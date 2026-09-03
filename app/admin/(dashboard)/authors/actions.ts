'use server'

import { revalidatePath } from 'next/cache'
import { ObjectId } from 'mongodb'
import { verifySession } from '@/lib/admin-auth'
import { destroyAsset } from '@/lib/cloudinary/delete'
import { MAX_UPLOAD_BYTES, type CloudinaryImage } from '@/lib/cloudinary/types'
import { AUTHORS_COLLECTION, BLOG_COLLECTION, getDb } from '@/lib/mongodb'
import {
  AUTHOR_LIMITS,
  authorSlugTaken,
  countPostsByAuthor,
  getAuthorById,
} from '@/lib/authors'
import { getPublishedPostsByAuthor } from '@/lib/blog'
import { slugify } from '@/lib/slug'

/**
 * The write side of authors: create, update, delete.
 *
 * EVERY ACTION RE-VERIFIES THE SESSION FIRST, exactly as blog/actions.ts does
 * and for exactly the same reason: the proxy and the dashboard layout have both
 * checked by the time anyone clicks, but an action is addressable directly over
 * HTTP, so it has to stand on its own. See the boundary note in lib/admin-auth.ts.
 *
 * SAME VALIDATION DISCIPLINE. Every incoming value is coerced to a string before
 * anything reads it — a hand-crafted request can put an object where the form
 * puts a string, and coercion is what keeps Mongo query operators out of a
 * document — then lengths are capped and URLs are checked for a real scheme.
 *
 * NO HTML ANYWHERE, which is the one way this is simpler than the post actions.
 * A bio is plain text and is stored as typed, so there is no sanitiser here and
 * no stored-XSS surface to defend: the render path prints it as text.
 */

export type AuthorPayload = {
  /** Absent when creating; the Mongo id string when editing. */
  id?: string
  name: unknown
  slug: unknown
  role: unknown
  bio: unknown
  avatar: unknown
  avatarAlt: unknown
  linkedinUrl: unknown
  xUrl: unknown
  websiteUrl: unknown
}

export type SaveAuthorResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; errors: Record<string, string> }

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** Same coercion as the post actions' — the shape the uploader sends may not be
 *  the shape that arrives, and publicId is the only field that has to be right,
 *  since it is what addresses the asset for transformation and deletion. */
function asCloudinaryImage(value: unknown): CloudinaryImage | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const publicId = asString(raw.publicId)
  if (!publicId) return null
  return {
    url: asString(raw.url),
    secureUrl: asString(raw.secureUrl),
    publicId,
    width: Number(raw.width) || 0,
    height: Number(raw.height) || 0,
    format: asString(raw.format),
    bytes: Number(raw.bytes) || 0,
  }
}

/**
 * An external profile URL, or an error.
 *
 * HTTP(S) ONLY, AND THAT IS A CONTROL RATHER THAN TIDINESS. These render as
 * anchors on a public page, so accepting an arbitrary scheme here would store
 * `javascript:` in the database and put it in an href — the stored-XSS hole the
 * post body has a whole sanitiser to prevent. `new URL` is the parser doing the
 * work; a bare "looks like a link" regex is exactly what gets this wrong.
 */
function asUrl(value: unknown, field: string, errors: Record<string, string>): string | null {
  const raw = asString(value)
  if (!raw) return null
  if (raw.length > AUTHOR_LIMITS.url) {
    errors[field] = 'That address is too long.'
    return null
  }
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    errors[field] = 'That does not look like a full web address — include https://'
    return null
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    errors[field] = 'Only http and https addresses can be linked.'
    return null
  }
  return parsed.toString()
}

export async function saveAuthor(payload: AuthorPayload): Promise<SaveAuthorResult> {
  if (!(await verifySession())) {
    return { ok: false, errors: { form: 'Your session has expired. Sign in again.' } }
  }

  const name = asString(payload.name)
  const role = asString(payload.role)
  const bio = asString(payload.bio)
  const avatarAlt = asString(payload.avatarAlt)
  const avatar = asCloudinaryImage(payload.avatar)

  /* Re-derived server-side whatever the client sent, exactly as a post's is:
     slugify is the grammar, and running it here means a hand-crafted request
     cannot mint a slug the form could not. */
  const slug = slugify(asString(payload.slug) || name)

  const errors: Record<string, string> = {}
  const linkedinUrl = asUrl(payload.linkedinUrl, 'linkedinUrl', errors)
  const xUrl = asUrl(payload.xUrl, 'xUrl', errors)
  const websiteUrl = asUrl(payload.websiteUrl, 'websiteUrl', errors)

  if (!name) errors.name = 'Give the author a name.'
  else if (name.length > AUTHOR_LIMITS.name) {
    errors.name = `Longer than we store (${AUTHOR_LIMITS.name} characters).`
  }
  if (!slug) errors.slug = 'The URL is empty once tidied. Try different words.'
  else if (slug.length > AUTHOR_LIMITS.slug) {
    errors.slug = `Longer than we store (${AUTHOR_LIMITS.slug} characters).`
  }
  if (role.length > AUTHOR_LIMITS.role) {
    errors.role = `Keep the role under ${AUTHOR_LIMITS.role} characters.`
  }
  if (bio.length > AUTHOR_LIMITS.bio) {
    errors.bio = `Keep the bio under ${AUTHOR_LIMITS.bio} characters.`
  }
  if (avatarAlt.length > AUTHOR_LIMITS.avatarAlt) {
    errors.avatarAlt = `Keep the alt text under ${AUTHOR_LIMITS.avatarAlt} characters.`
  }
  if (payload.avatar && !avatar) {
    errors.avatar = 'That photo reference is not valid. Upload it again.'
  }
  /* The last of the three size gates, same as a post cover's: the browser
     refuses the file, the uploader checks the response, and this is the one a
     hand-crafted request cannot skip. */
  if (avatar && avatar.bytes > MAX_UPLOAD_BYTES) {
    errors.avatar = `That photo is over the ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB limit.`
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const existing = payload.id ? await getAuthorById(payload.id) : null
  if (payload.id && !existing) {
    return { ok: false, errors: { form: 'That author no longer exists.' } }
  }

  /**
   * THE SLUG LOCKS ONCE THE AUTHOR HAS A PUBLISHED POST.
   *
   * Same rule as a post's, for the same reason and with a different trigger: an
   * author only has a public URL once something of theirs is live, so that is
   * the moment /authors/<slug> can be indexed, linked and shared. Before it,
   * renaming is free. The form greys the field out; this is the server-side
   * half, because the form is a convenience and this is the control.
   */
  const hasPublished = existing ? (await getPublishedPostsByAuthor(existing.id)).length > 0 : false
  const finalSlug = hasPublished ? existing!.slug : slug

  if (!hasPublished && (await authorSlugTaken(finalSlug, existing?.id))) {
    return { ok: false, errors: { slug: 'Another author already uses this URL.' } }
  }

  const now = new Date()
  const doc = {
    slug: finalSlug,
    name,
    role: role || null,
    bio: bio || null,
    /* The alt text travels INSIDE the asset record, the same shape a post cover
       uses: it describes this image, so it goes when the image goes rather than
       lingering to reappear against the next portrait uploaded. */
    avatar: avatar ? { ...avatar, ...(avatarAlt ? { altText: avatarAlt } : {}) } : null,
    linkedinUrl,
    xUrl,
    websiteUrl,
    updatedAt: now,
  }

  let id: string
  try {
    const db = await getDb()
    const col = db.collection(AUTHORS_COLLECTION)
    if (existing) {
      await col.updateOne({ _id: new ObjectId(existing.id) }, { $set: doc })
      id = existing.id
    } else {
      const inserted = await col.insertOne({ ...doc, createdAt: now })
      id = String(inserted.insertedId)
    }
  } catch (error) {
    console.error('[admin] failed to save author', error)
    return { ok: false, errors: { form: 'Could not save. Try again, and check the server log.' } }
  }

  /* The old portrait goes only AFTER the write succeeded — the same ordering,
     and the same reasoning, as a post's cover replacement in blog/actions.ts.
     Awaited rather than fired and forgotten because this is a serverless
     function and work in flight when the response returns can be killed with
     the container. destroyAsset never throws. */
  const previousPublicId = existing?.avatar?.publicId
  if (previousPublicId && previousPublicId !== avatar?.publicId) {
    await destroyAsset(previousPublicId)
  }

  /* Every surface that prints this author's name or face. The posts' own pages
     carry the byline, so they revalidate too — otherwise a corrected job title
     would sit stale on every post until the five-minute ISR window rolled. */
  revalidatePath('/authors')
  revalidatePath(`/authors/${finalSlug}`)
  if (existing && existing.slug !== finalSlug) revalidatePath(`/authors/${existing.slug}`)
  revalidatePath('/blog')
  for (const post of await getPublishedPostsByAuthor(id)) {
    revalidatePath(`/blog/${post.slug}`)
  }
  revalidatePath('/sitemap.xml')

  return { ok: true, id, slug: finalSlug }
}

export type DeleteAuthorResult = { ok: true; unassigned: number } | { ok: false; error: string }

/**
 * Deletes an author, and takes their byline off the posts that named them.
 *
 * POSTS ARE UNASSIGNED, NOT DELETED, and never blocked. Refusing to remove an
 * author while any post references them sounds safer and is worse: it makes
 * removing someone who has left a manual hunt through every post they wrote,
 * and the obvious workaround — deleting their posts — destroys real content to
 * tidy a byline. `authorId: null` is already a supported, permanent state on a
 * post (see BlogPost.authorId), so the posts simply fall back to the company
 * byline, which is what they had before authors existed.
 *
 * THE ORDER IS UNASSIGN, THEN DELETE. Removing the author first would leave
 * every one of their posts pointing at an id that resolves to nothing, and any
 * failure after that point would strand them there.
 */
export async function deleteAuthor(id: string): Promise<DeleteAuthorResult> {
  if (!(await verifySession())) {
    return { ok: false, error: 'Your session has expired. Sign in again.' }
  }

  const author = await getAuthorById(asString(id))
  if (!author) return { ok: false, error: 'That author no longer exists.' }

  /* Captured before the unassign, because afterwards there is nothing left to
     count and the pages still need revalidating. */
  const affected = await getPublishedPostsByAuthor(author.id)
  let unassigned = 0

  try {
    const db = await getDb()
    const result = await db
      .collection(BLOG_COLLECTION)
      .updateMany({ authorId: author.id }, { $set: { authorId: null } })
    unassigned = result.modifiedCount
    await db.collection(AUTHORS_COLLECTION).deleteOne({ _id: new ObjectId(author.id) })
  } catch (error) {
    console.error('[admin] failed to delete author', error)
    return { ok: false, error: 'Could not delete. Try again.' }
  }

  /* The portrait is nobody's now — no other author can reference it, because an
     avatar belongs to exactly one record. destroyAsset still refuses anything
     outside this admin's own Cloudinary folders. */
  if (author.avatar) await destroyAsset(author.avatar.publicId)

  revalidatePath('/authors')
  revalidatePath(`/authors/${author.slug}`)
  revalidatePath('/blog')
  for (const post of affected) revalidatePath(`/blog/${post.slug}`)
  revalidatePath('/sitemap.xml')

  return { ok: true, unassigned }
}

/** The count the delete dialog states, so "delete this author" is never a
 *  surprise about what happens to their posts. */
export async function authorPostCount(id: string): Promise<number> {
  if (!(await verifySession())) return 0
  return countPostsByAuthor(asString(id))
}

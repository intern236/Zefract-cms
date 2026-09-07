'use server'

import { revalidatePath } from 'next/cache'
import { ObjectId } from 'mongodb'
import { verifySession } from '@/lib/admin-auth'
import { destroyAsset } from '@/lib/cloudinary/delete'
import { MAX_UPLOAD_BYTES, type CloudinaryImage } from '@/lib/cloudinary/types'
import { publicIdsInHtml } from '@/lib/cloudinary/url'
import { getAuthorById } from '@/lib/authors'
import { getDb, BLOG_COLLECTION } from '@/lib/mongodb'
import {
  POST_LIMITS,
  countImageTags,
  getPostById,
  readingMinutes,
  sanitizePostHtml,
  slugTaken,
  slugify,
  tagSlug,
  type BlogPostStatus,
} from '@/lib/blog'

/**
 * The write side of the blog: create, update, publish, unpublish, delete.
 *
 * EVERY ACTION RE-VERIFIES THE SESSION FIRST. The proxy and the dashboard
 * layout have already checked it by the time a person clicks a button, but an
 * action is addressable directly over HTTP, so it must stand on its own — see
 * the boundary note in lib/admin-auth.ts. CSRF is covered twice over: server
 * actions check Origin against Host themselves, and the session cookie is
 * SameSite=Lax, so a cross-site POST arrives without it anyway.
 *
 * VALIDATION IS THE CONTACT ROUTE'S DISCIPLINE, applied here: every incoming
 * value is coerced to a string before anything reads it (a hand-crafted request
 * can put an object where the editor puts a string — coercion is what keeps
 * query operators out of Mongo), lengths are capped, and the HTML body goes
 * through sanitizePostHtml before it is stored, never merely before render.
 */

export type PostPayload = {
  /** Absent for a new post; the Mongo id string when editing. */
  id?: string
  title: unknown
  slug: unknown
  description: unknown
  /** The on-page standfirst. Empty means the description stands in for it. */
  excerpt: unknown
  /** Comma-separated, as typed. Parsed and capped here. */
  tags: unknown
  /** `{ question, answer }[]` from the FAQ panel. Coerced entry by entry below,
   *  because this arrives over HTTP like everything else. */
  faqs: unknown
  category: unknown
  contentHtml: unknown
  /** The author's id, or '' for none. Validated against the collection before
   *  it is stored — see the note at the check. */
  authorId: unknown
  /** The Cloudinary cover, or null to clear it. Shaped by the uploader. */
  coverImage: unknown
  coverAlt: unknown
  coverCaption: unknown
  seoTitle: unknown
  focusKeyword: unknown
  /** save keeps the current status; publish and unpublish move it. */
  intent: 'save' | 'publish' | 'unpublish'
}

export type SaveResult =
  /**
   * `warning` reports something the save could not carry through but was not
   * willing to fail over. Today that is exactly one thing: images whose source
   * the allowlist refuses, which the sanitiser drops.
   *
   * NOT AN ERROR, DELIBERATELY. Refusing the save would hold a whole post
   * hostage to one bad image and risk losing the writing around it. Silence was
   * the old behaviour and the actual bug — a post that looked complete in the
   * editor and arrived on the site with nothing in it. So the write goes
   * through and the author is told plainly what did not survive it.
   */
  | { ok: true; id: string; slug: string; status: BlogPostStatus; warning?: string }
  | { ok: false; errors: Record<string, string> }

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * The uploader's result, coerced into something safe to store.
 *
 * Same discipline as asString and for the same reason: this arrives over HTTP
 * and an action is addressable directly, so nothing here may be assumed to have
 * the shape the component would have sent. Every field is coerced to its type
 * and the publicId — the only one that has to be right, since it is what
 * addresses the asset for transformation and deletion — is required.
 *
 * altText and caption are deliberately NOT read from here: they come from the
 * post's own fields, which is where the writer edits them.
 */
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
 * The FAQ list, coerced and capped.
 *
 * SAME RULE AS asCloudinaryImage BELOW: an action is an HTTP endpoint, so
 * nothing arriving here may be assumed to have the shape the editor sends.
 * Every field is coerced to a string, an entry missing either half is dropped
 * rather than stored, and the count is capped so a hand-crafted request cannot
 * attach a thousand questions to a post.
 *
 * DROPPED, NOT REJECTED, for an incomplete entry. A half-typed question is a
 * normal state to leave the editor in, and failing the whole save over one empty
 * answer would hold the writing hostage to it. The panel shows the writer which
 * rows will not be published.
 */
function asFaqs(value: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(value)) return []
  return value
    .flatMap((entry) => {
      if (!entry || typeof entry !== 'object') return []
      const raw = entry as Record<string, unknown>
      const question = asString(raw.question)
      const answer = asString(raw.answer)
      return question && answer ? [{ question, answer }] : []
    })
    .slice(0, POST_LIMITS.faqCount)
}

/**
 * Slugs a post may not take, because a route already owns the path.
 *
 * `tag` IS THE ONE THAT MATTERS: /blog/tag/<tag> is the archive, so a post
 * slugged `tag` would sit at /blog/tag, one segment above a page that is not
 * about it. Next would still serve it — there is no page.tsx at that level, so
 * it falls through to /blog/[slug] — which is worse than a collision, because it
 * works and reads as a mistake.
 */
const RESERVED_SLUGS = new Set(['tag'])

export async function savePost(payload: PostPayload): Promise<SaveResult> {
  if (!(await verifySession())) {
    return { ok: false, errors: { form: 'Your session has expired. Sign in again.' } }
  }

  const title = asString(payload.title)
  const description = asString(payload.description)
  const excerpt = asString(payload.excerpt)
  const faqs = asFaqs(payload.faqs)
  const category = asString(payload.category)
  const coverAlt = asString(payload.coverAlt)
  const coverCaption = asString(payload.coverCaption)
  const seoTitle = asString(payload.seoTitle)
  const focusKeyword = asString(payload.focusKeyword)
  const rawHtml = typeof payload.contentHtml === 'string' ? payload.contentHtml : ''
  const coverImage = asCloudinaryImage(payload.coverImage)
  const intent = payload.intent

  /* The slug is re-derived server-side whatever the client sent: slugify is the
     grammar, and running it here means a hand-crafted request cannot mint a
     slug the editor could not. */
  const slug = slugify(asString(payload.slug))

  const tags = asString(payload.tags)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, POST_LIMITS.tagCount)

  const errors: Record<string, string> = {}
  if (!title) errors.title = 'Give the post a title.'
  else if (title.length > POST_LIMITS.title) {
    errors.title = `Longer than we store (${POST_LIMITS.title} characters).`
  }
  if (!slug) errors.slug = 'The slug is empty once tidied. Try different words.'
  else if (RESERVED_SLUGS.has(slug)) {
    errors.slug = `“${slug}” is reserved for the tag archive. Try different words.`
  }
  if (excerpt.length > POST_LIMITS.excerpt) {
    errors.excerpt = `Keep the introduction under ${POST_LIMITS.excerpt} characters.`
  }
  if (faqs.some((faq) => faq.question.length > POST_LIMITS.faqQuestion)) {
    errors.faqs = `Keep each question under ${POST_LIMITS.faqQuestion} characters.`
  }
  if (faqs.some((faq) => faq.answer.length > POST_LIMITS.faqAnswer)) {
    errors.faqs = `Keep each answer under ${POST_LIMITS.faqAnswer} characters.`
  }
  if (!description) errors.description = 'Write the one-sentence description — it is the search snippet and the card text.'
  else if (description.length > POST_LIMITS.description) {
    errors.description = `Longer than we store (${POST_LIMITS.description} characters).`
  }
  if (tags.some((t) => t.length > POST_LIMITS.tag)) {
    errors.tags = `Keep each tag under ${POST_LIMITS.tag} characters.`
  }
  if (category.length > POST_LIMITS.category) {
    errors.category = `Keep the category under ${POST_LIMITS.category} characters.`
  }
  if (coverAlt.length > POST_LIMITS.coverAlt) {
    errors.coverAlt = `Keep the alt text under ${POST_LIMITS.coverAlt} characters.`
  }
  if (coverCaption.length > POST_LIMITS.coverCaption) {
    errors.coverCaption = `Keep the caption under ${POST_LIMITS.coverCaption} characters.`
  }
  if (seoTitle.length > POST_LIMITS.seoTitle) {
    errors.seoTitle = `Keep the SEO title under ${POST_LIMITS.seoTitle} characters.`
  }
  if (focusKeyword.length > POST_LIMITS.focusKeyword) {
    errors.focusKeyword = `Keep the focus keyword under ${POST_LIMITS.focusKeyword} characters.`
  }
  /* The raw length is capped BEFORE sanitising, so a hostile request cannot
     make the sanitiser chew through megabytes just to be told no. */
  if (rawHtml.length > POST_LIMITS.contentHtml) {
    errors.content = 'The post is over the storage cap. Split it in two.'
  }
  if (payload.coverImage && !coverImage) {
    errors.cover = 'That cover image reference is not valid. Upload it again.'
  }
  /* The last of the three size gates. Cloudinary cannot enforce a byte cap on a
     signed upload, so the limit is checked in the browser, again by the
     uploader on the response, and finally here — the only one of the three a
     hand-crafted request cannot skip. */
  if (coverImage && coverImage.bytes > MAX_UPLOAD_BYTES) {
    errors.cover = `That image is over the ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB limit.`
  }
  /**
   * The author must exist, or the post has none.
   *
   * CHECKED AGAINST THE COLLECTION RATHER THAN TRUSTED. An id arrives from the
   * browser like every other field, and an unchecked one would let a
   * hand-crafted request write a reference to nothing — which surfaces later as
   * a byline that silently disappears, on a page nobody was looking at when it
   * broke. It also catches the ordinary case: an author deleted in another tab
   * while this post sat open in the editor.
   *
   * An unknown id is not an error. `authorId: null` is already a normal,
   * permanent state on a post, so the save proceeds under the company byline
   * rather than blocking a whole post over a byline.
   */
  const requestedAuthorId = asString(payload.authorId)
  const authorId = requestedAuthorId && (await getAuthorById(requestedAuthorId))
    ? requestedAuthorId
    : null

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const contentHtml = sanitizePostHtml(rawHtml)

  /**
   * Did sanitising just throw images away?
   *
   * It does that to any `<img>` whose source is not ours, and for a long time
   * it did it in silence: paste a section of a web page, watch it look right in
   * the editor, publish, and find every image gone with nothing to explain it.
   * The editor now adopts pasted images into Cloudinary before they ever get
   * here, so this should not fire — which is exactly why it is worth keeping.
   * It is the check that tells us the adoption path has a hole, instead of the
   * author discovering it on the live site.
   */
  const imagesDropped = countImageTags(rawHtml) - countImageTags(contentHtml)
  const warning =
    imagesDropped > 0
      ? `${imagesDropped} ${imagesDropped === 1 ? 'image was' : 'images were'} not saved — ` +
        'images have to be uploaded here rather than linked from another site.'
      : undefined

  /* Empty AFTER sanitising is the check that matters: a body of nothing but
     stripped markup is still an empty post. An image with no text passes,
     deliberately — a photo essay is a real post. */
  const hasText = contentHtml.replace(/<[^>]*>/g, '').trim().length > 0
  const hasImage = contentHtml.includes('<img')
  if (!hasText && !hasImage) {
    return { ok: false, errors: { content: 'Write something first.' } }
  }

  const existing = payload.id ? await getPostById(payload.id) : null
  if (payload.id && !existing) {
    return { ok: false, errors: { form: 'That post no longer exists.' } }
  }

  /* THE SLUG LOCKS AT FIRST PUBLISH. A published URL may already be indexed,
     linked and shared; renaming it silently is how a site accumulates 404s.
     The editor greys the field out, and this is the server-side half of that. */
  const everPublished = Boolean(existing?.publishedAt)
  const finalSlug = everPublished ? existing!.slug : slug

  if (!everPublished && (await slugTaken(finalSlug, existing?.id))) {
    return { ok: false, errors: { slug: 'Another post already uses this slug.' } }
  }

  const now = new Date()
  const status: BlogPostStatus =
    intent === 'publish' ? 'published' : intent === 'unpublish' ? 'draft' : (existing?.status ?? 'draft')
  /* publishedAt is set once, on FIRST publish, and kept thereafter — including
     across an unpublish/republish cycle, so a touched-up post does not leapfrog
     to the top of the index claiming to be new. */
  const publishedAt =
    existing?.publishedAt ?? (intent === 'publish' ? now : null)

  const doc = {
    slug: finalSlug,
    title,
    description,
    /* Null rather than '' so lib/blog.ts reads it back as absent and the page's
       `excerpt || description` fallback fires, which is what a cleared field
       should do: go back to the behaviour the post had before. */
    excerpt: excerpt || null,
    faqs,
    contentHtml,
    /* Alt and caption travel INSIDE the asset record, so the whole image is one
       self-describing object — which is the shape a Media Library will want to
       list without joining anything. They are meaningless without an image, so
       they go when it goes rather than lingering to reappear on the next
       upload. lib/blog.ts reads them back out onto BlogPost.coverAlt. */
    coverImage: coverImage
      ? {
          ...coverImage,
          ...(coverAlt ? { altText: coverAlt } : {}),
          ...(coverCaption ? { caption: coverCaption } : {}),
        }
      : null,
    /* The legacy fields are cleared the moment a post gets a Cloudinary cover,
       so no post can carry both and leave the render path guessing. A post that
       still has only a legacy image keeps it untouched. */
    ...(coverImage ? { coverImageId: null, coverAlt: null, coverCaption: null } : {}),
    category: category || null,
    tags,
    authorId,
    seoTitle: seoTitle || null,
    focusKeyword: focusKeyword || null,
    status,
    publishedAt,
    updatedAt: now,
    readingMinutes: readingMinutes(contentHtml),
  }

  let id: string
  try {
    const db = await getDb()
    const col = db.collection(BLOG_COLLECTION)
    if (existing) {
      await col.updateOne({ _id: new ObjectId(existing.id) }, { $set: doc })
      id = existing.id
    } else {
      const inserted = await col.insertOne({ ...doc, createdAt: now })
      id = String(inserted.insertedId)
    }
  } catch (error) {
    console.error('[admin] failed to save post', error)
    return { ok: false, errors: { form: 'Could not save. Try again, and check the server log.' } }
  }

  /**
   * THE OLD COVER IS DELETED ONLY NOW, after the write has succeeded.
   *
   * That ordering is the whole safety of the replace flow. The new image is
   * uploaded first, then stored, and only once the post definitely references
   * it does the previous asset go. If the upload had failed, nothing reached
   * here; if the write had failed, we returned above. At no point is the post
   * pointing at an asset that no longer exists.
   *
   * Awaited rather than fired and forgotten, because this runs as a serverless
   * function: work still in flight when the response returns can be killed with
   * the container. destroyAsset never throws and refuses to delete anything
   * another post still references, so the worst case is an orphan that
   * `npm run media:sweep` collects later.
   */
  const previousPublicId = existing?.coverImage?.publicId
  if (previousPublicId && previousPublicId !== coverImage?.publicId) {
    await destroyAsset(previousPublicId, { exceptPostId: id })
  }

  /* Body images dropped from the text during this edit. The post is already
     saved without them, so nothing on the page can break; anything another post
     still uses is left alone by the reference check inside destroyAsset. */
  const orphanedInBody = publicIdsInHtml(existing?.contentHtml ?? '').filter(
    (publicId) => !publicIdsInHtml(contentHtml).includes(publicId)
  )
  for (const publicId of orphanedInBody) {
    await destroyAsset(publicId, { exceptPostId: id })
  }

  /* The public pages are ISR-cached; this is what makes a publish visible NOW
     rather than at the next five-minute revalidation. The old slug is included
     when a draft was renamed, so a stale page is not left behind at the old
     address, and the sitemap route re-renders with the new URL set. */
  revalidatePath('/blog')
  revalidatePath(`/blog/${finalSlug}`)
  if (existing && existing.slug !== finalSlug) revalidatePath(`/blog/${existing.slug}`)
  /* THE UNION OF THE OLD AND NEW TAGS, not just the new ones. Removing a tag has
     to refresh the archive the post is leaving as well as the ones it stays in,
     or it goes on listing a post that no longer carries it. A Set because a tag
     kept through the edit appears in both lists. */
  for (const slug of new Set(
    [...(existing?.tags ?? []), ...tags].map(tagSlug).filter(Boolean)
  )) {
    revalidatePath(`/blog/tag/${slug}`)
  }
  revalidatePath('/sitemap.xml')

  return { ok: true, id, slug: finalSlug, status, warning }
}

export type DeleteResult = { ok: true } | { ok: false; error: string }

/**
 * Deletes the post, and the Cloudinary assets nothing else is using.
 *
 * THE POST GOES FIRST. Once it is gone the page is gone, so an asset delete
 * that fails afterwards is untidy rather than visible — and `npm run
 * media:sweep` collects it later. Deleting the images first would risk a live
 * post pointing at assets that no longer exist.
 *
 * destroyAsset refuses to remove anything another post still references, which
 * is what makes deleting a post that shares an image with another one safe.
 * Legacy blobs in `blog_images` are left alone, as they always were.
 */
export async function deletePost(id: string): Promise<DeleteResult> {
  if (!(await verifySession())) {
    return { ok: false, error: 'Your session has expired. Sign in again.' }
  }

  const post = await getPostById(asString(id))
  if (!post) return { ok: false, error: 'That post no longer exists.' }

  try {
    const db = await getDb()
    await db.collection(BLOG_COLLECTION).deleteOne({ _id: new ObjectId(post.id) })
  } catch (error) {
    console.error('[admin] failed to delete post', error)
    return { ok: false, error: 'Could not delete. Try again.' }
  }

  /* Now that the post is gone, nothing can reference these except another post
     — which destroyAsset checks for. `exceptPostId` is not needed here: the
     document has already been removed, so it cannot count itself. */
  const assets = [
    ...(post.coverImage ? [post.coverImage.publicId] : []),
    ...publicIdsInHtml(post.contentHtml),
  ]
  for (const publicId of assets) {
    await destroyAsset(publicId)
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  /* Every archive the post appeared in. A deleted post left listed on a tag page
     is a link to a 404, which is the one thing a tag archive must not produce. */
  for (const slug of new Set(post.tags.map(tagSlug).filter(Boolean))) {
    revalidatePath(`/blog/tag/${slug}`)
  }
  revalidatePath('/sitemap.xml')
  return { ok: true }
}

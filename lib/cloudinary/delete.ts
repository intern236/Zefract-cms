import { cloudinary, cloudinaryConfigured, isOwnedAsset } from '@/lib/cloudinary/config'
import { publicIdsInHtml } from '@/lib/cloudinary/url'
import { BLOG_COLLECTION, getDb } from '@/lib/mongodb'

/**
 * Removing an asset from Cloudinary, safely.
 *
 * SERVER-ONLY: it uses the configured SDK, which holds the API secret.
 *
 * THE REFERENCE CHECK IS THE POINT. The same image can legitimately be the
 * cover of one post and sit inside the body of another — a Media Library will
 * make that normal rather than exceptional. Destroying it because one of those
 * posts let it go would silently break the other, and the failure would surface
 * as a broken image on a live page days later. So nothing is destroyed while
 * anything still points at it.
 */

export type DeleteOutcome =
  | { status: 'deleted' }
  /** Still used somewhere, so deliberately left alone. Not an error. */
  | { status: 'in-use'; by: number }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; error: string }

/**
 * How many posts still reference an asset, ignoring one that is allowed to.
 *
 * `exceptPostId` is what makes the replace and remove flows work: the post
 * being edited has usually just dropped the image in memory, but its stored
 * document still names it, and counting itself would make every delete look
 * like a conflict.
 *
 * Body images are found by searching the stored HTML for the id. A regex over
 * `contentHtml` is crude next to a join, but the ids only ever appear inside an
 * `src` we wrote, and the alternative — a second collection tracking usage —
 * is a source of truth that can disagree with the posts themselves.
 */
export async function countReferences(publicId: string, exceptPostId?: string): Promise<number> {
  const db = await getDb()
  const posts = await db
    .collection(BLOG_COLLECTION)
    .find(
      {},
      { projection: { _id: 1, coverImage: 1, contentHtml: 1 } }
    )
    .toArray()

  return posts.filter((post) => {
    if (exceptPostId && String(post._id) === exceptPostId) return false
    const cover = post.coverImage as { publicId?: string } | null | undefined
    if (cover?.publicId === publicId) return true
    const html = typeof post.contentHtml === 'string' ? post.contentHtml : ''
    return publicIdsInHtml(html).includes(publicId)
  }).length
}

/**
 * Destroys an asset unless something still uses it.
 *
 * NEVER THROWS. A failed delete is untidy, not dangerous — the asset stays in
 * Cloudinary and `npm run media:sweep` will find it later, because the sweep
 * works from what the posts reference rather than from a list of things we
 * meant to remove. So callers report the outcome and carry on; none of them
 * should fail a save because a cleanup did not land.
 */
export async function destroyAsset(
  publicId: string,
  options?: { exceptPostId?: string }
): Promise<DeleteOutcome> {
  if (!publicId) return { status: 'skipped', reason: 'no public id' }
  if (!cloudinaryConfigured()) return { status: 'skipped', reason: 'Cloudinary is not configured' }
  /**
   * NOTHING OUTSIDE THIS APP'S OWN FOLDERS, EVER.
   *
   * `deleteAsset` in blog/media-actions.ts is a server action, which means it
   * is an HTTP endpoint that takes a public id from the browser. The session
   * check in front of it is the real control, but "an authenticated admin"
   * and "whoever currently holds an admin cookie" are the same thing to this
   * function — and without a scope, the id it accepts is any id in the whole
   * Cloudinary account. That account is not exclusively ours: the same cloud
   * can hold assets for other sites, other tools, or a future media library
   * with its own rules, and none of them should be one crafted request away
   * from being destroyed by the blog editor.
   *
   * The prefix check turns the blast radius of a stolen session from "the
   * account" into "images this editor uploaded", which is the most a post
   * editor ever needs. It is a containment boundary, not an auth check — it
   * sits behind one.
   */
  if (!isOwnedAsset(publicId)) {
    console.warn('[media] refused to delete out-of-scope asset: %s', publicId)
    return { status: 'skipped', reason: 'not an admin-panel asset' }
  }

  try {
    const references = await countReferences(publicId, options?.exceptPostId)
    if (references > 0) return { status: 'in-use', by: references }

    const result = (await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    })) as { result?: string }

    /* Cloudinary answers "not found" for an id that is already gone. That is
       the desired end state, so it counts as done rather than as a failure. */
    if (result.result === 'ok' || result.result === 'not found') return { status: 'deleted' }
    return { status: 'failed', error: result.result ?? 'unknown response' }
  } catch (error) {
    return { status: 'failed', error: error instanceof Error ? error.message : String(error) }
  }
}

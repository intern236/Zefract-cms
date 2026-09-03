import { v2 as cloudinary } from 'cloudinary'
import type { MediaFolder } from '@/lib/cloudinary/types'

/**
 * The Cloudinary SDK, configured once.
 *
 * SERVER-ONLY, in the same sense as lib/mongodb.ts: it reads
 * CLOUDINARY_API_SECRET, so importing it from a client component would be a
 * build error — which is the outcome we want. Anything the browser needs lives
 * in lib/cloudinary/types.ts and lib/cloudinary/url.ts, neither of which
 * imports this file.
 *
 * The cloud name is deliberately the only public value: it appears in every
 * delivery URL, so `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` gives away nothing that
 * a page source would not.
 */

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

/**
 * The root every asset this admin uploads lives under, so a shared Cloudinary
 * account stays legible and the sweep script has one place to look.
 *
 *   admin-panel/posts/covers   post cover images
 *   admin-panel/posts/body     images placed inside a post's text
 *   admin-panel/authors        author portraits
 *
 * IT USED TO BE `admin-panel/posts` AND WAS WIDENED BY ONE SEGMENT when authors
 * arrived, because a person is not a post and filing their photograph under
 * `posts/` would have been a lie the sweep script then had to decode. Widening
 * is the safe direction and the only reason this could be changed at all:
 * `isOwnedAsset` below is a `startsWith`, so every asset already uploaded under
 * `admin-panel/posts/...` still matches `admin-panel/` and stays deletable.
 * NARROWING it later would strand assets outside the boundary — they would be
 * refused deletion for ever and the sweep would never collect them.
 *
 * FLAT WITHIN EACH FOLDER, not a directory per post or per author. The editor
 * has no id until the first save — a cover or a portrait can be chosen before
 * the record exists — and Cloudinary has no cheap "move": renaming an asset
 * changes its delivery URL and invalidates every CDN copy of it. Since the
 * document stores the `publicId`, the folder never needs to encode ownership.
 */
export const MEDIA_ROOT = 'admin-panel'

export const MEDIA_FOLDERS: Record<MediaFolder, string> = {
  cover: `${MEDIA_ROOT}/posts/covers`,
  body: `${MEDIA_ROOT}/posts/body`,
  avatar: `${MEDIA_ROOT}/authors`,
}

export function folderFor(kind: MediaFolder): string {
  return MEDIA_FOLDERS[kind]
}

/**
 * Is this public id one of ours — something this editor uploaded?
 *
 * The delete path uses it as a containment boundary: an id arriving from the
 * browser may only ever name an asset under MEDIA_ROOT, so the worst a stolen
 * session can reach is this admin's own images rather than everything in the
 * Cloudinary account. See the note in lib/cloudinary/delete.ts.
 *
 * The trailing slash matters. A bare `startsWith(MEDIA_ROOT)` would also match
 * a sibling folder like `admin-panel/posts-archive/...`, which is exactly the
 * kind of near-miss this is meant to exclude.
 */
export function isOwnedAsset(publicId: string): boolean {
  return publicId.startsWith(`${MEDIA_ROOT}/`)
}

/**
 * True when uploads can actually happen.
 *
 * All three are required: the cloud name to address the account, the key to
 * identify the caller, the secret to sign. Checked rather than assumed so a
 * deploy missing one fails with a sentence instead of a Cloudinary error code
 * surfacing in the browser.
 */
export function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

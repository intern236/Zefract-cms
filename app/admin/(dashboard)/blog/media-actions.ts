'use server'

import { verifySession } from '@/lib/admin-auth'
import { cloudinary, cloudinaryConfigured, folderFor } from '@/lib/cloudinary/config'
import { destroyAsset } from '@/lib/cloudinary/delete'
import {
  ACCEPTED_FORMATS,
  MAX_UPLOAD_BYTES,
  type MediaFolder,
  type SignedUploadParams,
} from '@/lib/cloudinary/types'
import { bodyUrl } from '@/lib/cloudinary/url'

/**
 * The only two things the browser may ask about Cloudinary: sign an upload, and
 * delete an asset.
 *
 * SERVER ACTIONS, NOT ROUTE HANDLERS, because that is how every other mutation
 * in this editor already travels — see blog/actions.ts. Actions also give the
 * CSRF check for free (Origin against Host) on top of the SameSite=Lax session
 * cookie, and there is no multipart body here to justify a route handler: the
 * file never passes through our server at all.
 *
 * BOTH RE-VERIFY THE SESSION. proxy.ts and the dashboard layout have already
 * checked it by the time anyone clicks, but an action is addressable over HTTP
 * on its own, so it must stand up without them — the boundary rule documented
 * in lib/admin-auth.ts.
 */

export type SignResult =
  | { ok: true; params: SignedUploadParams }
  | { ok: false; error: string }

/**
 * Signs one upload.
 *
 * WHY SIGNED DIRECT UPLOAD RATHER THAN PROXYING THE BYTES. This site runs as
 * serverless functions on Netlify, where a request body is capped around 6MB
 * and every megabyte through a function is billed time — the existing
 * MongoDB-backed route documents its own 4MB ceiling for exactly that reason.
 * A signed upload sends the file from the browser straight to Cloudinary, so
 * the 5MB limit is a policy rather than an infrastructure edge, and the browser
 * can report real progress because it owns the request.
 *
 * WHAT THE SIGNATURE ACTUALLY BUYS. Every parameter below is signed, so the
 * browser cannot change any of them without the signature failing: not the
 * folder, not the size cap, not the allowed formats. A stolen signature is
 * good for one upload, into one folder, of one of four formats, under 5MB,
 * for one hour. The API secret is only ever used to compute the hash and never
 * leaves the server.
 */
export async function signUpload(kind: MediaFolder): Promise<SignResult> {
  if (!(await verifySession())) {
    return { ok: false, error: 'Your session has expired. Sign in again.' }
  }
  if (!cloudinaryConfigured()) {
    console.error(
      '[media] upload refused: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and ' +
        'CLOUDINARY_API_SECRET. See .env.example.'
    )
    return { ok: false, error: 'Image uploads are not configured. Check the server log.' }
  }

  const folder = folderFor(kind === 'body' ? 'body' : 'cover')
  const timestamp = Math.round(Date.now() / 1000)

  /**
   * Signed exactly as sent. Cloudinary hashes the sorted parameters with the
   * secret, so this object and the one the browser posts have to match to the
   * character — which is what makes each of them a constraint rather than a
   * suggestion.
   *
   * NO max_bytes, AND THAT IS NOT AN OVERSIGHT. It was here, and every upload
   * failed with "Invalid Signature". Cloudinary's own error names the string it
   * hashed, and max_bytes was absent from it: the upload API does not recognise
   * that parameter, drops it, and then computes a different digest from ours.
   * Verified against the live API — a folder + allowed_formats signature
   * verifies, the same signature plus max_bytes does not.
   *
   * The 5MB limit is therefore enforced in three other places instead: the
   * browser refuses the file before uploading, the uploader deletes anything
   * that somehow arrives oversized, and savePost refuses to store it. See
   * MAX_UPLOAD_BYTES.
   */
  const params = {
    folder,
    timestamp,
    /* This one IS recognised and IS enforced by Cloudinary, so it is a real
       server-side gate on file type — the browser cannot widen it without
       invalidating the signature. */
    allowed_formats: ACCEPTED_FORMATS.join(','),
  }

  try {
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET as string
    )
    return {
      ok: true,
      params: {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string,
        apiKey: process.env.CLOUDINARY_API_KEY as string,
        timestamp,
        signature,
        folder,
      },
    }
  } catch (error) {
    console.error('[media] could not sign upload', error)
    return { ok: false, error: 'Could not start the upload. Try again.' }
  }
}

export type AdoptResult = { ok: true; url: string } | { ok: false; error: string }

/**
 * Copies an image that lives somewhere else into our own Cloudinary folder, and
 * returns the delivery URL for it.
 *
 * WHY THIS EXISTS. Paste a section of a web page into the editor and the images
 * come with it — as `<img src="https://somewhere-else/…">`. TipTap shows them,
 * so the post looks right, and then the sanitiser drops every one of them on
 * save because their src is not ours. The author sees a finished post in the
 * editor and an empty one on the site, with nothing anywhere saying why. That
 * is the bug this fixes: rather than widening the allowlist to make the foreign
 * URL legal — which would re-open hotlinking and third-party tracking pixels,
 * and leave the post depending on a server we do not control — the image is
 * ADOPTED, so the stored post points at our own copy.
 *
 * THE BROWSER TRIES FIRST. The editor fetches the bytes itself and uses the
 * ordinary signed upload; this is the fallback for when that fetch is blocked
 * by CORS. Here Cloudinary does the fetching from its own servers, which is
 * also why this is not an SSRF hole: our server never issues the request, and
 * Cloudinary cannot see anything private to us. It does mean a URL that is not
 * publicly reachable — anything on localhost — can only be adopted by the
 * browser path, which is the one that already handles it.
 */
export async function adoptRemoteImage(sourceUrl: string): Promise<AdoptResult> {
  if (!(await verifySession())) {
    return { ok: false, error: 'Your session has expired. Sign in again.' }
  }
  if (!cloudinaryConfigured()) {
    return { ok: false, error: 'Image uploads are not configured.' }
  }

  let parsed: URL
  try {
    parsed = new URL(sourceUrl)
  } catch {
    return { ok: false, error: 'That image address could not be read.' }
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Only http and https images can be imported.' }
  }

  try {
    const result = (await cloudinary.uploader.upload(parsed.toString(), {
      folder: folderFor('body'),
      resource_type: 'image',
      /* The same format gate the signed browser uploads carry, so an adopted
         image cannot become the one route by which something else gets in. */
      allowed_formats: [...ACCEPTED_FORMATS],
    })) as { public_id: string; bytes: number }

    /* Over the limit: undo the upload rather than leave an asset behind that
       no post will ever reference. */
    if (result.bytes > MAX_UPLOAD_BYTES) {
      await destroyAsset(result.public_id)
      return { ok: false, error: `That image is larger than ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.` }
    }

    return { ok: true, url: bodyUrl(result.public_id) }
  } catch (error) {
    console.error('[media] could not adopt %s: %s', parsed.host, error)
    return { ok: false, error: 'That image could not be imported.' }
  }
}

export type DeleteAssetResult = { ok: true; kept?: boolean } | { ok: false; error: string }

/**
 * Deletes an asset, if nothing still points at it.
 *
 * `exceptPostId` lets the post being edited exclude itself: its stored document
 * usually still names the image it has just dropped, and counting that would
 * make every removal look like a conflict.
 *
 * `kept: true` means the asset was left alone because another post uses it —
 * reported rather than silently ignored, but not an error: the caller's post no
 * longer references it, which is what was asked for.
 */
export async function deleteAsset(
  publicId: string,
  exceptPostId?: string
): Promise<DeleteAssetResult> {
  if (!(await verifySession())) {
    return { ok: false, error: 'Your session has expired. Sign in again.' }
  }

  const outcome = await destroyAsset(publicId, { exceptPostId })
  switch (outcome.status) {
    case 'deleted':
      return { ok: true }
    case 'in-use':
      return { ok: true, kept: true }
    case 'skipped':
      return { ok: true }
    case 'failed':
      /* Logged, not surfaced as a blocking failure: the image is already gone
         from the post, and the sweep script cleans up what Cloudinary would
         not. Telling the writer their save failed over this would be wrong. */
      console.error('[media] failed to delete %s: %s', publicId, outcome.error)
      return { ok: false, error: 'The image was removed from the post but not from storage.' }
  }
}

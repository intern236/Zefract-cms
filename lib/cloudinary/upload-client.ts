import { deleteAsset, signUpload } from '@/app/admin/(dashboard)/blog/media-actions'
import {
  ACCEPTED_FORMATS,
  MAX_UPLOAD_BYTES,
  formatBytes,
  validateFile,
  type CloudinaryImage,
  type CloudinaryUploadResult,
  type MediaFolder,
  type UploadProgress,
} from '@/lib/cloudinary/types'

/**
 * Uploading a file from the browser: get a signature, then send the bytes
 * straight to Cloudinary.
 *
 * CLIENT-SIDE, and it must be — the whole reason for the signed-upload design
 * is that the file never passes through our own server. This module imports the
 * signing action (which runs on the server) and nothing else from the SDK, so
 * no secret can reach a client bundle through it.
 *
 * XHR, NOT FETCH, and that is the only reason for it. `fetch` still cannot
 * report upload progress in any browser — `ReadableStream` request bodies are
 * not widely enough supported and do not give byte counts for a multipart form
 * anyway. XMLHttpRequest has had `upload.onprogress` for fifteen years, and a
 * progress bar was a stated requirement. It also gives a real `abort()`, which
 * is what makes cancelling an upload actually stop the transfer rather than
 * just ignoring its result.
 */

export type UploadOutcome =
  | { ok: true; image: CloudinaryImage }
  | { ok: false; error: string; cancelled?: boolean }

export interface UploadHandle {
  /** Resolves once the upload settles, whichever way it goes. */
  done: Promise<UploadOutcome>
  /** Stops the transfer. The promise resolves with `cancelled: true`. */
  cancel: () => void
}

function toImage(result: CloudinaryUploadResult): CloudinaryImage {
  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  }
}

/**
 * Starts an upload and hands back a handle.
 *
 * Returns a handle rather than a bare promise so the caller can cancel — a
 * requirement that a promise alone cannot express.
 */
export function startUpload(
  file: File,
  kind: MediaFolder,
  onProgress?: (progress: UploadProgress) => void
): UploadHandle {
  let request: XMLHttpRequest | null = null
  let cancelled = false

  const done = (async (): Promise<UploadOutcome> => {
    /* Checked here first so an obviously wrong file fails instantly, with a
       sentence, instead of after a round trip. Cloudinary re-checks both the
       format and the size against the signed parameters, which is the check
       that actually counts. */
    const problem = validateFile(file)
    if (problem) return { ok: false, error: problem }

    const signed = await signUpload(kind)
    if (!signed.ok) return { ok: false, error: signed.error }
    if (cancelled) return { ok: false, error: 'Upload cancelled.', cancelled: true }

    const { cloudName, apiKey, timestamp, signature, folder } = signed.params
    const form = new FormData()
    form.append('file', file)
    form.append('api_key', apiKey)
    form.append('timestamp', String(timestamp))
    form.append('signature', signature)
    /* Every signed parameter has to be echoed back exactly, and NOTHING extra
       may be added: Cloudinary hashes what it receives, so one stray field is
       an Invalid Signature. That is precisely how `max_bytes` broke every
       upload before it was removed — see the note in media-actions.ts. */
    form.append('folder', folder)
    form.append('allowed_formats', ACCEPTED_FORMATS.join(','))

    return new Promise<UploadOutcome>((resolve) => {
      const xhr = new XMLHttpRequest()
      request = xhr
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable || !onProgress) return
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        })
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const image = toImage(JSON.parse(xhr.responseText))
            /**
             * THE SIZE GATE, after the fact.
             *
             * Cloudinary cannot enforce a byte limit on a signed upload — the
             * parameter that would do it is not part of the upload API — so an
             * oversized file that got past the browser check (a hand-crafted
             * request, most plausibly) lands successfully. It is deleted here
             * rather than left in the account, and never handed back to the
             * caller, so it cannot be attached to a post.
             */
            if (image.bytes > MAX_UPLOAD_BYTES) {
              void deleteAsset(image.publicId)
              resolve({
                ok: false,
                error: `That image is ${formatBytes(image.bytes)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`,
              })
              return
            }
            resolve({ ok: true, image })
          } catch {
            resolve({ ok: false, error: 'Cloudinary sent a response we could not read.' })
          }
          return
        }
        /* Cloudinary explains its own refusals — wrong format, over the size
           cap, expired signature — and its wording is more useful than
           anything generic we could substitute. */
        let message = 'Upload failed. Please try again.'
        try {
          const body = JSON.parse(xhr.responseText) as { error?: { message?: string } }
          if (body.error?.message) message = body.error.message
        } catch {
          /* Non-JSON error body; the generic message stands. */
        }
        resolve({ ok: false, error: message })
      }

      xhr.onerror = () =>
        resolve({ ok: false, error: 'Upload failed. Check your connection and try again.' })
      xhr.ontimeout = () => resolve({ ok: false, error: 'The upload timed out. Try again.' })
      xhr.onabort = () => resolve({ ok: false, error: 'Upload cancelled.', cancelled: true })

      /* Two minutes: enough for 5MB on a poor connection, short enough that a
         dead transfer does not leave a progress bar sitting at 4% forever. */
      xhr.timeout = 120_000
      xhr.send(form)
    })
  })()

  return {
    done,
    cancel: () => {
      cancelled = true
      request?.abort()
    },
  }
}

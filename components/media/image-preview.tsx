'use client'

import { ImageOff, RefreshCw, Trash2 } from 'lucide-react'
import { coverSrcSet, coverUrl } from '@/lib/cloudinary/url'
import { formatBytes, type CloudinaryImage } from '@/lib/cloudinary/types'
import { cn } from '@/lib/utils'

/**
 * A chosen image, with the two things you can do to it.
 *
 * RENDERS FROM THE PUBLIC ID, not from the stored secure_url. That URL points
 * at the original upload — full size, original format — so using it here would
 * pull a 5MB PNG into a 400px box every time the panel opens. Composing the URL
 * means the preview gets the same f_auto/q_auto treatment the published page
 * does, and is therefore an honest preview of it.
 *
 * REPLACE AND REMOVE ARE SEPARATE BUTTONS, not one destructive action followed
 * by an upload. Replacing keeps the old image on screen and in the database
 * until the new one has finished uploading, so a failed replacement leaves the
 * post exactly as it was — see the note on the save action. Remove is the only
 * path that ends with no image, and it asks first.
 *
 * A plain <img>, deliberately, not next/image: Cloudinary has already done the
 * format negotiation, the quality selection and the resizing, and routing it
 * through Next's optimizer would re-encode an optimised image and bill the host
 * for the privilege.
 */
export function ImagePreview({
  image,
  onReplace,
  onRemove,
  busy = false,
  className,
}: {
  image: CloudinaryImage
  onReplace: () => void
  onRemove: () => void
  /** True while a replace or a delete is in flight — both buttons lock. */
  busy?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <div className="overflow-hidden rounded-tile border border-line bg-page">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl(image.publicId, 960)}
          srcSet={coverSrcSet(image.publicId)}
          sizes="(max-width: 1024px) 100vw, 480px"
          alt={image.altText || 'Cover image preview'}
          className="aspect-video w-full object-cover"
        />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onReplace}
          disabled={busy}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12.5px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong disabled:opacity-50"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Replace image
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12.5px] font-semibold text-mut transition-colors hover:border-red-200 hover:text-red-600 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Remove
        </button>

        {/* The facts about the asset, for anyone deciding whether to replace it.
            Bytes are the original's, which is the number that matters when the
            question is "is this too heavy" — the delivered image is smaller. */}
        <p className="ml-auto font-mono text-[11px] text-mut-2 tabular-nums">
          {image.width}×{image.height} · {image.format.toUpperCase()} ·{' '}
          {formatBytes(image.bytes)}
        </p>
      </div>
    </div>
  )
}

/** Shown where an image is expected but its asset has gone — a Cloudinary
 *  delete that happened outside the app, most likely. Better than a broken
 *  image icon and a silent failure. */
export function MissingImage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-tile border border-dashed border-line bg-page px-4 py-8 text-center',
        className
      )}
    >
      <ImageOff className="size-6 text-mut-2" aria-hidden="true" />
      <p className="mt-2 text-[13px] font-semibold text-head">This image is no longer available</p>
      <p className="mt-1 text-[12.5px] text-mut-2">Upload a new one to replace it.</p>
    </div>
  )
}

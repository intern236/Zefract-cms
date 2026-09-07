'use client'

import { FIELD_BASE } from '@/components/forms/field'
import { ImagePreview } from '@/components/media/image-preview'
import { ImageUploader } from '@/components/media/image-uploader'
import { Label } from '@/components/ui/label'
import {
  RECOMMENDED_COVER,
  formatBytes,
  MAX_UPLOAD_BYTES,
  type CloudinaryImage,
} from '@/lib/cloudinary/types'
import { cn } from '@/lib/utils'

/**
 * The cover image, in two pieces: the picker and the words that go with it.
 *
 * SPLIT SO THE PANEL CAN PUT THEM IN DIFFERENT COLUMNS. The image is a big
 * square thing and belongs on the left where it can be seen at a useful size;
 * alt text and caption are text fields and belong on the right with the rest of
 * the writing. Keeping them in one component would have forced them into one.
 *
 * ALT TEXT IS NOT DECORATION, even though the field can be left empty. An image
 * with no alt is the one piece of a page a screen reader cannot work around,
 * and a cover is the largest thing on a post. It falls back to the post's title
 * when unwritten — a poor description, but never silence — and the SEO checks
 * flag it, because "describe this image" is a thirty-second job nobody does
 * unless asked.
 *
 * The caption is genuinely optional and prints under the image on the post page
 * inside a <figcaption>, which is why it lives here rather than being pasted
 * into the body: a caption that is part of the figure is read with the image
 * and moves with it.
 */

const ALT_MAX = 125
const CAPTION_MAX = 125

/**
 * The line inside the drop zone.
 *
 * THE DIMENSIONS LEAD, because they are the part that changes what the writer
 * does. Format and size only matter once a file has been rejected; the ratio
 * matters while they are still choosing which image to use, and it is the one
 * thing that decides whether the cover they picked survives the crop intact.
 */
const COVER_HINT =
  `${RECOMMENDED_COVER.width}x${RECOMMENDED_COVER.height} (16:9) · ` +
  `PNG, JPG or WEBP · Max ${formatBytes(MAX_UPLOAD_BYTES)}`

/**
 * The image itself: an uploader when there is none, a preview when there is.
 *
 * `legacyUrl` covers the posts whose cover predates Cloudinary. Those render as
 * a plain preview with no metadata line, because a stored blob has no public id
 * to report dimensions or a format for. Uploading a new image replaces it, and
 * the save clears the legacy record.
 */
export function CoverPicker({
  image,
  legacyUrl,
  error,
  busy = false,
  onUploaded,
  onRemove,
}: {
  image: CloudinaryImage | null
  legacyUrl: string | null
  error?: string
  busy?: boolean
  onUploaded: (image: CloudinaryImage) => void
  onRemove: () => void
}) {
  if (image) {
    return (
      <div>
        <ImagePreview image={image} busy={busy} onReplace={onRemove} onRemove={onRemove} />
        {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
      </div>
    )
  }

  if (legacyUrl) {
    return (
      <div>
        <div className="overflow-hidden rounded-tile border border-line bg-page">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={legacyUrl} alt="" className="aspect-video w-full object-cover" />
        </div>
        <p className="mt-2 text-[12.5px] text-mut-2">
          Stored on this site rather than in the image library. Uploading a new cover moves it
          across.
        </p>
        <div className="mt-3">
          <ImageUploader
            kind="cover"
            onUploaded={onUploaded}
            label="Replace cover image"
            hint={COVER_HINT}
            disabled={busy}
          />
        </div>
        {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
      </div>
    )
  }

  return (
    <div>
      <ImageUploader kind="cover" onUploaded={onUploaded} hint={COVER_HINT} disabled={busy} />
      <p className="mt-2.5 text-[12.5px] text-mut-2">
        Optional. A post without one gets a full-width text card on the blog index rather than
        an empty space.
      </p>
      {/* Says what happens to an image that is not 16:9, so the ratio above reads as
          advice rather than a requirement someone has to go and satisfy in Photoshop
          before they can publish. */}
      <p className="mt-1.5 text-[12.5px] text-mut-2">
        Another shape still works — it is cropped to 16:9 around the subject, and the
        same crop is used on the post, the blog index and the share card.
      </p>
      {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
    </div>
  )
}

/**
 * Alt text and caption for the cover.
 *
 * ONE ELEMENT, NOT A FRAGMENT, and that is the reason this wrapper exists.
 * Returning two sibling <div>s made them two separate cells of the panel's
 * two-column grid: Alt Text took the column beside the image and Caption
 * wrapped onto the next row, back under the picture. A fragment has no box, so
 * a grid lays out its children, not it.
 *
 * Always on screen, whether or not an image has been picked. Gating them on the
 * upload left half the panel holding a dashed apology and made the column jump
 * in height the moment a file finished uploading. The save action drops both
 * when there is no cover, so filling them in early stores nothing stale.
 */
export function CoverMeta({
  alt,
  caption,
  errors,
  onAltChange,
  onCaptionChange,
}: {
  alt: string
  caption: string
  errors: Record<string, string>
  onAltChange: (value: string) => void
  onCaptionChange: (value: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="coverAlt" className="text-[13.5px] font-semibold text-head">
          Alt Text
        </Label>
        <textarea
          id="coverAlt"
          name="coverAlt"
          value={alt}
          maxLength={ALT_MAX}
          onChange={(event) => onAltChange(event.target.value)}
          placeholder="Describe this image for SEO…"
          aria-invalid={errors.coverAlt ? true : undefined}
          className={cn(FIELD_BASE, 'mt-1.5 min-h-20 px-4 py-3 text-[14px] leading-relaxed')}
        />
        <Counter value={alt.length} max={ALT_MAX} />
        {errors.coverAlt ? <p className="mt-1 text-[13px] text-red-600">{errors.coverAlt}</p> : null}
      </div>

      <div>
        <Label htmlFor="coverCaption" className="text-[13.5px] font-semibold text-head">
          Caption <span className="font-normal text-mut-2">(Optional)</span>
        </Label>
        <textarea
          id="coverCaption"
          name="coverCaption"
          value={caption}
          maxLength={CAPTION_MAX}
          onChange={(event) => onCaptionChange(event.target.value)}
          placeholder="Write a caption for this image…"
          aria-invalid={errors.coverCaption ? true : undefined}
          className={cn(FIELD_BASE, 'mt-1.5 min-h-20 px-4 py-3 text-[14px] leading-relaxed')}
        />
        <Counter value={caption.length} max={CAPTION_MAX} />
        {errors.coverCaption ? (
          <p className="mt-1 text-[13px] text-red-600">{errors.coverCaption}</p>
        ) : null}
      </div>
    </div>
  )
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <p
      className={cn(
        'mt-1 text-right font-mono text-[11px] tabular-nums',
        value >= max ? 'text-brand-strong' : 'text-mut-2'
      )}
    >
      {value}/{max}
    </p>
  )
}

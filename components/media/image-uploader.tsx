'use client'

import { useCallback, useId, useRef, useState } from 'react'
import { AlertCircle, UploadCloud, X } from 'lucide-react'
import { startUpload } from '@/lib/cloudinary/upload-client'
import {
  ACCEPT_ATTRIBUTE,
  MAX_UPLOAD_BYTES,
  formatBytes,
  validateFile,
  type CloudinaryImage,
  type MediaFolder,
  type UploadProgress,
} from '@/lib/cloudinary/types'
import { cn } from '@/lib/utils'

/**
 * The empty state of a media field: a drop target that is also a button.
 *
 * BUILT FOR REUSE, because a Media Library is coming. It knows nothing about
 * posts, covers or the editor — it takes a folder to file into and hands back a
 * CloudinaryImage. The cover field composes it; a library picker or an inline
 * body upload can compose it identically.
 *
 * ACCESSIBILITY IS THE REASON FOR THE SHAPE. Drag-and-drop is unreachable
 * without a pointer, so the drop zone is a real <button> wrapping a hidden file
 * input: it is in the tab order, activates on Enter and Space for free, and
 * announces itself. The drag handlers are an enhancement layered on top, never
 * the only way in. `aria-describedby` ties the format and size rules to the
 * control, and an upload failure is announced through a live region rather than
 * appearing silently.
 *
 * A DRAG COUNTER, NOT A BOOLEAN. dragenter and dragleave both fire when the
 * pointer crosses a CHILD element, so a naive boolean flickers the highlight
 * off every time the cursor passes over the icon or the label inside the zone.
 * Counting entries and exits is the standard fix.
 */
export interface ImageUploaderProps {
  /** Which Cloudinary folder the file is filed into. */
  kind: MediaFolder
  onUploaded: (image: CloudinaryImage) => void
  /** Headline inside the drop zone. */
  label?: string
  /** Replaces the default "PNG, JPG or WEBP · Max 5MB" line. */
  hint?: string
  disabled?: boolean
  className?: string
}

export function ImageUploader({
  kind,
  onUploaded,
  label = 'Upload cover image',
  hint,
  disabled = false,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef<(() => void) | null>(null)
  const dragDepth = useRef(0)

  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hintId = useId()
  const errorId = useId()

  const uploading = progress !== null

  const handle = useCallback(
    async (file: File) => {
      /* Guarded rather than merely disabled: a second file can arrive by drop
         while the first is still going, and the pointer never touched the
         disabled control. */
      if (uploading || disabled) return

      const problem = validateFile(file)
      if (problem) {
        setError(problem)
        return
      }

      setError(null)
      setProgress({ loaded: 0, total: file.size, percent: 0 })

      const upload = startUpload(file, kind, setProgress)
      cancelRef.current = upload.cancel

      const result = await upload.done
      cancelRef.current = null
      setProgress(null)

      if (!result.ok) {
        /* A cancellation is a decision, not a failure — saying "upload failed"
           to someone who just pressed Cancel is the interface arguing. */
        if (!result.cancelled) setError(result.error)
        return
      }
      onUploaded(result.image)
    },
    [disabled, kind, onUploaded, uploading]
  )

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void handle(file)
  }

  if (uploading) {
    return (
      <div
        className={cn('rounded-tile border border-line bg-page px-5 py-8', className)}
        aria-busy="true"
      >
        <p className="text-center text-[13.5px] font-semibold text-head">Uploading image…</p>
        {/* A real progress bar with the ARIA role, so a screen reader gets the
            percentage rather than a decorative div that means nothing. */}
        <div
          role="progressbar"
          aria-label="Upload progress"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line"
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-200 ease-out motion-reduce:transition-none"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="mt-2 text-center font-mono text-[11.5px] text-mut-2 tabular-nums">
          {progress.percent}% · {formatBytes(progress.loaded)} of {formatBytes(progress.total)}
        </p>
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => cancelRef.current?.()}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-mut transition-colors hover:text-red-600"
          >
            <X className="size-3.5" aria-hidden="true" />
            Cancel upload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          dragDepth.current += 1
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault()
          dragDepth.current -= 1
          if (dragDepth.current <= 0) setDragging(false)
        }}
        onDrop={onDrop}
        aria-describedby={`${hintId}${error ? ` ${errorId}` : ''}`}
        className={cn(
          'flex w-full flex-col items-center rounded-tile border border-dashed px-4 py-10 transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-60',
          dragging ? 'border-brand bg-brand/5' : 'border-line bg-page hover:border-brand/50',
          error && 'border-red-300'
        )}
      >
        <UploadCloud
          aria-hidden="true"
          className={cn('size-7', dragging ? 'text-brand' : 'text-brand-strong')}
        />
        <span className="mt-2.5 text-[14px] font-semibold text-head">
          {dragging ? 'Drop to upload' : label}
        </span>
        <span id={hintId} className="mt-0.5 text-[12.5px] text-mut-2">
          {hint ?? `PNG, JPG or WEBP · Max ${formatBytes(MAX_UPLOAD_BYTES)}`}
        </span>
        <span className="mt-1 text-[12px] text-mut-2">Click, or drag an image here</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          /* Cleared before handling, so choosing the SAME file again after a
             failure still fires a change event. */
          event.target.value = ''
          if (file) void handle(file)
        }}
      />

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-[13px] text-red-600"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  )
}

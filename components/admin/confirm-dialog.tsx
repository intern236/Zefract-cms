'use client'

import { useRef } from 'react'
import { Dialog } from 'radix-ui'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The confirmation step for something that cannot be undone.
 *
 * WHY NOT window.confirm(). The native box is the browser's, not the site's: it
 * arrives in the OS typeface, pinned to the top of the window, with buttons
 * labelled OK and Cancel — so the one moment a person must read carefully is
 * the one moment the interface stops looking like itself. It also cannot say
 * WHICH post, cannot show an error if the delete fails, and blocks the whole
 * tab while it is open.
 *
 * This says the post's name in the title, keeps the site's own type and
 * spacing, labels the button with the verb it performs rather than "OK", and
 * has somewhere to put a failure. Radix supplies the parts that are easy to get
 * wrong: focus is trapped inside while it is open and restored to the trigger
 * on close, Escape and a click outside both dismiss, the page behind stops
 * scrolling, and the rest of the document is hidden from assistive tech.
 *
 * CANCEL IS THE DEFAULT FOCUS. Radix would otherwise focus the first tabbable
 * element, and a destructive button under an already-moving finger is how
 * people delete things they meant to keep.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  busyLabel,
  busy = false,
  error,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  /** Shown on the confirm button while the action is in flight. */
  busyLabel: string
  busy?: boolean
  /** A failure from the action, shown in place rather than as a second popup. */
  error?: string | null
  onConfirm: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* z-110 clears everything the site puts on screen: the header pill
            (80), the admin bar (72), the mobile sheet (95) and the skip link
            (100). A modal that something can paint over is not a modal. */}
        <Dialog.Overlay className="fixed inset-0 z-110 bg-ink/45 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Content
          onOpenAutoFocus={(event) => {
            /* Focus Cancel, not the destructive button — see the note above.
               preventDefault stops Radix placing focus itself, then the ref
               puts it where it belongs. */
            event.preventDefault()
            cancelRef.current?.focus()
          }}
          className={cn(
            'fixed top-1/2 left-1/2 z-111 w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2',
            'rounded-card border border-line bg-surface p-6 shadow-[0_30px_70px_-30px_rgba(8,20,34,0.5)]',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95'
          )}
        >
          <div className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[18px] font-bold tracking-[-0.02em] text-head">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-[14px] leading-relaxed text-mut">
                {description}
              </Dialog.Description>
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex justify-end gap-2.5">
            <Dialog.Close asChild>
              <button
                ref={cancelRef}
                type="button"
                disabled={busy}
                className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-head transition-colors hover:border-brand/50 disabled:opacity-50"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className="inline-flex h-9 items-center rounded-full bg-destructive px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? busyLabel : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

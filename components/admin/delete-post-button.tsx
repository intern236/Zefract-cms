'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { deletePost } from '@/app/admin/(dashboard)/blog/actions'

/**
 * The per-row delete on the admin post list. Its own client island so the list
 * page itself can stay a server component — this button is the only thing on
 * that page that needs the browser.
 *
 * The dialog names the post, because "delete this?" over a list of rows is
 * exactly how the wrong one gets deleted. A failure is shown inside the dialog
 * rather than as a second popup, so the row stays put and can be retried.
 */
export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onConfirm = async () => {
    setBusy(true)
    setError(null)
    const result = await deletePost(id)
    if (result.ok) {
      setOpen(false)
      setBusy(false)
      router.refresh()
      return
    }
    setBusy(false)
    setError(result.error)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null)
          setOpen(true)
        }}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12.5px] font-semibold text-mut transition-colors hover:border-red-200 hover:text-red-600"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
        Delete
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          /* A dismiss mid-request would leave the spinner running behind a
             closed dialog, so the only way out while busy is the action
             finishing. */
          if (!busy) setOpen(next)
        }}
        title="Delete this post?"
        description={`“${title}” and its page will be removed permanently. There is no undo. Any images it used stay in the library.`}
        confirmLabel="Delete post"
        busyLabel="Deleting…"
        busy={busy}
        error={error}
        onConfirm={onConfirm}
      />
    </>
  )
}

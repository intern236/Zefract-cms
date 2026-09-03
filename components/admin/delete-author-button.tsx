'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { deleteAuthor } from '@/app/admin/(dashboard)/authors/actions'

/**
 * The per-row delete on the admin author list. Its own client island so the list
 * page stays a Server Component — the same arrangement as DeletePostButton, and
 * this button is the only thing on that page that needs the browser.
 *
 * THE DIALOG STATES WHAT HAPPENS TO THE POSTS, which is the whole difference
 * from deleting a post. Deleting a post removes one thing; deleting an author
 * silently changes the byline on everything they wrote, and a confirmation that
 * did not say so would be hiding the consequential half of the action. The count
 * comes from the list page, which has already loaded the posts.
 */
export function DeleteAuthorButton({
  id,
  name,
  postCount,
}: {
  id: string
  name: string
  postCount: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onConfirm = async () => {
    setBusy(true)
    setError(null)
    const result = await deleteAuthor(id)
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
        onClick={() => setOpen(true)}
        aria-label={`Delete ${name}`}
        className="inline-flex size-8 items-center justify-center rounded-full border border-line bg-surface text-mut transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this author?"
        description={
          postCount === 0
            ? `“${name}” will be removed. No posts name them, so nothing else changes.`
            : `“${name}” will be removed and ${postCount} ${
                postCount === 1 ? 'post' : 'posts'
              } will fall back to the company byline. The posts themselves are kept.`
        }
        confirmLabel="Delete author"
        busyLabel="Deleting…"
        busy={busy}
        error={error}
        onConfirm={onConfirm}
      />
    </>
  )
}

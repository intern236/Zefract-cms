import 'server-only'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { requireWorkspace } from '@cms-logic/lib/auth/access'
import { getMessage } from '@cms-logic/lib/content/contact'
import { isId, readWorkspace } from '@cms-logic/lib/db'

/**
 * The open message, or a 404. Its own small read, so the page can run it side by
 * side with the message list.
 */
export const openMessage = cache(async (slug: string, id: string) => {
  const access = await requireWorkspace(slug, 'inbox.read')
  if (!isId(id)) notFound()
  const message = await readWorkspace(access.workspace.id, (tx) => getMessage(tx, access.workspace.id, id))
  if (!message) notFound()
  return message
})

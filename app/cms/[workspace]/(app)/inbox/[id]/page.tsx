import type { Metadata } from 'next'
import { InboxView } from '@cms-logic/components/inbox/inbox-view'
import { requireWorkspace } from '@cms-logic/lib/auth/access'
import { inboxData } from '@cms-logic/lib/inbox-data'
import { openMessage } from './message'
import { Fresh } from '@cms-logic/components/fresh/fresh'

export const metadata: Metadata = { title: 'Message' }

export default async function MessagePage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string; id: string }>
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const { workspace, id } = await params
  const access = await requireWorkspace(workspace, 'inbox.read')
  const data = await inboxData(access, await searchParams, () => openMessage(workspace, id))
  return (
    <>
      <Fresh />
      <InboxView workspace={workspace} {...data} />
    </>
  )
}

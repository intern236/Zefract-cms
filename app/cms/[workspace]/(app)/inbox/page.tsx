import type { Metadata } from 'next'
import { InboxView } from '@cms-logic/components/inbox/inbox-view'
import { requireWorkspace } from '@cms-logic/lib/auth/access'
import { inboxData } from '@cms-logic/lib/inbox-data'
import { Fresh } from '@cms-logic/components/fresh/fresh'

export const metadata: Metadata = { title: 'Inbox' }

export default async function InboxPage({ params, searchParams }: { params: Promise<{ workspace: string }>; searchParams: Promise<{ filter?: string; q?: string }> }) {
  const { workspace } = await params
  const access = await requireWorkspace(workspace, 'inbox.read')
  const data = await inboxData(access, await searchParams)
  return (
    <>
      <Fresh />
      <InboxView workspace={workspace} {...data} selected={null} />
    </>
  )
}

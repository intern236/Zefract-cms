import type { Metadata } from 'next'
import { Fresh } from '@cms-logic/components/fresh/fresh'
import { NewClientForm } from '@cms-logic/components/agency/new-client-form'
import { PageHeader } from '@cms-logic/components/ui/page-header'
import { requireAgency } from '@cms-logic/lib/auth/access'
import { cmsUrl } from '@cms-logic/lib/env'

export const metadata: Metadata = { title: 'Add a client' }

export default async function NewClient() {
  await requireAgency()
  return (
    <>
      <Fresh />
      <PageHeader eyebrow="New workspace" title="Add a client" description="They get their own workspace, a sign-in page in their colours, and a key for their website." />
      <NewClientForm cmsHost={cmsUrl().replace(/^https?:\/\//, '')} />
    </>
  )
}

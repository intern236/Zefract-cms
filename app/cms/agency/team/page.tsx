import type { Metadata } from 'next'
import { TeamPanel } from '@cms-logic/components/agency/team-panel'
import { PageHeader } from '@cms-logic/components/ui/page-header'
import { requireAgency } from '@cms-logic/lib/auth/access'
import { agencyTeam } from '@cms-logic/lib/agency-team'
import { Fresh } from '@cms-logic/components/fresh/fresh'

export const metadata: Metadata = { title: 'Team' }

export default async function TeamPage() {
  const user = await requireAgency()
  const { members, pending } = await agencyTeam()
  return (
    <>
      <Fresh />
      <PageHeader title="Your team" description="People at your agency who manage every client." />
      <TeamPanel
        me={user.id}
        members={members.map((m) => ({ ...m, lastLoginAt: m.lastLoginAt?.toISOString() ?? null, disabled: Boolean(m.disabledAt) }))}
        pending={pending.map((p) => ({ ...p, expiresAt: p.expiresAt.toISOString() }))}
      />
    </>
  )
}

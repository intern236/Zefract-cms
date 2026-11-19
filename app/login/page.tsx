import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Container } from '@/components/ui/section'
import { currentSession } from '@cms-logic/lib/auth/session'
import { userCount } from '@cms-logic/lib/setup-state'
import { findInvite } from '@cms-logic/lib/auth/invites'
import { ROLE_LABEL } from '@cms-logic/lib/permissions'
import { agencyName } from '@cms-logic/lib/env'
import { LoginForm, type InviteData } from './login-form'

export const metadata: Metadata = {
  title: 'Sign in',
  alternates: {},
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; invite?: string }>
}) {
  if ((await userCount()) === 0) redirect('/cms/setup')

  const { next, invite: inviteToken } = await searchParams
  const user = await currentSession()

  let inviteData: InviteData | undefined = undefined

  if (inviteToken) {
    const invite = await findInvite(inviteToken)
    if (!invite) {
      inviteData = {
        token: inviteToken,
        email: '',
        roleLabel: '',
        where: '',
        mode: 'expired',
      }
    } else {
      const ws = invite.workspace
      const where = ws ? ws.name : `the ${agencyName()} team`
      const roleLabel = invite.role === 'agency' ? 'Agency Admin' : ROLE_LABEL[invite.role]

      let mode: 'new' | 'join' | 'signin' | 'wrong' = 'new'
      if (invite.existingUserId) {
        if (user?.id === invite.existingUserId) {
          mode = 'join'
        } else if (user) {
          mode = 'wrong'
        } else {
          mode = 'signin'
        }
      } else if (user) {
        mode = 'wrong'
      } else {
        mode = 'new'
      }

      inviteData = {
        token: inviteToken,
        email: invite.email,
        where,
        roleLabel,
        mode,
        currentEmail: user?.email,
      }
    }
  } else if (user) {
    if (user.isAgency) redirect('/admin/cms/agency')
    const db = await (await import('@cms-logic/lib/db')).sys()
    const allotted = await db.members.workspacesOf(user.id)
    if (allotted.length > 0) {
      redirect(`/cms/${allotted[0].slug}`)
    }
    redirect('/cms')
  }

  return (
    <section data-admin-surface className="hero-grid relative isolate overflow-clip px-0 pt-36 pb-28 md:pt-44">
      <Container>
        <div className="mx-auto max-w-[440px]">
          <LoginForm
            next={typeof next === 'string' ? next : undefined}
            invite={inviteData}
          />
        </div>
      </Container>
    </section>
  )
}

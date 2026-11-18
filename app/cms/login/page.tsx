import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthShell } from '@cms/components/auth/auth-shell'
import { LoginForm } from '@cms/components/auth/login-form'
import { currentSession } from '@cms/lib/auth/session'
import { agencyAccent, agencyName, outboxVisible } from '@cms/lib/env'
import { userCount } from '@cms/lib/setup-state'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if ((await userCount()) === 0) redirect('/cms/setup')
  if (await currentSession()) redirect('/cms')
  const { next } = await searchParams
  return (
    <AuthShell brand={{ name: agencyName(), slug: null, accent: agencyAccent(), hasLogo: false, agency: agencyName() }}>
      <LoginForm heading="Welcome back" next={typeof next === 'string' ? next : undefined} outboxHint={outboxVisible()} />
    </AuthShell>
  )
}

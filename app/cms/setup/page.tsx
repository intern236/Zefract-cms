import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthShell } from '@cms/components/auth/auth-shell'
import { SetupForm } from '@cms/components/auth/forms'
import { agencyAccent, agencyName } from '@cms/lib/env'
import { userCount } from '@cms/lib/setup-state'

export const metadata: Metadata = { title: 'Set up' }

export default async function SetupPage() {
  if ((await userCount()) > 0) redirect('/cms/login')
  const production = process.env.NODE_ENV === 'production'
  return (
    <AuthShell brand={{ name: agencyName(), slug: null, accent: agencyAccent(), hasLogo: false, agency: agencyName() }}>
      <SetupForm needsToken={production} dev={!production} />
    </AuthShell>
  )
}

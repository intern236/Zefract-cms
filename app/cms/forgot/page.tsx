import type { Metadata } from 'next'
import { brandStyle } from '@cms-logic/lib/brand-style'
import { AuthShell } from '@cms-logic/components/auth/auth-shell'
import { ForgotForm } from '@cms-logic/components/auth/forms'
import { getWorkspaceBySlug } from '@cms-logic/lib/auth/access'
import { agencyAccent, agencyName } from '@cms-logic/lib/env'

export const metadata: Metadata = { title: 'Reset password' }

export default async function ForgotPage({ searchParams }: { searchParams: Promise<{ workspace?: string }> }) {
  const { workspace } = await searchParams
  const ws = typeof workspace === 'string' ? await getWorkspaceBySlug(workspace) : null
  const known = ws && !ws.archived ? ws : null
  return (
    <div style={known ? brandStyle(known.accent) : undefined}>
      <AuthShell
        brand={
          known
            ? { name: known.name, slug: known.slug, accent: known.accent, hasLogo: known.hasLogo, agency: agencyName() }
            : { name: agencyName(), slug: null, accent: agencyAccent(), hasLogo: false, agency: agencyName() }
        }
      >
        <ForgotForm workspace={known?.slug} />
      </AuthShell>
    </div>
  )
}

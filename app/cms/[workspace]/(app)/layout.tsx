import { AppShell } from '@cms-logic/components/shell/app-shell'
import { requireWorkspace } from '@cms-logic/lib/auth/access'
import { brandStyle } from '@cms-logic/lib/brand-style'
import { shellProps } from '@cms-logic/lib/shell'

/** Every page inside a client's workspace: signed in, a member, in their colours. */
export default async function WorkspaceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ workspace: string }> }) {
  const { workspace } = await params
  const access = await requireWorkspace(workspace)
  const props = await shellProps(access.user, access)
  return (
    <div style={brandStyle(access.workspace.accent)}>
      <AppShell {...props}>{children}</AppShell>
    </div>
  )
}

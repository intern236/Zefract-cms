import { AppShell } from '@cms-logic/components/shell/app-shell'
import { requireAgency } from '@cms-logic/lib/auth/access'
import { shellProps } from '@cms-logic/lib/shell'

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAgency()
  return <AppShell {...await shellProps(user, null)}>{children}</AppShell>
}

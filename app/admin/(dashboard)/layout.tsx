import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * Every admin page except the login form lives inside this group, and this
 * layout is the page-level half of the auth boundary: requireAdmin() verifies
 * the session cookie server-side and redirects to the login form when it fails.
 * proxy.ts does the same at the routing layer, but only as a convenience — see
 * the note there. The third layer is the actions themselves, which re-verify
 * before every write.
 *
 * NO VISUAL CHROME OF ITS OWN, deliberately. Each page decides what it is: the
 * list and the editor wrap themselves in <AdminShell> and get the application
 * treatment (own top bar, no site header or footer), while the draft preview
 * skips it and keeps the site's real chrome, because its whole job is to look
 * like the published page. A layout that imposed either one would have to be
 * fought by whichever page wanted the other.
 */
export const metadata: Metadata = {
  title: 'Admin',
  alternates: {},
  robots: { index: false, follow: false },
}

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  await requireAdmin()
  return <>{children}</>
}

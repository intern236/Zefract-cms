import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { cookies } from 'next/headers'
import { Providers } from '@cms-logic/components/providers/providers'
import { agencyAccent, agencyName, outboxVisible } from '@cms-logic/lib/env'
import { accentForeground } from '@cms-logic/lib/workspaces/settings'
import { AppShell } from '@cms-logic/components/shell/app-shell'
import { requireAgency } from '@cms-logic/lib/auth/access'
import { shellProps } from '@cms-logic/lib/shell'
import { requireAdmin } from '@/lib/admin-auth'
import '../../../../app/cms/globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })
const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: `Agency · ${agencyName()}`, template: `%s · ${agencyName()}` },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f5f1' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0c' },
  ],
}

export default async function AdminCmsLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  const user = await requireAgency()
  const theme = (await cookies()).get('cms_theme')?.value
  const accent = agencyAccent()

  const props = await shellProps(user, null)
  const adminNav = [
    { key: 'clients' as const, label: 'Clients', href: '/admin/cms/agency', exact: true },
    { key: 'team' as const, label: 'Team', href: '/admin/cms/agency/team' },
    ...(outboxVisible() ? [{ key: 'outbox' as const, label: 'Email outbox', href: '/admin/cms/agency/outbox' }] : []),
    { key: 'posts' as const, label: 'Blog Posts', href: '/admin/blog' },
  ]

  return (
    <div
      data-cms-surface
      data-theme={theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : undefined}
      className={`min-h-dvh bg-canvas text-ink font-sans ${geist.variable} ${geistMono.variable} ${instrument.variable}`}
      style={{ ['--brand' as string]: accent, ['--brand-fg' as string]: accentForeground(accent) }}
    >
      <Providers>
        <AppShell {...props} nav={adminNav}>
          {children}
        </AppShell>
      </Providers>
    </div>
  )
}

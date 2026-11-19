import { getPillars, getPillarServices, getCrossCuttingServices } from '@/lib/content'
import { HeaderShell } from './header-shell'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/admin-session'
import { currentSession } from '@cms-logic/lib/auth/session'

/**
 * Server Component: resolves the mega-menu content, then hands it to the client
 * shell that owns the interactive parts. Keeps the content layer out of the
 * client bundle.
 */
export async function SiteHeader() {
  const pillars = await getPillars()

  const columns = await Promise.all(
    pillars.map(async (pillar) => ({
      slug: pillar.slug,
      name: pillar.name,
      outcome: pillar.outcome,
      services: (await getPillarServices(pillar.slug))
        .slice(0, 12)
        .map((s) => ({ slug: s.slug, name: s.name })),
    }))
  )

  const support = (await getCrossCuttingServices()).map((s) => ({
    slug: s.slug,
    name: s.name,
    outcome: s.outcome ?? '',
  }))

  let signedIn = false
  try {
    const jar = await cookies()
    const adminToken = jar.get(SESSION_COOKIE)?.value
    if (adminToken && (await verifySessionToken(adminToken))) {
      signedIn = true
    } else {
      const cmsUser = await currentSession()
      if (cmsUser) signedIn = true
    }
  } catch {
    // Unauthenticated or build-time prerender
  }

  return <HeaderShell columns={columns} support={support} signedIn={signedIn} />
}

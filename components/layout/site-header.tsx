import { getPillars, getPillarServices, getCrossCuttingServices } from '@/lib/content'
import { HeaderShell } from './header-shell'

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
      /* Appendix D L604-605: "Feed the top sub-services into the service mega menu."

         THE CAP IS NOW HIGHER THAN ANY PILLAR, so the menu shows every service. It was six,
         which is one of those numbers that quietly costs you a page: at six, Marketing &
         Growth showed six of its eight and hid Email and Local & Reputation entirely — and
         "where is Email?" is exactly the question that came back. Before that, splitting
         "AI Search (AEO / GEO)" into two pages had pushed Content Marketing out the same way.
         A cap that silently drops services is a cap that has to be re-tuned every time the
         catalogue changes, and it had been re-tuned twice.

         Current counts: Marketing & Growth 8, Cloud Data & Security 5, Engineering 4,
         AI & Automation 4, Experience & Design 3. Eight rows measured 270px in the flyout
         column against a 5-column grid, so the panel grew and nothing scrolled or clipped.
         The slice stays rather than being deleted, because the reason for a cap — a column
         tall enough to need scrolling — is a real one; it is just not reached at nine. */
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

  return <HeaderShell columns={columns} support={support} />
}

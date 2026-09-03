import { SITE, CONTACT } from '@/content/site'
import { resolved } from '@/lib/todo'
import { absoluteUrl } from '@/lib/url'
import { getPillars, getPillarServices, getCrossCuttingServices } from '@/lib/content'
import type { PillarSlug } from '@/content/types'

/**
 * /llms.txt — the site described for an answer engine.
 *
 * A plain-text index an LLM can read in one request instead of crawling forty pages. It is
 * a proposed convention rather than a standard, so nothing depends on it; it costs one
 * small file and is the cheapest way to be summarised correctly rather than approximately.
 *
 * GENERATED, NOT WRITTEN, for the same reason robots.ts and sitemap.ts are. A hand-kept
 * copy of the service list is a copy that goes stale the first time a service is renamed,
 * and this file's whole value is being an accurate index. Everything below is derived from
 * content/, so `npm run gen:services` reaches here too.
 *
 * THE SERVICE LIST IS THE PILLARS' OWN, not `getServices()`. The two differ by exactly one
 * entry: /services/local-reputation exists and is deliberately unlinked at the client's
 * request (see content/pillars.ts). Deriving from the pillars keeps this file agreeing with
 * what the site actually links, rather than advertising to an answer engine a page a visitor
 * cannot reach from the navigation.
 *
 * Static: the content cannot vary per request, and a GET handler in Next 16 is dynamic by
 * default. Without this it would be re-rendered per hit for a file that changes at deploy.
 */
export const dynamic = 'force-static'

/**
 * The summary, in the client's own words.
 *
 * NOT `SITE.description`, and that is a change from how this file used to open. The client
 * supplied a version written specifically for this file, and it is the longer form: it
 * names the entity, says what the company does, and then says WHY the single-team model
 * matters ("so nothing is lost between vendors"), which is the sentence an answer engine
 * needs to characterise the business rather than list it.
 *
 * The two do not contradict each other — this is the same claim as SITE.description at more
 * length — so the risk the previous note here worried about does not arise. If this wording
 * is ever wanted site-wide it belongs in SITE.description, not copied to a second place.
 */
const SUMMARY =
  'Zefract Tech Pvt Ltd is a product-and-growth studio that builds digital products and then grows them. One team covers engineering, design, AI, cloud and marketing, so nothing is lost between vendors.'

/**
 * What each practice actually covers, supplied by the client for this file.
 *
 * DELIBERATELY NOT `pillar.outcome`, which is what this used to print. Those are positioning
 * lines — "Products that hold up under real load", "AI that ships, not AI that demos" — and
 * they are the right words on a page a human is reading, where the heading above already
 * says what the practice is. Handed to an answer engine on its own, "Infrastructure that
 * stops being a topic" describes nothing it can match a question against. These name the
 * work instead, which is what gets a page retrieved and cited.
 *
 * Exhaustive over PillarSlug ON PURPOSE. A sixth pillar would be a type error here rather
 * than silently falling back to a tagline that reads nothing like its five neighbours —
 * the failure would otherwise be invisible, because the file would still render.
 */
const PILLAR_NOTES: Record<PillarSlug, string> = {
  engineering: 'Web, SaaS and mobile builds, APIs, QA automation',
  'experience-and-design': 'UX research, UI, design systems, brand',
  'ai-and-automation': 'Agents, copilots, RAG, intelligent automation',
  'cloud-data-and-security': 'Migration, platform engineering, pipelines, VAPT',
  'marketing-and-growth': 'SEO, AEO, GEO, PPC, content, lifecycle',
}

/**
 * The company facts an answer engine asks for that are NOT derivable from the pages.
 *
 * THE TWO PLACEHOLDERS HERE ARE NOW ANSWERED. The founding year and the typical launch were
 * `TODO()`s, held back because the only figures available were HERO_PROOF entries carrying
 * `verified: false` and a number handed to a machine as a fact is repeated without any of
 * the context a hero gives it. The client has since supplied both directly — 2019, and six
 * weeks to production for a core site — so they are stated rather than dropped.
 *
 * `HQ` IS NOT `CONTACT.address` AND MUST NOT BECOME IT. The client gave "Delhi NCR, India",
 * which is a region and is exactly right for this file. It is NOT the office address that
 * TODO is waiting on: that one gates the LocalBusiness schema and the map embed, both of
 * which need a street. Resolving that TODO with a region would publish a postal address
 * that does not exist, so it stays open — see content/site.ts and `npm run check:todos`.
 *
 * `resolved()` still guards every value, so anything that becomes a TODO again drops out
 * rather than printing the marker.
 */
const FACTS: { label: string; value: string | undefined }[] = [
  { label: 'Founded', value: '2019' },
  { label: 'HQ', value: 'Delhi NCR, India' },
  /* Replaces the derived `Language: English`. The client's line says the same thing and
     more: it answers the question actually being asked, which is who can buy this. */
  { label: 'Serves', value: `global, ${SITE.locale === 'en' ? 'English' : SITE.locale}-first` },
  { label: 'Model', value: 'one accountable team, fixed quote per phase, no vendor handoffs' },
  { label: 'Typical launch', value: 'six weeks to production for a core site' },
  { label: 'Contact', value: CONTACT.email },
]

/** `- [Name](absolute url)`, optionally followed by a short line. Absolute because the file
 *  is read away from the site, where a relative path resolves against nothing. */
function link(name: string, path: string, note?: string): string {
  return `- [${name}](${absoluteUrl(path)})${note ? `: ${note}` : ''}`
}

export async function GET(): Promise<Response> {
  const pillars = await getPillars()
  const grouped = await Promise.all(
    pillars.map(async (pillar) => ({ pillar, services: await getPillarServices(pillar.slug) }))
  )
  const crossCutting = await getCrossCuttingServices()

  const lines: string[] = [
    `# ${SITE.name}`,
    '',
    /* One blockquote, which is where the convention puts the summary. It already opens with
       the legal name, so the entity is unambiguous — "Zefract" alone is a word, "Zefract
       Tech Pvt Ltd" is a company. */
    `> ${SUMMARY}`,
    '',
    '## Services',
    ...grouped.map(({ pillar }) =>
      link(pillar.name, `/services/${pillar.slug}`, PILLAR_NOTES[pillar.slug])
    ),
    '',
    /* Every service as its own URL, under its own heading.
       THE CLIENT'S DRAFT OF THIS FILE STOPPED AT THE FIVE ABOVE, and these are kept anyway
       rather than deleted to match it. The five say what the company sells; these twenty-odd
       are what an engine matches a SPECIFIC question against, and the page it can cite when
       it does. Dropping them would cost this file most of its reach for a question like
       "who does AEO in India" — which is a service Zefract sells, so being retrievable for
       it is the point. Nothing here contradicts the draft; it is the same list, deeper.
       Names only: a description each would double the file for wording already on the page
       the link points at. */
    '## Service pages',
    ...grouped.flatMap(({ services }) =>
      services.map((service) => link(service.name, `/services/${service.slug}`))
    ),
    ...crossCutting.map((service) => link(service.name, `/services/${service.slug}`)),
    '',
    '## Company',
    link('Services index', '/services'),
    link('Work', '/work'),
    link('About', '/about'),
    link('Contact', '/contact'),
    '',
    '## Key facts',
    ...FACTS.map((fact) => {
      const value = resolved(fact.value)
      return value ? `- ${fact.label}: ${value}` : null
    }).filter((line): line is string => line !== null),
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      /* Long enough that it is not refetched on every crawl, short enough that a service
         rename reaches an engine within the day. */
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  })
}

/**
 * The single seam between the site and its content.
 *
 * Components never import from content/ directly — they call these accessors.
 * Today the data comes from typed files; when the brief's CMS requirement (§9,
 * L222-223) is picked up, only this file changes.
 *
 * The functions are async on purpose: Server Components can await them now, so
 * swapping in a network-backed source later is not a breaking change.
 */
import { GENERATED_SERVICES } from '@/content/services.generated'
import { ADDITIONAL_SERVICES } from '@/content/services.additions'
import { SERVICE_OVERRIDES, CHIP_SHORT } from '@/content/services.overrides'
import { PILLARS } from '@/content/pillars'
import { CASE_STUDIES, TESTIMONIALS, FAQS } from '@/content/cases'
import { SERVICE_FAQS } from '@/content/service-faqs'
import { SERVICE_POINTS } from '@/content/service-points'
import { SERVICE_STORY } from '@/content/service-story'
import type { CaseStudy, Faq, Pillar, Service, Testimonial } from '@/content/types'

/**
 * Generated content + hand-authored positioning + shortened chip labels.
 *
 * Two catalogue sources, one list. GENERATED_SERVICES is Appendix D, parsed; ADDITIONAL_SERVICES
 * is the services the client documented outside it — see the note in services.additions.ts. They
 * are concatenated here rather than merged in the generated file so that file stays exactly what
 * its header claims. Everything downstream of this line treats them identically, and the pillar
 * decides display order regardless of which list a service came from.
 */
const SERVICES: Service[] = [...GENERATED_SERVICES, ...ADDITIONAL_SERVICES].map((s) => ({
  ...s,
  ...SERVICE_OVERRIDES[s.slug],
  points: SERVICE_POINTS[s.slug],
  story: SERVICE_STORY[s.slug],
  groups: s.groups.map((g) => ({
    ...g,
    chips: g.chips.map((c) => ({
      ...c,
      short: CHIP_SHORT[c.label],
    })),
  })),
}))

const SERVICE_BY_SLUG = new Map<string, Service>(SERVICES.map((s) => [s.slug, s]))
// Keyed by plain string: callers look these up with an arbitrary route param,
// so narrowing to the PillarSlug union here would only push a cast to every caller.
const PILLAR_BY_SLUG = new Map<string, Pillar>(PILLARS.map((p) => [p.slug, p]))

export async function getServices(): Promise<Service[]> {
  return SERVICES
}

export async function getService(slug: string): Promise<Service | undefined> {
  return SERVICE_BY_SLUG.get(slug)
}

export async function getPillars(): Promise<Pillar[]> {
  return PILLARS
}

export async function getPillar(slug: string): Promise<Pillar | undefined> {
  return PILLAR_BY_SLUG.get(slug)
}

/** Services belonging to a pillar, in the order the pillar declares. */
export async function getPillarServices(slug: string): Promise<Service[]> {
  const pillar = PILLAR_BY_SLUG.get(slug)
  if (!pillar) return []
  return pillar.services
    .map((s) => SERVICE_BY_SLUG.get(s))
    .filter((s): s is Service => Boolean(s))
}

/** Services outside the five pillars — currently just Managed Services. */
export async function getCrossCuttingServices(): Promise<Service[]> {
  return SERVICES.filter((s) => s.parent === 'cross-cutting')
}

/**
 * `/services/[slug]` serves both pillar and service pages. Appendix B's flat
 * service URLs are preserved, and the five pillar routes sit alongside them —
 * verified not to collide. The caller switches on `kind`.
 */
export type ServiceRouteEntry =
  | { kind: 'pillar'; pillar: Pillar; services: Service[] }
  | { kind: 'service'; service: Service }

export async function getServiceRoute(slug: string): Promise<ServiceRouteEntry | null> {
  const pillar = PILLAR_BY_SLUG.get(slug)
  if (pillar) {
    return { kind: 'pillar', pillar, services: await getPillarServices(slug) }
  }
  const service = SERVICE_BY_SLUG.get(slug)
  if (service) return { kind: 'service', service }
  return null
}

/** Every slug served by /services/[slug] — the 5 pillars plus every service. */
export async function getServiceRouteSlugs(): Promise<string[]> {
  return [...PILLARS.map((p) => p.slug), ...SERVICES.map((s) => s.slug)]
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return CASE_STUDIES
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | undefined> {
  return CASE_STUDIES.find((c) => c.slug === slug)
}

/** Case studies that reference a given service — used for service-page proof. */
export async function getCaseStudiesForService(slug: string): Promise<CaseStudy[]> {
  return CASE_STUDIES.filter((c) => c.services.includes(slug))
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return TESTIMONIALS
}

/**
 * Site-wide FAQs, or the subset attached to one service.
 *
 * Two sources: the general questions in cases.ts, and the per-service sets in
 * service-faqs.ts. Kept in separate files because the per-service list is long and has
 * nothing to do with case studies, but joined here so callers only ever see one list. The
 * unfiltered call still returns only the general questions, so adding service FAQs cannot
 * leak thirty entries onto the home page.
 */
const ALL_FAQS: Faq[] = [...FAQS, ...SERVICE_FAQS]

export async function getFaqs(service?: string): Promise<Faq[]> {
  if (!service) return ALL_FAQS.filter((f) => !f.service)
  return ALL_FAQS.filter((f) => f.service === service)
}

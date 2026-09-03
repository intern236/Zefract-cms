import type { Pillar } from './types'

/**
 * The five pillars.
 *
 * The brief names "5 pillar pages" (L110, L322) but Appendix B's sitemap contains
 * no pillar-level routes — only flat /services/<service> URLs. Those flat URLs are
 * preserved as-is (they are likely committed for SEO) and these five routes are
 * added alongside. None of the slugs below collides with a service slug.
 *
 * Coverage lines are drawn from Appendix A (L387-484).
 */
export const PILLARS: Pillar[] = [
  {
    slug: 'engineering',
    name: 'Engineering',
    h1: 'Engineering Services: Web, APIs, Mobile & QA',
    outcome: 'Products that hold up under real load.',
    blurb:
      'Web applications, APIs and system architecture, product discovery through MVP and beyond, native and cross-platform mobile, and the test automation that keeps all of it honest.',
    services: [
      'digital-engineering',
      'software-product-engineering',
      'mobile-engineering',
      'quality-engineering',
    ],
  },
  {
    slug: 'experience-and-design',
    name: 'Experience & Design',
    h1: 'Experience & Design: Web, UX/UI & Branding',
    outcome: 'Interfaces people finish, not abandon.',
    blurb:
      'Marketing sites, ecommerce and CMS builds; UX research, UI design and design systems; and the brand identity that ties them together.',
    services: ['digital-experience', 'experience-design', 'branding-creative'],
  },
  {
    slug: 'ai-and-automation',
    name: 'AI & Automation',
    h1: 'AI & Automation: Agents, Copilots & Workflows',
    outcome: 'AI that ships, not AI that demos.',
    blurb:
      'Agentic workflows and copilots, LLM integration and RAG over your own data, and the process automation that removes the work nobody wanted to do.',
    services: [
      'applied-ai',
      'ai-enablement',
      'conversational-ai',
      'intelligent-automation',
    ],
  },
  {
    slug: 'cloud-data-and-security',
    name: 'Cloud, Data & Security',
    h1: 'Cloud, Data & Security Services',
    outcome: 'Infrastructure that stops being a topic.',
    blurb:
      'Cloud migration and platform engineering, data pipelines and analytics you can act on, and security testing that finds problems before anyone else does.',
    services: [
      'cloud-modernization',
      'platform-engineering',
      'data-and-ai',
      'data-and-analytics',
      'cybersecurity',
    ],
  },
  {
    slug: 'marketing-and-growth',
    name: 'Marketing & Growth',
    h1: 'Marketing & Growth: SEO, PPC & AI Search',
    outcome: 'Demand you can trace to a number.',
    blurb:
      'Search, paid, social and content working off one plan, including the answer-engine work that decides whether AI assistants mention you at all.',
    services: [
      'seo',
      'ai-search-aeo',
      'ai-search-geo',
      'paid-advertising',
      'social-media',
      'content-marketing',
      /* `email-marketing` is the service Appendix D calls "Email, CRM & Automation", renamed
         when its own document arrived — see SPLITS in scripts/generate-services.mjs.
         `digital-marketing-strategy` is not in Appendix D at all; it comes from a client
         document and lives in content/services.additions.ts. */
      'email-marketing',
      'digital-marketing-strategy',
      /* `local-reputation` IS DELIBERATELY ABSENT, at the client's request — they do not want
         the tab. A pillar lists the services it shows, so leaving it out of this array removes
         it from the mega menu and from the pillar page grid in one place.

         The page itself still exists at /services/local-reputation and stays in the sitemap:
         Appendix B commits that URL, the content is written, and the local work is real — SEO's
         own Appendix D groups include "Local SEO: win near me". So this is unlinked, not
         deleted. If it should stop existing, the honest version is a permanent redirect to
         /services/seo in next.config.ts plus removing it from the route slugs, not an orphan. */
    ],
  },
]

export const PILLAR_BY_SLUG = new Map(PILLARS.map((p) => [p.slug, p]))

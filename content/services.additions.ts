import type { GeneratedService } from './types'

/**
 * Services the client documented OUTSIDE Appendix D.
 *
 * WHY THIS FILE EXISTS. Every other service on the site comes from
 * content/source/service-catalogue.md, parsed into services.generated.ts by
 * `npm run gen:services`. That file is auto-generated and says so at the top, and the
 * catalogue itself is a faithful copy of the client's appendix — neither is a place to hand-add
 * a service the appendix does not contain. So a service that arrives as its own document lands
 * here instead, in the same `GeneratedService` shape, and lib/content.ts concatenates the two
 * lists. The provenance of every service stays readable from the file it sits in.
 *
 * These entries carry the same three things Appendix D gives a service — group name, benefit
 * line, chips — so pillar cards, JSON-LD and the fallback grid all work without a special case.
 * The groups mirror the document's own numbered sections and the chips are its INCLUDES lines
 * verbatim; only the short benefit line is ours, because the document has full paragraphs where
 * the appendix has a three-word promise. The paragraphs are not duplicated here — they live in
 * content/service-points.ts, which is where a document-backed service's prose belongs.
 */
export const ADDITIONAL_SERVICES: GeneratedService[] = [
  /* SOURCE. Zefract_Digital_Marketing_Strategy.docx. Seven numbered sections, in the
     document's own order. Marketing & Growth had every channel but no page for the plan that
     decides which channels to run — the document's own closing argument is that strategy is
     what stops SEO, paid and social competing for the same budget. */
  {
    slug: 'digital-marketing-strategy',
    name: 'Digital Marketing Strategy',
    parent: 'marketing-and-growth',
    groups: [
      {
        name: 'Market & Opportunity Mapping',
        benefit: 'aim where demand is real',
        chips: [
          { label: 'Market sizing' },
          { label: 'Best-fit customer profile' },
          { label: 'Competitor gaps' },
          { label: 'Demand signals' },
          { label: 'Opportunity shortlist' },
        ],
      },
      {
        name: 'Budget & Capacity Planning',
        benefit: 'a plan you can afford to run',
        chips: [
          { label: 'Budget mapping' },
          { label: 'Resource planning' },
          { label: 'Cost-per-move estimates' },
          { label: 'Realistic timelines' },
          { label: 'Trade-off decisions' },
        ],
      },
      {
        name: 'Growth & Channel Strategy',
        benefit: 'a few channels, chosen on purpose',
        chips: [
          { label: 'Growth roadmap' },
          { label: 'Channel selection' },
          { label: 'Budget allocation' },
          { label: 'Channel-fit analysis' },
          { label: 'Sequencing' },
        ],
      },
      {
        name: 'Campaign & Media Planning',
        benefit: 'the year, on a calendar',
        chips: [
          { label: 'Media calendar' },
          { label: 'Placement planning' },
          { label: 'Format mix' },
          { label: 'Spend scheduling' },
          { label: 'Platform coordination' },
        ],
      },
      {
        name: 'Go-to-Market & Campaign Strategy',
        benefit: 'launches that land',
        chips: [
          { label: 'Launch playbook' },
          { label: 'Positioning' },
          { label: 'Audience messaging' },
          { label: 'Campaign narratives' },
          { label: 'Market entry plan' },
        ],
      },
      {
        name: 'KPI Frameworks',
        benefit: 'agree what winning looks like',
        chips: [
          { label: 'KPI definition' },
          { label: 'Metric hierarchy' },
          { label: 'Funnel tracking' },
          { label: 'Reporting setup' },
          { label: 'Success benchmarks' },
        ],
      },
      {
        name: 'Experiment & Test Roadmaps',
        benefit: 'keep finding what works next',
        chips: [
          { label: 'Test pipeline' },
          { label: 'Experiment design' },
          { label: 'Prioritisation' },
          { label: 'Measured results' },
          { label: 'Continuous learning' },
        ],
      },
    ],
  },
]

import type { ServiceRoadmap } from './types'

/**
 * Six-phase execution roadmaps, keyed by the service they belong to.
 *
 * SOURCE. Zefract_Service_Roadmaps_Table.html, supplied by the client. Six services, six
 * phases each, transcribed with the document's own phase names, week ranges, lead sentences
 * and deliverables. Two deliberate departures from it, both noted where they apply below: the
 * em dashes in its prose are rewritten as commas, colons or full stops to match house style,
 * and each service is titled with the name the rest of the site uses rather than the
 * document's own label.
 *
 * KEYED BY SERVICE, not by pillar. These first rendered as one stack on the Marketing & Growth
 * pillar page, which had two problems. Six roadmaps in one place had to be collapsed behind an
 * accordion or they buried the page, so the plan for the service someone actually came to read
 * was a click away. And the document's sixth roadmap is Branding & Creative, an Experience &
 * Design service, so it sat under a pillar it does not belong to and needed a label explaining
 * why. On its own service page it simply belongs, and the explaining goes away rather than
 * being managed.
 *
 * The deliverables were one string per phase in the document, separated by middots. They are
 * split into a real array, because a middot is a rendering choice and this file is content.
 * Splitting them is also why each one is capitalised here and is not in the source: the
 * document wrote them as a single running sentence, so only the first was, and a list of items
 * where item one is capitalised and items two and three are not reads as a mistake.
 */

/**
 * The document's closing note, shown under whichever roadmap is on the page.
 *
 * NOT decoration. Its second sentence answers a question the phase table raises and cannot
 * answer itself: SEO, Social Media and AI Search each give two consecutive phases the same
 * "Weeks 4-6" range, which reads as a copy-paste error unless someone says the phases run in
 * parallel. The client says so, and this is where.
 *
 * The two sentences are the client's, verbatim, apart from the em dashes bracketing the list
 * of phases becoming parentheses per house style. The HEADING is ours: the document's own was
 * "One method, six services", which was right on a page showing six and invites "which six?"
 * on a page showing one.
 */
export const ROADMAP_NOTE = {
  heading: 'One method, every service',
  body: 'Every service follows the same six-phase rhythm (Discovery, Strategy, Foundation, Build, Scale, and an ongoing phase), so the work feels like one studio no matter which service you start with. Week ranges overlap on purpose: phases run in parallel, not single file.',
} as const

export const SERVICE_ROADMAPS: Record<string, ServiceRoadmap> = {
  'seo': {
    slug: 'seo',
    name: 'SEO',
    heading: 'How we run it',
    sub: 'Tested methods, in the order that compounds.',
    intro:
      'SEO builds an asset, so we build it deliberately: understand where you stand, fix the foundations, then earn rankings that keep working long after the work slows.',
    phases: [
      {
        name: 'Audit & Discovery',
        timeline: 'Weeks 1–2',
        lead: 'Deep-dive analysis of where your SEO stands today.',
        items: [
          'Current performance analysis',
          'Competitor benchmarking',
          'Goal setting & KPI definition',
        ],
      },
      {
        name: 'Strategy Development',
        timeline: 'Weeks 2–3',
        lead: 'We turn the findings into a custom roadmap you can follow.',
        items: [
          'Custom SEO roadmap',
          'Keyword prioritization matrix',
          'Content calendar planning',
        ],
      },
      {
        name: 'Technical Foundation',
        timeline: 'Weeks 3–4',
        lead: 'We fix the plumbing search engines need before rankings can move.',
        items: [
          'Fix critical technical issues',
          'Site speed optimization',
          'Schema markup implementation',
        ],
      },
      {
        name: 'Content Optimization',
        timeline: 'Weeks 4–6',
        lead: 'We make every page rank higher and read better.',
        items: [
          'On-page SEO overhaul',
          'Content gap analysis & creation',
          'Internal linking structure',
        ],
      },
      {
        name: 'Authority Building',
        timeline: 'Weeks 4–6',
        lead: 'We earn the trust that makes rankings last.',
        items: ['Strategic link building', 'PR & digital outreach', 'Brand mention tracking'],
      },
      {
        name: 'Scale & Optimize',
        timeline: 'Ongoing',
        lead: 'SEO compounds, so we keep finding the next opportunity.',
        items: [
          'Performance monitoring',
          'A/B testing & iteration',
          'New opportunity identification',
        ],
      },
    ],
  },
  'paid-advertising': {
    /* Titled 'Paid Marketing' in the source document. */
    slug: 'paid-advertising',
    name: 'Paid Advertising (PPC)',
    heading: 'How we run it',
    sub: 'A tested path from first rupee to profitable scale.',
    intro:
      'Paid moves fast, but fast isn\'t the same as reckless. We measure before we spend and prove before we scale, so your budget is never guessing.',
    phases: [
      {
        name: 'Audit & Account Setup',
        timeline: 'Week 1',
        lead: 'Before a single ad runs, we look at what you\'ve spent and what it returned.',
        items: ['Ad-account & spend review', 'Conversion tracking & pixel setup', 'Goals → KPIs'],
      },
      {
        name: 'Research & Targeting',
        timeline: 'Weeks 1–2',
        lead: 'We work out exactly who to reach, where, and for how much.',
        items: [
          'Audience & keyword research',
          'Platform & budget allocation',
          'Competitor ad analysis',
        ],
      },
      {
        name: 'Creative & Campaign Build',
        timeline: 'Weeks 2–3',
        lead: 'We build the ads and the structure that carries your spend to the right person.',
        items: ['Ad creative & copy', 'Campaign & funnel structure', 'Landing-page alignment'],
      },
      {
        name: 'Launch & Testing',
        timeline: 'Weeks 3–4',
        lead: 'We go live small, test hard, and let the data pick the winners.',
        items: ['Controlled launch', 'A/B tests on creative & audiences', 'Daily monitoring'],
      },
      {
        name: 'Optimize & Scale',
        timeline: 'Weeks 4–6',
        lead: 'Once a campaign proves profitable, growth becomes a dial we turn.',
        items: [
          'Scale winning campaigns',
          'Cut wasted spend',
          'Retargeting & lookalike expansion',
        ],
      },
      {
        name: 'Manage & Improve',
        timeline: 'Ongoing',
        lead: 'The longer a well-run account runs, the cheaper each result gets.',
        items: ['Continuous testing', 'Monthly plain-English ROI reporting', 'New opportunities'],
      },
    ],
  },
  'social-media': {
    /* Titled 'Social Media Marketing' in the source document. */
    slug: 'social-media',
    name: 'Social Media',
    heading: 'How we run it',
    sub: 'A tested path from scattered accounts to one brand people notice.',
    intro:
      'Great social isn\'t luck or volume. It\'s a system. We move from listening, to a plan, to consistent presence, to campaigns that turn followers into customers.',
    phases: [
      {
        name: 'Audit & Listening',
        timeline: 'Weeks 1–2',
        lead: 'We look at how you show up today, and how your market talks.',
        items: ['Channel & content audit', 'Audience & competitor listening', 'Goals → KPIs'],
      },
      {
        name: 'Brand & Content Strategy',
        timeline: 'Weeks 2–3',
        lead: 'We set one voice and one look, and decide what to post and why.',
        items: [
          'Unified voice & visual guidelines',
          'Platform strategy',
          'Content pillars & calendar',
        ],
      },
      {
        name: 'Profile & Foundation',
        timeline: 'Weeks 3–4',
        lead: 'We polish every profile so the brand reads the same everywhere.',
        items: ['Profile & bio optimization', 'Visual template & asset kit', 'Scheduling setup'],
      },
      {
        name: 'Content & Publishing',
        timeline: 'Weeks 4–6',
        lead: 'We create the content and start showing up on purpose.',
        items: ['Reels, posts & stories', 'Consistent publishing rhythm', 'Community management'],
      },
      {
        name: 'Paid Amplification & Growth',
        timeline: 'Weeks 4–6',
        lead: 'We put budget behind what\'s working to turn reach into leads.',
        items: [
          'Boosted & full-funnel campaigns',
          'Retargeting warm audiences',
          'Engagement growth',
        ],
      },
      {
        name: 'Report & Refine',
        timeline: 'Ongoing',
        lead: 'We keep the presence sharp and the story consistent as you grow.',
        items: [
          'Monthly performance reporting',
          'Content testing',
          'New platform & trend opportunities',
        ],
      },
    ],
  },
  'digital-marketing-strategy': {
    slug: 'digital-marketing-strategy',
    name: 'Digital Marketing Strategy',
    heading: 'How we build it',
    sub: 'A tested path from goals to a plan your whole team can run.',
    intro:
      'Strategy shouldn\'t sit in a PDF. We move from understanding the market, to hard trade-offs, to a plan on a calendar, so everyone knows what to do on Monday morning.',
    phases: [
      {
        name: 'Discovery & Market Mapping',
        timeline: 'Weeks 1–2',
        lead: 'We work out where the real opportunity is before we plan anything.',
        items: [
          'Goals & context deep-dive',
          'Market sizing & best-fit customer',
          'Competitor gaps',
        ],
      },
      {
        name: 'Budget & Capacity Planning',
        timeline: 'Weeks 2–3',
        lead: 'We hold the ambition up against your money and your time.',
        items: ['Budget & resource mapping', 'Cost-per-move estimates', 'Realistic timelines'],
      },
      {
        name: 'Channel & Growth Strategy',
        timeline: 'Weeks 3–4',
        lead: 'We pick the two or three channels that can actually move your numbers.',
        items: [
          'Growth roadmap & channel selection',
          'Budget allocation',
          'Channel-fit analysis',
        ],
      },
      {
        name: 'Campaign & Media Planning',
        timeline: 'Weeks 4–5',
        lead: 'We turn direction into a schedule of what runs, where, and when.',
        items: [
          'Media calendar & placements',
          'Format mix & spend scheduling',
          'Launch playbook',
        ],
      },
      {
        name: 'KPI & Measurement Framework',
        timeline: 'Weeks 5–6',
        lead: 'We define what winning looks like in numbers everyone agrees on.',
        items: [
          'KPI definition & metric hierarchy',
          'Funnel & reporting setup',
          'Success benchmarks',
        ],
      },
      {
        name: 'Test, Learn & Adjust',
        timeline: 'Ongoing',
        lead: 'The plan stays alive: measured, adjusted, and compounding.',
        items: [
          'Structured experiment pipeline',
          'Results kept or dropped on evidence',
          'Quarterly review',
        ],
      },
    ],
  },
  'ai-search-geo': {
    /* Titled 'AI Search & GEO' in the source document. */
    slug: 'ai-search-geo',
    name: 'AI Search (GEO)',
    heading: 'How we run it',
    sub: 'A tested path from invisible in AI answers to the source it cites.',
    intro:
      'Getting cited by AI isn\'t magic. It\'s authority, structure, and credibility built deliberately. We move from measuring where you stand today to owning the answers that matter.',
    phases: [
      {
        name: 'GEO Audit & Baseline',
        timeline: 'Weeks 1–2',
        lead: 'We map exactly how visible you are across every AI platform right now.',
        items: [
          'Visibility mapping across AI engines',
          'Prompt testing & citation baseline',
          'Competitor analysis',
        ],
      },
      {
        name: 'Strategy & Prompt Priorities',
        timeline: 'Weeks 2–3',
        lead: 'We decide which questions are worth owning and where the openings are.',
        items: [
          'Priority prompt & topic mapping',
          'Gap & opportunity identification',
          'Answer-coverage roadmap',
        ],
      },
      {
        name: 'Entity & Trust Foundation',
        timeline: 'Weeks 3–4',
        lead: 'We build the signals AI looks for before it will cite you.',
        items: [
          'Knowledge panel & Wikidata setup',
          'Author profiles & expert bylines',
          'Consistent brand data',
        ],
      },
      {
        name: 'Answer-Ready Content',
        timeline: 'Weeks 4–6',
        lead: 'We create content built to be quoted, not just found.',
        items: [
          'Answer-first content & FAQs',
          'Structured comparisons & definitions',
          'E-E-A-T signals',
        ],
      },
      {
        name: 'Test & Expand Coverage',
        timeline: 'Weeks 4–6',
        lead: 'We check what\'s landing and go take the prompts still up for grabs.',
        items: [
          'Prompt re-testing & answer monitoring',
          'Coverage expansion',
          'Competitor displacement',
        ],
      },
      {
        name: 'Monitor & Report',
        timeline: 'Ongoing',
        lead: 'Visibility in AI shifts constantly, so we track it constantly.',
        items: [
          'Ongoing citation & mention tracking',
          'Monthly plain-English reporting',
          'New platform opportunities',
        ],
      },
    ],
  },
  'branding-creative': {
    /* Titled 'Digital Design & Branding' in the source document. */
    slug: 'branding-creative',
    name: 'Branding & Creative',
    heading: 'How we run it',
    sub: 'A tested path from scattered visuals to a system that works harder.',
    intro:
      'Design earns its keep when it moves numbers, not just when it looks good. We move from understanding your users, to a coherent identity, to assets built to convert, and to a system that holds as you grow.',
    phases: [
      {
        name: 'Discovery & Research',
        timeline: 'Weeks 1–2',
        lead: 'We learn how people actually use your product before we style anything.',
        items: [
          'Brand & user research',
          'Audit of current visuals & flows',
          'Goals → design metrics',
        ],
      },
      {
        name: 'Strategy & Direction',
        timeline: 'Weeks 2–3',
        lead: 'We set the direction so opinions don\'t derail the work later.',
        items: [
          'Moodboards & visual direction',
          'Information architecture & user flows',
          'Scope agreement',
        ],
      },
      {
        name: 'Identity & Foundations',
        timeline: 'Weeks 3–4',
        lead: 'We build the core system everything else is drawn from.',
        items: [
          'Logo, colour & typography system',
          'Brand guidelines & visual rules',
          'Core UI components',
        ],
      },
      {
        name: 'Design & Build',
        timeline: 'Weeks 4–6',
        lead: 'We design the screens, pages, and assets that carry the work.',
        items: [
          'Website & landing-page design',
          'Conversion layouts',
          'Collateral, decks & graphics',
        ],
      },
      {
        name: 'Handoff & Launch',
        timeline: 'Weeks 5–6',
        lead: 'We hand design to development cleanly, because it\'s the same team.',
        items: [
          'Design-to-dev handoff',
          'Responsive & mobile-first checks',
          'Launch review & polish',
        ],
      },
      {
        name: 'System & Scale',
        timeline: 'Ongoing',
        lead: 'One source of truth keeps the brand coherent as you grow.',
        items: [
          'Living component & asset library',
          'New screens & campaigns on-brand',
          'Ongoing support',
        ],
      },
    ],
  },
}

/**
 * Hand-authored layer on top of the generated Appendix D content.
 *
 * Three jobs:
 *  1. `h1`       — the page heading where it should differ from the service NAME, from the
 *                  client's SEO pass. `name` stays the label — mega menu, pillar cards,
 *                  breadcrumbs, llms.txt, JSON-LD — and the h1 carries the search terms.
 *                  "Platform Engineering: CI/CD, IaC, Kubernetes & SRE" is a good heading
 *                  and an unusable nav item, which is why these are two fields and not one.
 *                  Consumers read `h1 ?? name`, so a service without one is unchanged.
 *  2. `outcome`  — the one-line promise for the service hero and mega-menu flyout.
 *                  Appendix D supplies deliverables but no positioning.
 *  3. `aliases`  — Appendix C's everyday phrasing (L558-597). Meta keywords are dead,
 *                  so these feed H2s, FAQ phrasing and internal-link anchor text, so
 *                  /services/experience-design still ranks for "UI/UX design".
 *
 * `CHIP_SHORT` shortens the 8 chips that exceed the brief's 1-3 word rule (L602)
 * without discarding the source text — the full label stays in the generated file.
 */

export const SERVICE_OVERRIDES: Record<
  string,
  { h1?: string; outcome?: string; aliases?: string[]; description?: string[] }
> = {
  'digital-engineering': {
    h1: 'Digital Engineering: Web Apps, APIs & Architecture',
    outcome: 'Web applications and APIs built to survive their own success.',
    aliases: ['web development', 'backend development', 'frontend development'],
  },
  'software-product-engineering': {
    h1: 'Software Product Engineering: Idea to MVP',
    outcome: 'From a validated idea to a product in production.',
    aliases: ['custom software development'],
  },
  'mobile-engineering': {
    h1: 'Mobile Engineering: iOS, Android & Flutter',
    outcome: 'Apps that earn their place on the home screen.',
    aliases: ['mobile app development', 'iOS development', 'Android development'],
  },
  'quality-engineering': {
    h1: 'Quality Engineering & Test Automation',
    outcome: 'Ship faster because the tests already told you it works.',
    aliases: ['software testing', 'QA'],
  },
  'digital-experience': {
    h1: 'Digital Experience: Websites & Ecommerce',
    outcome: 'Sites and storefronts that load fast and convert.',
    aliases: ['website development', 'ecommerce development'],
  },
  'experience-design': {
    h1: 'Experience Design: UX Research to UI Prototyping',
    outcome: 'Research-led design that survives contact with real users.',
    aliases: ['UI / UX design', 'product design'],
  },
  'branding-creative': {
    h1: 'Branding & Creative: Identity, Assets & Strategy',
    outcome: 'An identity that still works at favicon size.',
    aliases: ['logo design', 'brand identity'],
  },
  'applied-ai': {
    outcome: 'Agents and copilots doing real work, not demos.',
    aliases: ['AI development', 'GenAI development'],
  },
  'ai-enablement': {
    h1: 'AI Enablement: LLM Integration & In-Product AI',
    outcome: 'Your existing product, with AI where it actually helps.',
    aliases: ['AI integration', 'LLM integration'],
  },
  'conversational-ai': {
    h1: 'Conversational AI & Copilots for Business',
    outcome: 'Assistants that answer instead of deflecting.',
    aliases: ['chatbot development'],
  },
  'intelligent-automation': {
    h1: 'Intelligent Automation & RPA Services',
    outcome: 'The manual process, gone.',
    aliases: ['automation', 'RPA'],
  },
  'cloud-modernization': {
    h1: 'Cloud Modernization & Migration Services',
    outcome: 'Off the legacy stack without a migration horror story.',
    aliases: ['cloud migration'],
  },
  'platform-engineering': {
    h1: 'Platform Engineering: CI/CD, IaC, Kubernetes & SRE',
    outcome: 'Deploys that are boring, on purpose.',
    aliases: ['DevOps', 'CI/CD'],
  },
  'data-and-ai': {
    h1: 'Data & AI: Pipelines, Warehousing, Governance & MLOps',
    outcome: 'Pipelines that make your data usable.',
    aliases: ['data engineering'],
  },
  'data-and-analytics': {
    h1: 'Data & Analytics: BI Dashboards & Reporting',
    outcome: 'Reporting that answers the question you actually asked.',
    aliases: ['business intelligence', 'reporting'],
  },
  cybersecurity: {
    h1: 'Cybersecurity: VAPT, IAM, Compliance & App Security',
    outcome: 'Find the holes before someone else does.',
    aliases: ['cyber security', 'penetration testing'],
  },
  /* No `description` here, unlike its neighbours. SEO has a full document behind it, so its
     opening paragraphs are the document's own and live in content/service-story.ts as
     `intro` — where the page can put them ABOVE the ten parts rather than in the "About"
     block at the foot of the page. Two near-identical openings, one at each end of the same
     page, is what having both would produce. */
  seo: {
    h1: 'SEO Services: Rankings That Turn Into Pipeline',
    outcome: 'Rankings that turn into pipeline.',
    aliases: ['search engine optimization'],
  },
  /* AEO and GEO were one service in Appendix D — see SPLITS in scripts/generate-services.mjs
     for why they are two pages. The aliases split along the same line so the two pages do
     not compete for the same phrasing. */
  /* No `description`: the opening paragraphs now live in content/service-story.ts as `intro`,
     above the parts, like every other service with a story. */
  'ai-search-aeo': {
    h1: 'Answer Engine Optimization (AEO) Services',
    outcome: 'Own the answer, not just the tenth blue link.',
    aliases: ['answer engine optimization', 'AEO', 'featured snippets', 'voice search'],
  },
  /* No `description`: GEO has a document, so its opening paragraphs are the client's own and
     live in content/service-story.ts as `intro`, above the seven parts. */
  'ai-search-geo': {
    h1: 'Generative Engine Optimization (GEO) for AI Search',
    outcome: 'Be the source an AI cites when it answers for you.',
    aliases: [
      'generative engine optimization',
      'GEO',
      'LLM optimization',
      'ChatGPT visibility',
    ],
  },
  /* No `description`, same as `seo` and `social-media`: Paid Advertising has a document, so
     its opening paragraphs are the client's own and live in content/service-story.ts as
     `intro`, above the five platforms rather than in the "About" block at the foot. */
  'paid-advertising': {
    h1: 'Paid Advertising (PPC): Google, Meta & LinkedIn Ads',
    outcome: 'Spend that you can trace to revenue.',
    aliases: ['PPC', 'Google Ads'],
  },
  /* No `description`, same as `seo` above: Social Media has a document, so its opening
     paragraphs are the client's own and live in content/service-story.ts as `intro`, where
     the page sets them above the six platforms instead of in the "About" block at the foot. */
  'social-media': {
    h1: 'Social Media Marketing Across All Platforms',
    outcome: 'A feed worth following.',
    aliases: ['social media marketing'],
  },
  /* No `description`: opening paragraphs live in content/service-story.ts as `intro`. */
  'content-marketing': {
    h1: 'Content Marketing: Content That Ranks and Sells',
    outcome: 'Content that ranks and sells.',
    aliases: ['content strategy'],
  },
  /* No `description`: Email Marketing now has a document, so its opening paragraphs are the
     client's own and live in content/service-story.ts as `intro`, above the eleven parts.
     `email marketing` has been dropped from the aliases — it is the page's own name now, and
     "Also known as email marketing" on a page titled Email Marketing reads as a mistake. The
     CRM phrasing stays: it is what the old URL and the Appendix D name ranked for. */
  'email-marketing': {
    h1: 'Email Marketing: Flows, Segmentation & Deliverability',
    outcome: 'Lifecycle messaging that runs itself.',
    aliases: ['marketing automation', 'CRM automation', 'lifecycle marketing'],
  },
  /* Not in Appendix D — see content/services.additions.ts. No `description` for the same
     reason as its neighbours: the document's opening runs above the seven parts as `intro`. */
  'digital-marketing-strategy': {
    h1: 'Digital Marketing Strategy: A Plan You Can Run',
    outcome: 'A plan your team can actually run.',
    aliases: ['marketing strategy', 'go-to-market strategy', 'media planning'],
  },
  'local-reputation': {
    outcome: 'Own the map pack and the reviews.',
    aliases: ['local SEO', 'reputation management'],
  },
  'managed-services': {
    outcome: 'Someone accountable after launch.',
    aliases: ['website maintenance', 'support retainer'],
  },
}

/**
 * Shortened display labels for chips over three words.
 * Keyed by the exact generated label so the mapping breaks loudly if the brief changes.
 */
export const CHIP_SHORT: Record<string, string> = {
  'App Store & Play submission': 'Store submission',
  'Unit & integration tests': 'Unit & integration',
  'Colour & type systems': 'Colour & type',
  'Single & multi agent workflows': 'Agent workflows',
  'Human in the loop': 'Human in loop',
  'AWS / Azure / GCP': 'AWS · Azure · GCP',
  'ChatGPT / Perplexity / Gemini visibility': 'LLM visibility',
  'Reels & short video': 'Short video',
}

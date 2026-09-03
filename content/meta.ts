/**
 * Hand-authored page titles and descriptions.
 *
 * These are the client's own words, supplied as a 39-row table covering every route the
 * site publishes except the /services index. They are reproduced here verbatim: no
 * clamping, no title-case tidying, no appending of the site name. Every row already fits
 * inside what a SERP shows (longest title 60 characters, longest description 152), so the
 * helpers in lib/seo.ts that exist to rescue generated copy have nothing to do here.
 *
 * THE TABLE IS NOW 39 ROWS AND THE ORIGINAL WAS 39, which is a coincidence rather than a
 * match — the membership is different. The three placeholder case studies were deleted at
 * the client's request, taking their rows with them, because a row for a route that no
 * longer exists is dead weight that reads as a missing page. Three were added back: the two
 * real studies that replaced them, /work/seair-exim-qualified-traffic and
 * /work/eximpedia-reaching-the-right-buyer, and /authors, which did not exist when the
 * table was written. Every added row is marked as such where it sits, as is the /work row
 * below, which describes the collection and has been rewritten twice as it changed.
 *
 * WHY THIS FILE EXISTS AT ALL. Before it, every title and description on the site was
 * derived from body copy: the first sentence of a headline, or a tagline padded out with
 * the opening paragraph, each then clamped to length. That produces something reasonable
 * for 40 routes without anyone writing 40 snippets, but it can only ever describe what a
 * page says, never what someone searching would type. These were written the other way
 * round, from the query back to the page, which is the point of the exercise.
 *
 * Each title is COMPLETE, including its own "| Zefract" where the author wanted one. It is
 * therefore applied through `title.absolute`, which bypasses the "%s | Zefract" template in
 * the root layout. Applying it as a plain title would produce "Privacy Policy | Zefract |
 * Zefract". lib/seo.ts handles that, so no route has to think about it.
 *
 * Keys are route paths with a leading slash and no trailing slash, matching
 * `alternates.canonical` and the sitemap. A route with no row here keeps the derived
 * metadata it had before, which today means /services, /services/local-reputation and
 * /services/managed-services.
 */
export const PAGE_META = {
  '/': {
    title: 'Zefract | Engineering, Design, AI, Cloud & Growth',
    description:
      'One accountable team for engineering, design, AI, cloud and marketing. We build digital products, then make them grow.',
  },
  '/services/engineering': {
    title: 'Engineering Services | Web, Mobile APPs, APIs & QA | Zefract',
    description:
      'Web apps, APIs and system architecture, product discovery through MVP, native and cross-platform mobile, and test automation, all from one team.',
  },
  '/services/digital-engineering': {
    title: 'Digital Engineering Services | Zefract',
    description:
      'Frontend, backend, system architecture and SaaS builds engineered to still work the year after launch, not just on demo day.',
  },
  '/services/software-product-engineering': {
    title: 'Software Product Engineering | Zefract',
    description:
      'Discovery, MVP builds and evidence-led feature engineering that take a validated idea to a product people keep paying for.',
  },
  '/services/mobile-engineering': {
    title: 'Mobile App Development Services | Zefract',
    description:
      'Native and cross-platform mobile engineering built for real phones, real connections and the home screen your app has to earn.',
  },
  '/services/quality-engineering': {
    title: 'Quality Engineering & Test Automation | Zefract',
    description:
      'Automated testing, performance and security checks built into the pipeline, so releases ship fast because the tests already proved it.',
  },
  '/services/experience-and-design': {
    title: 'Experience & Design Services | Zefract',
    description:
      'Marketing sites, ecommerce and CMS builds, UX research and UI design, and the brand identity that ties every touchpoint together.',
  },
  '/services/digital-experience': {
    title: 'Website & Ecommerce Design Services | Zefract',
    description:
      'Marketing sites, ecommerce storefronts and CMS builds engineered to load fast, convert visitors and stay editable by your own team.',
  },
  '/services/experience-design': {
    title: 'UI/UX & Product Design Services | Zefract',
    description:
      'Research-led UI/UX design for web and mobile, from user research and prototyping to design systems that scale with your product.',
  },
  '/services/branding-creative': {
    title: 'Branding & Creative Design Services | Zefract',
    description:
      'Brand identity, creative assets and presentation design built from real positioning, so your brand looks like one company everywhere.',
  },
  '/services/ai-and-automation': {
    title: 'AI & Automation Services | Zefract',
    description:
      'Agentic workflows and copilots, LLM integration and RAG over your own data, plus the process automation that removes manual work.',
  },
  '/services/applied-ai': {
    title: 'Applied AI & Agentic Solutions | Zefract',
    description:
      'AI agents, copilots and RAG-powered enterprise search grounded in your own data, built with the guardrails a security review needs.',
  },
  '/services/ai-enablement': {
    title: 'AI Enablement Services | LLM Integration | Zefract',
    description:
      'Add AI to a product that already works: model selection, data grounding, in-product AI and prompt engineering with cost control.',
  },
  '/services/conversational-ai': {
    title: 'Conversational AI & Copilots | Zefract',
    description:
      'Support assistants and internal copilots that answer from your own documentation, with citations, confidence handling and human handoff.',
  },
  '/services/intelligent-automation': {
    title: 'Intelligent Automation & RPA Services | Zefract',
    description:
      'Workflow automation, RPA, document processing and AI decisioning that remove the manual process nobody designed on purpose.',
  },
  '/services/cloud-data-and-security': {
    title: 'Cloud, Data & Security Services | Zefract',
    description:
      'Cloud migration and platform engineering, data pipelines and analytics, and security testing that finds problems before anyone else.',
  },
  '/services/cloud-modernization': {
    title: 'Cloud Migration & Modernization Services | Zefract',
    description:
      'Cloud migration and modernization planned around your real dependencies, with cost optimization and tested rollback at every stage.',
  },
  '/services/platform-engineering': {
    title: 'Platform Engineering & DevOps Services | Zefract',
    description:
      'CI/CD, infrastructure as code, containers and SRE practices that make deploys boring, on purpose, and releases routine.',
  },
  '/services/data-and-ai': {
    title: 'Data Engineering & MLOps Services | Zefract',
    description:
      'Data pipelines, warehousing, governance and MLOps that turn scattered systems into one trustworthy source of truth for your business.',
  },
  '/services/data-and-analytics': {
    title: 'BI Dashboards & Data Analytics Services | Zefract',
    description:
      'BI dashboards, reporting design and self-service analytics built around the decisions people actually make, not everything you hold.',
  },
  '/services/cybersecurity': {
    title: 'Cybersecurity & Penetration Testing | Zefract',
    description:
      'Security assessments, VAPT, identity and access management, and compliance work that finds the holes before someone else does.',
  },
  '/services/marketing-and-growth': {
    title: 'Marketing & Growth Services | SEO, AI Search & Ads',
    description:
      'Search, paid, social and content working off one plan, including the answer-engine work that decides if AI assistants mention you.',
  },
  '/services/seo': {
    title: 'SEO Services | Search Engine Optimization | Zefract',
    description:
      'Technical SEO, content strategy and off-page authority building delivered as one connected service, with plain-English reporting.',
  },
  '/services/ai-search-aeo': {
    title: 'Answer Engine Optimization (AEO) Services | Zefract',
    description:
      'AEO work that wins featured snippets, People-Also-Ask boxes and voice answers by structuring pages to be the extractable answer.',
  },
  '/services/ai-search-geo': {
    title: 'Generative Engine Optimization (GEO) | Zefract',
    description:
      'GEO services that get your brand cited by ChatGPT, Gemini, Perplexity and Copilot when people ask AI instead of searching Google.',
  },
  '/services/paid-advertising': {
    title: 'PPC & Paid Advertising Services | Zefract',
    description:
      'Google, Meta, YouTube and LinkedIn ad campaigns built on clean tracking and precision targeting, with ROI you can trace to revenue.',
  },
  '/services/social-media': {
    title: 'Social Media Marketing Services | Zefract',
    description:
      'Managed social media across six platforms with one consistent brand voice, organic content and paid campaigns built to convert.',
  },
  '/services/content-marketing': {
    title: 'Content Marketing & SEO Content Services | Zefract',
    description:
      'Content strategy, articles, long-form assets and multimedia built to rank, get cited by AI, and clear objections before the sales call.',
  },
  '/services/email-marketing': {
    title: 'Email Marketing & Marketing Automation | Zefract',
    description:
      'Lifecycle email flows, segmentation, deliverability setup and AI-enhanced personalization that turn subscribers into predictable revenue.',
  },
  '/services/digital-marketing-strategy': {
    title: 'Digital Marketing Strategy Services | Zefract',
    description:
      'Market mapping, channel strategy, budget planning and KPI frameworks that turn your goals into a plan your team can run on Monday.',
  },
  '/work': {
    title: 'Case Studies & Client Work | Zefract',
    /* Describes both studies this index holds, and no others. The client's original line
       named the three placeholder studies; those were deleted at their request, so a
       description promising a bank migration and a ROAS programme would have sent someone
       to a page containing neither. Rewritten again when Eximpedia was added — this is the
       one row in this file that describes a COLLECTION rather than a single page, so it is
       the only one that can go stale on its own. Rewrite it whenever a study is added or
       removed. 149 characters, inside the ceiling every other row respects. */
    description:
      'Case studies with quantified outcomes: 30% more qualified leads for a Delhi trade data firm, and double the visitors for a trade intelligence platform.',
  },
  '/work/seair-exim-qualified-traffic': {
    title: 'Seair Exim Case Study: Traffic That Converted | Zefract',
    /* The client's own meta description for this study, shortened from 176 characters to
       fit the ceiling every other row in this file respects. Only the firm's full legal
       name and the spam-traffic clause came out; the claim and the figure are untouched. */
    description:
      'How Zefract diagnosed and rebuilt organic search and email for Seair Exim, a Delhi-based trade intelligence firm, lifting qualified leads 30%.',
  },
  /* Not from the client's supplied table — the Eximpedia study post-dates it. Written to
     the same rules as the rows above: the title is complete including its own "| Zefract"
     and stays under 60 characters, the description under 152. It leads on the doubling
     because that is the study's own headline figure, and names the segment problem because
     that is the query someone with this problem would actually type. */
  '/work/eximpedia-reaching-the-right-buyer': {
    title: 'Eximpedia Case Study: Reaching the Right Buyer | Zefract',
    description:
      'How Zefract doubled visitors and lifted qualified demo requests 40% for Eximpedia, a trade intelligence platform selling to four distinct buyers.',
  },
  /* Not from the client's table — /authors did not exist when it was written.
     Kept inside the same length ceilings as every row above so the file's own
     header note stays true. Individual profiles have no row: their title and
     description are derived from the author's own name, role and bio, which is
     copy nobody can write in advance. */
  '/authors': {
    title: 'Authors | The People Behind the Zefract Blog',
    description:
      'The engineers, designers and marketers who write here — what each of them works on, and every article they have published.',
  },
  '/about': {
    title: 'About Zefract | One Team, Five Practices',
    description:
      'Zefract Tech Pvt Ltd is one accountable team across engineering, design, AI, cloud and marketing, with a single lead on every project.',
  },
  '/blog': {
    title: 'Insights & Engineering Notes | Zefract Blog',
    description:
      'Notes on shipping software, cloud, AI and growth from the Zefract team, written by the people who maintain what they build.',
  },
  '/contact': {
    title: 'Contact Zefract | Start Your Project',
    description:
      'Tell us what you\'re trying to ship. Send a brief or three bullet points and get scope, a timeline and a number back in three days.',
  },
  /* Both rewritten when the client's real documents replaced the placeholder
     pages. The old descriptions described the placeholders: "how we collect data
     through the contact form" for a policy that now covers processor obligations,
     international transfers and a grievance route, and "terms governing use of the
     website" for a document where the website is clause 27 of 28. */
  '/privacy': {
    title: 'Privacy Policy | Zefract',
    /* 148 characters. The first draft of this row ran to 178 and the one below it to 160,
       both over the 152 this file's own header sets as its ceiling — which meant two rows
       that would have been cut off mid-clause in a result. Trimmed by dropping "India's"
       from before the DPDP Act, which nothing needs, and by cutting "and how to exercise
       them" from the tail, which §10 of the policy answers anyway. */
    description:
      'What Zefract Tech Pvt Ltd collects, why, how long it is kept and who it is shared with, under the DPDP Act and the UK and EU GDPR — and your rights.',
  },
  '/terms': {
    title: 'Terms & Conditions | Zefract',
    /* 140 characters. "and dispute resolution" came off the end — clause 25 is real but it
       is the least likely thing anyone searches for out of a list of eight. */
    description:
      'The terms of engagement with Zefract Tech Pvt Ltd: fees, ad spend, notice and exit, IP and account ownership, liability and data protection.',
  },
} as const satisfies Record<string, { title: string; description: string }>

/** A route path the table covers. Narrow, so a typo at a call site fails to compile. */
export type AuthoredPath = keyof typeof PAGE_META

import type { ServicePoint } from './types'

/**
 * The parts of a service, each defined in full, keyed by service slug.
 *
 * SOURCE. Transcribed from the client's own service documents, one point per numbered
 * section, keeping that document's ordering, its explanation and its INCLUDES list. Where a
 * service has no document the points are built from its Appendix D groups instead and say so
 * in a comment above them.
 *
 * WHY THIS EXISTS. Appendix D compresses each service into groups with a three-word benefit
 * line. That is fine for a scannable grid but it silently loses whole parts of a service: the
 * SEO document has ten sections and Appendix D has six groups, so UX and behavioural work,
 * monitoring and analysis, and the ongoing monthly work had no representation on the page at
 * all. Points exist so every part of a service is stated on its own terms.
 *
 * These render INSTEAD OF the generated groups on a service page — see Service.points.
 */
export const SERVICE_POINTS: Record<string, ServicePoint[]> = {
  // ==========================================================================
  // WRITTEN, NOT TRANSCRIBED — pillar 1, Engineering.
  //
  // No client document exists for these four. One point per Appendix D group, keeping that
  // file's group names and its chips verbatim as the INCLUDES list — so the taxonomy stays
  // the client's own and only the explanation is ours. Same standing as the authored entries
  // in service-story.ts: honest positioning, no invented numbers, needs client review.
  // ==========================================================================
  'digital-engineering': [
    {
      name: 'Frontend Engineering',
      body: [
        'The part your customers actually touch. We build interfaces that load quickly on the devices and connections people really have, not the ones in a demo, and that stay quick as the product grows past its first few screens.',
        'Components are built as a system rather than page by page, so the tenth screen costs less to build than the third and looks like it belongs to the same product. Accessibility and performance budgets are set at the start, because both are far cheaper to design in than to retrofit.',
      ],
      includes: [
        'React / Next.js',
        'Component systems',
        'State management',
        'Accessibility',
        'Performance budgets',
      ],
    },
    {
      name: 'Backend & APIs',
      body: [
        'Everything behind the interface: the services that hold your data, the rules that govern it, and the integrations that connect it to whatever else your business runs on.',
        'We design APIs to be used by someone who did not write them: predictable, documented and versioned, so the mobile app, the partner integration and the internal tool can all be built against the same contract without a meeting each time.',
      ],
      includes: [
        'REST & GraphQL',
        'Microservices',
        'Authentication',
        'Third party integrations',
        'Webhooks',
      ],
    },
    {
      name: 'System Architecture',
      body: [
        'The decisions that are cheap on day one and expensive on day five hundred. How the data is modelled, where the boundaries sit, what happens when one part of the system is slow or unavailable.',
        'We choose architecture for the load you are heading toward rather than the biggest number anyone can imagine. Complexity you do not need is its own kind of debt. Then we write it down, so the reasoning survives the people who made it.',
      ],
      includes: [
        'Solution architecture',
        'Database design',
        'Caching',
        'Event driven design',
        'Tech documentation',
      ],
    },
    {
      name: 'Web Apps & SaaS',
      body: [
        'Full products rather than pages: things people log into, work in, and pay for. Multi-tenancy, permissions, billing and the admin tooling your own team needs to run the thing without calling us.',
        'The unglamorous parts are the ones that decide whether a SaaS is operable. Getting roles, audit trails and admin panels right early is what stops every customer request becoming a database query someone runs by hand.',
      ],
      includes: [
        'Multi tenant SaaS',
        'Dashboards',
        'Role based access',
        'Billing integration',
        'Admin panels',
      ],
    },
    {
      name: 'Engineering Practices',
      body: [
        'The habits that decide whether a codebase is still pleasant to work in a year from now. Code review, continuous integration, automated tests, and observability that tells you what is happening in production.',
        'None of this is visible in a demo, and all of it is why the second year of a product costs less than the first. Security is part of the same set: considered at design time rather than audited in afterwards.',
      ],
      includes: [
        'Code reviews',
        'CI/CD',
        'Automated testing',
        'Observability',
        'Security by design',
      ],
    },
  ],

  'software-product-engineering': [
    {
      name: 'Product Discovery',
      body: [
        'Before anything is built, we work out what should be. Discovery workshops surface what the business needs and what users actually do, and the gap between those two is usually where the real product is hiding.',
        'The output is a scope you can commit to: user stories, a working prototype, and an honest read on feasibility. Cheap to produce, and far cheaper than discovering the same things after a build.',
      ],
      includes: [
        'Discovery workshops',
        'User stories',
        'Prototyping',
        'Feasibility',
        'Scope definition',
      ],
    },
    {
      name: 'MVP Build',
      body: [
        'The smallest thing that is genuinely useful, built properly. An MVP is not a rough draft: it is the core of the product with the optional parts deferred, which is a discipline rather than a shortcut.',
        'We ship it with analytics from the first day and a plan for the iteration after, so launch is the start of the learning rather than the end of the project.',
      ],
      includes: [
        'MVP scoping',
        'Rapid build',
        'Launch support',
        'Iteration plan',
        'Analytics baseline',
      ],
    },
    {
      name: 'Feature Engineering',
      body: [
        'Growing the product on evidence. Features are designed against a job the user is trying to do, delivered incrementally, and where the answer is genuinely unclear, tested rather than debated.',
        'The backlog is kept honest: ordered by what the data and the customers say, pruned of the things that seemed essential last quarter and have not been asked for since.',
      ],
      includes: [
        'Feature design',
        'Incremental delivery',
        'Experimentation',
        'Backlog management',
      ],
    },
    {
      name: 'Scale & Performance',
      body: [
        'Success is a load-bearing problem. When usage climbs, the parts of a system that were fine at small numbers start to show, and the fix is usually cheaper before the growth than during it.',
        'We profile, tune and load-test against real traffic shapes, refactor where the design has been outgrown, and keep an eye on infrastructure cost, which has a habit of scaling faster than revenue if nobody is watching.',
      ],
      includes: [
        'Performance tuning',
        'Load testing',
        'Refactoring',
        'Cost optimization',
        'Reliability',
      ],
    },
    {
      name: 'Roadmap Execution',
      body: [
        'The steady rhythm that turns a plan into shipped software: sprint planning, releases that are routine rather than dramatic, and reporting that tells stakeholders the truth about pace.',
        'The roadmap is kept as a living document rather than a promise made once in January. What changed, what it displaced and why is visible, so nobody is surprised at the quarter end.',
      ],
      includes: [
        'Sprint planning',
        'Release management',
        'Stakeholder reporting',
        'Roadmap upkeep',
      ],
    },
  ],

  'mobile-engineering': [
    {
      name: 'Native Apps',
      body: [
        'When an app needs the best the platform can give (performance, hardware access, or interactions that must feel exactly right), we build it natively in Swift or Kotlin.',
        'Native is the right answer less often than it used to be, and unmistakably the right answer when it is. We will tell you which case you are in before you pay for either.',
      ],
      includes: ['Swift / iOS', 'Kotlin / Android', 'Native modules', 'Platform APIs'],
    },
    {
      name: 'Cross Platform',
      body: [
        'One codebase, two stores. React Native and Flutter cover the great majority of apps at a fraction of the cost of building the same product twice, and the gap in feel has narrowed to the point where most users could not pick it.',
        'Where a specific screen or feature genuinely needs to be native, we bridge to it rather than compromising the whole app for one requirement.',
      ],
      includes: ['React Native', 'Flutter', 'Shared logic', 'Native bridges'],
    },
    {
      name: 'App Experience',
      body: [
        'The details that separate an app from a website in a shell. Gestures that behave the way the platform taught people to expect, and states designed for a phone rather than shrunk down from a desktop.',
        'Offline sync, push notifications and deep linking are treated as core rather than extras: they are what make an app usable on a train and worth reopening after the first session.',
      ],
      includes: ['Gestures', 'Offline sync', 'Push notifications', 'Deep linking'],
    },
    {
      name: 'Release & Store',
      body: [
        'Getting it live, which is its own discipline. Store submissions have review guidelines, metadata requirements and rejection reasons that are much easier to satisfy before you hit submit than after.',
        'We handle both stores, run beta builds through TestFlight and its Android equivalent so real people see it before the public does, and keep versioning tidy enough to roll back if needed.',
      ],
      includes: ['App Store & Play submission', 'ASO basics', 'Beta / TestFlight', 'Versioning'],
    },
    {
      name: 'Quality & Care',
      body: [
        'An app is never finished, because the phones underneath it keep changing. Every OS release is a compatibility event, and the apps that quietly stop working are usually the ones nobody was watching.',
        'We test across a real device matrix rather than one simulator, monitor crashes in production, and plan OS migrations as scheduled work instead of emergencies.',
      ],
      includes: ['Device testing', 'Crash monitoring', 'Updates', 'OS migration'],
    },
  ],

  'quality-engineering': [
    {
      name: 'Test Automation',
      body: [
        'The suite that lets a team change things without fear. Unit and integration tests where logic lives, end-to-end coverage of the journeys that actually earn money, and regression packs so a fixed bug stays fixed.',
        'Automation is worth it when it is trusted, which means it has to be fast and it has to be stable. A suite people ignore because it cries wolf is worse than no suite at all.',
      ],
      includes: [
        'Selenium / Playwright',
        'Unit & integration tests',
        'E2E suites',
        'Regression packs',
      ],
    },
    {
      name: 'Performance & Load',
      body: [
        'Finding your ceiling on purpose, before a campaign or a launch finds it for you. Load testing shows what happens at expected volume; stress testing shows where it breaks and how.',
        'Profiling turns a vague "it feels slow" into a specific query, endpoint or asset, so the fix is targeted rather than a rewrite undertaken on a hunch.',
      ],
      includes: ['Load testing', 'Stress testing', 'Profiling', 'Benchmarking'],
    },
    {
      name: 'Security Testing',
      body: [
        'Penetration testing and vulnerability assessment against the application you actually run, plus scanning of the dependencies you inherited without reading, which is where a great many real vulnerabilities live.',
        'Findings are triaged by exploitability rather than by severity score alone, and every one comes with remediation guidance, so the report is a work plan instead of a list of things to worry about.',
      ],
      includes: ['VAPT', 'Dependency scanning', 'OWASP checks', 'Remediation guidance'],
    },
    {
      name: 'Test Strategy',
      body: [
        'Deciding what to test, which matters more than testing everything. Total coverage is neither achievable nor useful; coverage weighted toward risk and revenue is both.',
        'We map what exists, identify what is untested and load-bearing, and write it down, so QA is a documented plan your team can carry on running rather than knowledge in one person’s head.',
      ],
      includes: ['Test plans', 'Coverage mapping', 'Risk based testing', 'QA documentation'],
    },
    {
      name: 'CI Integrated QA',
      body: [
        'Tests that run themselves, on every change, and block the ones that fail. Quality stops being a stage at the end and becomes a property of the pipeline.',
        'That includes keeping the suite honest: flaky tests are hunted down rather than re-run, because a test nobody believes is a gate nobody respects. Reporting is automated so release sign-off is evidence rather than opinion.',
      ],
      includes: ['CI test gates', 'Automated reporting', 'Flaky test control', 'Release sign off'],
    },
  ],

  // ==========================================================================
  // WRITTEN, NOT TRANSCRIBED — pillar 2, Experience & Design.
  // ==========================================================================
  'digital-experience': [
    {
      name: 'Marketing Websites',
      body: [
        'The site most of your buyers meet first. Built around the questions people actually arrive with, and the next step you want them to take, rather than around an org chart.',
        'Responsive is the floor, not the feature. The work that matters is the hierarchy: what is said first, what is proven, and how short the path is from interested to in touch.',
      ],
      includes: [
        'Corporate sites',
        'Responsive build',
        'CMS',
        'Conversion focused',
        'Brand aligned',
      ],
    },
    {
      name: 'Ecommerce',
      body: [
        'Storefronts on Shopify, WooCommerce or a headless setup where the catalogue or the integrations justify it. We will tell you which, and why, before anyone commits to a platform.',
        'Most of the money is won or lost at checkout. Product data, search, filtering and the last three steps get the attention, because that is where the abandoned carts actually come from.',
      ],
      includes: [
        'Shopify',
        'Headless commerce',
        'WooCommerce',
        'Checkout optimization',
        'Product catalog',
      ],
    },
    {
      name: 'CMS Builds',
      body: [
        'A content model shaped around how your team really works, so editing a page does not require a developer or a support ticket. WordPress, Webflow or headless, chosen for who has to operate it.',
        'Handover includes training and a written guide. A CMS nobody was taught to use is functionally the same as not having one, and it is the single most common reason a site goes stale.',
      ],
      includes: [
        'WordPress',
        'Webflow',
        'Headless CMS',
        'Editor training',
        'Content modeling',
      ],
    },
    {
      name: 'Web Performance',
      body: [
        'Speed is a conversion feature and a ranking factor, and it is far cheaper to build in than to retrofit. Core Web Vitals are treated as a budget the site has to stay inside.',
        'Images optimised and sized properly, caching and a CDN configured rather than assumed, and the technical SEO foundations laid while the markup is still being written.',
      ],
      includes: [
        'Core Web Vitals',
        'Image optimization',
        'Caching / CDN',
        'Technical SEO foundation',
      ],
    },
    {
      name: 'Landing Systems',
      body: [
        'Campaigns need pages faster than a project can deliver them. A landing system is a set of reusable blocks your team can assemble, so the next launch is an afternoon rather than a quote.',
        'Built to be tested: variants are straightforward to run, and form capture is wired into wherever your leads actually need to land.',
      ],
      includes: ['Landing page systems', 'A/B ready', 'Form capture', 'Reusable blocks'],
    },
  ],

  'experience-design': [
    {
      name: 'UI/UX for Web',
      body: [
        'Interfaces designed around the job someone came to do. Flows first, screens second, because most usability problems are decisions about order and wording rather than about visuals.',
        'Responsive behaviour and accessibility are designed in rather than adapted later, and the UI is built to scale to the screens that do not exist yet.',
      ],
      includes: [
        'Web interfaces',
        'User flows',
        'Responsive design',
        'Accessibility',
        'Scalable UI',
      ],
    },
    {
      name: 'UI/UX for Mobile',
      body: [
        'A phone is a different medium, not a narrow desktop. Thumb reach, one-handed use and the fact that people are usually distracted all change what a good screen looks like.',
        'The first tap decides retention more than anything that follows, so the opening moments get disproportionate attention, and every target is sized for a thumb rather than a cursor.',
      ],
      includes: ['iOS & Android', 'First tap clarity', 'Touch optimization', 'Retention design'],
    },
    {
      name: 'User Research',
      body: [
        'Evidence instead of opinion, at a scale that fits the decision. Not every question needs a formal study; most need a handful of the right people and someone watching carefully.',
        'We look at what users do as well as what they say, because the two disagree more often than anyone expects, and design against the behaviour rather than the report.',
      ],
      includes: ['User insights', 'Behaviour patterns', 'Feature validation', 'Lean research'],
    },
    {
      name: 'Wireframing & Prototyping',
      body: [
        'A clickable prototype is the cheapest possible version of your product, and the only one you can test before committing engineering time to it.',
        'It also settles arguments. A stakeholder disagreement about a flow is much shorter when both parties can click through it, and feedback loops with real users replace the approval meeting as the deciding vote.',
      ],
      includes: [
        'Clickable prototypes',
        'User testing',
        'Design alignment',
        'Feedback loops',
      ],
    },
    {
      name: 'Design Systems',
      body: [
        'Components, tokens and documented patterns, so consistency stops depending on whoever is designing that day. The tenth screen costs less than the third and looks like it belongs.',
        'Governance is the part usually skipped and the part that decides whether a system survives: who can add a pattern, and what happens when someone needs an exception.',
      ],
      includes: [
        'Component libraries',
        'Design tokens',
        'Documentation',
        'Pattern governance',
      ],
    },
    {
      name: 'Data Visualization',
      body: [
        'Dashboards designed around the decision someone is trying to make, not around everything the database happens to hold. Most internal dashboards fail by showing too much.',
        'Role-based views mean each person sees the handful of numbers they can act on, and the chart type follows the question rather than whatever was easiest to render.',
      ],
      includes: ['Dashboards', 'Role based views', 'Interactive charts', 'KPI focus'],
    },
  ],

  'branding-creative': [
    {
      name: 'Brand Identity',
      body: [
        'The mark and the system around it: colour, type, and the visual language that makes two pieces of your material recognisably related without either being a copy of the other.',
        'Designed at the sizes it will actually live at, favicon and app icon included. An identity that only works large is one that fails in most of the places it appears.',
      ],
      includes: ['Logo design', 'Colour & type systems', 'Brand guidelines', 'Visual language'],
    },
    {
      name: 'Creative Assets',
      body: [
        'The working collateral: social creative, ad variants, banners and iconography, produced to the system rather than improvised each time.',
        'Built as templates wherever they repeat, so your team can produce the next round without either waiting on us or quietly drifting off-brand.',
      ],
      includes: ['Social creatives', 'Ad creative', 'Banners', 'Iconography'],
    },
    {
      name: 'Presentation Design',
      body: [
        'The deck is often the highest-stakes place your brand appears, and usually the worst maintained. Pitch and sales decks designed to be read at the back of a room and skimmed as a PDF afterwards.',
        'Data storytelling is the difference between a slide of numbers and an argument. Templates come with the deck, so the next one does not regress.',
      ],
      includes: ['Pitch decks', 'Sales decks', 'Templates', 'Data storytelling'],
    },
    {
      name: 'Brand Strategy',
      body: [
        'Before the visuals: who this is for, what it is instead of, and what it should make someone feel confident about. Identity design without this is decoration applied to an unanswered question.',
        'The output is usable: positioning, core messages and a tone of voice with examples, so it shapes the site copy and the campaigns rather than sitting in a folder.',
      ],
      includes: ['Positioning', 'Messaging', 'Tone of voice', 'Naming support'],
    },
  ],

  // ==========================================================================
  // WRITTEN, NOT TRANSCRIBED — pillar 3, AI & Automation.
  // ==========================================================================
  'applied-ai': [
    {
      name: 'AI Agents',
      body: [
        'Software that acts rather than only answers. An agent with real tool access can complete a task end to end (look something up, make the change, report back) instead of producing a suggestion a person still has to carry out.',
        'Autonomy is set per task rather than per project. Where an action is consequential, a human approval gate sits in front of it, which is what makes an agent trustworthy with real work.',
      ],
      includes: [
        'Single & multi agent workflows',
        'Tool use',
        'Autonomous tasks',
        'Human in the loop',
      ],
    },
    {
      name: 'Copilots',
      body: [
        'Assistance inside the product people already use, aware of what they are looking at and what they were trying to do. Context is most of what separates a useful copilot from a chat window bolted to a sidebar.',
        'The best ones remove a step rather than adding a surface: drafting the thing that was about to be written by hand, or explaining the screen without the user leaving it.',
      ],
      includes: ['In app copilots', 'Task assistance', 'Context awareness'],
    },
    {
      name: 'Generative AI Apps',
      body: [
        'Product surfaces that did not previously exist: drafting, summarising and transforming content at a scale that was not economic before.',
        'Where output has to feed another system, we constrain it to structured formats and validate it, because free text arriving where a schema was expected is the most common way these features break in production.',
      ],
      includes: [
        'LLM applications',
        'Content generation',
        'Summarization',
        'Structured output',
      ],
    },
    {
      name: 'RAG & Enterprise Search',
      body: [
        'Answers drawn from your own documents and systems rather than from whatever the model absorbed during training. Retrieval pipelines, vector storage and the grounding that keeps responses tied to a source.',
        'Citations are part of the answer, not an extra. An assistant that cannot show where something came from is one nobody in a regulated or high-stakes context is permitted to act on.',
      ],
      includes: ['RAG pipelines', 'Enterprise search', 'Vector databases', 'Grounding'],
    },
    {
      name: 'AI Strategy',
      body: [
        'Working out where AI actually pays, before anything is built. Most organisations have one or two processes where it is transformative and a longer list where it is an expensive distraction.',
        'Readiness matters as much as opportunity: an excellent use case sitting on data nobody can access is not a use case yet. The output is a roadmap with honest ROI attached, including the things we recommend not doing.',
      ],
      includes: ['Use case discovery', 'Readiness assessment', 'Roadmap', 'ROI modeling'],
    },
  ],

  'ai-enablement': [
    {
      name: 'LLM Integration',
      body: [
        'Choosing the right model per task rather than defaulting to the largest, and connecting it properly. A cheap fast model handles most jobs; the expensive one is reserved for the ones that genuinely need it.',
        'Orchestration across providers with fallback handling means an outage or a price change is a configuration decision rather than an incident and a rebuild.',
      ],
      includes: [
        'Model selection',
        'API integration',
        'Provider orchestration',
        'Fallback handling',
      ],
    },
    {
      name: 'Data Grounding',
      body: [
        'Connecting the model to your reality. Data connectors and retrieval so answers come from your systems, and context engineering so the model is given what it needs rather than everything available.',
        'Guardrails define what it may discuss and what it must refuse. That boundary is a product decision, and writing it down is what makes the feature reviewable.',
      ],
      includes: ['Data connectors', 'Context engineering', 'Retrieval', 'Guardrails'],
    },
    {
      name: 'In Product AI',
      body: [
        'Intelligence embedded where the work already happens. Inline suggestions and smart defaults take a step out of a flow people already understand rather than adding a new one to learn.',
        'The features that survive are usually the least visible. A field that filled itself in correctly gets used every day; a chat panel gets opened twice.',
      ],
      includes: ['AI feature embedding', 'Inline suggestions', 'Smart defaults'],
    },
    {
      name: 'Prompt Engineering',
      body: [
        'Prompts treated as code: designed, versioned and evaluated against a real test set, so a change can be shown to be an improvement rather than assumed to be one.',
        'Evaluation is what makes the feature maintainable. Without it, nobody can safely touch a prompt that is working, and quality drifts silently as models are updated underneath you.',
      ],
      includes: ['Prompt design', 'Evaluation', 'Versioning', 'Cost control'],
    },
  ],

  'conversational-ai': [
    {
      name: 'Support Assistants',
      body: [
        'Customer-facing assistants that resolve rather than deflect, answering from your documentation and your systems so a common question is genuinely handled.',
        'Ticket triage and routing behind the scenes, and multilingual support where your customers need it, often the quickest win, since it extends coverage without extending the rota.',
      ],
      includes: ['Support chatbots', 'FAQ automation', 'Ticket triage', 'Multilingual'],
    },
    {
      name: 'Internal Copilots',
      body: [
        'The same technology pointed inward, which is frequently the faster payback. Knowledge assistants that answer from the handbook, the wiki and the policy documents nobody can find.',
        'Onboarding is the clearest case: a new starter asks the assistant the questions they would otherwise interrupt three colleagues to ask, and gets a cited answer.',
      ],
      includes: ['Knowledge assistants', 'Document Q&A', 'Onboarding bots'],
    },
    {
      name: 'Grounded Responses',
      body: [
        'Every answer traced to a source, with the citation shown. Retrieval keeps the assistant tied to what your documentation actually says rather than to a plausible reconstruction of it.',
        'Confidence is handled explicitly: below a threshold it says it does not know and offers a route to someone who does. Admitting uncertainty is what makes the rest of the answers usable.',
      ],
      includes: ['RAG responses', 'Source citations', 'Confidence handling'],
    },
    {
      name: 'Channels & Handoff',
      body: [
        'Available where the question was going to be asked anyway (the site, WhatsApp, or a voice interface) rather than in one widget on a page people have to find first.',
        'Escalation carries the whole conversation with it, so nobody repeats themselves to a human. The route to a person is visible rather than buried, which is what stops the channel being resented.',
      ],
      includes: ['Web & WhatsApp', 'Voice interfaces', 'Human handoff', 'Escalation flows'],
    },
  ],

  'intelligent-automation': [
    {
      name: 'Workflow Automation',
      body: [
        'Connecting the systems that were always capable of talking to each other, so the export-retype-email-file loop stops needing a person in the middle of it.',
        'Triggers, approvals and notifications are built around how the process actually runs, including the exceptions, which is usually where a naive automation falls over.',
      ],
      includes: ['Process automation', 'Integrations', 'Triggers', 'Approvals'],
    },
    {
      name: 'RPA',
      body: [
        'For the systems with no API and no prospect of one. Bots that drive the interface the way a person would, on a schedule, without the transcription errors.',
        'It is the pragmatic option rather than the elegant one, and it is the right call when the alternative is replacing a system that otherwise works. Exception handling matters more here than anywhere else.',
      ],
      includes: ['Bots', 'Screen automation', 'Scheduled runs', 'Exception handling'],
    },
    {
      name: 'Document Processing',
      body: [
        'Getting structured data out of invoices, forms, contracts and scans, so the process does not stall at whoever opens the post.',
        'Extraction is paired with validation: a confidence threshold, a rules check, and a review queue for anything that fails. The aim is to remove the typing, not the checking.',
      ],
      includes: ['OCR', 'Data extraction', 'Classification', 'Validation'],
    },
    {
      name: 'AI Decisioning',
      body: [
        'Where a rule alone is not enough. Scoring and prioritisation that combine deterministic rules with a model, so routing reflects judgement rather than just the order things arrived in.',
        'Anomaly flags catch the cases that do not fit any rule and put them in front of a person, which is where the genuinely expensive mistakes tend to live.',
      ],
      includes: ['Rules plus ML', 'Scoring', 'Prioritization', 'Anomaly flags'],
    },
    {
      name: 'Process Mining',
      body: [
        'Finding out where the time really goes before automating anything. Discovery from system logs shows the actual path work takes, which is regularly not the documented one.',
        'The bottleneck is often a different step from the one everybody complains about. Mining it first is what stops you automating the wrong thing very efficiently.',
      ],
      includes: ['Process discovery', 'Bottleneck analysis', 'Opportunity mapping'],
    },
  ],

  // ==========================================================================
  // WRITTEN, NOT TRANSCRIBED — pillar 4, Cloud, Data & Security.
  // ==========================================================================
  'cloud-modernization': [
    {
      name: 'Cloud Migration',
      body: [
        'Mapping every dependency and integration before anything moves, because the surprises in a migration are almost never in the part you planned for.',
        'Then the decision per workload: lift and shift where the system is fine and the hosting is not, replatform where a managed service removes maintenance. Rehearsed against production-shaped data, with a tested rollback at every stage.',
      ],
      includes: ['AWS / Azure / GCP', 'Lift and shift', 'Replatforming', 'Migration planning'],
    },
    {
      name: 'Cloud Native',
      body: [
        'Rebuilding for the cloud where the return justifies it: containers, serverless and managed services that remove whole categories of work rather than relocating them.',
        'Not everything should be. Cloud-native architecture adds operational complexity that pays off at some scales and is pure overhead at others, and we will tell you which side you are on.',
      ],
      includes: ['Microservices', 'Containers', 'Serverless', 'Managed services'],
    },
    {
      name: 'Cost Optimization',
      body: [
        'The cloud bill is a design output, not a fixed cost. Most accounts carry substantial spend on over-provisioned instances and resources nobody has looked at since they were created.',
        'FinOps practice means rightsizing against real usage, reserving capacity where demand is predictable, and monitoring spend so an unexpected increase is noticed in days rather than at quarter end.',
      ],
      includes: ['FinOps', 'Rightsizing', 'Reserved capacity', 'Spend monitoring'],
    },
    {
      name: 'Resilience & Scaling',
      body: [
        'Auto-scaling and high availability configured deliberately and then tested, because untested failover is a hope rather than a plan.',
        'Backups and disaster recovery are treated the same way: restored from at least once, so you know the recovery works and how long it takes before you need it.',
      ],
      includes: ['Auto scaling', 'High availability', 'Disaster recovery', 'Backups'],
    },
  ],

  'platform-engineering': [
    {
      name: 'CI/CD',
      body: [
        'Pipelines that build, test and deploy on their own, with tests as gates rather than as a report someone reads afterwards.',
        'Rollback is part of the pipeline and gets used, and environments are managed rather than improvised, which together are what make deploying several times a day a reasonable thing to do.',
      ],
      includes: ['Pipelines', 'Automated deploys', 'Rollback', 'Environment management'],
    },
    {
      name: 'Infrastructure as Code',
      body: [
        'Infrastructure defined in Terraform and applied from version control, so what exists is what the repository says exists, and any change has an author and a reason.',
        'Drift control is the part that decays without attention. Once someone has made an undocumented change in a console, the code stops being the truth and everything downstream of it becomes guesswork.',
      ],
      includes: ['Terraform', 'Config management', 'GitOps', 'Drift control'],
    },
    {
      name: 'Containers & Orchestration',
      body: [
        'Docker and Kubernetes where the workload warrants them: consistent environments, sane scaling, and the ability to move between providers without rewriting how things run.',
        'Kubernetes is not a default. It carries real operational cost, and plenty of systems are better served by something simpler. We will say so rather than selling the complicated answer.',
      ],
      includes: ['Docker', 'Kubernetes', 'Service mesh', 'Autoscaling'],
    },
    {
      name: 'Reliability (SRE)',
      body: [
        'Monitoring and alerting built around what users actually experience, with SLOs that define what "working" means in numbers rather than in opinion.',
        'Incident response defined in advance (who is called, what gets checked first, how it is recorded), so an outage does not depend on whoever happens to remember how that service behaves.',
      ],
      includes: ['Monitoring', 'Alerting', 'SLOs', 'Incident response', 'On call'],
    },
  ],

  'data-and-ai': [
    {
      name: 'Data Pipelines',
      body: [
        'Getting data out of the systems it is trapped in and into somewhere it can be used. Batch or streaming, depending on how fresh the answer actually needs to be.',
        'Transformation is where the meaning gets applied: deduplication, normalisation and the business rules that turn six systems’ worth of records into something comparable.',
      ],
      includes: ['ETL / ELT', 'Ingestion', 'Streaming', 'Transformation'],
    },
    {
      name: 'Warehousing',
      body: [
        'A single place the numbers come from, modelled properly. Snowflake, Databricks or BigQuery, chosen on your volumes, your skills and what you are already paying for.',
        'The modelling is the work. A warehouse with no agreed definitions is just a bigger pile of the same disagreements, moved somewhere more expensive.',
      ],
      includes: ['Snowflake', 'Databricks', 'BigQuery', 'Data modeling'],
    },
    {
      name: 'Governance',
      body: [
        'What makes data trustworthy enough to act on. A catalogue so people can find what exists, quality checks so a broken feed is flagged where it enters, and lineage so any figure can be traced to its source.',
        'Access control belongs here too: teams able to self-serve what they need without everyone holding a key to everything.',
      ],
      includes: ['Data catalog', 'Quality', 'Lineage', 'Access control'],
    },
    {
      name: 'MLOps',
      body: [
        'Getting models out of notebooks and into production, then keeping them honest. Deployment, feature stores and versioning so a result can be reproduced.',
        'Monitoring and retraining are the parts most often skipped. A model that was accurate at launch and never re-evaluated drifts quietly, and the failure is invisible until a decision goes badly.',
      ],
      includes: ['Model deployment', 'Feature stores', 'Monitoring', 'Retraining'],
    },
  ],

  'data-and-analytics': [
    {
      name: 'BI Dashboards',
      body: [
        'Dashboards in Power BI, Tableau or Looker, built around the decisions people actually make rather than around everything the warehouse happens to contain.',
        'Executive views answer a different question from operational ones and are designed separately, because a board pack and a daily working screen have almost nothing in common.',
      ],
      includes: ['Power BI', 'Tableau', 'Looker', 'Executive dashboards'],
    },
    {
      name: 'Reporting Design',
      body: [
        'Choosing the small number of metrics somebody acts on, and defining them precisely enough that two teams cannot compute them differently.',
        'Then delivering them without anyone having to go and look: automated reports on a schedule, into the inbox or channel where the decision actually gets taken.',
      ],
      includes: ['KPI design', 'Automated reports', 'Scheduled delivery'],
    },
    {
      name: 'Self Service Analytics',
      body: [
        'A semantic layer over the warehouse, so a follow-up question does not need a ticket. That second question is usually where the real insight was.',
        'Governed rather than open: consistent definitions and appropriate access, so self-service produces answers that agree with each other.',
      ],
      includes: ['Data models', 'Semantic layers', 'Governed access'],
    },
    {
      name: 'Insight & Visualization',
      body: [
        'Charts chosen to make a comparison legible rather than to look impressive. The right visualisation makes the conclusion obvious; the wrong one hides it in plain sight.',
        'Cohort analysis and metric modelling show whether a trend is real or whether a total is being carried by one unusual month, which is the difference between a signal and a coincidence.',
      ],
      includes: ['Data visualization', 'Metric modeling', 'Cohort analysis'],
    },
  ],

  cybersecurity: [
    {
      name: 'Assessments',
      body: [
        'Finding out where you actually stand, against the system you actually run rather than the architecture diagram of it.',
        'Penetration testing and vulnerability assessment, with findings triaged by exploitability rather than severity score alone, and a risk report written to be read by the people who have to fund the fixes.',
      ],
      includes: ['Security assessments', 'VAPT', 'Penetration testing', 'Risk reports'],
    },
    {
      name: 'Identity & Access',
      body: [
        'Most breaches turn on an account rather than an exploit. Identity done properly (SSO, multi-factor, and permissions granted at the least level that works) is the highest-return security work available.',
        'Least privilege is a practice, not a setting. It needs review as people change roles, which is the step that quietly lapses in most organisations.',
      ],
      includes: ['IAM', 'SSO', 'MFA', 'Least privilege'],
    },
    {
      name: 'Compliance',
      body: [
        'ISO 27001, SOC 2 and GDPR structured so the evidence accumulates from how you already operate rather than being reconstructed before an audit.',
        'The goal is audit readiness as a standing state. Compliance approached as an annual event produces a certificate and very little actual security.',
      ],
      includes: ['ISO 27001', 'SOC 2', 'GDPR', 'Audit readiness'],
    },
    {
      name: 'Application Security',
      body: [
        'Security inside the way you build: a secure development lifecycle, code scanning and dependency checks running on every change.',
        'Most real vulnerabilities arrive through packages nobody read. Automated checking in the pipeline is what turns that from an unknown into a managed queue, with remediation guidance attached.',
      ],
      includes: ['Secure SDLC', 'Code scanning', 'Dependency checks', 'Remediation'],
    },
    {
      name: 'Cloud Security',
      body: [
        'Posture management and configuration hardening across your cloud accounts. Misconfigured storage and over-permissive roles remain among the most common and most avoidable causes of a breach.',
        'Monitoring and threat detection so unusual activity is surfaced, because the gap between compromise and discovery is what determines how much a breach costs.',
      ],
      includes: ['Cloud posture', 'Config hardening', 'Monitoring', 'Threat detection'],
    },
  ],

  // ==========================================================================
  // WRITTEN, NOT TRANSCRIBED — pillar 5 remainder, plus cross-cutting.
  // ==========================================================================
  //
  // AEO DIVERGES FROM APPENDIX D, deliberately and visibly. Every other service here keeps
  // one point per Appendix D group; AEO has exactly ONE group ("Answer Engine Optimization"),
  // because the appendix filed the whole discipline under a single heading before AEO and GEO
  // were split into separate pages. One point cannot carry a page — the index would read
  // "1 PARTS" — so the discipline is expanded into its four real components here, using that
  // group's own chips as the deliverables. Fold this back the day a client document arrives.
  'ai-search-aeo': [
    {
      name: 'Answer Audit',
      body: [
        'Which answer slots you already hold, which a competitor holds, and which exist for your questions with nobody occupying them yet. The third category is where the quickest wins are.',
        'Answer boxes are countable in a way rankings are not, so the audit produces a baseline you can measure against rather than a general impression of visibility.',
      ],
      includes: ['Featured snippets', 'Structured answers'],
    },
    {
      name: 'Structured Answers',
      body: [
        'Rewriting pages so the answer is extractable: a direct response in the first two sentences, before the context and the caveats rather than after them.',
        'Search engines lift a snippet from a passage that already reads as a complete answer. Most pages bury theirs under four paragraphs of preamble, which is the single most common reason a well-ranking page loses the box.',
      ],
      includes: ['Structured answers', 'Featured snippets'],
    },
    {
      name: 'FAQ & Schema Markup',
      body: [
        'Marking questions and answers up so a crawler can parse them without inferring anything. Schema is the difference between content that happens to be an answer and content that declares itself one.',
        'Headings phrased as the question people actually type, which matters for the People-Also-Ask panels that surface queries adjacent to the one searched.',
      ],
      includes: ['FAQ schema', 'Structured answers'],
    },
    {
      name: 'Voice & Answer Tracking',
      body: [
        'Voice assistants read a single result, so there is no second place. Concise, well-structured answers are what make a page eligible for a surface with no runner-up.',
        'Then tracking: which questions you own, which you have gained or lost, and what that is worth in clicks, because holding a box nobody clicks is not a result.',
      ],
      includes: ['Featured snippets', 'FAQ schema'],
    },
  ],

  'content-marketing': [
    {
      name: 'Content Strategy',
      body: [
        'The plan that decides whether anything else is worth writing. Which searches are winnable, which objections come up before every sale, and which buyer each piece is aimed at.',
        'Topic clusters rather than a list of post ideas, so pieces support each other and accumulate authority on a subject instead of scattering across unrelated ground.',
      ],
      includes: [
        'Content strategy',
        'Editorial calendar',
        'Topic clusters',
        'Audience mapping',
      ],
    },
    {
      name: 'Written Content',
      body: [
        'Articles, site copy and landing copy written to rank and to actually be read, which is one job, not two, since search engines have spent years getting better at telling the difference.',
        'Written from your experts rather than around them. For anything technical we would rather book half an hour with the person who does the work than produce something plausible and subtly wrong.',
      ],
      includes: ['Blog articles', 'Website copy', 'SEO content', 'Landing copy'],
    },
    {
      name: 'Long Form & Assets',
      body: [
        'The pieces that carry authority for a buyer doing serious homework: guides, whitepapers, ebooks and case studies with something specific in them.',
        'These are also what your sales team sends after a call. A long-form asset that answers the real objection does more work in the pipeline than a month of short posts.',
      ],
      includes: ['Ebooks', 'Whitepapers', 'Case studies', 'Guides'],
    },
    {
      name: 'Multimedia',
      body: [
        'The same ideas where text alone will not travel: video scripts, infographics and newsletters that carry the argument into channels people are already in.',
        'Repurposing is deliberate rather than opportunistic. One well-researched piece is planned from the start to become several formats, so the research cost is paid once.',
      ],
      includes: ['Video scripts', 'Infographics', 'Newsletters', 'Repurposing'],
    },
  ],

  /* Email Marketing is NOT in this authored section any more. It had four points written from
     Appendix D's four groups; the client has since sent Zefract_Email_Marketing_Services.docx,
     and this file's own rule is that an authored entry is replaced outright the day a real
     document arrives. The transcribed eleven are at the foot of the file under `email-marketing`
     — the slug changed with the rename. */

  'local-reputation': [
    {
      name: 'Google Business Profile',
      body: [
        'The listing that decides whether you appear in the map result, set up completely and kept active. Categories, services, hours, photos and the fields most businesses fill in once and never revisit.',
        'Posts and the Q&A section are ranking and conversion surfaces in their own right, and they are almost always neglected, which makes them cheap to win.',
      ],
      includes: ['GBP setup', 'Optimization', 'Posts', 'Q&A'],
    },
    {
      name: 'Local Rankings',
      body: [
        'Getting into the three-result map pack, which sits above the organic listings and takes the majority of local clicks.',
        'Local keyword work and landing pages for the areas you genuinely serve, so you appear for the towns nearby rather than only the one on your letterhead.',
      ],
      includes: ['Maps ranking', 'Local keywords', 'Local landing pages'],
    },
    {
      name: 'Listings & Citations',
      body: [
        'Your name, address and phone number identical everywhere they appear, across directories and the data aggregators that quietly feed them.',
        'Conflicting details are one of the most common reasons a local ranking stalls, and they accumulate on their own as old listings and moved offices linger for years.',
      ],
      includes: ['Directory listings', 'NAP consistency', 'Data aggregators'],
    },
    {
      name: 'Reputation & Reviews',
      body: [
        'A steady flow of recent reviews, asked for properly at the moment a customer is happiest, plus replies to them, including the critical ones, which prospects read most closely.',
        'Sentiment monitoring means an emerging complaint is spotted while it is still one review rather than after it has become the first thing people read about you.',
      ],
      includes: ['Review generation', 'Review responses', 'ORM', 'Sentiment monitoring'],
    },
  ],

  'managed-services': [
    {
      name: 'Website & App Care',
      body: [
        'The maintenance that keeps something running long after launch: platform and dependency updates, backups taken and tested, uptime monitoring, and security patching on a schedule.',
        'None of it is visible when it is working, which is exactly why it stops happening the moment nobody is accountable for it.',
      ],
      includes: ['Updates', 'Backups', 'Uptime monitoring', 'Security patching'],
    },
    {
      name: 'Managed Hosting',
      body: [
        'Hosting looked after rather than merely purchased. Configuration, CDN, certificates and scaling handled continuously, so performance does not slowly degrade as content and traffic accumulate.',
        'Certificate expiry and quietly full disks cause a surprising share of outages, and both are trivially preventable by someone whose job it is to look.',
      ],
      includes: ['Managed hosting', 'CDN', 'SSL', 'Scaling'],
    },
    {
      name: 'Support Retainers',
      body: [
        'A named team with a response commitment in writing, so an urgent problem has a defined path rather than depending on who happens to read the email first.',
        'Retained hours also cover the small things (a copy change, a new page, a tweak to a form) that would otherwise each need a quote, a scoping call and a minimum engagement.',
      ],
      includes: ['Support hours', 'SLA response', 'Priority fixes', 'Enhancements'],
    },
  ],

  // ---- SEO ---------------------------------------------------------------
  // Zefract_SEO_Services.docx, sections 01-10, verbatim.
  //
  // Transcribed close to verbatim, with one deliberate departure: the site does not use em
  // dashes anywhere, so the document's are replaced. Where the dash was carrying a beat
  // rather than a pause, it becomes a full stop and not a comma. "We look. Properly." keeps
  // the emphasis the document's dashed version had; "we look, properly" would lose it.
  // Contractions and the client's wording are otherwise left alone, which is what makes the
  // page match the deck a client is reading alongside it.
  //
  // One sentence has been dropped rather than restored: an earlier edit added "Available in
  // more depth as its own service, on the AI Search pages" to point 07. It is not in the
  // document. The cross-link it was standing in for now lives in the page's own markup,
  // where a link can actually be a link.
  seo: [
    {
      name: 'Website Audit',
      body: [
        'Before we change anything, we look. Properly. We check how fast your site loads, whether your links work, whether search engines can even read your pages, and whether your content actually says what your customers are searching for.',
        'Nothing is guessed. We map every issue holding you back, then hand you a clear, prioritised roadmap that shows exactly what we’ll fix, in what order, and why it matters. You start the whole engagement knowing where you stand and where you’re going.',
      ],
      includes: ['Technical audit', 'Content audit', 'Positioning analysis'],
    },
    {
      name: 'Technical Optimization',
      body: [
        'This is where we turn your website into something search engines love to read. Faster load times, a site that works beautifully on a phone, and all the behind-the-scenes plumbing done right, so nothing stands between your pages and the top of the results.',
        'We handle the parts most owners never see: telling search engines which pages matter, giving them a clean map of your site, connecting your pages sensibly, and adding the structured markup that helps you show up richer in results. Small, technical, invisible to visitors, and decisive for rankings.',
      ],
      includes: [
        'Speed optimization',
        'Mobile-friendly performance',
        'Robots.txt & sitemap',
        'Internal linking',
        'Schema markup',
      ],
    },
    {
      name: 'UX & Behavioural Optimization',
      body: [
        'Getting people to your site is only half the job. We watch how real humans actually move through your pages (where they land, where they leave, where they hesitate) and then smooth the path so more visitors do the thing you want them to do.',
        'Clearer navigation, sharper calls-to-action, and fewer dead ends turn traffic into results. Rankings bring people in; a site built around real behaviour is what turns those people into customers.',
      ],
      includes: [
        'Entry & exit point fixes',
        'Streamlined navigation',
        'CTA improvements',
        'Engagement boosting',
      ],
    },
    {
      name: 'Monitoring & Analysis',
      body: [
        'No black boxes. We track your traffic in real time, measure the return on every keyword, and keep a close eye on your competitors, so you always know what’s working and what isn’t.',
        'Then we translate all of it into a report a human can actually read. No dashboards you have to decode, no jargon to hide behind, just a plain-English picture of your progress and the reasoning behind every move we make next.',
      ],
      includes: [
        'Analytics setup',
        'Rank tracking',
        'ROI-per-keyword',
        'Competitor analysis',
        'Plain-English progress reports',
      ],
    },
    {
      name: 'Keyword Research & Content Strategy',
      body: [
        'We find the exact words your customers use when they’re looking for what you offer, not the words you assume they use, but the real ones, backed by data. We also study the keywords your competitors are winning on, so we know where the opportunities are.',
        'From there we build a content plan where every page has a job to do. Instead of publishing and hoping, you get a deliberate map of what to create, which searches it targets, and how it moves you closer to the customers who matter.',
      ],
      includes: ['Keyword analysis', 'Competitor research', 'Content strategy'],
    },
    {
      name: 'Content Optimization',
      body: [
        'Great content that nobody can find is wasted effort. We write, rewrite, and restructure your pages so they rank higher and read better: clear enough for a first-time visitor, sharp enough for a search engine.',
        'That means getting the details right where they count: the titles that decide whether someone clicks, the headings that give a page its shape, and the structure that helps both people and search engines understand what each page is about.',
      ],
      includes: ['Content writing & rewriting', 'Meta tags', 'Heading structure'],
    },
    {
      name: 'AI Search & Answer Engine Optimization',
      body: [
        'Search isn’t just Google anymore. People now ask ChatGPT, Google’s AI answers, and other AI engines, and those engines only cite the sources they trust. If your site isn’t one of them, you’re invisible in the fastest-growing corner of search.',
        'We prepare your website to be that trusted source: structured clearly, written to be quoted, and positioned as an authority in your field. So when the AI answers a question in your space, your name is the one it puts forward.',
      ],
      includes: [
        'AI search optimization',
        'Answer engine optimization',
        'Trusted-source positioning',
      ],
    },
    {
      name: 'Local SEO',
      body: [
        'When someone nearby searches for what you do, you should be the answer they see first. We set up and polish your Google Business Profile, make sure your name, address, and phone number are consistent everywhere online, and help you turn happy customers into visible, trust-building reviews.',
        'For any business that serves a local area, this is often the single highest-return part of SEO: the difference between being found by the person around the corner and being missed entirely.',
      ],
      includes: ['Google Business Profile setup', 'NAP verification', 'Review management'],
    },
    {
      name: 'Off-Page Optimization',
      body: [
        'Authority is earned, not gamed. Search engines trust sites that other reputable sites point to, so we build that trust the honest way, through genuine link building and real partnerships, never spam or shortcuts that put your site at risk.',
        'We start by analysing your existing backlink profile to see where you stand, then grow it deliberately with links that actually mean something. Slower than the shortcuts, but it lasts, and it won’t collapse the next time an algorithm updates.',
      ],
      includes: ['Link building', 'Backlink analysis', 'Authority & partnership building'],
    },
    {
      name: 'Ongoing Development',
      body: [
        'SEO isn’t set-and-forget. Search engines change their rules constantly, trends shift, and your own goals evolve, so we adapt every month to keep you ahead instead of watching your rankings quietly slip.',
        'This is the part most agencies quietly drop once the contract is signed. We don’t. Every month brings fresh content, adjustments for the latest algorithm changes, and new strategies we test, measure, and refine, so your growth keeps compounding.',
      ],
      includes: [
        'Monthly content updates',
        'Algorithm adaptation',
        'Continuous strategy testing',
      ],
    },
  ],

  // ---- AI Search (GEO) ---------------------------------------------------
  // Zefract_AI_Search_GEO_Services.docx, sections 01-07, verbatim. Single-paragraph sections
  // in the source, kept that way rather than padded out — the parts layout handles a
  // one-paragraph point without looking short, so there is nothing to pad for.
  'ai-search-geo': [
    {
      name: 'GEO Audit',
      body: [
        'We map how visible you are across every AI platform today: which prompts surface your brand, which hand the answer to a competitor, and where the gaps are. You get a clear baseline citation rate to measure every future gain against.',
      ],
      includes: ['Visibility mapping', 'Prompt testing', 'Citation baseline'],
    },
    {
      name: 'E-E-A-T Signals',
      body: [
        'AI systems decide whether a brand is worth citing based on experience, expertise, authority, and trust. We build the signals they look for (real author profiles, expert bylines, and third-party validation), so you read as a credible source, not just another site.',
      ],
      includes: ['Author profiles', 'Expert bylines', 'Third-party validation'],
    },
    {
      name: 'Brand Entity Optimization',
      body: [
        'AI needs to recognise your brand as a distinct, trusted entity. We structure your presence so it does: a clean Google Knowledge Panel, accurate Wikidata, and consistent brand details everywhere they appear online.',
      ],
      includes: ['Knowledge panel', 'Wikidata entries', 'Consistent brand data'],
    },
    {
      name: 'Prompt Testing & Monitoring',
      body: [
        'Your visibility in AI answers shifts constantly. We test how your brand appears across the prompts that matter to you, on a regular cadence, so you always know where you stand and what’s moving.',
      ],
      includes: ['Ongoing prompt testing', 'Answer monitoring', 'Trend tracking'],
    },
    {
      name: 'Answer-Ready Content',
      body: [
        'We create content built to be cited: clear definitions, direct answers, structured comparisons, expert commentary, and FAQs that match how people actually phrase their questions to AI. Content designed to be quoted, not just found.',
      ],
      includes: ['Answer-first content', 'Structured comparisons', 'FAQ optimization'],
    },
    {
      name: 'Competitor GEO Analysis',
      body: [
        'We study which of your competitors AI names in your space, and why. Then we find the openings: the prompts where no one owns the answer yet, and the ones where you can take it.',
      ],
      includes: ['Competitor citation analysis', 'Gap identification', 'Opportunity mapping'],
    },
    {
      name: 'GEO Performance Reporting',
      body: [
        'No black boxes. Each month you get a plain-English report on your citation rate, how often your brand is mentioned, which prompts you’re covering, and how you’re trending across every platform that matters.',
      ],
      includes: ['Monthly citation reports', 'Mention frequency', 'Prompt coverage'],
    },
  ],

  // ---- Paid Advertising (PPC) -------------------------------------------
  // Zefract_Paid_Marketing_Services.docx, sections 01-05, verbatim except for the currency:
  // the document's "rupee" is rendered as plain spend, since the site serves clients outside
  // India and its own contact form quotes budgets in pounds. Same treatment as the SEO
  // document's closing line. Restore it the day the site is India-only.
  'paid-advertising': [
    {
      name: 'Google Ads',
      body: [
        'This is intent at its purest. When someone types your product into Google, they’ve already decided they want it. They just haven’t decided from whom. We put you in front of that person at the exact moment they’re ready to act.',
        'We run the whole engine: search, shopping, and lead-generation campaigns, with precision targeting and smart bidding that spend your budget where it converts, not where it’s wasted. Then we tighten it: tracking every conversion, sharpening keywords, and cutting the searches that drain spend without returning a customer.',
      ],
      includes: [
        'Search & shopping campaigns',
        'Smart bidding',
        'Conversion tracking',
        'Keyword strategy',
        'Negative keywords',
        'Ad extensions',
      ],
    },
    {
      name: 'Meta Ads',
      body: [
        'People don’t go to Facebook and Instagram to buy, so we earn the stop. We build scroll-stopping creative and hyper-targeted campaigns that interrupt the feed for the right person and make them want to know more.',
        'From first impression to final sale, we build the full funnel: precise audience targeting, retargeting for the people who almost bought, and lookalike audiences to scale what’s working. Every creative is tested against another, so the budget always flows to the version that actually performs.',
      ],
      includes: [
        'Audience targeting',
        'Lead generation',
        'Funnel strategy',
        'Retargeting',
        'Lookalike scaling',
        'A/B optimization',
      ],
    },
    {
      name: 'YouTube Ads',
      body: [
        'Video is the format that sticks: it builds recognition and trust in a way a text ad never can. We design a complete video funnel that meets viewers where their attention already is and turns watch time into intent.',
        'It starts with a script written to hold attention, streamed as ads placed for maximum relevant reach. We shape a channel strategy that keeps viewers watching, grows your brand in the background, and moves the ones who are ready straight toward becoming customers.',
      ],
      includes: [
        'Video scripting',
        'In-stream ads',
        'Channel strategy',
        'Viewer retention',
        'Targeted reach',
        'Brand awareness',
      ],
    },
    {
      name: 'LinkedIn Ads',
      body: [
        'When your customer is another business, LinkedIn is where the decision-makers are, and where a click can be worth far more than anywhere else. We run performance-driven campaigns built for B2B, not just visibility for its own sake.',
        'We target by role, industry, and company so your message reaches the people who can actually say yes, then capture them with lead forms built to convert. With account-based strategy and direct executive outreach, we turn professional attention into qualified pipeline.',
      ],
      includes: [
        'B2B targeting',
        'Lead-gen forms',
        'Conversion metrics',
        'Account-based strategy',
        'Executive outreach',
      ],
    },
    {
      name: 'Campaign Foundation',
      body: [
        'Great ads fail on a broken foundation. Before any money goes to any platform, we set up the tracking, structure, and measurement that let every campaign be judged honestly, and improved from real data instead of guesswork.',
        'We install clean conversion tracking, define the metrics that actually matter to your business, and build a testing rhythm into everything we run. So the account gets smarter over time, spend keeps shifting toward what works, and you always know what each campaign returned.',
      ],
      includes: [
        'Tracking & pixel setup',
        'Account structure',
        'KPI definition',
        'Measurement framework',
        'Continuous testing',
      ],
    },
  ],

  // ---- Social Media ------------------------------------------------------
  // Zefract_Social_Media_Marketing_Services.docx, sections 01-06, verbatim. One point per
  // platform, which is how the document is organised — so the page lists six platforms
  // rather than Appendix D's four thematic groups.
  //
  // Restored to the document's own punctuation for the same reason as the SEO points above:
  // an earlier transcription replaced its em dashes with colons and commas, which flattens
  // the rhythm of copy that was written to be read aloud.
  'social-media': [
    {
      name: 'Facebook',
      body: [
        'Facebook is where a community becomes a customer base. We build the content and the ad strategy together, so reach turns into real leads instead of vanity likes.',
        'From building a following to running full-funnel paid campaigns, we make Facebook work for the business: targeting the right audience, nurturing a community, and retargeting the people who almost converted until they do.',
      ],
      includes: [
        'Audience targeting',
        'Community building',
        'Paid campaigns',
        'Funnel strategy',
        'Content planning',
        'Retargeting ads',
        'Lead generation',
      ],
    },
    {
      name: 'LinkedIn',
      body: [
        'When your customer is another business, LinkedIn is where the decision is made. We position your brand as a thought leader in your field, the name people already trust before the first call.',
        'From a polished profile to B2B lead generation, we treat LinkedIn as the serious growth channel it is: expert positioning, content calendars that build authority, and industry targeting that puts you in front of the people who can actually say yes.',
      ],
      includes: [
        'Thought leadership',
        'B2B strategy',
        'Profile polishing',
        'Lead nurturing',
        'Expert positioning',
        'Content calendars',
        'Industry targeting',
      ],
    },
    {
      name: 'Instagram',
      body: [
        'Instagram is where a brand earns its look. We create scroll-stopping visuals and campaigns that convert: from everyday stories to paid ads that carry real intent.',
        'We build an Instagram presence that raises brand awareness through visual storytelling: reels, feed design, captions with a voice, paid boosting, and branded content that grows a community around what you make.',
      ],
      includes: [
        'Brand awareness',
        'Visual storytelling',
        'Reel creation',
        'Feed design',
        'Caption writing',
        'Paid boosting',
        'Community growth',
        'Branded content',
      ],
    },
    {
      name: 'YouTube',
      body: [
        'Video is the format that sticks. We turn it into a conversion engine, taking you from a rough idea to published content that educates, inspires, and drives action.',
        'We handle it end to end: scripting and channel strategy, SEO so the right people find it, series formats that keep them watching, and ad placements that move viewers who are ready straight toward becoming customers.',
      ],
      includes: [
        'Video scripting',
        'Channel strategy',
        'SEO optimization',
        'Series formats',
        'Ad placement',
        'Viewer retention',
      ],
    },
    {
      name: 'Twitter',
      body: [
        'Twitter rewards being sharp and being fast. We craft real-time messages that earn attention and action: from riding the right trend to engaging the right voices.',
        'From influencer outreach to trend-driven content, we turn Twitter into a growth engine: crisp copy, well-timed posts, a hashtag strategy that widens reach, and an engagement loop that keeps the conversation, and the brand, moving.',
      ],
      includes: [
        'Trend surfing',
        'Influencer outreach',
        'Sharp copy',
        'Real-time posting',
        'Hashtag strategy',
        'Community management',
        'Engagement loops',
      ],
    },
    {
      name: 'Pinterest',
      body: [
        'Pinterest is where inspiration turns into intent, and intent into traffic. We use strong creative and search optimization to turn browsing into clicks and sales.',
        'From branded boards to promoted pins, we build a Pinterest presence that sends qualified traffic to your site and turns a moment of inspiration into measurable business.',
      ],
      includes: [
        'Branded boards',
        'Pin SEO',
        'Promoted pins',
        'Creative design',
        'Traffic generation',
        'Shopping integration',
      ],
    },
  ],

  // ---- Email Marketing ---------------------------------------------------
  // Zefract_Email_Marketing_Services.docx, sections 01-11, verbatim.
  //
  // Replaces the four authored points this service had under its old slug — see the note where
  // they used to sit, above 'local-reputation'. The document's own order is kept, including the
  // fact that it spends its first four sections on audit, targets and plumbing before it writes
  // a single campaign: that sequence is the argument, and reordering it to lead with the
  // interesting parts would misrepresent how the service actually runs.
  'email-marketing': [
    {
      name: 'Email Marketing Audit',
      body: [
        'Before we send a single campaign, we look under the hood. We examine your whole email ecosystem: your list quality, your deliverability setup, the gaps in your customer lifecycle, weak or missing segmentation, and automations that overlap or work against each other.',
        'Nothing is guessed. You walk away with a clear revenue-opportunity map and a prioritised action plan that shows exactly what to fix, in what order, and what each fix is worth. You start knowing where the money is leaking, and where it’s waiting to be found.',
      ],
      includes: [
        'List & database health',
        'Deliverability check',
        'Lifecycle gap analysis',
        'Segmentation review',
        'Automation conflict audit',
        'Revenue opportunity map',
      ],
    },
    {
      name: 'Goals & KPI Framework',
      body: [
        'Email only earns its place when it’s measured like a real revenue channel. We tie your email programme to the numbers that actually run your business (activation, retention, repeat purchase, revenue per subscriber) instead of vanity metrics like open rates alone.',
        'Together we build a KPI model you can hold us to. Every campaign and every flow maps back to a business outcome, so you always know what email is contributing and why the next move makes sense.',
      ],
      includes: [
        'North-star metric',
        'Activation & retention targets',
        'Revenue-per-subscriber model',
        'Reporting cadence',
      ],
    },
    {
      name: 'Technical Infrastructure Setup',
      body: [
        'This is the invisible plumbing that decides whether your emails reach the inbox or vanish into spam. We configure the records that prove you’re a trusted sender (SPF, DKIM, and DMARC), set sensible sending limits, and warm your domain properly so your reputation grows instead of getting burned.',
        'We also set up inbox rotation, reply tracking, and the monitoring that flags a problem before it costs you. Small, technical, invisible to your customers, and decisive for whether your emails ever get seen.',
      ],
      includes: [
        'SPF',
        'DKIM',
        'DMARC',
        'Domain warm-up',
        'Sending limits',
        'Inbox rotation',
        'Reply tracking',
      ],
    },
    {
      name: 'Data & Tracking Infrastructure',
      body: [
        'You can’t grow what you can’t see. We connect your email platform to the rest of your stack so every open, click, and purchase flows back to one clear picture, no blind spots, no data trapped in tools that don’t talk to each other.',
        'With clean tracking in place, every decision is grounded in what customers actually do, not what we assume. You get attribution you can trust and a foundation that makes every later campaign smarter.',
      ],
      includes: [
        'Event tracking',
        'Platform & CRM integration',
        'Attribution setup',
        'Clean data pipeline',
      ],
    },
    {
      name: 'Prospect List Building & Data Validation',
      body: [
        'A great campaign sent to the wrong list is wasted effort. We build high-quality prospect lists based on your ideal-customer profile (the real people most likely to buy) rather than volume for its own sake.',
        'Then we validate every address to protect your deliverability, because sending to dead or risky emails is the fastest way to wreck your sender reputation. You get a list that’s an asset, not a liability.',
      ],
      includes: [
        'ICP-based list building',
        'Email verification',
        'List hygiene',
        'Deliverability protection',
      ],
    },
    {
      name: 'Segmentation & List Management',
      body: [
        'Not every subscriber wants the same message, and treating them as one crowd is why most email underperforms. We split your audience by who they are, what they’ve bought, and how they behave, so the right message reaches the right person.',
        'We keep your list healthy over time too: pruning inactive contacts, managing preferences, and keeping engaged subscribers front and centre. A smaller, sharper list almost always beats a big, tired one.',
      ],
      includes: [
        'Behavioural & lifecycle segments',
        'Preference management',
        'Re-permission',
        'List pruning',
      ],
    },
    {
      name: 'Customer Journey Mapping',
      body: [
        'This is the nerve centre of the whole programme. We map how a subscriber moves through your emails from start to finish (where they enter, how they progress, where they exit), so every message has a purpose and a place.',
        'Clear entry points, sensible transitions, and priority logic prevent flows from overlapping, cut needless unsubscribes, and squeeze more value from every stage of the relationship. It’s the difference between scattered sends and a system that compounds.',
      ],
      includes: [
        'Full journey map',
        'Entry & exit points',
        'Transition logic',
        'Overlap prevention',
        'Lifecycle monetisation',
      ],
    },
    {
      name: 'Retention & Engagement Flows',
      body: [
        'Winning a customer is expensive; keeping one is where the profit lives. We build the automated flows that do the quiet, compounding work (welcome sequences, onboarding, post-purchase follow-ups, win-backs, and loyalty nudges), so relationships deepen without you lifting a finger.',
        'Each flow is designed to move someone one step further: first purchase to second, casual to loyal, quiet to re-engaged. Set up once, they keep working every day, for every new subscriber.',
      ],
      includes: [
        'Welcome & onboarding',
        'Post-purchase',
        'Win-back',
        'Loyalty & re-engagement flows',
      ],
    },
    {
      name: 'Revenue Recovery Flows',
      body: [
        'A lot of revenue is lost in the last few inches: the abandoned cart, the browsed-but-didn’t-buy, the subscription about to lapse. We build the automated flows that catch those moments and bring people back with the right nudge at the right time.',
        'These are among the highest-return emails you can send, because they reach people who’ve already shown they want what you offer. It’s money that’s already on the table. We just help you pick it up.',
      ],
      includes: [
        'Abandoned cart',
        'Browse abandonment',
        'Failed-payment recovery',
        'Subscription rescue',
      ],
    },
    {
      name: 'Email Design & Copy',
      body: [
        'An email nobody opens or reads is a wasted send. We write subject lines that earn the open and copy that earns the click: clear, human, and true to your voice, never the fake urgency and clutter that trains people to ignore you.',
        'Every email is built to look right and work everywhere: clean on a phone, fast to load, easy to act on. Design and words pull in the same direction, toward a single obvious next step.',
      ],
      includes: [
        'Subject lines',
        'On-brand copy',
        'Mobile-first templates',
        'Clear CTAs',
        'A/B testing',
      ],
    },
    {
      name: 'AI-Enhanced Personalization',
      body: [
        'Generic email is easy to ignore. We use your data, and AI where it genuinely helps, to tailor what each subscriber sees: products they’re likely to want, timing that suits their habits, content that matches where they are in the journey.',
        'The result feels less like a broadcast and more like a message written for one person. That relevance is what lifts opens, clicks, and revenue, without adding hours of manual work on your side.',
      ],
      includes: [
        'Dynamic content',
        'Predictive product recommendations',
        'Send-time optimisation',
        'Behavioural triggers',
      ],
    },
  ],

  // ---- Digital Marketing Strategy ----------------------------------------
  // Zefract_Digital_Marketing_Strategy.docx, sections 01-07, verbatim.
  //
  // This service is not in Appendix D at all, so unlike every other entry in this file its
  // groups and chips are not the client's appendix taxonomy — they are derived from these same
  // seven sections in content/services.additions.ts. The prose stays here, where a
  // document-backed service's prose belongs.
  'digital-marketing-strategy': [
    {
      name: 'Market & Opportunity Mapping',
      body: [
        'Growth gets far easier when you stop trying to sell to everyone. Before anything else, we work out which slice of the market is genuinely worth your time: where demand is real, competition is beatable, and your product is the obvious answer rather than one of many.',
        'We map who your best-fit customer actually is, not who you hope they are, and we find the openings your competitors have left wide open. You walk away with a clear picture of where the biggest wins are hiding, and the confidence to aim your effort there instead of spreading it thin.',
      ],
      includes: [
        'Market sizing',
        'Best-fit customer profile',
        'Competitor gaps',
        'Demand signals',
        'Opportunity shortlist',
      ],
    },
    {
      name: 'Budget & Capacity Planning',
      body: [
        'An ambitious plan that ignores your bank balance and your team’s time is just a wish. We take the strategy and hold it up against what you can actually spend and actually deliver, so the plan stretches you without breaking you.',
        'We map the money and the people together: what each move costs, who does the work, and what has to wait. The result is a plan that’s bold on purpose but honest about limits, so you commit with your eyes open instead of running out of road halfway through.',
      ],
      includes: [
        'Budget mapping',
        'Resource planning',
        'Cost-per-move estimates',
        'Realistic timelines',
        'Trade-off decisions',
      ],
    },
    {
      name: 'Growth & Channel Strategy',
      body: [
        'Trying to be everywhere is the fastest way to be nowhere. We help you resist the urge to sprinkle budget across every platform and instead pick the handful of channels that can genuinely move your numbers.',
        'We lay out a long-term growth plan and choose the two or three channels that fit your customer, your margins, and your stage, then decide how they work together rather than competing for scraps. It’s a route to steady growth, not a scattered set of experiments hoping one lands.',
      ],
      includes: [
        'Growth roadmap',
        'Channel selection',
        'Budget allocation',
        'Channel-fit analysis',
        'Sequencing',
      ],
    },
    {
      name: 'Campaign & Media Planning',
      body: [
        'Strategy only earns its keep when it turns into something you can put on a calendar. We take the direction we’ve set and break it into a clear schedule of what runs, where, and when.',
        'We plan the placements, formats, and spend across each platform so nothing clashes and nothing is left to the last minute. You get a concrete media plan (the campaigns mapped out across the year), so your team always knows what’s live, what’s next, and why.',
      ],
      includes: [
        'Media calendar',
        'Placement planning',
        'Format mix',
        'Spend scheduling',
        'Platform coordination',
      ],
    },
    {
      name: 'Go-to-Market & Campaign Strategy',
      body: [
        'A great product still needs a story people can repeat. When you’re launching something new (a product, a feature, a move into a new market), we turn what you’ve built into a plan for getting it in front of the right people.',
        'We shape the message for each audience and market, then build the campaign narratives that carry it, so the launch lands with a clear reason to care instead of a quiet announcement nobody notices. Everyone selling it tells the same story, and that story is built to move people.',
      ],
      includes: [
        'Launch playbook',
        'Positioning',
        'Audience messaging',
        'Campaign narratives',
        'Market entry plan',
      ],
    },
    {
      name: 'KPI Frameworks',
      body: [
        'If you can’t say what winning looks like, you can’t tell whether you’re getting there. We define success in numbers everyone agrees on, and we sort them so you know which few actually matter and which are just noise.',
        'We set up a simple way to track impact across the whole journey, from first awareness to closed sale, so you can see what’s working at each stage instead of staring at a dashboard full of figures that don’t connect. Clear targets, honestly measured, in plain English.',
      ],
      includes: [
        'KPI definition',
        'Metric hierarchy',
        'Funnel tracking',
        'Reporting setup',
        'Success benchmarks',
      ],
    },
    {
      name: 'Experiment & Test Roadmaps',
      body: [
        'The best-run marketing never stops learning. Instead of betting everything on one big idea, we build a steady pipeline of small, structured tests, so you’re always finding what works next rather than repeating what worked last year.',
        'Each experiment is planned, measured, and either kept or dropped on evidence, not opinion. Over time this compounds: performance climbs, waste falls, and you unlock new pockets of growth your competitors are still guessing at.',
      ],
      includes: [
        'Test pipeline',
        'Experiment design',
        'Prioritisation',
        'Measured results',
        'Continuous learning',
      ],
    },
  ],
}

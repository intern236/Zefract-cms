import type { Faq } from './types'

/**
 * Five FAQs per service page, keyed to a service slug.
 *
 * Separate from the FAQS list in cases.ts, which holds the general questions the home page
 * asks. Both are read by `getFaqs()`: called with no argument it returns the general set,
 * called with a slug it returns that service's. The `service` field on `Faq` existed for
 * exactly this before anything used it.
 *
 * WRITTEN ANSWER-FIRST, ON PURPOSE. The first sentence of every answer answers the question
 * outright, before any qualification. That is the format an answer engine can lift and a
 * generative one can quote, which is the same advice the AEO and GEO pages sell — it would
 * be an odd look to give that advice in prose and then bury our own answers.
 *
 * These render through <FaqSection>, which emits FAQPage JSON-LD alongside the markup.
 *
 * SCOPE. Every service page. Sourced from the client's own service documents where one exists
 * (SEO, GEO, Paid, Social, Email Marketing, Digital Marketing Strategy); the rest are written
 * from the service catalogue — and from the answer-engine section of the SEO document in the
 * case of AEO — and still need the client's review before launch.
 *
 * Deliberately no prices, no timelines presented as measured results, and no claims about
 * past performance. Every number the client can actually stand behind is still on the
 * hand-back list, and a FAQ is the worst place to invent one.
 */
export const SERVICE_FAQS: Faq[] = [
  // ==========================================================================
  // WRITTEN, NOT TRANSCRIBED — pillar 1, Engineering.
  // No client document behind these. Same rules as the rest of this file: answer-first, no
  // prices, no timelines presented as measured results, no claims about past performance.
  // Needs client review before launch.
  // ==========================================================================
  {
    service: 'digital-engineering',
    question: 'Will our own team be able to maintain what you build?',
    answer:
      'Yes, and we treat that as a requirement rather than a courtesy. The codebase follows conventions your developers will recognise, the architecture decisions are documented with their reasoning, and handover is a walkthrough rather than a handover of credentials. If your team cannot safely change what we built, we have not finished.',
  },
  {
    service: 'digital-engineering',
    question: 'Which stack will you use?',
    answer:
      'Whichever your team can maintain without us, weighed against what the product actually needs. We work primarily in React and Next.js on the front end with REST or GraphQL services behind, but the deciding factors are your existing skills, your integration requirements and your running costs. We justify the choice in writing before anyone commits.',
  },
  {
    service: 'digital-engineering',
    question: 'Can you work with our existing codebase?',
    answer:
      'Usually, and it is often the better option. We start by reading what is there and telling you honestly what can be built on and what is holding you back. Incremental improvement beats a rewrite in most cases, because a rewrite means paying again for everything the current system already knows how to do.',
  },
  {
    service: 'digital-engineering',
    question: 'How do you handle security?',
    answer:
      'At design time, not as an audit afterwards. Authentication and authorisation are architectural decisions, dependencies are scanned, and the pipeline runs security checks alongside the tests. Where a project warrants a full penetration test, that sits with our quality engineering practice and the findings come back as a work plan.',
  },
  {
    service: 'digital-engineering',
    question: 'What happens after launch?',
    answer:
      'Whatever you want to happen. Some clients take the codebase and run it entirely in-house, which is why the documentation and handover matter. Others keep us on for ongoing development or a support arrangement. The build is not structured to make you dependent on us either way.',
  },

  {
    service: 'software-product-engineering',
    question: 'What is the difference between this and just building the software?',
    answer:
      'The order of the questions. Product engineering starts by working out what should be built and whether it holds up, then builds the core of it and grows the rest on evidence. If you already know exactly what you want and simply need it built well, digital engineering is the more direct route.',
  },
  {
    service: 'software-product-engineering',
    question: 'What actually goes into an MVP?',
    answer:
      'The smallest set of features that makes the product genuinely useful to someone. Not a rough draft and not a prototype: the core, built properly, with the optional parts deliberately deferred. That is a judgement call we make with you in scoping, and the discipline is in what gets left out.',
  },
  {
    service: 'software-product-engineering',
    question: 'What if discovery says the idea does not work?',
    answer:
      'We tell you, and that is a good outcome. Discovery costs a fraction of a build, so finding out early that the demand is not there or the economics do not close is the cheapest possible version of that lesson. Usually it is not a flat no but a redirection: the same customers with a different problem worth solving.',
  },
  {
    service: 'software-product-engineering',
    question: 'How do you decide what to build next?',
    answer:
      'From what users do, not from who argued hardest. Analytics go in from the first release, so the backlog can be ordered against real behaviour, and where the answer is genuinely unclear we run an experiment rather than a debate. Everything is visible to you, including the reasoning for anything we drop.',
  },
  {
    service: 'software-product-engineering',
    question: 'Do we own the code and the IP?',
    answer:
      'You do, entirely. The repository, the infrastructure and the intellectual property are yours from the first commit, and nothing in the arrangement depends on us holding them. That is worth checking with any agency, because it is not universal.',
  },

  {
    service: 'mobile-engineering',
    question: 'Native or cross-platform: which do we need?',
    answer:
      'Cross-platform for most apps, native when there is a specific reason. React Native and Flutter now cover the large majority of products at roughly half the cost of building twice, and the difference in feel is one most users cannot pick. Heavy graphics, deep hardware access or interactions that must be perfectly precise are where native still earns its price, and we will say which case you are in.',
  },
  {
    service: 'mobile-engineering',
    question: 'Do you handle getting it into the App Store and Play Store?',
    answer:
      'Yes, submission is part of the work rather than something handed back to you. Both stores have review guidelines, metadata requirements and rejection reasons that are far easier to satisfy before submitting than after, and we run beta builds through TestFlight and its Android equivalent so real people use it before the public does.',
  },
  {
    service: 'mobile-engineering',
    question: 'Will the app work without an internet connection?',
    answer:
      'Where that matters for your users, yes, and it usually matters more than people expect. Offline sync and considered loading states mean a tunnel or a weak signal is an inconvenience rather than a dead end. It is a design decision made at the start, because retrofitting offline behaviour into an app built around a live connection is close to a rewrite.',
  },
  {
    service: 'mobile-engineering',
    question: 'What happens when iOS or Android releases an update?',
    answer:
      'It gets planned for rather than reacted to. Every OS release is a compatibility event, and apps that quietly break are usually ones nobody was monitoring. We test across a real device matrix, watch crash reporting in production, and treat OS migration as scheduled work, which is the difference between a maintenance task and a wave of one-star reviews.',
  },
  {
    service: 'mobile-engineering',
    question: 'Can you take over an app somebody else built?',
    answer:
      'Often, and the first step is reading it honestly. We assess the codebase, the store accounts and the crash history, then tell you what can be built on and what is a liability. Sometimes the answer is that a rebuild costs less than the next two years of working around what is there, and if so we will show you the reasoning rather than just assert it.',
  },

  {
    service: 'quality-engineering',
    question: 'Will testing slow our releases down?',
    answer:
      'The opposite, once it is automated and in the pipeline. Manual testing at the end of a project is a bottleneck; a trusted suite that runs on every change is what lets a team ship without ceremony. The slow part of most releases is not the testing, it is the uncertainty that exists when nobody has any.',
  },
  {
    service: 'quality-engineering',
    question: 'How much test coverage do we need?',
    answer:
      'Less than total, weighted toward risk. Chasing a coverage percentage produces tests for trivial code while the checkout flow goes unwatched. We map what exists, identify what is both untested and load-bearing, and put the effort where a failure would actually cost you something.',
  },
  {
    service: 'quality-engineering',
    question: 'What is VAPT and do we need it?',
    answer:
      'Vulnerability assessment and penetration testing: a structured attempt to find the security holes in your application before someone else does. You need it if you handle personal or payment data, sell to enterprise customers who will ask for it, or operate under a compliance regime. Findings come back triaged by exploitability with remediation guidance, so it reads as a work plan.',
  },
  {
    service: 'quality-engineering',
    question: 'Can you work with our existing test suite?',
    answer:
      'Yes, and the first job is usually working out how much of it is trusted. A suite that is routinely ignored or re-run until it passes is providing false confidence rather than coverage. We assess what is there, stabilise the flaky tests, and extend from that base rather than starting again by default.',
  },
  {
    service: 'quality-engineering',
    question: 'Do you test performance as well as functionality?',
    answer:
      'Yes, and they answer different questions. Functional tests confirm the thing does what it should; load and stress testing establish at what volume it stops doing so. Profiling then turns a vague sense that something is slow into a specific query or endpoint, so the fix is targeted rather than a rewrite undertaken on a hunch.',
  },

  // ---- pillar 2, Experience & Design (written, not transcribed) ------------
  {
    service: 'digital-experience',
    question: 'Which platform should we build on?',
    answer:
      'Whichever your team can run without us. We weigh who edits the site, what it has to integrate with, how much traffic it takes and what it costs to run, then recommend in writing with the reasoning attached. WordPress, Webflow, Shopify and headless setups all win in different circumstances, and we are not attached to any of them.',
  },
  {
    service: 'digital-experience',
    question: 'Can our team edit the site without a developer?',
    answer:
      'Yes, and that is a design constraint from the start rather than a feature added at the end. The content model is shaped around how your team actually works, and handover includes training plus a short written guide. A CMS nobody was shown how to use is the most common reason a site goes stale within a year.',
  },
  {
    service: 'digital-experience',
    question: 'Will a redesign actually improve our numbers?',
    answer:
      'Only if it changes more than the appearance. Most redesigns move the visuals and leave the load time, the page structure and the path to conversion exactly as they were, which is why so many of them show no measurable effect. We start by finding out which of those is actually holding you back, and say so if a full redesign is not the answer.',
  },
  {
    service: 'digital-experience',
    question: 'How do you handle site speed?',
    answer:
      'As a budget the build has to stay inside, not a clean-up task afterwards. Core Web Vitals are tracked during development, images are sized and served properly, and caching and CDN configuration are set up deliberately. Retrofitting performance into a finished site is far more expensive than designing to it.',
  },
  {
    service: 'digital-experience',
    question: 'Will the new site keep our search rankings?',
    answer:
      'That is the plan, and it takes deliberate work. URL mapping and redirects, preserved metadata and clean markup all get handled as part of the build rather than discovered afterwards. Migrations lose rankings when nobody owns that piece, which is one advantage of the people building the site being the people who have to make it rank.',
  },

  {
    service: 'experience-design',
    question: 'What is the difference between UX and UI?',
    answer:
      'UX is what happens and in what order; UI is what it looks like and how it responds. A beautiful interface over a confusing flow still loses people, and a well-reasoned flow presented badly is hard to trust. They are done together here because separating them is how products end up good at one and poor at the other.',
  },
  {
    service: 'experience-design',
    question: 'Do we really need user research?',
    answer:
      'You need evidence proportionate to the decision. Not every question warrants a formal study, but almost every product has assumptions that nobody has ever checked, and those are usually the expensive ones. Lean research with a handful of the right people costs very little next to building the wrong thing confidently.',
  },
  {
    service: 'experience-design',
    question: 'What do we actually get at the end?',
    answer:
      'Designs your engineers can build from without guessing: flows, screens at the states that matter including empty and error, and the components documented. Where a design system is in scope you also get tokens and a component library, so the work extends rather than needing reinterpretation each time.',
  },
  {
    service: 'experience-design',
    question: 'Can you work with our existing brand guidelines?',
    answer:
      'Yes, and we would rather. Existing guidelines carry recognition that is worth keeping, so we design inside them and flag anything that is genuinely obstructing usability rather than quietly overriding it. If there are no guidelines, we will set out what we are using so it stays consistent.',
  },
  {
    service: 'experience-design',
    question: 'How do you handle accessibility?',
    answer:
      'Designed in, not audited afterwards. Contrast, focus states, keyboard paths, target sizes and semantic structure are decisions made while the screens are being drawn, because retrofitting them means revisiting nearly every one. It is a legal position in many markets and, more straightforwardly, a larger audience.',
  },

  {
    service: 'branding-creative',
    question: 'We already have a logo. Do we need branding?',
    answer:
      'Possibly not a new logo, but a system around it is a different question. Most brand problems are not the mark: they are the absence of rules, so the site, the deck and the ads read as three companies. Guidelines, a type and colour system and real templates fix that without touching what you already own.',
  },
  {
    service: 'branding-creative',
    question: 'What does a brand project actually produce?',
    answer:
      'Something usable rather than a PDF that gets filed. The positioning and messaging that decide what you say, the identity and system that decide how it looks, and the working templates (decks, social, ad creative) that let your team produce the next round without drifting off-brand.',
  },
  {
    service: 'branding-creative',
    question: 'Why does the logo need to work at small sizes?',
    answer:
      'Because that is where it is mostly seen. A favicon, an app icon, a social avatar and a sender image are all tiny, and identities drawn large routinely turn to mush at those sizes. Designing for the smallest use first tends to produce a stronger mark at every size above it.',
  },
  {
    service: 'branding-creative',
    question: 'Do you do naming?',
    answer:
      'We support it rather than run it as a standalone exercise. That means generating and pressure-testing options against the positioning, checking they survive being said aloud and being typed, and giving you a reasoned shortlist. Trademark clearance sits with your legal advisers, and it should.',
  },
  {
    service: 'branding-creative',
    question: 'How is this different from just hiring a designer?',
    answer:
      'The strategy and the execution stay attached. A designer given an unclear brief produces something attractive that does not argue for anything in particular. Here the positioning work happens first and the same team carries it through to the site and campaigns, so the decision does not get lost between suppliers.',
  },

  // ---- pillar 3, AI & Automation (written, not transcribed) ---------------
  {
    service: 'applied-ai',
    question: 'How is this different from a chatbot?',
    answer:
      'An agent acts; a chatbot answers. With real tool access it can complete a task end to end (look something up, make the change, report back) rather than producing a suggestion someone still has to carry out. That difference is what turns a novelty into a time saving.',
  },
  {
    service: 'applied-ai',
    question: 'What stops it doing something we did not want?',
    answer:
      'Permissions and approval gates set per task rather than per project. Autonomy is a dial: routine, reversible actions run unattended, and anything consequential waits for a human. Every action is logged with its inputs and reasoning, so the audit trail exists before anyone asks for it.',
  },
  {
    service: 'applied-ai',
    question: 'Will it make things up?',
    answer:
      'That risk is what grounding exists to manage. Answers are retrieved from your own documents and systems and returned with citations, so a response can be checked rather than trusted blindly. Where confidence is low the correct behaviour is to say so, and we treat that as a feature rather than a failure.',
  },
  {
    service: 'applied-ai',
    question: 'Where does our data go?',
    answer:
      'Wherever your policy requires, and that is a decision made before anything is built. Model choice, hosting region and retention settings are all configurable, and enterprise API tiers generally exclude your data from training. If you have constraints, they shape the architecture rather than being checked afterwards.',
  },
  {
    service: 'applied-ai',
    question: 'How do we know a use case is worth it?',
    answer:
      'We model it before building it. Discovery looks at how often the task happens, what it currently costs in time, and how tolerable an error is, because a process that runs twice a month rarely justifies the work. Expect us to recommend against some of the ideas on your list.',
  },

  {
    service: 'ai-enablement',
    question: 'How is this different from applied AI?',
    answer:
      'Scale and starting point. Enablement adds AI to a product that already exists and works, usually as features inside flows people already use. Applied AI builds something new, typically agents or assistants that do a job end to end. Most companies want enablement first.',
  },
  {
    service: 'ai-enablement',
    question: 'Which model should we use?',
    answer:
      'Different ones for different tasks, which is usually the cheapest correct answer. A small fast model handles most jobs at a fraction of the cost, with the expensive one reserved for work that genuinely needs it. We build against an abstraction so the choice can change without a rebuild.',
  },
  {
    service: 'ai-enablement',
    question: 'How do we keep the costs predictable?',
    answer:
      'By treating token spend as a design decision. Model selection per task, caching for repeated work, prompts kept tight, and limits set deliberately. We instrument usage from the start so cost is visible per feature rather than arriving as one unexplained line on a monthly invoice.',
  },
  {
    service: 'ai-enablement',
    question: 'What happens when the AI provider goes down?',
    answer:
      'The feature degrades rather than the product failing. Orchestration across providers with fallback handling means a slow or unavailable model routes elsewhere or fails gracefully into the non-AI path. An outage at one vendor should not take a working product with it.',
  },
  {
    service: 'ai-enablement',
    question: 'How do you know the outputs are good enough?',
    answer:
      'Evaluation against a real test set, run whenever a prompt or model changes. Without it nobody can safely touch something that is working, and quality drifts silently as providers update models underneath you. Prompts are versioned and treated as code for the same reason.',
  },

  {
    service: 'conversational-ai',
    question: 'How do we stop it giving wrong answers?',
    answer:
      'Grounding, citations and explicit confidence handling. Responses are retrieved from your documentation rather than generated from general knowledge, every answer shows its source, and below a confidence threshold it says it does not know and offers a human. Confidently wrong is the failure mode that costs most, so it is the one designed against first.',
  },
  {
    service: 'conversational-ai',
    question: 'Will customers be able to reach a human?',
    answer:
      'Always, and visibly. Escalation carries the full conversation so nobody has to repeat themselves, and the route to a person is signposted rather than buried. Assistants that hide the exit are the reason people distrust the channel, and hiding it does not reduce contacts: it just makes them angrier.',
  },
  {
    service: 'conversational-ai',
    question: 'Which channels can it work on?',
    answer:
      'The ones your customers already use: your site, WhatsApp, and voice interfaces where they fit. An assistant is only useful on the channel the question was going to be asked on anyway, so we start from where your contacts actually arrive rather than adding a widget and hoping.',
  },
  {
    service: 'conversational-ai',
    question: 'Can it help our own team rather than customers?',
    answer:
      'Yes, and that is often the faster payback. The same grounding powers internal copilots: document Q&A over the handbook and the wiki, and onboarding assistants that answer the questions a new starter would otherwise interrupt three colleagues to ask. Lower risk, since the audience is internal.',
  },
  {
    service: 'conversational-ai',
    question: 'How does it improve after launch?',
    answer:
      'Conversations are reviewed for what it got wrong and where it had to escalate, and those gaps feed back into the content it draws on. That usually improves your documentation as a side effect, since a question the assistant cannot answer is generally one your help centre does not answer either.',
  },

  {
    service: 'intelligent-automation',
    question: 'Which process should we automate first?',
    answer:
      'Usually not the one people complain about most. Process mining shows where time actually goes, and the bottleneck is regularly a different step from the assumed one. We look for high frequency, low judgement and clear rules. Automating a rare, nuanced process efficiently is still the wrong thing done well.',
  },
  {
    service: 'intelligent-automation',
    question: 'Do we need APIs for everything?',
    answer:
      'No, which is what RPA is for. Where a system has no API and no prospect of one, a bot can drive the interface the way a person would, on a schedule and without transcription errors. It is the pragmatic option rather than the elegant one, and it is the right call when the alternative is replacing a system that works.',
  },
  {
    service: 'intelligent-automation',
    question: 'What happens when something unexpected arrives?',
    answer:
      'It goes to a person rather than being processed wrongly. Exception handling and validation thresholds route anything that does not fit into a review queue. The aim is to remove the typing, not the checking, and an automation with no exception path is one that fails silently.',
  },
  {
    service: 'intelligent-automation',
    question: 'Will this replace people’s jobs?',
    answer:
      'In our experience it removes the parts of jobs people least wanted. The work being automated is typically rekeying between systems and chasing approvals, which is rarely what anyone was hired for. Capacity moves to the work that actually needed judgement, and volume stops being a staffing question.',
  },
  {
    service: 'intelligent-automation',
    question: 'How do we prove it worked?',
    answer:
      'By measuring the process before it changes. Every automated run is logged with its inputs, its decision and its exceptions, so throughput, error rate and turnaround can be compared against the baseline. Without that measurement first, the saving is an assertion rather than a number.',
  },

  // ---- pillar 4, Cloud, Data & Security (written, not transcribed) --------
  {
    service: 'cloud-modernization',
    question: 'Will migrating actually save us money?',
    answer:
      'Not by itself. Moving a system onto rented hardware gets you the same system with a monthly bill attached. Savings come from what follows: rightsizing what was over-provisioned, replacing components with managed services, and switching off resources nobody has looked at in years. We model the running cost before the move rather than after.',
  },
  {
    service: 'cloud-modernization',
    question: 'How much downtime should we expect?',
    answer:
      'The plan is none, and it is a planning problem rather than a technical one. Cutovers are rehearsed against production-shaped data, run behind a flag, with a tested rollback at every stage. Where a window genuinely cannot be avoided we tell you its length before you commit, rather than discovering it on the night.',
  },
  {
    service: 'cloud-modernization',
    question: 'Should we lift and shift or rebuild?',
    answer:
      'Per workload, not per project. Some things should simply move, some are worth rebuilding to remove maintenance permanently, and a few should stay where they are. Rebuilding everything is how migrations overrun; lifting everything is how they fail to deliver a benefit. We show the reasoning for each.',
  },
  {
    service: 'cloud-modernization',
    question: 'Which cloud provider is best?',
    answer:
      'Whichever fits your workloads, your team’s existing skills and your commercial position. AWS, Azure and GCP are more alike than their marketing suggests, and the deciding factors are usually the managed services you will actually use and what you can negotiate. We are not tied to any of them.',
  },
  {
    service: 'cloud-modernization',
    question: 'What about disaster recovery?',
    answer:
      'Designed and then actually tested, because an untested backup is a belief rather than a safeguard. We agree how much data you can afford to lose and how long recovery may take, build to those targets, and restore from backup at least once so both numbers are known before you need them.',
  },

  {
    service: 'platform-engineering',
    question: 'Do we need Kubernetes?',
    answer:
      'Probably less often than you have been told. It carries real operational cost and pays off at particular scales and shapes of workload. Plenty of systems are better served by managed containers or serverless. We will tell you which side of that line you are on rather than defaulting to the complicated answer.',
  },
  {
    service: 'platform-engineering',
    question: 'What does infrastructure as code actually get us?',
    answer:
      'Infrastructure that is what the repository says it is. Every change has an author, a reason and a review, environments can be recreated rather than remembered, and staging genuinely resembles production. It also ends the situation where one person is the only one who knows how something was set up.',
  },
  {
    service: 'platform-engineering',
    question: 'How often should we be deploying?',
    answer:
      'Often enough that each release is small and boring. Batching a month of work into one Friday release means finding several problems at once with no way to tell which caused what. The frequency matters less than the property it produces: changes small enough to reason about and undo.',
  },
  {
    service: 'platform-engineering',
    question: 'Can you work with our existing pipeline?',
    answer:
      'Usually, and we start by finding out what your team trusts. A pipeline people routinely bypass is not providing safety, it is providing ceremony. We assess what is there, fix the parts that are ignored, and extend from that base rather than replacing everything by default.',
  },
  {
    service: 'platform-engineering',
    question: 'Do you provide on-call support?',
    answer:
      'We can, and we can also set your own team up to run it well. Either way the point is the same: defined incident response, alerting tuned to what users actually experience, and SLOs that say what "working" means in numbers rather than in opinion. Alert fatigue is the usual reason on-call fails.',
  },

  {
    service: 'data-and-ai',
    question: 'Why do our dashboards disagree with each other?',
    answer:
      'Almost always because there is no agreed definition. Two teams compute "revenue" or "active user" slightly differently, both are defensible, and every meeting becomes an argument about whose figure is right. A modelled warehouse with one definition per metric is what ends that, and it is a modelling problem rather than a tooling one.',
  },
  {
    service: 'data-and-ai',
    question: 'Do we need a warehouse, or is a database enough?',
    answer:
      'A database is enough until you need to combine sources or ask questions across them, at which point querying production directly starts affecting the thing your customers use. The trigger is usually the second or third system, not a data volume. We will say if you are not there yet.',
  },
  {
    service: 'data-and-ai',
    question: 'How do we know the data is right?',
    answer:
      'Quality checks at ingestion and lineage throughout. A broken upstream feed is flagged the day it breaks rather than discovered in a board pack three weeks later, and any figure can be traced back to its source. Being able to answer "where did this come from" is what makes people willing to act on it.',
  },
  {
    service: 'data-and-ai',
    question: 'What is MLOps and do we need it?',
    answer:
      'The practice of running models in production the way you run software: deployment, versioning, monitoring and retraining. You need it the moment a model informs a real decision, because a model that was accurate at launch and never re-evaluated drifts quietly, and the failure is invisible until something goes badly.',
  },
  {
    service: 'data-and-ai',
    question: 'Which warehouse platform should we use?',
    answer:
      'Snowflake, Databricks and BigQuery all work well and suit different situations. The deciding factors are your volumes, what your team already knows, what your cloud commitment looks like and how you expect to query it. The modelling work matters far more than the choice between them.',
  },

  {
    service: 'data-and-analytics',
    question: 'Why does nobody use the dashboards we already have?',
    answer:
      'Usually because they were built to display what was available rather than to answer a question someone has. A screen with forty metrics offers no way to prioritise, so reading it takes more effort than the decision it was meant to inform. Fewer, well-chosen numbers get looked at.',
  },
  {
    service: 'data-and-analytics',
    question: 'Which metrics should we track?',
    answer:
      'The ones somebody would act differently because of. We start from the decision (who makes it, how often, and what would change their mind) and work backwards to the number. Metrics that nobody can influence are interesting rather than useful, and they crowd out the ones that are.',
  },
  {
    service: 'data-and-analytics',
    question: 'Power BI, Tableau or Looker?',
    answer:
      'Largely a question of what your team already uses and what your data sits in. All three produce good results in capable hands. Switching tools rarely fixes a reporting problem, because the common causes are undefined metrics and untrustworthy data, and both follow you to the new platform.',
  },
  {
    service: 'data-and-analytics',
    question: 'Can our team build their own reports?',
    answer:
      'That is the aim, through a governed semantic layer rather than open access to raw tables. Defined metrics and appropriate permissions mean people can answer their own follow-up questions, which is usually where the real insight was, without producing five versions of the same number.',
  },
  {
    service: 'data-and-analytics',
    question: 'Do we need a data warehouse before analytics?',
    answer:
      'Not always. If the numbers live in one system and are trusted, reporting can be built directly. The warehouse becomes necessary when questions span sources or when querying production starts affecting it. We will tell you honestly which situation you are in rather than selling the larger project.',
  },

  {
    service: 'cybersecurity',
    question: 'How often should we run a penetration test?',
    answer:
      'At least annually, and after any significant architectural change. The system you tested eighteen months ago is not the system you run today: code has changed, dependencies have updated and infrastructure has drifted. Many compliance regimes require an annual cadence, and that is a reasonable floor rather than a target.',
  },
  {
    service: 'cybersecurity',
    question: 'What is the difference between VAPT and a security assessment?',
    answer:
      'A security assessment reviews your controls, architecture and processes: the design. VAPT actively probes the running system for exploitable weaknesses: the reality. They answer different questions and most organisations benefit from both, since good design can be undermined by one misconfigured resource.',
  },
  {
    service: 'cybersecurity',
    question: 'We are small. Are we really a target?',
    answer:
      'Most attacks are not targeted at all. They are automated scans looking for known vulnerabilities and exposed credentials across the whole internet, and they do not check company size first. Smaller organisations are frequently easier to compromise, which makes them proportionally more attractive rather than less.',
  },
  {
    service: 'cybersecurity',
    question: 'Can you help us get ISO 27001 or SOC 2?',
    answer:
      'Yes, and the useful version is structuring the work so evidence accumulates from how you already operate rather than being reconstructed before an audit. The certificate is a by-product of the controls actually running. Certification itself is issued by an accredited external auditor, not by us.',
  },
  {
    service: 'cybersecurity',
    question: 'What do we get at the end of an assessment?',
    answer:
      'A work plan rather than a list of anxieties. Findings triaged by exploitability rather than severity score alone, each with remediation guidance, plus a risk report written to be read by the people who have to fund the fixes. Where we built the system, we can also do the remediation.',
  },

  // ---- pillar 5 remainder and cross-cutting (written, not transcribed) ----
  // AEO and Content Marketing are NOT repeated here. Both already had authored FAQ sets
  // further up this file — they were written at the same time as the SEO/GEO/Paid/Social
  // sets, from the catalogue rather than from a document, because neither service had one.
  // A second set was drafted for them during the pillar sweep and removed: it asked
  // near-identical questions and would have rendered ten entries on each page.
  /* EMAIL MARKETING — rewritten against the client's own document
     (Zefract_Email_Marketing_Services.docx) and re-keyed to the new slug. The previous five
     were written from Appendix D when this service had no document; three of the questions
     survive because they are the ones buyers actually ask, but every answer now points at
     something the document commits to — the audit, the KPI framework, the two flow families,
     and the AI personalisation section. */
  {
    service: 'email-marketing',
    question: 'Is email still worth investing in?',
    answer:
      'It is the only audience you own. Every other channel rents you attention on terms that can change without notice, while a list of people who asked to hear from you survives any algorithm update, and unlike ads, which stop the moment you stop paying, a list and a set of flows keep working long after the setup is done.',
  },
  {
    service: 'email-marketing',
    question: 'Where do you start?',
    answer:
      'With an audit, before a single campaign goes out. We go through your list quality, your deliverability setup, the gaps in your customer lifecycle, your segmentation and any automations that overlap or fight each other, and you get a prioritised plan that says what to fix, in what order, and what each fix is worth. Nothing is guessed.',
  },
  {
    service: 'email-marketing',
    question: 'Which flows should we build first?',
    answer:
      'The ones that respond to something a person just did. Welcome and onboarding come first, then the revenue recovery flows (abandoned cart, browse abandonment, failed payments, lapsing subscriptions) because they reach people who have already shown they want what you offer. Loyalty, win-back and re-engagement follow once those are running.',
  },
  {
    service: 'email-marketing',
    question: 'Why do our emails end up in spam?',
    answer:
      'Usually authentication or list hygiene rather than content. Missing or misconfigured SPF, DKIM and DMARC records, a domain that was never warmed up properly, or sending to addresses that have not engaged in years will all do it. It is fixable, and it gets fixed before anything else about the channel is worth optimising.',
  },
  {
    service: 'email-marketing',
    question: 'How do you measure this if open rates are unreliable?',
    answer:
      'Against the numbers that run your business, not open rates. We agree a KPI model up front (activation, retention, repeat purchase, revenue per subscriber) and every campaign and flow maps back to one of them, so you can see what email contributed rather than how many people loaded an image.',
  },

  /* DIGITAL MARKETING STRATEGY — from Zefract_Digital_Marketing_Strategy.docx. Same rules as
     the rest of this file: answer-first, and nothing here promises a result. The document is
     itself careful on that point — its pitch is a plan you can run, not a number it will hit. */
  {
    service: 'digital-marketing-strategy',
    question: 'What do we actually get at the end?',
    answer:
      'A plan your team can run on Monday morning, not a deck. That means a shortlist of the opportunities worth your time, the two or three channels chosen for your customer and your margins, a media calendar of what runs where and when, a KPI framework everyone has agreed on, and a pipeline of tests to keep improving it.',
  },
  {
    service: 'digital-marketing-strategy',
    question: 'We already run SEO and ads. Do we need a strategy?',
    answer:
      'That is usually when it starts paying for itself. Channels run separately end up competing for the same budget and cancelling each other out; strategy is the layer that gives each one a job and a sequence. If you cannot say what each channel is for, or which you would cut first, the plan is doing less work than the spend.',
  },
  {
    service: 'digital-marketing-strategy',
    question: 'How many channels should we run at once?',
    answer:
      'Fewer than you think, usually two or three. Trying to be everywhere is the fastest way to be nowhere, so we pick the handful that fit your customer, your margins and your stage, then decide how they support each other rather than sprinkling budget across every platform and hoping one lands.',
  },
  {
    service: 'digital-marketing-strategy',
    question: 'How do you decide the budget?',
    answer:
      'By holding the plan against what you can actually spend and actually deliver. We cost each move, map who does the work, and name what has to wait, so the plan stretches you without running out of road halfway through. The trade-offs are written down and agreed rather than discovered later.',
  },
  {
    service: 'digital-marketing-strategy',
    question: 'Do you run the plan, or just write it?',
    answer:
      'The same team does both, which is the point. A strategy written by people who will not have to deliver it tends to be optimistic in exactly the places that matter, so ours is made by the team that builds and runs the work, realistic on day one and adjusted the moment the numbers say so.',
  },

  {
    service: 'local-reputation',
    question: 'What is the map pack and why does it matter?',
    answer:
      'The block of three business listings that appears above the organic results for local searches. It takes the majority of clicks for those queries, and getting into it is usually the highest-return move available to a business with a catchment, because most people never scroll past it to reach your website.',
  },
  {
    service: 'local-reputation',
    question: 'How do we get more reviews without being pushy?',
    answer:
      'By asking at the right moment and making it trivially easy. The point of highest satisfaction is usually just after the job is done or the order arrives, and a direct link removes the friction that loses most requests. Recency matters as much as volume, so a steady flow beats a burst. Incentivising reviews breaches most platforms’ terms and we will not do it.',
  },
  {
    service: 'local-reputation',
    question: 'Should we respond to bad reviews?',
    answer:
      'Yes, and prospects read those replies more closely than the positive ones. A calm, specific response that takes the issue seriously reads far better than either silence or defensiveness, and it is aimed at the next reader rather than the reviewer. Sentiment monitoring means you see them while they are still one review.',
  },
  {
    service: 'local-reputation',
    question: 'Why do our business details need to match everywhere?',
    answer:
      'Because conflicting information undermines the confidence a search engine has in your listing, and it is one of the most common reasons a local ranking stalls. Inconsistency accumulates on its own as old directory entries, previous addresses and abandoned listings linger for years, so it is a clean-up job as much as a setup one.',
  },
  {
    service: 'local-reputation',
    question: 'Does this work if we serve several areas?',
    answer:
      'Yes, with local landing pages for the areas you genuinely operate in rather than a list of town names on one page. Proximity is a real ranking factor, so a business with one location will always compete harder further out, but the pages, profile and citations together are what let you appear beyond your immediate postcode.',
  },

  {
    service: 'managed-services',
    question: 'What does a care plan actually cover?',
    answer:
      'The maintenance that keeps something running after launch: platform and dependency updates, backups taken and tested, uptime and error monitoring, security patching, and hosting looked after rather than merely purchased. Most plans also include retained hours for small changes.',
  },
  {
    service: 'managed-services',
    question: 'We already have hosting. Why do we need this?',
    answer:
      'Hosting is where the site lives; this is somebody making sure it keeps working. A host will not notice an expired certificate, apply a security patch, test that your backups restore, or tell you a plugin update broke a form. Those are the things that actually take sites down, and all are trivial when someone is watching.',
  },
  {
    service: 'managed-services',
    question: 'How quickly do you respond to problems?',
    answer:
      'Against an SLA agreed in writing, with priorities defined so an urgent problem has a path rather than depending on who reads the email first. Monitoring means we are frequently aware of an issue before you are, and most outages we handle are resolved before anyone outside the team notices.',
  },
  {
    service: 'managed-services',
    question: 'Can you support something you did not build?',
    answer:
      'Often, and we will read it properly first. That means assessing the codebase, the hosting and the update history, then telling you honestly what we are taking on and anything we consider a liability. Occasionally the answer is that it needs work before it can be sensibly supported, and we would rather say so upfront.',
  },
  {
    service: 'managed-services',
    question: 'Are we locked in?',
    answer:
      'No. The code, the hosting accounts and the domains are yours throughout, and a care plan is a service arrangement rather than a dependency. If you move to another supplier or bring it in-house, everything needed to do that is already in your possession rather than ours.',
  },

  // ---- SEO ----------------------------------------------------------------
  // Written from the closing sections of Zefract_SEO_Services.docx — "Why it matters" and
  // "Why SEO with Zefract" — at the client's request, replacing an earlier set that covered
  // timelines, ranking guarantees, monthly deliverables and whether a rebuild is needed.
  //
  // Worth knowing what went with them: those five answered the questions a buyer asks before
  // signing, and the document does not address any of them. This set answers "is it worth
  // it", which is the argument the document actually makes. If the removed ground is wanted
  // back it is in the history, and the two sets do not overlap.
  {
    service: 'seo',
    question: 'Is SEO an expense or an investment?',
    answer:
      'An investment, and the difference is what happens when you stop. Paid ads stop the moment you stop paying; SEO builds an asset that keeps generating traffic, leads and sales long after the spending slows. Money spent on ads buys a click once. The same money spent on SEO buys a ranking that keeps working, compounding into traffic, trust and revenue for years.',
  },
  {
    service: 'seo',
    question: 'What does SEO actually return?',
    answer:
      'Five things, and they build on each other. Higher rankings put you in front of people already searching for what you do. Better-matched traffic converts better, so visibility turns into leads and sales. Ranking consistently signals that you are an established name, which builds trust before anyone has spoken to you. Organic traffic is essentially free once earned, so your cost per new customer falls as the work compounds. And being cited by AI answer engines opens a channel that did not exist a few years ago.',
  },
  {
    service: 'seo',
    question: 'How does SEO lower our cost of winning a customer?',
    answer:
      'Because the traffic keeps arriving after the work is paid for. Unlike paid ads, where every click is bought again, a ranking you have earned keeps generating leads and sales month after month. The spend stays roughly flat while the returns accumulate, so the cost of each new customer falls the longer the SEO compounds.',
  },
  {
    service: 'seo',
    question: 'Will AI engines like ChatGPT actually cite us?',
    answer:
      'They cite sources they trust, and that trust can be worked on deliberately. People increasingly ask ChatGPT, Perplexity and Google’s AI answers instead of scrolling a results page, and those engines name a small number of sources. We structure your site to be one of them: written to be quoted, positioned as an authority in your field. When the AI answers a question in your space and names you, it drives both authority and fresh, high-intent traffic.',
  },
  {
    service: 'seo',
    question: 'What makes SEO with Zefract different?',
    answer:
      'The people who understand your website are the same people growing it. Your SEO is not bolted on after the fact by a separate agency reading someone else’s build, it is built in, so nothing is lost in the handoff. You see the work weekly, you understand every step, and the whole thing chases one thing only: real people finding you.',
  },

  // ---- AI Search (AEO) ----------------------------------------------------
  {
    service: 'ai-search-aeo',
    question: 'What is answer engine optimization?',
    answer:
      'AEO is optimising to be the answer rather than a result. It targets the places a search engine gives one response instead of a list: the featured snippet above the results, the People-Also-Ask box, and the reply a voice assistant reads aloud. The work is structural as much as editorial, because those slots are filled by machines lifting text out of pages.',
  },
  {
    service: 'ai-search-aeo',
    question: 'How is AEO different from SEO?',
    answer:
      'SEO competes for a position in a list; AEO competes to be the extracted answer. They overlap heavily and AEO does not work on a site that cannot rank at all, since engines draw snippets from pages they already trust. The difference is in the detail: AEO cares about answering in the first two sentences, marking up questions so they can be parsed, and phrasing a heading as the question a person actually asked.',
  },
  {
    service: 'ai-search-aeo',
    question: 'How is AEO different from GEO?',
    answer:
      'AEO wins the answer box on a search results page; GEO gets you cited inside an answer a model generates. AEO is aimed at Google and Bing surfaces built by extracting text from a ranked page. GEO is aimed at ChatGPT, Gemini, Perplexity and Copilot, which assemble a reply from what they have learned and retrieved. Most clients buy both, and the two share content and structure work, but they are measured differently and we keep them as separate pages for that reason.',
  },
  {
    service: 'ai-search-aeo',
    question: 'Do I need AEO if I already rank on page one?',
    answer:
      'Often yes, because the answer box sits above page one. A snippet can take a large share of the clicks for a query, and it is frequently awarded to a page ranked below the top result purely because that page answers the question more cleanly. If a competitor holds the snippet for a term you rank for, you are ranking underneath their answer.',
  },
  {
    service: 'ai-search-aeo',
    question: 'How do you measure AEO?',
    answer:
      'By tracking which of your target questions you hold an answer slot for, and how that changes. That means a baseline of the snippets and People-Also-Ask boxes you currently own, the ones a competitor owns, and the queries where the slot exists but nobody has taken it. Reported alongside the clicks those queries send you, because owning a box that nobody clicks is not a result.',
  },

  // ---- AI Search (GEO) ---------------------------------------------------
  // Written from the closing sections of Zefract_AI_Search_GEO_Services.docx — "Why it
  // matters" and "Why GEO with Zefract" — matching how the SEO, Social and Paid sets are
  // sourced. Replaces an earlier set defining GEO, listing platforms, guarantees, measurement
  // and the SEO overlap; the platform list is now on the page itself as the PLATFORMS row,
  // and the definition is in the intro, so neither is lost.
  {
    service: 'ai-search-geo',
    question: 'Why isn’t being found on Google enough anymore?',
    answer:
      'Because an AI answer names one source and everyone else disappears. Ten blue links gave every business on the page a chance to be seen; a generated answer does not. Millions of people now ask ChatGPT, Claude, Perplexity and Google’s AI Overviews the questions they used to type into a search box, and the customer has often decided before they ever reach your site.',
  },
  {
    service: 'ai-search-geo',
    question: 'What do we get out of being the cited source?',
    answer:
      'Instant authority in front of someone who has already decided to trust the answer. When AI names you in your field, that endorsement arrives before any sales conversation. The traffic that follows is high-intent too: people asking AI are close to a decision, so a citation sends visitors who arrive already informed and ready to act rather than idle clicks.',
  },
  {
    service: 'ai-search-geo',
    question: 'Does GEO replace our SEO?',
    answer:
      'No, it builds on it. GEO and SEO share the same foundations of authority, structure and credibility, so the work compounds everything you are already doing rather than duplicating it. The simplest way to hold the two apart: SEO earns you a place on the page, GEO earns you the answer itself.',
  },
  {
    service: 'ai-search-geo',
    question: 'Why start now rather than wait?',
    answer:
      'Because AI rewards established, trusted entities, and that recognition takes time to build. Early movers own their space: every citation, profile and structured signal reinforces the next, so the more AI trusts you the more it surfaces you. It is a flywheel rather than a one-off, which also makes it harder for latecomers to displace whoever got there first.',
  },
  {
    service: 'ai-search-geo',
    question: 'What makes GEO with Zefract different?',
    answer:
      'The people who understand your content are the same people making it citable. Your GEO is not bolted on after the fact by a team reading someone else’s pages, it is built in, so nothing is lost in the handoff. You see the work weekly, you understand every move, and the whole thing chases one thing: being the answer.',
  },

  // ---- Paid Advertising (PPC) -------------------------------------------
  // Written from the closing sections of Zefract_Paid_Marketing_Services.docx — "Why it
  // matters" and "Why paid marketing with Zefract" — matching how the SEO and Social sets
  // are sourced. Replaces an earlier set on starting budget, platform choice, timelines,
  // account ownership and what happens when a campaign fails; that ground is in the history.
  {
    service: 'paid-advertising',
    question: 'Is paid advertising a gamble?',
    answer:
      'Not when it is measured, and measurement is the whole difference. Burning a budget and building a business on paid ads look identical until you can see what came back. When every bit of spend is tracked, targeting is precise and results are read honestly, advertising stops being a cost you tolerate and becomes an engine you can scale with confidence.',
  },
  {
    service: 'paid-advertising',
    question: 'How quickly do we see results?',
    answer:
      'Traffic and leads from the day a campaign goes live. That immediacy is the half of the picture organic cannot give you: SEO compounds but takes months, so paid is what stops you waiting to find out whether the strategy works. It is also why the two are usually run together rather than chosen between.',
  },
  {
    service: 'paid-advertising',
    question: 'How do we know the money is not being wasted?',
    answer:
      'Because every bit of it is traceable. You see what you spent, what it returned, and the cost of each lead and each sale. Targeting by intent, interest, role and behaviour means the budget lands on qualified prospects rather than wasted impressions, and the decision to scale becomes a number you read instead of a leap of faith.',
  },
  {
    service: 'paid-advertising',
    question: 'Can we scale up once something works?',
    answer:
      'Yes, and that is the point of proving it first. Once a campaign is profitable, growth becomes a dial you can turn: spend more where the returns are proven and predictable, pull back where they are not. It is growth you control rather than growth you hope for, which is only possible because the measurement went in first.',
  },
  {
    service: 'paid-advertising',
    question: 'Does performance improve over time?',
    answer:
      'It should, and a well-run account gets sharper the longer it runs. The platforms’ algorithms learn from every click, and so do we, so targeting tightens and the cost per result falls as the account accumulates data. That is also why moving agencies repeatedly is expensive: it throws away the learning you already paid for.',
  },

  // ---- Social Media -----------------------------------------------------
  // Written from the closing sections of Zefract_Social_Media_Marketing_Services.docx —
  // "Why it matters" and "Why social media with Zefract" — matching how the SEO set is
  // sourced. It replaces an earlier set covering platform choice, who writes the content,
  // organic versus paid, measurement and existing accounts; that ground is in the history
  // and does not overlap with this.
  {
    service: 'social-media',
    question: 'What does social media actually do for the business?',
    answer:
      'Two things, and most people only count one. Leads and sales are half of it: paid campaigns and full-funnel strategy mean the audience you build actually converts. The other half is perception. The more consistently a brand shows up across the feeds people already live in, the bigger it reads, so a small company can look like a category leader long before it is one. That visibility earns trust, opens doors, and makes every other channel work harder.',
  },
  {
    service: 'social-media',
    question: 'Why does looking the same on every channel matter?',
    answer:
      'Because recognition compounds only when there is one thing to recognise. Most underperforming social looks like a different company on Facebook than on LinkedIn, so every impression starts the introduction again instead of building on the last one. One voice, one look and one story everywhere means the effort accumulates rather than scattering across six accounts that happen to share a name.',
  },
  {
    service: 'social-media',
    question: 'Is this just about likes and followers?',
    answer:
      'No, and a following that never converts is the failure this is built to avoid. Community work is the top of the funnel and qualified leads are the bottom, and we run both rather than reporting the easy half. The measure is business results anyone can point to, which is exactly what most social is missing when it underperforms.',
  },
  {
    service: 'social-media',
    question: 'Do we need to hire an in-house social team?',
    answer:
      'Not to keep up, no. Hiring and training in-house is the usual answer to a growing team with no time and no specialist expertise, and it is why accounts drift when that hire does not happen. One connected team scales the effort with you instead: more platforms, more campaigns and more reach, without the overhead of building the function yourself.',
  },
  {
    service: 'social-media',
    question: 'What makes social media with Zefract different?',
    answer:
      'The people who shape your brand are the same people running your social. Your presence is not a set of disconnected accounts, it is one story told well in six places, so nothing is lost in the handoff between whoever owns the brand and whoever posts. You see the work weekly, you understand every decision, and every platform points at the same goal.',
  },

  // ---- Content Marketing ------------------------------------------------
  {
    service: 'content-marketing',
    question: 'How much content do we need to publish?',
    answer:
      'Less than most calendars assume, done properly. A small number of pieces that each target a real search or answer a real objection will outperform a high-volume schedule of thin posts, and search engines have spent years getting better at telling the difference. We set the cadence from what you can sustain at a quality worth publishing, then hold it.',
  },
  {
    service: 'content-marketing',
    question: 'Who writes it, and will they understand our subject?',
    answer:
      'Our writers, working from your experts. We do the research, the structure and the drafting; the specifics that make a piece credible have to come from the people who do the work, usually through a short interview rather than a long brief. For technical subjects we would rather book thirty minutes with your engineer than guess, because a plausible-sounding article that is subtly wrong costs you more than no article.',
  },
  {
    service: 'content-marketing',
    question: 'Will AI write our content?',
    answer:
      'Not as the thing you publish. AI is genuinely useful for research, outlining and first-pass drafting, and we use it there. It is unreliable for the parts that matter: the specific claim, the real example, the judgement that makes a piece worth citing. It also tends to produce prose that reads like everyone else, which is the opposite of what content is for.',
  },
  {
    service: 'content-marketing',
    question: 'How does content connect to SEO and AI search?',
    answer:
      'It is the raw material both run on. SEO decides which pieces get written and how they are structured; the content is what actually ranks. For AI search the link is even more direct, because a generated answer is assembled from sources it can quote, and a clear, well-organised piece is far easier to quote than a sales page. Planning them separately is how sites end up with content that ranks for nothing.',
  },
  {
    service: 'content-marketing',
    question: 'How do you measure content?',
    answer:
      'By what each piece was commissioned to do. A piece written to win a search is judged on rankings and the traffic they bring; one written to clear an objection is judged on whether it gets read by people who then convert. Reported per piece against that intent, alongside the assisted conversions where content is doing the warming-up rather than the closing.',
  },
]

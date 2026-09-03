import type { ServiceStory } from './types'

/**
 * TWO CLASSES OF ENTRY IN THIS FILE, and the difference matters at hand-back.
 *
 * TRANSCRIBED — seo, social-media, paid-advertising, ai-search-geo, email-marketing,
 * digital-marketing-strategy. These are the client's own service documents, close to verbatim.
 * Treat the wording as fixed.
 *
 * AUTHORED — everything else, marked with a WRITTEN, NOT TRANSCRIBED banner. There is no
 * document for these services yet, so the copy is written from Appendix D's own group names
 * and deliverables in services.generated.ts, in the voice the four real documents establish.
 * It is honest positioning, deliberately free of statistics, named clients, timelines
 * presented as measured results, and any claim about past performance — the brief lists
 * "unverifiable stats" as an explicit anti-goal, and invented copy is exactly where one
 * would creep in. Every one of these still needs the client's review before launch, and
 * should be replaced outright the day a real document arrives.
 */

/**
 * The argument for a service, transcribed from the client's own service document.
 *
 * SOURCE. Zefract_SEO_Services.docx. Kept close to verbatim — this is the client's voice,
 * including its em dashes and contractions, which the earlier transcription into
 * service-points.ts had smoothed away. Where a service has no document it has no entry
 * here, and its page renders as it always did.
 *
 * ONE DELIBERATE EDIT. The document's closing line is "Every rupee spent on ads buys a click
 * once." The site serves clients outside India — the same reason the Paid Advertising points
 * drop the document's rupee framing — so the currency is taken out and the sentence otherwise
 * left alone. Put it back the day the site is India-only.
 */
export const SERVICE_STORY: Record<string, ServiceStory> = {
  seo: {
    tagline: 'SEO that people, and machines, can actually find.',
    intro: [
      'Most SEO is sold as a mystery: reports full of numbers nobody explains, promises of “page one” with no path to get there, and a monthly invoice you take on faith.',
      'We do it differently. SEO at Zefract is one connected service made of ten moving parts, all pulling toward a single goal: the right people finding you, understanding you, and choosing you. You’ll see the work at every step, and we’ll tell you what we’re doing in plain English. No jargon tax.',
    ],
    whyItMatters: {
      heading: 'SEO isn’t an expense. It’s an investment.',
      body: [
        'Paid ads stop the moment you stop paying. SEO is different: it builds an asset. The work compounds, and it keeps generating traffic, leads, and sales long after the spending slows, delivering long-term, sustainable growth rather than a bill that resets every month.',
      ],
      kicker: 'Here’s what that investment actually returns:',
      returns: [
        {
          title: 'Increased visibility',
          body: 'Higher rankings on Google and other search engines put you in front of the people already searching for what you do. That means a steady stream of quality traffic, visitors matched to your keywords and your industry, not random clicks.',
        },
        {
          title: 'More conversions, more sales',
          body: 'The more the right people reach you, the more of them turn into leads and customers. Better-matched traffic converts better, so growth in visibility flows straight through to growth in revenue.',
        },
        {
          title: 'Stronger brand authority',
          body: 'Ranking consistently at the top does more than win clicks: it signals to customers that you’re a credible, established name in your field. Over time, that repeated visibility builds trust before a visitor has even spoken to you, and trust is what turns a first-time searcher into a loyal customer.',
        },
        {
          title: 'Lower customer acquisition cost',
          body: 'Unlike paid ads, organic traffic is essentially free once it’s earned. Your rankings keep generating new leads and sales month after month, so the cost of winning each new customer falls the longer your SEO compounds.',
        },
        {
          title: 'AI search & citation optimization',
          body: 'As people increasingly ask ChatGPT, Perplexity, and Google’s AI answers, being cited as a trusted source in your industry becomes a powerful new channel. When the AI answers a question in your space and names you, it drives both authority and fresh, high-intent traffic.',
        },
      ],
      bottomLine:
        'Money spent on ads buys a click once. The same money spent on SEO buys a ranking that keeps working, quietly compounding into traffic, trust, and revenue for years.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people who understand your website are the same people growing it, so your SEO isn’t bolted on after the fact, it’s built in. You see the work weekly, you understand every step, and you only ever chase one thing: real people finding you.',
      ],
    },
    closingCta: {
      line: 'Ready to be found?',
      label: 'Start with your free website audit',
      href: '/contact',
    },
  },

  // ---- Social Media Marketing ---------------------------------------------
  // Zefract_Social_Media_Marketing_Services.docx, verbatim.
  'social-media': {
    tagline: 'A brand that looks bigger than it is, because people can see it working.',
    intro: [
      'Most social media underperforms for the same three reasons: it isn’t bringing business results anyone can point to, no one can say what’s working and what isn’t, and the brand looks like a different company on every channel. Add a growing team with no time or in-house expertise to manage it, and the accounts drift.',
      'We fix the drift. Social media at Zefract is one connected service across six platforms, each managed to a single, consistent brand and a clear goal: not just posts, but presence. You get one voice everywhere, content built on purpose, and paid campaigns that turn attention into leads. And because social does more than sell, we build the kind of visibility that makes a small company read as a big one.',
    ],
    whyItMatters: {
      heading: 'Social media isn’t just sales. It’s the size people think you are.',
      body: [
        'Leads and sales are only half of what social does. The other half is perception. The more consistently a brand shows up across the feeds people already live in, the bigger it reads: a small company can look like a category leader long before it is one. That visibility earns trust, opens doors, and makes every other channel work harder.',
      ],
      kicker: 'Here’s what a well-run social presence actually returns:',
      returns: [
        {
          title: 'A brand that looks bigger than it is',
          body: 'Consistent, high-quality presence across the platforms your market uses makes a growing company read as an established one, the perception that opens conversations before you’ve said a word.',
        },
        {
          title: 'One brand, every channel',
          body: 'No more looking like a different company on Facebook than on LinkedIn. One voice, one look, one story everywhere, so recognition compounds instead of scattering.',
        },
        {
          title: 'Leads and sales, not just likes',
          body: 'Paid campaigns and full-funnel strategy mean the audience you build actually converts. Community is the top of the funnel; qualified leads are the bottom. We run both.',
        },
        {
          title: 'Trust before the first call',
          body: 'Thought leadership and social proof do the warming-up for you. By the time a prospect reaches out, they’ve already seen you show up, again and again, knowing your field.',
        },
        {
          title: 'Scalable support as you grow',
          body: 'You don’t have to hire and train an in-house social team to keep up. One connected team scales the effort with you: more platforms, more campaigns, more reach, without the overhead.',
        },
      ],
      bottomLine:
        'A great product that no one can see doesn’t grow. Social media is how a small company becomes a recognised one: consistent, visible, and trusted across every feed that matters, so the market treats you as bigger than your size and closer than your competitors.',
    },
    whyUs: {
      // The same heading the SEO document uses. Not a copy-paste slip — both documents close
      // on it, and it is the client's own line, so it stays in both.
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people who shape your brand are the same people running your social, so your presence isn’t a set of disconnected accounts, it’s one story told well in six places. You see the work weekly, you understand every decision, and every platform points at the same goal: a brand people notice, trust, and buy from.',
      ],
    },
    closingCta: {
      line: 'Ready to look bigger than you are?',
      label: 'Start with a free social media audit',
      href: '/contact',
    },
  },

  // ---- Paid Advertising (PPC) ---------------------------------------------
  // Zefract_Paid_Marketing_Services.docx, verbatim except for the currency — see the note at
  // the top of this file. This document names the rupee four times; each is rendered as
  // plain spend, exactly as the SEO document's closing line is.
  'paid-advertising': {
    tagline: 'Attention you can buy, results you can measure.',
    intro: [
      'Most paid advertising is sold on hope: money in, fingers crossed, a dashboard nobody explains. Budgets get spent, and no one can quite tell you what came back.',
      'We treat it as what it actually is: not an expense, but a scalable investment. Paid marketing at Zefract is one connected service across five platforms, each aimed at a single goal: fast traffic, qualified leads, and revenue you can predict. You’ll see exactly where the money goes and exactly what it returns, in plain English. No black boxes.',
    ],
    whyItMatters: {
      heading: 'Paid isn’t a gamble. It’s a controlled investment.',
      body: [
        'The difference between burning a budget and building a business on paid ads is measurement. When every bit of spend is tracked, targeting is precise, and results are read honestly, advertising stops being a cost you tolerate and becomes an engine you can scale with confidence.',
      ],
      kicker: 'Here’s what that investment actually returns:',
      returns: [
        {
          title: 'Fast, measurable results',
          body: 'Organic growth compounds, but it takes time. Paid gives you the other half: traffic and leads the day a campaign goes live, so you’re not waiting months to see whether the strategy works.',
        },
        {
          title: 'Precision targeting',
          body: 'You’re not paying to reach everyone. You’re paying to reach the exact person most likely to buy. Targeting by intent, interest, role, and behaviour means your budget lands on qualified prospects, not wasted impressions.',
        },
        {
          title: 'Clear, provable ROI',
          body: 'Every bit of it is traceable. You see what you spent, what it returned, and the cost of each lead and sale, so the decision to scale isn’t a leap of faith, it’s a number you can read.',
        },
        {
          title: 'Scale on demand',
          body: 'Once a campaign is profitable, growth becomes a dial you can turn. Spend more where the returns are proven and predictable, pull back where they aren’t: growth you control, not growth you hope for.',
        },
        {
          title: 'Smarter every month',
          body: 'The platforms’ algorithms learn from every click, and so do we. The longer a well-run account runs, the sharper the targeting and the lower the cost per result, performance that improves the more it’s fed.',
        },
      ],
      bottomLine:
        'SEO builds an asset that compounds quietly over years. Paid marketing turns on the tap today: immediate, targeted, and scalable the moment you find what works. Run together, one earns your trust over time while the other drives results right now.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people who build your funnel are the same people running your ads, so your paid strategy isn’t bolted on after the fact, it’s built in. You see the spend weekly, you understand every decision, and you only ever chase one thing: profitable growth.',
      ],
    },
    closingCta: {
      line: 'Ready to grow on demand?',
      label: 'Start with a free campaign audit',
      href: '/contact',
    },
  },

  // ---- AI Search (GEO) -----------------------------------------------------
  // Zefract_AI_Search_GEO_Services.docx, verbatim.
  //
  // Two things this document does that the others do not. It carries a PLATFORMS line, which
  // is why `platforms` exists on ServiceStory. And it lists FOUR returns rather than five,
  // written as "1 Title. Body" in a single paragraph each — split back into title and body
  // here, which is how the other documents already format the same section.
  'ai-search-geo': {
    tagline: 'When people ask AI, your name is the answer.',
    intro: [
      'Search is changing faster than it ever has. Millions of people now ask ChatGPT, Claude, Perplexity, and Google’s AI Overviews the questions they used to type into a search box, and the AI answers them directly, often naming just one or two trusted sources. If that source isn’t you, you’re invisible in the fastest-growing corner of search, and your customer has decided before they ever reach your site.',
      'We get you into that answer. Generative Engine Optimization (GEO) is one connected service that makes your brand the one AI cites, quotes, and recommends. It doesn’t replace SEO; it builds on it. GEO and SEO share the same foundations of authority, structure, and credibility, so this work compounds everything you’re already doing. Early movers own their space. We make you one of them.',
    ],
    platforms: [
      'ChatGPT',
      'Google Gemini & AI Overviews',
      'Perplexity',
      'Microsoft Copilot & Bing',
      'Claude',
    ],
    whyItMatters: {
      heading: 'Being found isn’t enough anymore. You have to be the answer.',
      body: [
        'The shift from search results to AI answers changes the whole game. Ten blue links gave every business a chance to be seen. An AI answer names one source, and everyone else disappears.',
      ],
      kicker: 'Here’s what winning that spot returns:',
      returns: [
        {
          title: 'You become the cited source',
          body: 'When AI answers a question in your field and names you, you gain instant authority in front of a customer who’s already decided to trust the answer.',
        },
        {
          title: 'High-intent traffic',
          body: 'People asking AI are close to a decision. A citation sends you visitors who arrive already informed and ready to act, not idle clicks.',
        },
        {
          title: 'A first-mover moat',
          body: 'AI rewards established, trusted entities. Build that recognition now and it compounds, making it harder for latecomers to displace you.',
        },
        {
          title: 'Compounding authority',
          body: 'Every citation, profile, and structured signal reinforces the next. The more AI trusts you, the more it surfaces you: a flywheel, not a one-off.',
        },
      ],
      bottomLine:
        'SEO earns you a place on the page. GEO earns you the answer itself. As people move from searching to simply asking, the brands cited by AI won’t just be found first. They’ll be the only ones found.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people who understand your content are the same people making it citable, so your GEO isn’t bolted on after the fact, it’s built in. You see the work weekly, you understand every move, and you only ever chase one thing: being the answer.',
      ],
    },
    closingCta: {
      line: 'Ready to be the answer AI gives?',
      label: 'Start with a free GEO audit',
      href: '/contact',
    },
  },

  // ==========================================================================
  // WRITTEN, NOT TRANSCRIBED — pillar 1, Engineering.
  // No client document exists for these four yet. Written from their Appendix D groups.
  // See the banner at the top of this file. Needs client review.
  // ==========================================================================

  'digital-engineering': {
    tagline: 'Software that still works the year after you launch it.',
    intro: [
      'Most builds are quoted on what it takes to ship version one. The bill that actually hurts arrives later: when traffic doubles, when an integration changes its contract, when the person who wrote it leaves and nobody else can safely touch it.',
      'We build for that second bill. Digital engineering at Zefract covers the interface people use, the services behind it, and the architecture holding both up, with the practices that keep a codebase workable long after handover. The test is not whether it launches. It is whether your own team can read it, extend it, and own it.',
    ],
    whyItMatters: {
      heading: 'The cheapest code to write is the most expensive to keep.',
      body: [
        'Every shortcut taken to hit a launch date is a loan, and the repayments come out of every sprint that follows. The difference between software that compounds and software that calcifies is not talent or budget. It is whether the boring parts were done: the architecture decisions, the tests, the documentation nobody wants to write.',
      ],
      kicker: 'Here’s what building it properly returns:',
      returns: [
        {
          title: 'Speed that stays',
          body: 'A well-structured codebase gets faster to change, not slower. The second feature costs less than the first because the foundations are already there, which is the opposite of what most teams experience.',
        },
        {
          title: 'A codebase your team can own',
          body: 'Readable code, real documentation and conventions that hold. Handover is a walkthrough rather than an excavation, and hiring your next engineer does not mean rewriting what we built.',
        },
        {
          title: 'Fewer emergencies',
          body: 'Automated tests, observability and security considered at design time mean problems surface in a pipeline rather than in production at the worst possible hour.',
        },
        {
          title: 'Room to grow',
          body: 'Architecture chosen for where you are going, not just where you are. Growth becomes a scaling decision you make deliberately rather than a wall you hit without warning.',
        },
        {
          title: 'Integrations that hold',
          body: 'APIs designed as contracts, with versioning and sensible failure behaviour. When a third party changes something at their end, it becomes a scheduled fix rather than an outage you find out about from a customer.',
        },
        {
          title: 'Onboarding measured in days',
          body: 'Conventions that hold, documentation that exists, and a local environment that works first time. The cost of adding an engineer to the project stops being a fortnight of somebody else’s time.',
        },
      ],
      bottomLine:
        'Anyone can ship something that works on the day it launches. The engineering is in what happens next: the change that takes an afternoon instead of a fortnight, the traffic spike nobody notices, the new developer productive in a week.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people who design your product are the same people building it, so the thing that gets shipped is the thing that was drawn, and the awkward questions get asked before the code exists rather than after. You see working software every fortnight, on a link you can open any day.',
      ],
    },
    closingCta: {
      line: 'Got something to build?',
      label: 'Start with a technical scoping call',
      href: '/contact',
    },
  },

  'software-product-engineering': {
    tagline: 'From a validated idea to a product people keep paying for.',
    intro: [
      'Most products fail long before the engineering does. They get built because someone was confident, not because anyone checked, and the expensive discovery happens after launch, when the feature nobody wanted has already been paid for twice.',
      'We put the cheap questions first. Product engineering at Zefract runs from discovery through MVP to the steady release rhythm that follows: validate, ship the core, learn from real use, then grow the product on evidence. The plan survives contact with users because it was built to be corrected.',
    ],
    whyItMatters: {
      heading: 'The riskiest thing you can build is the thing nobody asked for.',
      body: [
        'Building software is not the hard part anymore. Deciding what to build is. A team that ships quickly in the wrong direction burns money faster than one that ships slowly in the right one, which is why discovery, a genuine MVP and honest measurement are engineering decisions rather than a preamble to them.',
      ],
      kicker: 'Here’s what running it this way returns:',
      returns: [
        {
          title: 'Less money spent on guesses',
          body: 'Discovery workshops, prototypes and feasibility work cost a fraction of a build. Finding out early that an idea does not hold is a saving, not a setback.',
        },
        {
          title: 'A real product in market sooner',
          body: 'An MVP scoped to its core gets you in front of actual users while the assumptions are still cheap to change, instead of a full build launched into silence.',
        },
        {
          title: 'A roadmap based on evidence',
          body: 'Analytics from day one and experiments after it mean the backlog gets ordered by what users do, not by whoever argued hardest in the meeting.',
        },
        {
          title: 'A product that scales when it works',
          body: 'Performance tuning, load testing and refactoring built into the rhythm, so the reward for success is growth rather than a rewrite.',
        },
        {
          title: 'A backlog that reflects reality',
          body: 'Ordered by what users do rather than by who argued hardest, and pruned of the things that seemed essential last quarter and have not been mentioned since.',
        },
        {
          title: 'Predictable delivery',
          body: 'A steady release rhythm and reporting that tells stakeholders the truth about pace, so the roadmap is a living document rather than a promise made once in January.',
        },
      ],
      bottomLine:
        'A product is not a project with an end date. It is a series of bets, each one cheaper and better informed than the last, and the job of engineering is to keep the cost of being wrong low enough that you can afford to keep learning.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people who ran your discovery are the people who build the thing, so what was learned in a workshop is still in the room at sprint planning. You get sprint-by-sprint visibility, a staging link you can open any day, and the occasional recommendation not to build something.',
      ],
    },
    closingCta: {
      line: 'Got an idea worth testing?',
      label: 'Start with a discovery call',
      href: '/contact',
    },
  },

  'mobile-engineering': {
    tagline: 'Apps that earn their place on the home screen.',
    intro: [
      'A phone is the most contested screen a business will ever compete for. An app that is slow to open, awkward to navigate, or useless without signal does not get deleted in anger. It just stops being opened, which is worse, because nothing tells you it happened.',
      'We build for the way phones are actually used: on bad connections, one-handed, in a hurry. Mobile engineering at Zefract covers native and cross-platform builds, the mobile-first details that make an app feel native rather than ported, and the release and monitoring work that keeps it healthy across every OS update that follows.',
    ],
    whyItMatters: {
      heading: 'Installing an app is easy. Keeping it installed is the job.',
      body: [
        'The store listing is not the finish line. Retention is decided in the first session and defended every release after it: by launch speed, by whether the thing works on a train, by whether the last OS update broke something nobody caught. An app is a relationship with a device, and devices change underneath you.',
      ],
      kicker: 'Here’s what building it properly returns:',
      returns: [
        {
          title: 'An app that feels native',
          body: 'Real gestures, platform conventions and transitions that behave the way the operating system taught your users to expect. The difference between an app and a website in a shell is felt immediately, even when it cannot be named.',
        },
        {
          title: 'It works without signal',
          body: 'Offline sync and considered loading states mean a tunnel or a weak connection is an inconvenience rather than a dead end, which is where most apps quietly lose the people who needed them most.',
        },
        {
          title: 'A shorter route to both stores',
          body: 'Cross-platform where it fits, native where it does not, plus the submission, beta and versioning work that turns "it builds" into "it is live on both stores".',
        },
        {
          title: 'It survives the next OS release',
          body: 'Device testing, crash monitoring and planned OS migration, so an update from Apple or Google is a scheduled task rather than an emergency and a wave of one-star reviews.',
        },
        {
          title: 'A reason to come back',
          body: 'Push notifications and deep linking designed as part of the product rather than bolted on, so a message opens the right screen instead of dumping someone at a home tab.',
        },
        {
          title: 'You can see what is happening',
          body: 'Crash reporting and usage analytics from the first release, so decisions about the next version are made from what people actually do rather than from store reviews.',
        },
      ],
      bottomLine:
        'Home screen space is the scarcest real estate your brand will ever hold. An app keeps it by being fast, being reliable, and working on the days the network does not.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people designing the screens are the people shipping them, so the interaction that looked effortless in the prototype is the one that reaches the store. You see builds on TestFlight as they happen, not a demo at the end.',
      ],
    },
    closingCta: {
      line: 'Ready to build for the small screen?',
      label: 'Start with a mobile scoping call',
      href: '/contact',
    },
  },

  'quality-engineering': {
    tagline: 'Ship faster, because the tests already told you it works.',
    intro: [
      'Testing has a reputation as the thing that slows a release down. It earns that reputation when it is manual, done late, and owned by whoever is free, a bottleneck bolted on at the end of a project, checking by hand what a machine could have checked a hundred times already.',
      'Done properly it is the opposite. Quality engineering at Zefract puts automated tests, performance proof and security checks inside the pipeline, so the question "is this safe to release?" is answered continuously rather than argued about on a Friday afternoon. Confidence is what lets a team move quickly.',
    ],
    whyItMatters: {
      heading: 'You do not choose between shipping fast and shipping safely.',
      body: [
        'Teams that release confidently are not braver than everyone else: they have better evidence. Every bug caught in a pipeline instead of production is cheaper by an order of magnitude, and every release that goes out without ceremony is time your engineers spent building instead of firefighting.',
      ],
      kicker: 'Here’s what quality engineering returns:',
      returns: [
        {
          title: 'Releases stop being events',
          body: 'When the suite is green and the gates have passed, shipping is a routine action rather than a scheduled risk that needs three people watching a dashboard.',
        },
        {
          title: 'Bugs cost less',
          body: 'A defect caught by a unit test costs minutes. The same defect found by a customer costs a support ticket, a hotfix, a release and some trust. The gap only widens the later it is found.',
        },
        {
          title: 'Proof that it scales',
          body: 'Load and stress testing turn "we think it will hold" into a number you can act on, before a launch or a campaign finds the ceiling for you.',
        },
        {
          title: 'Security found first',
          body: 'VAPT, dependency scanning and OWASP checks with remediation guidance, so vulnerabilities surface in your pipeline rather than in someone else’s disclosure.',
        },
        {
          title: 'Refactoring stops being frightening',
          body: 'A trusted suite is what makes it safe to improve code you did not write. Without one, every team eventually stops touching the oldest and most important parts of the system.',
        },
        {
          title: 'Coverage aimed at what matters',
          body: 'Risk-based testing puts the effort on the journeys that earn money, rather than chasing a coverage percentage that rewards testing trivial code.',
        },
      ],
      bottomLine:
        'Quality is not a phase at the end of a project. It is the thing that makes every phase before it move faster, because nobody has to be careful about breaking what the tests are already watching.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people writing the tests understand the product they are testing, because they are in the same team building it. Coverage follows risk rather than convenience, and you get a release sign-off you can actually read.',
      ],
    },
    closingCta: {
      line: 'Releases making you nervous?',
      label: 'Start with a QA assessment',
      href: '/contact',
    },
  },

  // ==========================================================================
  // WRITTEN, NOT TRANSCRIBED — pillar 2, Experience & Design.
  // ==========================================================================

  'digital-experience': {
    tagline: 'Sites and storefronts that load fast and earn their keep.',
    intro: [
      'A website is the one salesperson that works every hour of every day, and most are quietly bad at it. Slow on the connections real customers have, awkward to edit without calling the agency, and designed around what the business wanted to say rather than what the visitor came to find out.',
      'We build the other kind. Marketing sites, ecommerce and CMS work, with performance treated as a feature rather than an afterthought, and a content model your own team can actually operate. The measure is not how it looks in a portfolio. It is whether it converts and whether you can change it on a Tuesday without help.',
    ],
    whyItMatters: {
      heading: 'A beautiful site nobody can use is an expensive brochure.',
      body: [
        'Most redesigns change how a site looks and nothing about how it performs, which is why so many of them fail to move a single number. The things that actually decide whether a site earns are less photogenic: how fast it loads, how clear the path to the next step is, and whether the people who own it can keep it current.',
      ],
      kicker: 'Here’s what building it properly returns:',
      returns: [
        {
          title: 'Speed that converts',
          body: 'Core Web Vitals, optimised images and sensible caching are not a technical vanity project. A site that responds immediately keeps people who would otherwise have left before seeing anything at all.',
        },
        {
          title: 'You can edit it yourself',
          body: 'A content model built around how your team actually works, plus training. Publishing a page stops being a support ticket, which is usually the difference between a site that stays current and one that ages.',
        },
        {
          title: 'Ready for the campaign',
          body: 'Reusable blocks and landing systems mean the next campaign takes hours rather than another project, and it can be tested rather than guessed at.',
        },
        {
          title: 'Search foundations in place',
          body: 'Clean markup, sane structure and technical SEO built in from the start, so the growth work that follows is building on something rather than fixing it.',
        },
        {
          title: 'A checkout that finishes',
          body: 'On ecommerce, most of the money is lost in the last three steps. Product data, search, filtering and checkout get the attention, because that is where abandoned carts actually come from.',
        },
        {
          title: 'It works on a real phone',
          body: 'Tested on the devices and connections your customers have rather than the desk they were designed on, which is usually where the gap between a demo and a conversion rate hides.',
        },
      ],
      bottomLine:
        'The best site is not the most striking one. It is the one that loads before people give up, says the right thing when they arrive, and can still be updated by your team a year after we have gone.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people designing your site are the same people building it and the same people who have to make it rank, so nothing gets designed that cannot be built, and nothing gets built that quietly ruins your search foundations. Handover includes training and a written guide, not just a password.',
      ],
    },
    closingCta: {
      line: 'Site not earning its keep?',
      label: 'Start with a site review',
      href: '/contact',
    },
  },

  'experience-design': {
    tagline: 'Research-led design that survives contact with real users.',
    intro: [
      'Most design is judged in a meeting by people who are not the customer. It gets approved because it looks confident, and the first honest feedback arrives months later in the form of a drop-off rate nobody can explain.',
      'We move that feedback forward. Experience design at Zefract puts research before opinion and a clickable prototype before a build, so the expensive disagreements happen while they are still cheap to resolve. What you approve is something people have already tried.',
    ],
    whyItMatters: {
      heading: 'Every interface is a series of small decisions to leave.',
      body: [
        'Nobody abandons a product because of one catastrophic flaw. They leave because of an unclear label, a form asking for something they do not have to hand, a step that felt like it needed thinking about. Design is the work of removing those, and you cannot remove what you have not watched someone hit.',
      ],
      kicker: 'Here’s what designing on evidence returns:',
      returns: [
        {
          title: 'Fewer expensive mistakes',
          body: 'A prototype tested with real users costs a fraction of a build. Finding the confusing step before it is written is the cheapest fix available at any stage of a project.',
        },
        {
          title: 'Interfaces people finish',
          body: 'Flows designed around the job someone came to do, with the friction taken out of the steps that matter. Completion is the metric, not aesthetics.',
        },
        {
          title: 'Consistency that scales',
          body: 'A design system means the tenth screen looks like it belongs with the first and costs less to make. Without one, every new feature is a fresh set of decisions and a fresh chance to drift.',
        },
        {
          title: 'Accessible by default',
          body: 'Contrast, focus states, keyboard paths and semantics designed in rather than audited afterwards, which is both a legal position and a straightforwardly larger audience.',
        },
        {
          title: 'Arguments settled with evidence',
          body: 'A stakeholder disagreement about a flow is much shorter when everyone can click through it. Prototypes replace the approval meeting as the deciding vote.',
        },
        {
          title: 'Designs engineers can build',
          body: 'Screens specified at the states that matter, including empty and error, with components documented. Less guessing at implementation time means fewer quiet compromises nobody tells you about.',
        },
      ],
      bottomLine:
        'Good design is not what wins the approval meeting. It is what a stranger can use, on their first attempt, without being told how.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The designers sit with the engineers who will build it, so what gets drawn is buildable and what gets built is what was drawn. No handover of a static file into a void, and no quiet compromises made at implementation time that nobody tells you about.',
      ],
    },
    closingCta: {
      line: 'Users dropping off and you don’t know where?',
      label: 'Start with a UX review',
      href: '/contact',
    },
  },

  'branding-creative': {
    tagline: 'An identity that still works at favicon size.',
    intro: [
      'A brand is not a logo. It is what people already believe about you before you speak, assembled from every touch they have had: the site, the deck, the ad in a feed, the email that arrived at the wrong time. Most of it accumulates by accident.',
      'We make it deliberate. Branding at Zefract runs from positioning and messaging through to the identity and the assets that carry it, so the same company shows up everywhere it appears. A mark that works small, a voice that sounds like one organisation, and templates your team can use without breaking either.',
    ],
    whyItMatters: {
      heading: 'Consistency is what makes a small company look established.',
      body: [
        'Recognition compounds only when there is one thing to recognise. A brand that looks different on its site than in its deck spends every impression reintroducing itself, while the competitor who looks the same everywhere is quietly accumulating familiarity, and familiarity is most of what people mean by trust.',
      ],
      kicker: 'Here’s what a coherent brand returns:',
      returns: [
        {
          title: 'You look like the safer choice',
          body: 'Buyers read consistency as competence. A company whose materials all agree with each other reads as one that has its house in order, long before anyone has checked whether that is true.',
        },
        {
          title: 'Every asset gets easier',
          body: 'Guidelines, a type and colour system and real templates mean the next deck or campaign starts from something rather than from a blank page and a debate.',
        },
        {
          title: 'It works everywhere it has to',
          body: 'A mark designed for the favicon and the app icon as well as the sign. Most identities are drawn large and fall apart small, which is where they are actually seen most.',
        },
        {
          title: 'Meaning behind the mark',
          body: 'Positioning and messaging worked out first, so the visual identity is expressing a decision about who you are for rather than decorating an unanswered question.',
        },
        {
          title: 'One voice, not five',
          body: 'A documented tone with real examples, so the site, the deck and the outbound email sound like the same organisation regardless of who in your team wrote them.',
        },
        {
          title: 'Your best deck is repeatable',
          body: 'The pitch deck is often the highest-stakes place your brand appears and the worst maintained. Templates mean the next one starts from the standard rather than from whatever was nearest.',
        },
      ],
      bottomLine:
        'The point of a brand is not to be admired. It is to be recognised instantly and trusted slightly more than the alternative, which is a compounding advantage, and cheaper to build early.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people who set your positioning are the same people designing the identity and building the site it lands on, so the strategy is not a document that gets filed, it is the thing the work is made from. You get usable templates and guidelines, not a PDF nobody opens twice.',
      ],
    },
    closingCta: {
      line: 'Brand looking like three different companies?',
      label: 'Start with a brand review',
      href: '/contact',
    },
  },

  // ==========================================================================
  // WRITTEN, NOT TRANSCRIBED — pillar 3, AI & Automation.
  // ==========================================================================

  'applied-ai': {
    tagline: 'AI that does the work, not AI that does a demo.',
    intro: [
      'Most AI projects die in the gap between the pilot and production. The demo is impressive, the board is enthusiastic, and then someone asks what happens when it is wrong, who approved the action it just took, and where the data went. Nobody has an answer, and the project quietly stops.',
      'We build for that conversation. Applied AI at Zefract means agents and copilots wired into the systems you already run, grounded in your own data, with the guardrails and audit trail your security lead will ask about on the first call rather than the last.',
    ],
    whyItMatters: {
      heading: 'The hard part of AI is not the model. It is everything around it.',
      body: [
        'The model is the commodity. What decides whether an AI feature survives contact with your business is the unglamorous scaffolding: what it is allowed to do, what it is grounded in, what happens when it is uncertain, and who can see what it did. Get that right and the same model that failed as a pilot becomes something people rely on.',
      ],
      kicker: 'Here’s what building it properly returns:',
      returns: [
        {
          title: 'Work that actually gets done',
          body: 'Agents with real tool access complete tasks end to end rather than producing a suggestion someone still has to action. That is the difference between a time saving and a second inbox.',
        },
        {
          title: 'Answers grounded in your data',
          body: 'Retrieval over your own documents and systems, with citations, so responses can be checked. An assistant that cannot show its source is one nobody is allowed to act on.',
        },
        {
          title: 'A security review you can pass',
          body: 'Permissions, approval gates and audit logging designed in from the start, so the question is a reading exercise rather than a negotiation held after the build.',
        },
        {
          title: 'Effort aimed where it pays',
          body: 'Use case discovery and honest ROI modelling first. Most organisations have one or two processes where AI is transformative and a dozen where it is a distraction, and knowing which is which is most of the value.',
        },
        {
          title: 'A human stays in the loop',
          body: 'Approval gates on the actions that warrant them, so an agent can be trusted with real work without being trusted with everything. Autonomy is a dial, set per task rather than per project.',
        },
        {
          title: 'It survives a model change',
          body: 'Built against an abstraction rather than one vendor’s API, so a better or cheaper model next quarter is a configuration decision instead of a rebuild.',
        },
      ],
      bottomLine:
        'Nobody needs another impressive demonstration. What earns its place is a system that does a real job every day, that people trust enough to stop checking, and that your security team already signed off.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people building your AI are the same people who built the product it plugs into, so nothing is bolted on across a vendor boundary. You see the evaluations as well as the outputs, and we tell you when a use case does not justify the effort.',
      ],
    },
    closingCta: {
      line: 'Got an AI idea that keeps stalling?',
      label: 'Start with an AI use case review',
      href: '/contact',
    },
  },

  'ai-enablement': {
    tagline: 'Your existing product, with AI where it actually helps.',
    intro: [
      'Adding AI to a product that already works is a different job from building an AI product. The risk is not that it fails to impress: it is that it makes something reliable feel unpredictable, and users lose trust in the parts that were fine.',
      'We add it carefully. AI enablement at Zefract means choosing the right model for each job, grounding it in your data, and embedding it where it removes a step people currently resent, with evaluation and cost control so the feature stays good and affordable after launch.',
    ],
    whyItMatters: {
      heading: 'The best AI feature is one users never have to think about.',
      body: [
        'The AI features people actually keep using are rarely the ones with a chat box. They are the smart default that was already correct, the suggestion that appeared at the moment it was useful, the field that filled itself in. Visible AI asks for effort and trust; invisible AI simply removes work.',
      ],
      kicker: 'Here’s what doing it well returns:',
      returns: [
        {
          title: 'Fewer steps for your users',
          body: 'Inline suggestions and smart defaults take work out of a flow people already understand, instead of adding a new surface they have to learn.',
        },
        {
          title: 'Outputs you can rely on',
          body: 'Prompts designed, versioned and evaluated against real cases, so quality is measured rather than assumed and a change can be shown to be an improvement.',
        },
        {
          title: 'Costs that stay predictable',
          body: 'Model selection per task, caching, and orchestration across providers with fallback handling. Token spend is a design decision rather than a surprise on the invoice.',
        },
        {
          title: 'Not locked to one vendor',
          body: 'An abstraction over providers means a price change, an outage or a better model next quarter is a configuration decision rather than a rebuild.',
        },
        {
          title: 'It degrades gracefully',
          body: 'Fallback handling for when a provider is slow or down, so an AI feature having a bad day does not take a working product with it.',
        },
        {
          title: 'Trust in the rest of the product',
          body: 'AI added where it removes a step, not everywhere it could go. The fastest way to make reliable software feel unpredictable is to sprinkle probabilistic output through the parts that were fine.',
        },
      ],
      bottomLine:
        'AI is worth adding where it removes work someone is currently doing by hand. Everywhere else it is a feature that demos well, gets used twice, and quietly costs you money every month.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people adding AI to your product understand the product, because product engineering is the same bench. The feature fits the thing it is going into rather than sitting beside it, and we will say plainly when a use case is not worth the tokens.',
      ],
    },
    closingCta: {
      line: 'Want AI in your product without the risk?',
      label: 'Start with a feasibility call',
      href: '/contact',
    },
  },

  'conversational-ai': {
    tagline: 'Assistants that answer, instead of deflecting.',
    intro: [
      'Everyone has met a bad support bot. It restates the question, offers three irrelevant articles, and hides the route to a human, and every one of those conversations costs more goodwill than the ticket it avoided.',
      'A good one is the opposite: it answers from your actual documentation, says so when it does not know, and hands over cleanly with the context attached. Conversational AI at Zefract covers customer-facing assistants and internal copilots, grounded in your own knowledge and available on the channels your people already use.',
    ],
    whyItMatters: {
      heading: 'A bot that guesses costs more than the tickets it deflects.',
      body: [
        'Confidently wrong is the worst failure mode a support channel can have. One invented answer about a refund policy or a delivery date produces a complaint, a correction, and a customer who will not trust the channel again, which is why grounding, citations and a clean escalation path matter more than conversational polish.',
      ],
      kicker: 'Here’s what a well-built assistant returns:',
      returns: [
        {
          title: 'Real resolution, not deflection',
          body: 'Answers drawn from your documentation and systems, so common questions are genuinely resolved rather than redirected into a help centre the customer has already searched.',
        },
        {
          title: 'Answers you can check',
          body: 'Responses grounded in named sources with citations, and explicit handling of low confidence. An assistant that admits uncertainty is one people can safely rely on.',
        },
        {
          title: 'A clean handover to a human',
          body: 'Escalation with the full conversation attached, so nobody has to repeat themselves. The route to a person is visible rather than hidden, which is what stops the channel being resented.',
        },
        {
          title: 'Your team asks it too',
          body: 'The same grounding powers internal copilots: document Q&A and onboarding assistants that answer from the handbook nobody can find, which is often the faster payback of the two.',
        },
        {
          title: 'Available where people already are',
          body: 'Web, WhatsApp and voice rather than one widget on a page nobody visits. An assistant is only useful on the channel the question was going to be asked on anyway.',
        },
        {
          title: 'It gets better from real questions',
          body: 'Conversations are reviewed for what it got wrong, and the gaps feed back into the content it draws on, so the documentation improves alongside the assistant.',
        },
      ],
      bottomLine:
        'The measure of an assistant is not how human it sounds. It is whether the answer was right, whether you can see where it came from, and how quickly it got out of the way when it could not help.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people building the assistant are the people who can also connect it to your systems, so it can look things up rather than only talk about them. You see the evaluation results, including the questions it gets wrong, before it goes anywhere near a customer.',
      ],
    },
    closingCta: {
      line: 'Support queue growing faster than the team?',
      label: 'Start with an assistant scoping call',
      href: '/contact',
    },
  },

  'intelligent-automation': {
    tagline: 'The manual process, gone.',
    intro: [
      'Every business runs on a handful of processes nobody designed. Someone exports a report, retypes it into another system, emails it for approval, and files the result, and it works, because a person is quietly absorbing the friction every single day.',
      'Those are the ones worth removing. Intelligent automation at Zefract connects the systems, handles the documents, and applies judgement where a rule alone is not enough, starting with the processes where the time actually goes rather than the ones that are easiest to automate.',
    ],
    whyItMatters: {
      heading: 'The most expensive software in your company is a spreadsheet and a person.',
      body: [
        'Manual process cost is invisible because it never appears on an invoice. It shows up as slower turnaround, errors nobody catches until month end, and capable people spending their week on rekeying. It also does not scale: twice the volume needs twice the hours, which is the constraint that quietly caps growth.',
      ],
      kicker: 'Here’s what removing it returns:',
      returns: [
        {
          title: 'Hours back, every week',
          body: 'The repetitive steps stop needing a person. That capacity goes to the work that actually required judgement, which is usually what those people were hired for.',
        },
        {
          title: 'Fewer errors, caught sooner',
          body: 'Automated validation and exception handling mean bad data is flagged where it enters rather than discovered downstream when it is expensive to unpick.',
        },
        {
          title: 'It scales without hiring',
          body: 'Volume stops being a staffing question. Twice the invoices or twice the applications cost roughly the same to process as they did before.',
        },
        {
          title: 'You find out where the time goes',
          body: 'Process mining shows the real bottlenecks rather than the assumed ones, which regularly turns out to be a different step from the one everybody complains about.',
        },
        {
          title: 'Paper stops being a blocker',
          body: 'OCR, extraction and validation turn invoices, forms and scanned documents into structured data, so the process does not stall at whoever opens the post.',
        },
        {
          title: 'An audit trail by default',
          body: 'Every automated run is logged with its inputs, its decision and its exceptions, which is both how you improve it and how you answer a compliance question about it.',
        },
      ],
      bottomLine:
        'Automation is not about replacing people. It is about no longer paying skilled people to be a data bridge between two systems that were always capable of talking to each other.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people automating your process are the same people who can build what is missing at either end of it, so you are not left with an automation that works everywhere except the one system nobody could integrate. We start by measuring where the time goes, not by guessing.',
      ],
    },
    closingCta: {
      line: 'Know which process is eating your week?',
      label: 'Start with a process review',
      href: '/contact',
    },
  },

  // ==========================================================================
  // WRITTEN, NOT TRANSCRIBED — pillar 4, Cloud, Data & Security.
  // ==========================================================================

  'cloud-modernization': {
    tagline: 'Off the legacy stack without the migration horror story.',
    intro: [
      'Everybody knows a migration that went badly. A weekend that became a fortnight, a rollback that did not work, a bill that arrived three times larger than the one it replaced. The stories are common enough that plenty of businesses stay on infrastructure they have outgrown simply because moving sounds worse.',
      'It is a planning problem more than a technical one. Cloud modernization at Zefract means mapping what you actually have before touching it, choosing honestly between lifting and rebuilding, and rehearsing the cutover until it is boring, with cost control from day one rather than after the first invoice.',
    ],
    whyItMatters: {
      heading: 'The cloud does not save money by itself. It saves money when it is run properly.',
      body: [
        'Moving a badly-behaved system onto rented hardware gets you the same system with a monthly bill attached. The savings come from what you do afterwards: rightsizing what was over-provisioned, using managed services instead of maintaining your own, and switching off the things nobody has looked at in two years.',
      ],
      kicker: 'Here’s what doing it properly returns:',
      returns: [
        {
          title: 'A cutover nobody notices',
          body: 'Rehearsed against production-shaped data, executed behind a flag, with a tested rollback at every stage. The goal is a migration your customers never find out about.',
        },
        {
          title: 'A bill you can explain',
          body: 'FinOps practice from the start: rightsizing, reserved capacity where usage is predictable, and spend monitoring so a surprise is caught in days rather than at quarter end.',
        },
        {
          title: 'It stays up under pressure',
          body: 'Auto-scaling and high availability configured deliberately, so a traffic spike is absorbed rather than survived, and tested, because untested failover is a hope rather than a plan.',
        },
        {
          title: 'Recovery you have actually tried',
          body: 'Backups and a disaster recovery plan that have been restored from at least once. An untested backup is not a backup, and most organisations discover this at the worst possible moment.',
        },
        {
          title: 'Less to maintain',
          body: 'Managed services and serverless where they fit mean whole categories of patching, upgrades and capacity planning stop being your team’s problem.',
        },
        {
          title: 'An honest lift-or-rebuild call',
          body: 'Some workloads should simply move; others should be rebuilt for the cloud, and a few should stay where they are. We make that call per workload and show the reasoning rather than selling one answer.',
        },
      ],
      bottomLine:
        'A good migration is not an achievement anyone outside the team notices. It is the one where the numbers improve, the bill goes down, and nobody has a story to tell afterwards.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people moving your infrastructure are the same people who understand the application running on it, so the migration plan accounts for how the software actually behaves rather than treating it as a black box to be relocated.',
      ],
    },
    closingCta: {
      line: 'Stuck on infrastructure you have outgrown?',
      label: 'Start with a migration assessment',
      href: '/contact',
    },
  },

  'platform-engineering': {
    tagline: 'Deploys that are boring, on purpose.',
    intro: [
      'You can tell how healthy a team is by how they feel about releasing. Where deploys are manual, half-documented and done late at night by the one person who knows the sequence, everything else slows down to match, because shipping is frightening, so it happens less often, so each release carries more risk.',
      'Platform engineering removes that. Pipelines that deploy on their own, infrastructure defined as code rather than as configuration somebody applied once, and the monitoring that tells you something is wrong before a customer does.',
    ],
    whyItMatters: {
      heading: 'How often you can safely deploy sets the pace of everything else.',
      body: [
        'Every improvement your team wants to make is gated by how easily it can reach production. Teams that deploy on demand ship small changes and find problems quickly; teams that batch a month of work into a Friday release find several problems at once and cannot tell which caused what.',
      ],
      kicker: 'Here’s what a real platform returns:',
      returns: [
        {
          title: 'Releases without ceremony',
          body: 'Automated pipelines with tests as gates, so shipping is a routine action rather than an event that needs three people watching a dashboard.',
        },
        {
          title: 'A rollback that works',
          body: 'Because it is part of the pipeline and has been used. The ability to undo a release in minutes is what makes shipping frequently a reasonable thing to do.',
        },
        {
          title: 'Environments that match',
          body: 'Infrastructure as code means staging genuinely resembles production, and "it worked on staging" stops being the beginning of an investigation.',
        },
        {
          title: 'No more configuration drift',
          body: 'Terraform and GitOps mean the infrastructure is what the repository says it is. Nobody is logging into a console to make an undocumented change that survives until it breaks.',
        },
        {
          title: 'You hear about it first',
          body: 'Monitoring, alerting and SLOs that reflect what users actually care about, so problems arrive as a page rather than as a support ticket.',
        },
        {
          title: 'Incidents that get shorter',
          body: 'A defined response process and on-call rotation, plus the observability to find the cause. Incidents stop depending on whoever happens to remember how that service works.',
        },
      ],
      bottomLine:
        'The point of platform work is that nothing dramatic happens. The best possible outcome is a team that ships several times a day and has stopped thinking of it as a thing they do.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people building your pipeline are the people writing the code that goes through it, so the platform fits how your team actually works rather than imposing a process invented elsewhere. Everything is in your repositories and your cloud account.',
      ],
    },
    closingCta: {
      line: 'Deploys still a manual event?',
      label: 'Start with a delivery assessment',
      href: '/contact',
    },
  },

  'data-and-ai': {
    tagline: 'Pipelines that make your data usable.',
    intro: [
      'Most companies do not have a data problem so much as a plumbing problem. The numbers exist, but they are in six systems that disagree, arrive late, and require somebody to assemble them by hand each month, which is why the reporting is always slightly out of date and quietly distrusted.',
      'We build the plumbing. Ingestion, transformation and a warehouse that acts as one source of truth, with the governance to make it trustworthy and the MLOps to get models into production and keep them honest once they are there.',
    ],
    whyItMatters: {
      heading: 'Data nobody trusts is worse than no data at all.',
      body: [
        'Once two dashboards disagree, every number becomes negotiable, and meetings turn into arguments about whose figure is right rather than what to do about it. Trust is a technical property: it comes from lineage, quality checks and a single definition of what a metric means.',
      ],
      kicker: 'Here’s what proper data foundations return:',
      returns: [
        {
          title: 'One version of the numbers',
          body: 'A modelled warehouse with agreed definitions, so "revenue" means the same thing in finance and in marketing and nobody has to reconcile two spreadsheets first.',
        },
        {
          title: 'Reporting that is not manual',
          body: 'Pipelines that run on a schedule rather than a person. The monthly assembly job stops consuming a week of somebody capable.',
        },
        {
          title: 'You can trace any figure',
          body: 'Lineage and a data catalogue mean a number can be followed back to its source. Being able to answer "where did this come from" is what makes people act on it.',
        },
        {
          title: 'Bad data caught early',
          body: 'Quality checks at ingestion, so a broken upstream feed is flagged the day it breaks rather than discovered in a board pack three weeks later.',
        },
        {
          title: 'Models that stay useful',
          body: 'MLOps for deployment, monitoring and retraining. A model that was accurate at launch and never re-evaluated is a liability quietly decaying in production.',
        },
        {
          title: 'Access without a free-for-all',
          body: 'Governed access and clear ownership, so teams can self-serve the data they need without everyone having a key to everything.',
        },
      ],
      bottomLine:
        'The value is not in having data. It is in being able to ask a question on a Tuesday and get an answer you are willing to act on before the decision has passed.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people building your pipelines are the same people building the products generating the data, so what gets captured is designed rather than reverse-engineered later from whatever happened to be logged.',
      ],
    },
    closingCta: {
      line: 'Reporting taking a week to assemble?',
      label: 'Start with a data assessment',
      href: '/contact',
    },
  },

  'data-and-analytics': {
    tagline: 'Reporting that answers the question you actually asked.',
    intro: [
      'Most dashboards are built to display everything available rather than to answer anything specific. They get opened enthusiastically for a fortnight and then ignored, because reading them takes more effort than the decision they were meant to inform.',
      'We build the other kind: a small number of metrics that map to decisions someone actually makes, delivered where they will be seen, with enough self-service underneath that teams can follow up their own questions without joining a queue.',
    ],
    whyItMatters: {
      heading: 'A dashboard nobody opens is a report nobody reads with extra steps.',
      body: [
        'The measure of analytics is not how much is visible but how many decisions changed. That means starting from the decision (who makes it, how often, and what would make them act differently) and working backwards to the number, which is the opposite of how most reporting gets built.',
      ],
      kicker: 'Here’s what useful analytics returns:',
      returns: [
        {
          title: 'Fewer numbers, better ones',
          body: 'KPIs chosen because someone acts on them. A dashboard with six meaningful metrics beats one with forty that nobody can prioritise.',
        },
        {
          title: 'It arrives without being fetched',
          body: 'Scheduled delivery into the inbox or channel where the decision gets made, so the reporting reaches people who were never going to log in to look.',
        },
        {
          title: 'Teams answer their own questions',
          body: 'A semantic layer and governed models mean the follow-up question does not need a ticket, which is usually where the real insight was hiding.',
        },
        {
          title: 'Everyone sees their own view',
          body: 'Role-based dashboards, so an executive gets the shape of the business and a team lead gets the handful of numbers they can personally move.',
        },
        {
          title: 'Trends, not just totals',
          body: 'Cohort analysis and metric modelling show whether something is genuinely improving or whether the total is being carried by one unusual month.',
        },
        {
          title: 'Charts that argue clearly',
          body: 'Visualisation chosen to make the comparison legible rather than to look impressive. The right chart makes the conclusion obvious; the wrong one hides it in plain sight.',
        },
      ],
      bottomLine:
        'Good analytics is not a wall of screens. It is a small number of things you check, trust, and change your mind because of.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people designing your reporting are the same people who built the pipelines feeding it, so a number that looks wrong can be traced to its source in the same conversation rather than across two suppliers.',
      ],
    },
    closingCta: {
      line: 'Dashboards nobody opens?',
      label: 'Start with a reporting review',
      href: '/contact',
    },
  },

  cybersecurity: {
    tagline: 'Find the holes before somebody else does.',
    intro: [
      'Security gets treated as a thing you buy once, usually because a customer asked. Then the certificate is filed, the code keeps changing, the dependencies keep updating, and the posture that passed an audit eighteen months ago quietly stops describing the system you actually run.',
      'We treat it as ongoing work. Assessment to find out where you really stand, identity and access done properly, application and cloud security built into how you ship, and the compliance evidence assembled as a by-product rather than a fire drill.',
    ],
    whyItMatters: {
      heading: 'You will find your vulnerabilities, or somebody else will.',
      body: [
        'The question is never whether weaknesses exist (every system has them), but who finds them first and how much it costs when they do. A penetration test is a controlled version of an event that will otherwise happen uncontrolled, at a time you do not choose, with an audience you do not want.',
      ],
      kicker: 'Here’s what taking it seriously returns:',
      returns: [
        {
          title: 'You know your real exposure',
          body: 'Assessment and penetration testing against the system you actually run, with findings triaged by exploitability rather than by severity score alone.',
        },
        {
          title: 'Enterprise deals stop stalling',
          body: 'Security review is where a lot of large contracts quietly slow down. Having the controls, the evidence and the documentation ready turns that stage into a reading exercise.',
        },
        {
          title: 'The right people, the right access',
          body: 'IAM, SSO, MFA and least privilege, so a compromised account is a contained problem rather than a full one, which is what most breaches actually turn on.',
        },
        {
          title: 'Security inside the pipeline',
          body: 'Code scanning and dependency checks running on every change, so vulnerabilities surface in a pull request rather than a disclosure email.',
        },
        {
          title: 'Compliance as a by-product',
          body: 'ISO 27001, SOC 2 and GDPR work structured so the evidence accumulates from how you already operate, instead of being reconstructed in a panic before an audit.',
        },
        {
          title: 'Your cloud is actually locked down',
          body: 'Posture management, hardened configuration and threat detection. Misconfigured cloud storage remains one of the most common and most avoidable causes of a breach.',
        },
      ],
      bottomLine:
        'Security is not a certificate on a wall. It is whether the person who goes looking tomorrow finds something you did not already know about.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people testing your systems are the same people who can fix what they find, so a report does not end at the boundary between finding a problem and being able to do anything about it. Every finding comes with remediation guidance rather than a severity label.',
      ],
    },
    closingCta: {
      line: 'When was your last honest security assessment?',
      label: 'Start with a security assessment',
      href: '/contact',
    },
  },

  // ==========================================================================
  // WRITTEN, NOT TRANSCRIBED — pillar 5 remainder, plus cross-cutting.
  // SEO, Social, Paid and GEO in this pillar are transcribed; these four are not.
  // ==========================================================================

  'ai-search-aeo': {
    tagline: 'Own the answer, not just the tenth blue link.',
    intro: [
      'Search results are shrinking. Above the ten links sits a box with one answer in it: the featured snippet, the People-Also-Ask panel, the reply a voice assistant reads aloud. That box takes a large share of the clicks for the query it answers.',
      'AEO is the work of making that answer yours. It is close to SEO and often bought alongside it, but the detail differs: answering in the first two sentences, marking questions up so a machine can parse them without guessing, and phrasing headings the way people actually ask.',
    ],
    whyItMatters: {
      heading: 'The answer box sits above page one.',
      body: [
        'Ranking well and being the answer are different achievements. Snippets are routinely awarded to a page ranked below the top result purely because it answers the question more cleanly, which means a competitor can sit above you on the page you are winning, using content you could have structured better.',
      ],
      kicker: 'Here’s what winning the answer returns:',
      returns: [
        {
          title: 'Placement above the results',
          body: 'The featured snippet renders above the organic listings. Winning it is the only way to appear ahead of a competitor who outranks you without outranking them.',
        },
        {
          title: 'Clicks you were not getting',
          body: 'People-Also-Ask panels surface questions adjacent to the one typed, which puts you in front of searches you were never ranking for at all.',
        },
        {
          title: 'The voice answer',
          body: 'Voice assistants read one result. Structured, direct answers are what make a page eligible for a surface that has no second place.',
        },
        {
          title: 'It feeds your GEO work',
          body: 'Content structured to be extracted is content structured to be quoted. The same discipline that wins a snippet makes a page easier for a generative engine to cite.',
        },
        {
          title: 'Pages that read better',
          body: 'Answering directly near the top is good for machines and better for people. Cutting the preamble tends to improve engagement as well as eligibility.',
        },
        {
          title: 'Progress you can see',
          body: 'Answer slots are countable. You can track which questions you own, which a competitor holds, and which are unclaimed, a clearer signal than a ranking average.',
        },
      ],
      bottomLine:
        'Ten blue links rewarded being on the page. An answer box rewards being the clearest response to a specific question, and only one site gets it.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people structuring your pages are the same people writing them and the same people running your SEO, so the markup, the wording and the ranking work pull in one direction instead of being three separate briefs.',
      ],
    },
    closingCta: {
      line: 'Ready to own the answer?',
      label: 'Start with an answer-engine audit',
      href: '/contact',
    },
  },

  'content-marketing': {
    tagline: 'Content that ranks, and then sells.',
    intro: [
      'Publishing is not a strategy. Most content calendars are volume targets in disguise: a post a week, filled with whatever seemed reasonable that month, measured on whether it went out rather than whether it did anything.',
      'We give every piece a job. Content marketing at Zefract starts with the plan (the searches worth winning, the objections worth clearing, the buyer each piece is for) and then produces the work: articles and site copy written to rank and to read, the long-form assets that carry authority, and the formats that carry the same ideas where text alone will not.',
    ],
    whyItMatters: {
      heading: 'Content is the only marketing asset that keeps working after you stop paying.',
      body: [
        'An ad stops the day the budget does. A piece of content that answers a real question keeps arriving in search results, keeps getting sent by your sales team, and keeps being the reason someone decides you know what you are talking about, for years, at no additional cost.',
      ],
      kicker: 'Here’s what a real content programme returns:',
      returns: [
        {
          title: 'Traffic that compounds',
          body: 'Each piece that ranks adds to a base rather than replacing it. Twelve months of deliberate publishing produces a stream of visitors the thirteenth month inherits for free.',
        },
        {
          title: 'Shorter sales conversations',
          body: 'Objections cleared before the first call. A prospect who has read the honest comparison arrives already past the questions that used to take half a meeting.',
        },
        {
          title: 'Authority that is demonstrated',
          body: 'Long-form guides, whitepapers and case studies are the difference between claiming expertise and showing it, which is what a buyer doing their homework is looking for.',
        },
        {
          title: 'Fuel for every other channel',
          body: 'One well-researched piece becomes a newsletter, a video script, a social series and a sales attachment. The research cost is paid once.',
        },
        {
          title: 'The raw material AI cites',
          body: 'Generative engines assemble answers from sources they can quote. Clear, well-structured content is far easier to cite than a sales page, which makes this the same work as your AI search visibility.',
        },
        {
          title: 'Judged per piece',
          body: 'Each piece is measured against the job it was commissioned to do: rankings and traffic for a search piece, assisted conversions for one written to clear an objection.',
        },
      ],
      bottomLine:
        'The question is never how much content to publish. It is whether each piece has a job worth doing, because a small number of pieces that do beat a schedule of posts that do not.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people planning your content are the people running your SEO and your AI search work, so what gets written is chosen because it can win something rather than because it was next on a calendar. We interview your experts rather than guessing at their subject.',
      ],
    },
    closingCta: {
      line: 'Publishing without a plan?',
      label: 'Start with a content review',
      href: '/contact',
    },
  },

  /**
   * TRANSCRIBED. Zefract_Email_Marketing_Services.docx.
   *
   * Replaces an authored entry that stood under the old `email-crm-automation` slug, written
   * from Appendix D before this document existed. The banner at the top of this file says an
   * authored entry should be replaced outright the day a real document arrives, and this is
   * that day: the wording below is the client's, not ours.
   *
   * ONE DELIBERATE EDIT, the same one the SEO entry carries. The document's closing line is
   * "Every rupee spent on ads rents attention once. Every rupee spent on email builds an asset
   * you own". The site serves clients outside India — the reason the Paid Advertising points
   * drop the same framing — so the currency comes out and the sentence is otherwise untouched.
   * Put it back the day the site is India-only.
   */
  'email-marketing': {
    tagline: 'The one channel you actually own.',
    intro: [
      'Most email marketing is either ignored or overdone: a blast to everyone, sent and forgotten, measured by nothing that matters. Meanwhile the inbox stays what it has always been: the most direct, most profitable line you have to your customers.',
      'We do it differently. Email at Zefract is one connected service made of eleven moving parts, all pulling toward a single goal: turning subscribers into loyal customers, and that loyalty into predictable revenue. You’ll see the work at every step, and we’ll tell you what we’re doing in plain English. No jargon tax.',
    ],
    whyItMatters: {
      heading: 'Email isn’t a cost. It’s a compounding asset.',
      body: [
        'Ads stop the moment you stop paying, and every year the click gets pricier. Email is different: build the list and the flows once, and they keep generating opens, clicks, and sales long after the setup is done: steady, owned, compounding growth instead of a bill that resets every month.',
      ],
      kicker: 'Here’s what that investment actually returns:',
      returns: [
        {
          title: 'A direct line to your customers',
          body: 'Email speaks to your customers one-to-one, in their inbox, with no algorithm deciding who sees you. You own the relationship and the list, an asset that stays yours no matter what happens on any platform.',
        },
        {
          title: 'Revenue you can predict',
          body: 'Once your flows are running, they generate sales every day from work you did once. Email becomes a reliable, compounding engine, not a scramble of one-off sends hoping something lands.',
        },
        {
          title: 'Independence from platforms',
          body: 'Social reach rises and falls at the whim of an algorithm; ad costs climb every year. Your email list answers to neither. It’s the one channel you truly control, and it keeps working when the others get expensive.',
        },
        {
          title: 'Lower cost per sale',
          body: 'Reaching someone already on your list costs a fraction of buying a new click. The more of your growth email carries, the cheaper each new sale becomes, and the better your whole marketing budget performs.',
        },
        {
          title: 'Deeper, longer relationships',
          body: 'Email is where a first-time buyer becomes a repeat customer and a repeat customer becomes a fan. Consistent, useful contact builds the trust and loyalty that turn a single sale into a lifetime of them.',
        },
      ],
      bottomLine:
        'Money spent on ads rents attention once. The same money spent on email builds an asset you own: a list and a set of flows that keep working, quietly compounding into revenue for years.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people who understand your product are the same people writing your emails, so your email isn’t bolted on after the fact, it’s built in. You see the work weekly, you understand every flow, and you only ever chase one thing: relationships that turn into revenue.',
      ],
    },
    closingCta: {
      line: 'Ready to own your growth?',
      label: 'Start with your free email marketing audit',
      href: '/contact',
    },
  },

  /**
   * TRANSCRIBED. Zefract_Digital_Marketing_Strategy.docx.
   *
   * The only service on the site with no Appendix D entry behind it — see
   * content/services.additions.ts. Everything below is the document's own.
   *
   * SAME CURRENCY EDIT as the SEO and Email entries: the document's fifth return opens "Every
   * rupee has a reason behind it". Generalised, wording otherwise untouched.
   */
  'digital-marketing-strategy': {
    tagline: 'A plan you can actually run, not a deck that gathers dust.',
    intro: [
      'Most strategy work ends the same way: a thick slide deck, a room full of nodding, and then nothing. The words sound impressive, but nobody can point to what to do on Monday morning. Six months later the plan is forgotten and the spending carries on out of habit.',
      'We build strategy to be used, not admired. At Zefract, strategy is one connected service that turns your goals into a plan your whole team can follow, where the market is chosen on purpose, the budget is matched to reality, and every channel and campaign has a job. You see the thinking behind each decision, in plain language, and everyone from the founder to the newest marketer is pointed in the same direction. No jargon, no guesswork, no plan that only lives in a PDF.',
    ],
    whyItMatters: {
      heading: 'Strategy isn’t overhead. It’s the map that saves the spend.',
      body: [
        'Marketing without a strategy isn’t cheaper; it’s just expensive in ways you can’t see. Wasted budget, scattered effort, and campaigns that pull in different directions cost far more than the planning that would have prevented them. A good strategy is the difference between paying for motion and paying for progress.',
      ],
      kicker: 'Here’s what that planning actually returns:',
      returns: [
        {
          title: 'One direction, everyone aligned',
          body: 'Founder, marketing, sales, and product stop pulling different ways. When everyone is working from the same plan, effort stacks up instead of cancelling out, and decisions get faster because the goal is already agreed.',
        },
        {
          title: 'Fewer expensive mistakes',
          body: 'The costliest lessons are the ones you learn by burning budget. A clear strategy lets you sidestep the obvious traps and the dead ends, so you spend on what’s likely to work instead of paying tuition on what wasn’t.',
        },
        {
          title: 'The blind spots you can’t see from inside',
          body: 'When you’re in the business every day, some problems become invisible. An outside eye names the things nobody internally wanted to say, and often the opening nobody noticed, before they cost you.',
        },
        {
          title: 'A system, not a scramble',
          body: 'One-off campaigns give you one-off results. We build a plan that keeps working: repeatable, measurable, and ready to scale, so growth stops depending on the next burst of activity and starts running on its own rhythm.',
        },
        {
          title: 'Money spent on purpose',
          body: 'Every line of spend has a reason behind it, tied to a goal you agreed on. You stop funding habits and start funding outcomes, and when it’s time to spend more, you know exactly where it should go.',
        },
      ],
      bottomLine:
        'A plan you never execute is worth nothing; a plan everyone follows is worth more than any single campaign. Strategy is the layer that makes all your other marketing (SEO, paid, social) pull in one direction and compound, instead of competing for the same budget and cancelling each other out.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people who write your strategy are the same people who build and run the work, so the plan is never a document that gets handed off and forgotten. It’s made by the team that has to deliver it, which means it’s realistic on day one and adjusted the moment the numbers say so. You see the thinking weekly, you understand every call, and every channel points at the same goal: growth you can actually steer.',
      ],
    },
    closingCta: {
      line: 'Ready to turn goals into a plan you can run?',
      label: 'Start with a free strategy session',
      href: '/contact',
    },
  },

  'local-reputation': {
    tagline: 'Own the map pack and the reviews.',
    intro: [
      'For a business that serves an area, the most valuable piece of search real estate is not your website. It is the map result with three listings on it, the star rating beside your name, and the answer someone gets when they search for what you do with "near me" attached.',
      'That result is winnable and largely neglected. Local and reputation work at Zefract covers your Google Business Profile, the consistency of your details across the web, the local pages that support them, and the review programme that decides whether anyone chooses you once they have found you.',
    ],
    whyItMatters: {
      heading: 'Nearby and highly rated beats better and unknown.',
      body: [
        'Local search compresses the whole decision into one screen: three businesses, a star rating and a distance. Being the best option is not enough if a competitor with more reviews and a complete profile occupies the pack, because most people never scroll past it.',
      ],
      kicker: 'Here’s what local work returns:',
      returns: [
        {
          title: 'A place in the map pack',
          body: 'The three-result block sits above the organic listings and takes the majority of local clicks. Getting into it is the single highest-return move available to most local businesses.',
        },
        {
          title: 'Ready-to-buy intent',
          body: 'A "near me" search is about as close to the decision as search gets. These are people looking to act now rather than research for later.',
        },
        {
          title: 'Reviews that do the selling',
          body: 'A steady flow of recent reviews, and replies to them. Rating and volume are what a customer compares when two options look otherwise equivalent.',
        },
        {
          title: 'Consistency that search engines trust',
          body: 'Matching name, address and phone details across directories and aggregators. Conflicting information is one of the most common reasons a local ranking stalls.',
        },
        {
          title: 'Coverage of every area you serve',
          body: 'Local landing pages built for the places you actually operate in, so you appear for the towns nearby rather than only the one on your letterhead.',
        },
        {
          title: 'Early warning on reputation',
          body: 'Sentiment monitoring means an emerging complaint is spotted while it is one review, not after it has become the first thing people read about you.',
        },
      ],
      bottomLine:
        'For a business with a catchment, this is often the shortest distance between marketing spend and a phone ringing, and it is usually the work nobody has got round to.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people running your local presence are the same people running your SEO, so the profile, the citations and the site all reinforce each other rather than being managed by three suppliers who never speak.',
      ],
    },
    closingCta: {
      line: 'Invisible when people search nearby?',
      label: 'Start with a local visibility audit',
      href: '/contact',
    },
  },

  'managed-services': {
    tagline: 'Someone accountable after launch.',
    intro: [
      'Launch is the point at which most agency relationships quietly end. The invoice is settled, the team moves on, and the site or app enters the phase that lasts far longer than the build, where plugins go out of date, certificates lapse, backups stop running and nobody notices until something is already broken.',
      'We stay. Managed services at Zefract covers the updates, the monitoring, the hosting and the support hours, with a response commitment in writing, so there is a named team to call rather than a scramble to find whoever built it.',
    ],
    whyItMatters: {
      heading: 'Software does not decay because it was built badly. It decays because nobody was watching.',
      body: [
        'The things that take a site down are rarely dramatic. An expired certificate, a plugin update that conflicted, a disk that filled, a dependency with a newly published vulnerability. All are trivial to handle when someone is looking and expensive when the first indication is a customer telling you.',
      ],
      kicker: 'Here’s what having someone accountable returns:',
      returns: [
        {
          title: 'You find out before customers do',
          body: 'Uptime and error monitoring that alerts us rather than you. Most outages we handle are resolved before anyone outside the team is aware there was one.',
        },
        {
          title: 'Security patched, not deferred',
          body: 'Dependencies and platform updates applied on a schedule. Known vulnerabilities are published with instructions, which makes an unpatched system a standing invitation.',
        },
        {
          title: 'Backups that have been restored',
          body: 'Taken regularly and tested by actually restoring them. An untested backup is a belief rather than a safeguard, and the difference emerges at the worst moment.',
        },
        {
          title: 'A response time in writing',
          body: 'An SLA with named priorities, so an urgent problem has a defined path rather than depending on who happens to read the email.',
        },
        {
          title: 'Small changes stay small',
          body: 'Retained hours mean a copy change or a new page is a same-week task instead of a quote, a scoping call and a minimum engagement.',
        },
        {
          title: 'It stays fast',
          body: 'Managed hosting, CDN and scaling looked after continuously, so performance does not slowly degrade as content accumulates and traffic grows.',
        },
      ],
      bottomLine:
        'The build is a few months. Running it is the next several years, and that is the part that decides whether the investment keeps returning or quietly stops.',
    },
    whyUs: {
      heading: 'One team, one goal, nothing lost in the handoff.',
      body: [
        'The people supporting your site are the people who built it, so a problem does not begin with someone reading unfamiliar code. And if we did not build it, we will read it properly and tell you honestly what we are taking on before either of us commits.',
      ],
    },
    closingCta: {
      line: 'Nobody watching your site since launch?',
      label: 'Start with a care plan conversation',
      href: '/contact',
    },
  },
}

import { TODO } from '@/lib/todo'
import type { CaseStudy, Testimonial, Faq } from './types'

/**
 * The client portraits, written once because two different things show them.
 *
 * Each of these people appears twice on this site: as a testimonial in the carousel, and as
 * the quoted voice on their own case study — which the home page's featured card also
 * prints. Those are separate objects in separate arrays below, and before this they would
 * have carried the same path typed out twice. One name, one place to change it, and no way
 * for the two surfaces to end up showing a person a different face.
 *
 * NAMED `portrait-`, NOT `testimonial-`, and the files were renamed to match. They were
 * added for the carousel and the name said so; the moment the featured case started using
 * them too, a filename asserting where an image is used became a filename that was wrong
 * about it. `portrait-` says what the picture IS, which stays true wherever it is shown.
 *
 * Both are the client's own photographs, supplied for this purpose — see the note on
 * TESTIMONIALS for why that is the only thing that makes this field usable.
 */
const PORTRAITS = {
  ajitKumar: '/images/portrait-ajit-kumar.webp',
  rohitDass: '/images/portrait-rohit-dass.webp',
} as const

/**
 * Case studies. EVERY ENTRY HERE IS REAL. There are currently two.
 *
 * Seair Exim and Eximpedia both came from the client as written case studies, with named
 * figures and named people; Seair's own footer records that it is "published with the
 * client's review and permission". Their numbers therefore carry NO `verified: false` —
 * that flag marks a figure invented for the comp and awaiting confirmation, and applying
 * it to confirmed client copy would put real work on the hand-back list and quietly
 * devalue it.
 *
 * THE THREE PLACEHOLDERS ARE GONE, deleted at the client's request. CloudScale, Veloce and
 * DataLink were invented companies with invented people and invented numbers, carried from
 * the design comp; their pages, their PAGE_META rows and their sitemap entries went with
 * them. Nothing needs to be kept in sync with them any more.
 *
 * A ONE-ENTRY ARRAY IS STILL A SUPPORTED STATE, checked rather than assumed when this file
 * held only Seair. <FeaturedCase> reads `cases[0]` and returns null when empty; the Work
 * index maps over whatever is here; a service page renders its Proof block only on
 * `proof.length > 0`. So the site degrades to one study cleanly, and would survive zero.
 *
 * WHAT `services` ACTUALLY DRIVES TODAY — checked against the rendered pages, because the
 * obvious answer is wrong. It reads as "which service pages show this study as proof", and
 * app/services/[slug]/page.tsx does look it up for exactly that. But the Proof block is
 * gated on `proof.length > 0 && !service.story`, and every one of the twenty-six services
 * now has a story document, so THAT BLOCK RENDERS ON NO PAGE AT ALL. Neither study appears
 * as proof anywhere, and adding a slug here does not change that.
 *
 * What the field does do is fill the "related services" links at the foot of the study's
 * own page, which is real and worth keeping accurate. If the Proof block is ever wanted
 * back on a page that has a story, the condition in that file is the thing to change.
 *
 * ADDING MORE: real ones only. `services` must contain slugs that exist in the catalogue,
 * and whatever sits at index 0 becomes the home page's featured work. Two other places
 * need a matching edit and neither is enforced by the compiler — a PAGE_META row for
 * `/work/<slug>`, and the `/work` index description, which is the one row in that file
 * that describes a COLLECTION and therefore goes stale on its own.
 */
export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'seair-exim-qualified-traffic',
    client: 'Seair Exim Solutions',
    /* The client's own words for it. Not one of the eight INDUSTRIES chips, and it does
       not need to be: `sector` is free text, used only in the page eyebrow, the Work card
       and the keyword list. Forcing this to "Logistics" to match a chip would describe the
       cargo rather than the business, which sells trade data and research. */
    sector: 'Trade data & research',
    title: 'They were getting found. They just were not getting asked.',
    problem:
      'Seventeen years of authority in global trade data and no shortage of traffic, but almost nobody filling in the enquiry form. Every interface-level metric looked acceptable, which is what made it hard.',
    what: [
      'Spent two weeks on diagnostics across content, schema, technical SEO, breadcrumbs and the backlink profile before proposing a single fix.',
      'Audited and disavowed the toxic and irrelevant referring domains, then earned placement in trade, logistics and export-import publications.',
      'Rebuilt breadcrumbs across the data-page hierarchy and interlinked related countries, HS codes, products and ports so a researcher had a second step to take.',
      'Marked up organisation, dataset, breadcrumb and FAQ layers so a trade database stopped looking like a blog post to a crawler.',
      'Split email into two journeys: a sequence moving new researchers toward a demo, and data-update contact for existing clients.',
    ],
    outcomes: [
      { value: '+30%', label: 'qualified leads over 6 months' },
      { value: '−45%', label: 'spam score' },
      { value: '2 wks', label: 'diagnostic before a single fix shipped' },
    ],
    quote: {
      text: 'Zefract gave us a complete roadmap to address the issues with our organic ranking, and the team is working through it. It has been great working with them.',
      author: 'Ajit Kumar',
      role: 'Seair Exim Solutions',
      /* The same portrait the carousel shows him with, from one constant — see PORTRAITS.
         This is what replaces the "AK" monogram on the home page's featured card. */
      avatar: PORTRAITS.ajitKumar,
    },
    /**
     * Supplied by the client as the cover for this study. 1096x639 WebP, served at its own
     * size rather than upscaled — see the note in <CaseCover>. Setting this field is all it
     * takes to replace the drawn panel that renders without it.
     *
     * THE FILENAME CHANGED WITH THE PICTURE, and that is the fix for a real problem rather
     * than housekeeping. The replacement first went in at the old path,
     * `case-seair-cover.webp`, and the old photograph kept appearing: a URL is a cache key,
     * and swapping the bytes behind one leaves every layer that already has it — the
     * browser, Next's image optimizer under .next/cache/images, and a CDN in production —
     * serving what it fetched before. Nothing is wrong with the file in that situation and
     * no amount of rebuilding helps, which is what makes it an expensive hour if you have
     * not met it. A new name is a new key, so every cache misses and fetches the new image.
     *
     * The name also says what the picture is now, which the old one had stopped doing.
     *
     * TWO THINGS WERE DONE TO THE FILE THEY SENT, and both are recorded because editing a
     * client's asset is not a free action.
     *
     *   1. JPEG to WebP at quality 82. Same pixels, 98KB down to 34KB, and it matches the
     *      format the other cover on this site already uses.
     *   2. 280px TRIMMED FROM THE LEFT — a stretch of skyline, no subject in it — taking
     *      the frame from 1376x639 to 1096x639 and its ratio from 2.15 to 1.72.
     *
     * THE SECOND ONE IS NOT TIDYING, IT IS A BUG FIX. This cover renders into two boxes and
     * neither is the shape of the file: the Work card is 16:9 and the home page's featured
     * card is nearer 1.4:1. `object-cover` trims the sides to fill them, and at 2.15 the
     * featured card cut the wordmark mid-word — the home page read "SEAIR EXIM SOLUTION"
     * over "INFORMATION FOR BUSIN". A client's own name truncated on the most-visited page
     * of the site is not a crop, it is a defect. Checked by rendering both crops rather than
     * by measuring: at 1.72 the full mark and both lines of type survive 16:9 and 1.4:1
     * alike, with margin to spare.
     *
     * IF A REPLACEMENT IMAGE ARRIVES, this is the constraint it has to meet: whatever must
     * stay readable has to sit inside the middle ~64% of the frame's width, because that is
     * all the narrowest box keeps. The original file is unmodified in the client's own
     * hands, so nothing here is lost.
     */
    image: '/images/case-seair-office.webp',
    /**
     * REPLACED, AND IT SETTLES THE OBJECTION THE OLD ONE CARRIED.
     *
     * What was here was stock: a hand holding a phone showing a dashboard, where the
     * dashboard belonged to a different agency and the figures on it were invented.
     * Readable, at full width, on a page that names a real client and quotes a real person
     * — decorative stock sitting among verified claims, which is exactly the pairing this
     * project has spent its time removing everywhere else. It carried three paragraphs of
     * caveat because it needed them. This one needs none of that: it is Seair's own mark
     * and their own tagline, so the cover finally says something true about the engagement.
     *
     * THE ALT DESCRIBES THE PICTURE, NOT THE PREMISES, and that distinction is deliberate.
     * The image reads as a meeting room at Seair's office, and it may well be one — but the
     * lighting is stylised enough that it could equally be a brand mockup, and this codebase
     * cannot tell which. Writing "Seair's Delhi office" would assert something nobody here
     * has checked; describing the logo, the glass and the skyline is true either way. If the
     * client confirms it is their room, this can say so.
     *
     * IT STILL OVERRIDES THE DERIVED FORM for the original reason, which has not changed:
     * without this field the alt would be "Seair Exim Solutions: They were getting found…",
     * which reads a headline to a screen reader instead of describing an image.
     *
     * THE CROP IS HANDLED AT THE FILE RATHER THAN HERE — see the note on `image` above for
     * why the frame was tightened and what a replacement has to satisfy. Both surfaces now
     * show the mark and both lines of type in full, so this description is true of what a
     * sighted reader actually sees on either one.
     */
    imageAlt:
      'The Seair Exim Solutions logo and its “Information for Business” tagline on a glass meeting-room partition, with a city skyline lit at dusk behind it.',
    services: ['seo', 'email-marketing'],

    /* ---- The client's written case study, reproduced -------------------------------
       Everything below is the supplied document, in its own order and its own words. It
       is transcribed rather than summarised: the four blocks that used to stand in for it
       (`problem`, `what`, `outcomes`, `quote`) are a card's worth of a 1,200-word
       argument, and the argument is the thing worth reading. Those four stay because the
       Work index and <FeaturedCase> read them. */
    facts: [
      { label: 'Client', value: 'Seair Exim Solutions' },
      { label: 'Sector', value: 'Trade data & research' },
      { label: 'Engagement', value: 'Apr–Sep 2025' },
      { label: 'Scope', value: 'Organic SEO, email' },
    ],
    intro: [
      'Most of the SEO problems we get called into are visibility problems. A company cannot be found, and the work is to make it findable. Seair was the opposite. The brand was established, the domain had history going back to 2009, and traffic was arriving. It just was not arriving from the one who wanted to buy trade data.',
      'That is a harder brief, because every interface-level metric looks acceptable. Sessions were fine, the site was indexed, nothing was obviously wrong. The only number that told the truth was the enquiry form, and it was quiet.',
    ],
    narrative: [
      {
        kind: 'section',
        heading: 'What two weeks of diagnostics turned up',
        body: [
          'We went through content, schema, technical SEO, breadcrumbs and the backlink profile before proposing anything. Three things came out of it.',
        ],
        points: [
          {
            heading: 'Inappropriate backlinks were created',
            body: [
              'This was the root cause, and it was not subtle once we pulled the profile apart. A large share of referring domains had nothing to do with trade, logistics, customs or commodities. Some of it was old directory and reciprocal-link activity of the kind that used to be standard practice and stopped being safe a decade ago. The result was a domain with a meaningful spam score and a stream of visitors who had no reason to want a shipment database.',
              'Those visitors still count as sessions. They just never convert, and they drag every behavioural signal down with them.',
            ],
          },
          {
            heading: 'The site attracted visitors but failed to retain them',
            body: [
              'We analysed the journey properly across entry points, path through the site and exit points, because we wanted to stop guessing about where people were dropping. The pattern was consistent: someone would land on a country or HS-code page, get exactly the one fact they came for, and leave. Nothing on the page invited a second step. Breadcrumbs were inconsistent enough that visitors lost their place in a site with thousands of data pages, and related pages were not linked to each other in any deliberate way.',
              'A researcher who wants Vietnam export data usually also wants the HS codes underneath it, the ports, and the comparable lane. Seair had all of that; the customers were just unable to find it.',
            ],
          },
          {
            heading: 'Lack of schema implementation in the required places',
            body: [
              'Seair publishes structured trade information — countries, codes, shipment fields, pricing tiers, FAQs. Almost none of it was marked up with schema, so a trade database and a blog post look the same to a crawler. That costs you rich results, and increasingly it costs you citation in AI-generated answers, which is where a growing share of research-stage queries now get resolved.',
            ],
          },
        ],
      },
      {
        kind: 'callout',
        label: 'The diagnosis',
        body: 'Seair did not have a traffic problem. It had a traffic quality problem caused by its link profile, compounded by a site that gave qualified visitors no reason to go deeper.',
      },
      {
        kind: 'section',
        heading: 'The roadmap',
        body: [
          'Three workstreams, sequenced so the cleanup happened before the acquisition push. There is no point earning good links into a profile that is still carrying bad ones.',
        ],
        table: {
          columns: ['Phase', 'What it covered'],
          rows: [
            [
              'Technical rectification',
              'Crawl and indexation fixes, breadcrumb rebuild across the data-page hierarchy, deliberate interlinking between related countries, HS codes, products and ports',
            ],
            [
              'Schema markup',
              'Structured data across organisation, dataset, breadcrumb and FAQ layers so the catalogue is machine-readable',
            ],
            [
              'Backlink remediation and rebuild',
              'Audit and disavow of toxic and irrelevant domains, then earned placement in trade, logistics and export-import publications',
            ],
          ],
        },
        outro:
          'Alongside it, we put visitor-journey tooling in place so the next round of decisions would be made on observed behaviour rather than assumption.',
      },
      {
        kind: 'section',
        heading: 'Email, built as a journey rather than a newsletter',
        body: [
          "Seair's existing email activity was broadcast — the same message to the whole list. We rewrote the content and mapped it to where someone actually was: a first-time researcher who had downloaded a sample needs something different from a subscriber three months into a plan.",
          'Two jobs, split cleanly. For new contacts, a sequence that moves someone from a single data lookup toward a demo. For existing clients, ongoing contact tied to data updates and trade developments relevant to their sector, which is the difference between a subscription that renews and one that quietly lapses.',
        ],
      },
      {
        kind: 'section',
        heading: 'What changed',
        body: [
          'Spam score came down 45%, and bounce rate improved as the irrelevant traffic fell away and the visitors who remained had somewhere to go next. Enquiries rose 30% — and the part that matters more, the enquiries arriving were from people the sales team could actually work with.',
          'The session count is a less flattering number than it was, because a chunk of what used to be counted was never real. That is the trade we recommended and it is the right one. A smaller number of qualified visitors beats a larger number of accidental ones every quarter.',
        ],
      },
      {
        kind: 'section',
        heading: 'What makes us different',
        /* TRANSCRIBED VERBATIM, AND THE FIRST SENTENCE CONTRADICTS THE REST.
           "We did run the backlink disavow earlier" against "in hindsight it should have
           started on day one" — the paragraph is an admission of a sequencing mistake, and
           the opening line says the opposite of the admission. It reads like "We should
           have run the backlink disavow earlier" lost a word.
           NOT SILENTLY CORRECTED: this is the client's own copy about their own judgement,
           and rewriting it would put a different claim in their mouth on the one page that
           exists to show how they think. Fix the sentence in the source document and
           replace this string. Flagged on the hand-back list. */
        body: [
          'We did run the backlink disavow earlier. We sequenced it inside the same phase as the technical work, and in hindsight it should have started on day one of implementation — the cleanup has a lag before it shows up in rankings, and starting it a fortnight sooner would have pulled the whole curve forward.',
        ],
      },
    ],
    closing: {
      heading: 'Same shape of problem?',
      body: 'If you have traffic that does not convert, a link profile you inherited from an older era of SEO, or a catalogue of genuinely useful data that search engines cannot read, the diagnostic is where we would start. Two weeks, no implementation, and you get the findings whether or not you continue with us.',
      ctaLabel: 'Book a diagnostic',
      ctaHref: '/contact',
      note: 'Two weeks. Content, schema, technical, links and journey. You keep the findings.',
    },
  },

  /* ================================================================================
     EXIMPEDIA — the second real study, supplied as eximpedia-case-study.html.

     TRANSCRIBED ON THE SAME TERMS AS SEAIR ABOVE: the client's document, in its own
     order and its own words, with no figure, claim, judgement or name altered. Its
     numbers carry no `verified: false` for the same reason Seair's do not — that flag
     marks a figure invented for the design comp, and applying it to confirmed client
     copy would put real work on the hand-back list.

     WHAT WAS CHANGED, AND IT IS ONLY PUNCTUATION. The source runs several lists and
     appositions together without the mark that separates them, which reads as a typo
     on a published page. Six edits, none of which touch a word:

       "records which includes buyers, suppliers, …, across"  -> em dashes around the list
       "four distinct groups, exporters and manufacturers…"   -> colon, then semicolons
       "no competitor could copy Eximpedia's own records"     -> colon before "Eximpedia's"
       "its own offer, a sample report for the researcher"    -> colon before the examples
       "the brand-building programme, it keeps Eximpedia"     -> colon, splice removed
       "doubled over 12 months and more usefully, the"        -> dashes around the aside

     WHAT WAS NOT CHANGED, THOUGH IT PROBABLY SHOULD BE IN THE SOURCE. Three things
     read as errors of MEANING, and meaning is not ours to edit — the same call made
     for the garbled sentence in Seair's "What makes us different":

       1. The heading "What we have done" sits over two admissions of what the team
          would do DIFFERENTLY next time. It looks like "What we would have done" or
          "What we'd do differently" lost a word. Left verbatim; flagged.
       2. "They need to be measured on a different zone" — "zone" is doing the work of
          "clock", "horizon" or "timescale". Left verbatim; flagged.
       3. The headline stat reads "60% — Non-brand search entries", but the paragraph
          under "What changed" attributes the same 60% to "sessions arriving on
          commodity- or country-specific pages". Those are two different measures. Both
          are reproduced as written; the client should say which one the figure is.

     NO COVER IMAGE WAS SUPPLIED, so `image` is absent and <CaseCover> draws its panel
     from the headline figure and the sector. That is the designed behaviour, not a gap
     to paper over with stock — see the note at the top of that component.

     ORDER MATTERS: whatever sits at index 0 is what the home page features. Seair keeps
     that slot because it already had it; moving Eximpedia above it is a swap of these
     two objects and nothing else.
     ================================================================================ */
  {
    slug: 'eximpedia-reaching-the-right-buyer',
    client: 'Eximpedia',
    /* Free text, like Seair's. The document's own fact row says "B2B SaaS · Trade
       intelligence" and that is what is used, middot and all — it is rendered inside
       "{client} · {sector}" on the page eyebrow and the Work card, which reads
       correctly because the two halves are a category and a specialism, not a list. */
    sector: 'B2B SaaS · Trade intelligence',
    title: 'The data was never the problem. The reach was.',
    problem:
      'A trade-intelligence platform good enough for enterprise research teams, found mostly by accident. Buyers who needed exactly this product were arriving late or not at all, and the traffic that did arrive was too broad to convert — one product being sold to four different buyers with a single message.',
    what: [
      'Spent the first two weeks on diagnosis rather than campaigns, and found one product addressed to four distinct buyer groups with one undifferentiated message.',
      'Rebuilt search and content around the one asset no competitor could copy: Eximpedia’s own shipment records, in a repeatable answer-first format with sourced tables, explicit HS codes and named bylines.',
      'Rebuilt Google Ads around commodity and country-pair intent, ran LinkedIn against role and firm type, and used Meta for retargeting and the owner-operator exporter segment.',
      'Gave each segment its own landing destination and its own offer, so the click and the page it landed on agreed with each other.',
      'Built email as infrastructure rather than a newsletter: trial-to-paid onboarding, lapsed-account re-engagement, and a monthly trade-movement brief that holds customers between renewal decisions.',
    ],
    /**
     * FOUR FIGURES, WHERE SEAIR HAS THREE. The detail page's outcome grid was
     * `sm:grid-cols-3`, which would have left the fourth card alone on a second row;
     * it now sizes its own columns, so three and four both come out even. See the
     * note at that grid in app/work/[slug]/page.tsx.
     *
     * The signs are the site's, not the source's, and they are not decoration. The
     * document prints "40%" and "-20%" as bare numbers, which beside a label like
     * "Qualified demo requests" could be read as a share rather than a change. "+40%"
     * and "−20%" say which, and match how Seair's "+30%" and "−45%" already read. The
     * 60% is deliberately left unsigned because it IS a share — 60% of entries, not a
     * 60% rise — which is the distinction the signs exist to make. Minus signs are
     * U+2212, not a hyphen, so they align with the digits.
     */
    outcomes: [
      { value: '2×', label: 'website visitors in 12 months' },
      { value: '+40%', label: 'qualified demo requests' },
      { value: '−20%', label: 'cost per qualified lead' },
      { value: '60%', label: 'non-brand search entries' },
    ],
    quote: {
      text: 'Over the past year, we’ve seen a clear improvement in our online performance. The website is attracting more relevant visitors, especially through product and country-specific pages. We’re also getting more qualified leads at a lower cost.',
      author: 'Rohit Dass',
      role: 'Eximpedia',
      /* Set even though this study is not currently featured — <FeaturedCase> shows
         cases[0], which is Seair. Reordering these two is meant to be a swap of two
         objects and nothing else (see the note at the top of this file), and that stays
         true only if the study being promoted already carries everything the card reads. */
      avatar: PORTRAITS.rohitDass,
    },
    /**
     * FOUR SERVICES, AND ONE DELIBERATELY LEFT OFF.
     *
     * These slugs decide which service pages show this study as proof, so each one is a
     * claim that the engagement produced evidence for that service. Search, content,
     * paid and email all have described work and attributed outcomes in the document.
     *
     * `ai-search-aeo` is NOT here, though the document argues for it — the content
     * format is explicitly built to be citable by answer engines ("structured, sourced,
     * attributable content is the format AI search reaches for"). That is a description
     * of method, not a measured result: no figure in the study is attributed to AI
     * search. Proof blocks should carry evidence, so it waits for a number.
     */
    services: ['seo', 'content-marketing', 'paid-advertising', 'email-marketing'],

    facts: [
      { label: 'Client', value: 'Eximpedia' },
      { label: 'Sector', value: 'B2B SaaS · Trade intelligence' },
      { label: 'Market', value: 'Singapore, global reach' },
      { label: 'Engagement', value: '12-month growth retainer' },
      { label: 'Practices', value: 'Search · Paid · Content · Lifecycle' },
    ],
    intro: [
      'Eximpedia sells access to verified import–export shipment records — buyers, suppliers, HS codes, ports, volumes, unit values — across more than two hundred countries, through a dashboard built for people who make sourcing and market-entry decisions for a living.',
      'The product had already earned its way into research teams at large consultancies and financial institutions. That is a hard bar to clear, and it had been cleared. What had not been solved was distribution. Buyers who needed exactly this platform were finding it late, or not at all, and the traffic that did arrive was too broad to convert.',
      'The brief we were given was short: expand outreach to the right customer base, and reach global markets, quickly.',
    ],
    narrative: [
      {
        kind: 'section',
        heading: 'What we found when we looked',
        body: ['We spent the first two weeks on diagnosis rather than campaigns. Three things surfaced.'],
        points: [
          {
            heading: 'One product, four buyers, one message',
            body: [
              'Eximpedia serves at least four distinct groups: exporters and manufacturers hunting buyers; logistics providers; financial institutions modelling supply-chain risk; and consulting firms building market reports. Each buys for a different reason, on a different cycle, with a different definition of value. The site addressed them with a single message aimed at everyone, which in practice landed with no one strongly enough to convert.',
            ],
          },
          {
            heading: 'Content that could have been written by any competitor',
            body: [
              'The blog covered the right topics and ranked for very little. The reason was structural: the posts read like general trade explainers. They did not use the one asset no competitor could copy: Eximpedia’s own shipment records. A hundred near-identical articles about coffee exports already exist. One with real, cited, multi-year figures attached does not.',
            ],
          },
          {
            heading: 'Paid spend without a segment behind it',
            body: [
              'Advertising was reaching volume, not fit. Without a mapping from segment to channel to offer, spend optimised toward the cheapest click rather than the most valuable conversation.',
            ],
          },
        ],
      },
      {
        kind: 'callout',
        label: 'The working thesis',
        body: 'A trade-data platform does not have a traffic problem. It has a specificity problem. Every buyer arrives with a named commodity, a named country pair, or a named HS code in their head. Meet them at that level of specificity and the conversion work is already half done.',
      },
      {
        kind: 'section',
        heading: 'The plan',
        body: [
          'Five channels, run as one system off a single segment map, not five agencies pulling in five directions. Every channel had one job, and the jobs were sequenced.',
        ],
        table: {
          columns: ['Channel', 'Job it was hired to do'],
          rows: [
            [
              'Search & content',
              'Own the specific, high-intent queries: commodity + country + data. Compound over months, cost nothing per click.',
            ],
            [
              'Google Ads',
              'Cover the same intent immediately while the content compounds. Buy the terms we had not yet earned.',
            ],
            [
              'LinkedIn',
              'Reach the four segments by role and firm type — the only channel where “trade analyst at a logistics firm” is directly addressable.',
            ],
            [
              'Meta',
              'Cheap reach for retargeting and for the owner-operator exporter segment, which does not live on LinkedIn.',
            ],
            [
              'Email',
              'Convert the traffic the other four channels created, and hold the customers already won.',
            ],
          ],
        },
      },
      {
        kind: 'section',
        heading: 'What we actually did',
        /* No lead paragraph in the source — this heading goes straight to its three
           named workstreams. An empty array rather than an invented sentence; the
           renderer maps over it and produces nothing. */
        body: [],
        points: [
          {
            heading: 'Search and content, rebuilt around proprietary data',
            body: [
              'We replaced generic explainers with a repeatable format: an answer-first opening containing the headline figure, a findings list near the top, headers that carry the finding rather than a bare label, at least two data tables with source and period captions, HS codes stated explicitly with their product description, and a numbered methodology note before the FAQs. Every post is bylined by a named person with a real role.',
              'That last set of details is not house style for its own sake. It is what makes a page mentionable by an answer engine deciding which source to cite. Structured, sourced, attributable content is the format AI search reaches for.',
            ],
          },
          {
            heading: 'Paid, mapped segment by segment',
            body: [
              'Google campaigns were rebuilt around commodity and country-pair intent rather than broad category terms. LinkedIn ran segment-specific creative against role and firm-type audiences. Meta carried retargeting and the exporter segment. Each segment had its own landing destination and its own offer: a sample report for the researcher, a live dashboard walkthrough for the analyst.',
            ],
          },
          {
            heading: 'Email as infrastructure, not a newsletter',
            body: [
              'Three sequences: a trial-to-paid onboarding flow, a re-engagement flow for lapsed accounts, and a monthly trade-movement brief that gives existing subscribers a reason to open the dashboard. The brief doubles as the brand-building programme: it keeps Eximpedia in front of customers between renewal decisions, which is the moment retention is actually won.',
            ],
          },
        ],
      },
      {
        kind: 'section',
        heading: 'What changed',
        body: [
          'Website visitors doubled over 12 months — and, more usefully, the composition of that traffic changed. 60% of sessions now arrive on commodity- or country-specific pages, which is traffic that arrives already knowing what it wants.',
          'Qualified demo requests increased by 40%. Cost per qualified lead fell 20% as paid spend shifted from broad terms to segment-mapped campaigns.',
        ],
      },
      {
        kind: 'section',
        /* TRANSCRIBED VERBATIM, AND THE HEADING DOES NOT MATCH ITS OWN CONTENT.
           What follows are two admissions of what the team would do DIFFERENTLY on the
           next engagement — the sequencing of paid against content, and the weighting of
           the longest-cycle segment. "What we have done" reads like "What we would have
           done" lost a word. Not silently retitled: a heading is the client's framing of
           their own judgement, and rewriting it would put a different stance in their
           mouth on the one page that exists to show how they think. Same call as Seair's
           "What makes us different" above. Fix it in the source document and replace this
           string. Flagged on the hand-back list.

           "measured on a different zone" is left alone for the same reason, though
           "clock" or "timescale" is plainly what is meant. */
        heading: 'What we have done',
        body: [
          'We ran paid and content in parallel from week three. In hindsight, paid should have led by four to six weeks on its own. Search queries that convert on Google Ads are the cheapest possible research for deciding which content to write next, and we spent the first month writing on informed guesses instead of on paid conversion data we could have had.',
          'We also underweighted the financial-institution segment early. It has the longest sales cycle of the four and the highest contract value, and long-cycle segments look like failures on a 30-day dashboard. They need to be measured on a different zone, and we should have set that expectation at the start rather than defending it at month two.',
        ],
      },
    ],
    closing: {
      heading: 'Same problem, different product?',
      body: 'If you have something good that the right people cannot find, send us a brief (or half of one). You get scope, timeline and a number back within three working days.',
      ctaLabel: 'Start a project',
      ctaHref: '/contact',
      /* No `note`. Seair's condenses a line the source document supplies; this one
         supplies nothing beyond the CTA label, and the field is optional rather than
         somewhere to write a strapline the client did not. */
    },
  },
]

/**
 * EVERY TESTIMONIAL HERE IS REAL, AND TWO OF THE SIX ARE PUBLISHABLE TODAY.
 *
 * Ajit Kumar's and Rohit Dass's are the clients' own words, from the Seair Exim and
 * Eximpedia case studies, published with those documents' review and permission — the same
 * standing as the studies themselves in CASE_STUDIES above. They are the two that render.
 *
 * THREE MORE HAVE SINCE BEEN NAMED and now publish alongside them: Ranjeev Chandra at
 * Tracks 2 Curtains, Suraj Kunar at 4th Generation Resources and Vinod Sukhija at Decor
 * Masters. Their quotes were supplied earlier as fill-in-the-blank drafts and the client
 * has since sent the people. Ranjeev Chandra's job title is still open — the card renders
 * without one rather than waiting, since a name is what makes a testimonial attributable
 * and a title is decoration on top of it.
 *
 * ALL SIX NOW PUBLISH. The fourth draft, Proffer IT Consultancy's, is Sushant Acharya's —
 * the client sent that name against "profit.in", which matches no company here, and
 * confirmed the two are the same before it was written down.
 *
 * TWO FIELDS REMAIN OPEN AND NEITHER BLOCKS A CARD: Ranjeev Chandra's job title, and the
 * figure removed from Sushant Acharya's quote. `npm run check:todos` counts the first; the
 * second is recorded verbatim at that entry.
 *
 * A FIFTH NAME ARRIVED WITH NO QUOTE TO ATTACH IT TO — "Apricus premium solar — Vipin
 * Sachdeva". There is no Apricus testimonial in this file, and a name is not a testimonial:
 * without wording there is nothing to publish. It is noted here so the name is not lost the
 * next time this list is read.
 *
 * THE SIX PLACEHOLDERS ARE GONE, deleted at the client's request. Sarah Jenkins, Marcus
 * Thorne, David Chen, Priya Raman, Tom Alvarez and Elena Fischer were invented people at
 * invented companies, carried over from the design comp — and four of those companies
 * (CloudScale, Veloce, DataLink, Northwind) are the same fabricated names whose case
 * studies were deleted for the same reason. A quote is a statement a named person is said
 * to have made, which makes an invented one the least defensible placeholder on the site.
 *
 * NEITHER CARRIES A `rating`, AND THAT IS THE POINT OF THE FIELD BEING OPTIONAL. These are
 * client statements, not scores off a review platform — there is no five-star form behind
 * either of them. An absent score renders no stars rather than a flattering default, so
 * with the placeholders gone the carousel now shows no stars at all.
 *
 * WHICH LEAVES THE HERO'S "5.0 FROM 40+ CLIENTS" WITH NOTHING BEHIND IT ON THIS PAGE. It
 * was already `verified: false` and already the client's own call to restore — see
 * HERO_PROOF in content/site.ts — but it used to sit above six five-star cards, and now it
 * sits above two unrated ones. The claim is not contradicted; it is simply unevidenced, on
 * a page that no longer offers anything resembling forty reviews. Worth settling before
 * launch, either with the real review platform's figure or by dropping the line.
 *
 * TWO OF THEM NOW CARRY A PHOTOGRAPH, AND ONLY BECAUSE IT IS THEIRS. This field sat empty
 * on every entry for a long time: the seven avatar files that came with the design comp are
 * stock faces, and attaching one to a real named person would have presented a stranger as
 * them. The client has since sent Ajit Kumar's and Rohit Dass's own pictures, which is the
 * one thing that ever made the field usable. The other four have none, and <Testimonials>
 * guards on `t.avatar`, so those cards render as a name and a company — no silhouette, no
 * borrowed face, no gap where something obviously belongs.
 *
 * TWO IS BELOW WHAT A CAROUSEL CAN CARRY, and <Testimonials> handles that rather than this
 * file working around it: the section lays out a grid until there are more testimonials
 * than fit across it, because three cards in a three-up view is a carousel with nothing to
 * slide — and two in a three-up view is worse than that, since the loop would put the same
 * person on screen twice. Add a fourth real one and the carousel comes back on its own.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Zefract gave us a complete roadmap to address the issues with our organic ranking, and the team is working through it. It has been great working with them.',
    author: 'Ajit Kumar',
    /* The source names the person and the company and gives no job title. Left as the
       company rather than guessing at one — <Testimonials> renders "{role}, {company}",
       so inventing a title here would put a fabricated seniority beside a real name. */
    role: 'Client',
    company: 'Seair Exim Solutions',
    /* HIS OWN PHOTOGRAPH, supplied by the client — which is what makes this field
       usable at all. It stood empty for a long time and the note here explained why:
       the seven avatar files that came with the design comp are stock faces, and
       attaching one to a real named person would have presented a stranger as him.
       That objection dies the moment the picture is actually of the person, and this
       one is. Cropped square around the head and shoulders out of a 569x707 portrait,
       because the card renders a 56px rounded square and a centred crop of a tall
       photograph would have filled most of it with suit. */
    avatar: PORTRAITS.ajitKumar,
  },
  {
    /* The second real one, from the Eximpedia case study. Same treatment as Ajit
       Kumar's directly above: no `rating`, because it is a client statement rather
       than a score off a review platform and there is no five-star form behind it —
       and, now, his own photograph, for the same reason Ajit's has one. */
    quote:
      'Over the past year, we’ve seen a clear improvement in our online performance. The website is attracting more relevant visitors, especially through product and country-specific pages. We’re also getting more qualified leads at a lower cost.',
    author: 'Rohit Dass',
    /* The source names the person and the company and gives no job title, exactly as
       Seair's does. Left as the company rather than inventing a seniority. */
    role: 'Client',
    company: 'Eximpedia',
    /* Supplied square already, so nothing was cropped — resized and converted only. */
    avatar: PORTRAITS.rohitDass,
  },

  /* ================================================================================
     THE FOUR BELOW ARE SUPPLIED BUT NOT YET ATTRIBUTABLE, and that is why none of
     them renders in production. Each arrived as a fill-in-the-blank draft — the
     wording is written, the person is not:

         "— [Name], [Director], 4th Generation Resources"

     `author` is therefore a placeholder on all four. <Testimonials> drops any entry
     whose author is unresolved before it reaches a public page, and shows it as a
     visible stub in development, so these are in the content layer, listed by
     `npm run check:todos`, and invisible to a visitor until a real name lands.

     WHY A NAME IS NOT A DETAIL TO FILL IN LATER. A testimonial is a statement a
     named person is said to have made. Published without one it is an anonymous
     claim of praise, which is worth less than nothing; published with an invented
     one it is the thing six placeholder testimonials were just deleted for being.
     There is no third option, so the gate holds until the client supplies four
     names.

     CLAUSE 15 OF THE PUBLISHED TERMS IS THE OTHER REASON. It commits, in writing on
     this site, that "quotes are approved by the named individual attributed to
     them" and that a revised wording "goes back to the same person for sign-off".
     These read as drafts written FOR those clients rather than words they have sent
     us, so each needs that approval on record before it goes live — the site would
     otherwise be breaking a promise it makes two pages away.

     ONE SUBSTITUTION WAS MADE AND NOTHING ELSE: "[Your Agency]" is "Zefract", which
     is the one blank in these templates whose answer is not in doubt. Apostrophes
     are typographic, as everywhere else in this file. The bracketed roles are
     transcribed as the values they contain, except where the source offers a choice
     — see Tracks 2 Curtains below.
     ================================================================================ */
  {
    quote:
      'Before working with Zefract, our website barely surfaced when hospitals searched for cubicle tracks or curtain systems. Now we’re getting genuine enquiries from procurement and facility teams, and the site finally reflects the quality of what we actually manufacture. What stood out was that they understood healthcare buyers — not just keywords.',
    author: 'Ranjeev Chandra',
    /* STILL OPEN, and the only thing on this card that is. The draft gives
       "[Sales/Marketing Head]", which is two job titles with a slash between them
       rather than one title anyone holds. Left unresolved rather than picked: a role
       sits directly under a person's name, and choosing which half of it is his is
       the same kind of invention as choosing the name would have been.
       The card publishes without it — <Testimonials> drops the role and its comma
       when it is unresolved, so this reads "Ranjeev Chandra / Tracks 2 Curtains"
       until the title arrives. */
    role: TODO('job title of Ranjeev Chandra at Tracks 2 Curtains'),
    company: 'Tracks 2 Curtains',
  },
  {
    quote:
      'Almost all our business used to come through references — we’d never really invested in digital. Zefract gave us a proper online presence and started bringing in enquiries for facility and security contracts we’d never have reached otherwise. Honestly, what I valued most was how transparent they were about what would and wouldn’t work for a manpower company.',
    /* TRANSCRIBED EXACTLY AS SUPPLIED, INCLUDING THE SURNAME. "Kunar" is one letter
       from "Kumar", which is common enough that the eye corrects it automatically —
       and correcting someone's name on their behalf is not a typo fix, it is
       publishing a different person. Worth one confirmation before launch; changed
       only if the client says so. */
    author: 'Suraj Kunar',
    role: 'Director',
    company: '4th Generation Resources',
  },
  {
    /* THE FIGURE IS GONE FROM THIS QUOTE, and it is the only edit to any of the four.
       The source reads:

         "Leads have gone up [by X% / to X per month], but the bigger win is that
          prospects take us seriously before the first call even happens."

       That bracket is an unfilled statistic inside a sentence a named person will be
       said to have spoken. Three things could be done with it and only one is safe:
       inventing a number is fabrication, and leaving the brackets in the string is a
       trap — the day someone fills in the name, the site publishes the literal text
       "[by X% / to X per month]" in a client's mouth. So the clause is removed and
       recorded here, and the sentence still reads correctly without it.

       PUT IT BACK IF THE NUMBER ARRIVES. Clause 15 of the terms says "we publish only
       verified figures… with the measurement window stated", so a figure here needs
       both the number and the period it covers — and, being a change to the wording,
       the reviewer's sign-off on the revised sentence. */
    quote:
      'For an IT consulting firm, how we look online matters as much as how we deliver. Zefract sharpened our messaging, improved our search visibility, and helped us present our services at the level of the clients we want to work with. Leads have gone up, but the bigger win is that prospects take us seriously before the first call even happens.',
    /* The client sent this name against "profit.in", which matches no company in this
       file — Proffer IT reads as "proffer.it", a keystroke from it, and this was the
       only quote left unnamed. Confirmed with the client as the same company rather
       than assumed: a testimonial is a statement a named person is said to have made,
       so inferring the match would have put his name on words he may never have said.
       Asked, answered, then written. */
    author: 'Sushant Acharya',
    role: 'Head of Marketing',
    /* The attribution line says "Proffer IT Consultancy" where the heading above it
       says "Proffer"; the fuller form is used, since the card prints the company on
       its own with no surrounding context to explain it. */
    company: 'Proffer IT Consultancy',
  },
  {
    quote:
      'People need to see quality before they trust it, and Zefract made our brand look exactly that online. The website and our social media now feel premium and consistent with the brands we represent. We’ve seen a real jump in calls and walk-in enquiries from people asking about specific products they discovered through us online.',
    author: 'Vinod Sukhija',
    role: 'Proprietor',
    company: 'Decor Masters',
  },
]

export const FAQS: Faq[] = [
  {
    question: 'What does a project cost?',
    answer:
      'A number, not a shrug: after the intro call you get a fixed quote per phase, based on page count, integrations and content readiness. You always know what the next invoice is before it exists.',
  },
  {
    question: "How long until we're live?",
    answer:
      'Six weeks is our median for a launch set: home, services, about, contact and two case studies. The remaining pages phase in after go-live, so you are earning while we keep building.',
  },
  {
    question: 'Which platform will you recommend?',
    answer:
      'Whichever one your team can maintain without us. We weigh performance, editing experience, SEO and running cost, then justify the pick in writing. We are not attached to a stack, we are attached to you shipping.',
  },
  {
    question: 'Can we edit everything ourselves afterwards?',
    answer:
      'Yes, and we treat that as a requirement. Pages, case studies, posts and team bios are all editable without code. Handover includes a training walkthrough and a short written guide.',
  },
  {
    question: 'Do you take on AI work with security requirements?',
    answer:
      'That is most of our AI work. Everything ships with access controls, approval gates and an audit log, so your security team reviews a system, not a surprise.',
  },
]

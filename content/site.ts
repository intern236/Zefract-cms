import { TODO } from '@/lib/todo'

export const SITE = {
  name: 'Zefract',
  legalName: 'Zefract Tech Pvt Ltd',
  tagline: 'Engineering, Design, AI, Cloud and Growth. One Team.',
  description:
    'One accountable team across engineering, design, AI, cloud and marketing. We build digital products, then we make them grow.',
  /**
   * The site's canonical origin, and the ONLY place it is written down.
   *
   * THE APEX IS CANONICAL — https://zefract.com, no www. Nothing reads this constant
   * directly except lib/url.ts, which normalises it and builds every absolute URL the
   * site publishes: canonical tags, the sitemap, robots.txt, llms.txt, the OG objects
   * and every JSON-LD block. Changing hosts is changing this line.
   *
   * NO TRAILING SLASH. `absoluteUrl('/')` has to render the bare origin to match what
   * Next emits for `alternates: { canonical: '/' }` — the derivation is documented in
   * lib/url.ts against Next's own resolver. One is stripped defensively there, so a
   * slash typed here is harmless rather than doubling up on every path.
   *
   * WWW MUST REDIRECT TO THE APEX, and both halves of that are now in the repository:
   * next.config.ts carries a host-scoped 301 from www to here, alongside a 301 from http
   * to https on this host. Those rules are belt and
   * braces, NOT the whole control — the hosting still has to agree with it. On Netlify
   * the primary domain must be set to zefract.com; leave it on www and Netlify will
   * redirect apex -> www while the app redirects www -> apex, which is a loop. The two
   * have to point the same way, and this is the way.
   */
  url: 'https://zefract.com',
  locale: 'en',
} as const

/**
 * The one place contact details live. Every page reads from here — footer, contact page, CTA
 * band, and the Organization JSON-LD in lib/schema.tsx — so a change here reaches all of them.
 *
 * Email, phone and WhatsApp were all confirmed by the owner. The note that used to sit here —
 * that the email was an unverified default, that the phone blocked the contact page, and that the
 * WhatsApp number looked suspiciously like the example in the question that asked for it — is gone
 * with the placeholders it described. Only the address is still outstanding.
 *
 * Phone and WhatsApp are the SAME line, supplied by the client. Kept as two fields rather than
 * one because they are used differently: `phone` becomes a `tel:` link, `whatsapp` is flattened
 * to digits for a wa.me URL, and the day the two diverge nothing needs restructuring.
 *
 * Written in the international format with the country code, because both a `tel:` link and
 * wa.me need it — a bare 10-digit number dials only from inside India and produces a broken
 * WhatsApp link everywhere. The spacing is for reading; `whatsappHref` strips every non-digit.
 */
export const CONTACT = {
  email: 'hello@zefract.com',
  phone: '+91 93114 41557',
  whatsapp: '+91 93114 41557',
  whatsappPrefill: "Hi Zefract, I'd like to talk about a project.",
  /* Still outstanding. Gates the map embed and the LocalBusiness schema — see the hand-back
     list. `npm run check:todos` reports it. */
  address: TODO('office address'),
  responseTime: 'We reply to every enquiry within one business day.',
} as const

/**
 * Google Tag Manager container, supplied by the client with the SEO brief.
 *
 * Read by <GoogleTagManager /> in components/analytics/google-tag-manager.tsx, which is the
 * only place it is used. Kept here so the ID sits with the rest of the site-wide constants
 * rather than being buried in a component, and so swapping containers is a one-line change.
 */
export const ANALYTICS = {
  gtmId: 'GTM-KX4R5W99',
  /**
   * Google Search Console ownership token, rendered as
   * `<meta name="google-site-verification">` by the root layout.
   *
   * HERE RATHER THAN IN A DASHBOARD VARIABLE, for exactly the reason gtmId is:
   * this value is public by definition. It ships in the `<head>` of every page
   * of every site that uses one, so there is nothing to protect, and an unset
   * variable in a hosting dashboard is the usual reason a tag silently stops
   * appearing after a deploy. GOOGLE_SITE_VERIFICATION still overrides it (see
   * app/layout.tsx), so a second property can be verified without a code change.
   *
   * IT CANNOT BE DONE THROUGH GTM ON THIS SITE, which is why the meta tag is
   * needed at all. Search Console's Google Tag Manager method reads the
   * container snippet from the page itself, and the half of GTM that survives
   * without JavaScript is an `<iframe>` in the body (see
   * components/analytics/google-tag-manager.tsx) — verification does not look
   * inside a frame, and it requires the token in the document head before the
   * body opens. The meta tag is the direct method and does not depend on GTM
   * loading, on consent, or on JavaScript running at all.
   *
   * DO NOT REMOVE IT AFTER VERIFICATION SUCCEEDS. Search Console re-checks the
   * token periodically and revokes access when it disappears, which takes the
   * property's history with it.
   */
  googleSiteVerification: 'pYlrW38hgtc56ttJ90iJlcsZ6MSMPGhZkTMl_6VLO78',
} as const

/**
 * The cookie banner's words. The mechanism is in lib/consent.ts; this is what it says.
 *
 * IT EXISTS BECAUSE THE PRIVACY POLICY ALREADY SAID IT DID. What stood here until now was
 * a placeholder recording a gap: the container above loaded on every page for every
 * visitor, immediately, with nothing in front of it, while section 05 of the policy the
 * client supplied stated the opposite in four separate sentences — that non-essential
 * cookies are off by default, that consent is collected on first visit, that it can be
 * withdrawn from a "Cookie settings" link in the footer, and that Global Privacy Control
 * signals are honoured. A policy describing controls a site does not have is not a missing
 * feature; it is an untrue statement in the one document a regulator reads first.
 *
 * All four are now real, and each has an owner: the default-denied Consent Mode signals in
 * components/analytics/google-tag-manager.tsx, the banner in
 * components/layout/consent-banner.tsx, the withdrawal control in
 * components/layout/cookie-settings-button.tsx, and the GPC check in lib/consent.ts.
 *
 * THE COPY IS HERE RATHER THAN IN THE COMPONENT because these sentences make the same
 * claims section 05 does, and the two have to be edited by someone who can see both. Change
 * what the site actually stores and this copy is wrong; change this copy and section 05 may
 * be. There is no version of that which is safe to leave buried in a JSX literal.
 *
 * BOTH ANSWERS ARE OFFERED WITH EQUAL WEIGHT, which is a legal constraint and not a taste
 * one. Making refusal harder to find or harder to click than acceptance is the specific
 * dark pattern the EDPB names in its deceptive-design guidelines and the one enforcement
 * actions have repeatedly turned on. The two buttons are the same size, side by side, in
 * that order. Anyone restyling this should keep it that way.
 */
export const CONSENT = {
  heading: 'Cookies on this site',
  /**
   * TWO LINES, AND THAT IS THE BRIEF. This sits in a card in the corner of every page, and
   * a notice nobody reads is worse than a short one that leaves detail out: the detail is
   * a click away in section 05 of the privacy policy, which the card links to and which is
   * where the full cookie table actually lives. An earlier draft here named what the
   * analytics tell us and how campaigns are attributed, ran to four lines on a phone, and
   * made the panel tall enough to read as an advert.
   *
   * WHAT IT MUST STILL SAY, however short it gets: that necessary cookies are not optional,
   * that the rest need permission, and roughly what the rest are for. Drop any of those
   * three and the banner stops being informed consent.
   *
   * No em dashes: the house rule for published copy. Comments are free to use them.
   */
  body: 'Necessary cookies keep the site running. Analytics and advertising cookies are set only if you allow them.',
  /* Rendered in the SAME paragraph as the body, in a dimmer colour, followed by the policy
     link. Three stacked text blocks were most of what made the first version read as a
     panel rather than a notice; one paragraph with two weights in it reads as a sentence.
     The footer route is named because the policy names it, and a promise a visitor cannot
     find is the same as one that was never made. */
  withdrawal: 'You can change this any time from Cookie settings in the footer.',
  accept: 'Accept all',
  reject: 'Reject all',
  cancel: 'Cancel',
  /* Shown only when the banner has been reopened from the footer, so the visitor can see
     what they are changing rather than guessing at it. */
  current: {
    granted: 'Right now you allow analytics and advertising cookies.',
    denied: 'Right now only necessary cookies are on.',
    /* GPC is a browser-level instruction rather than a choice made on this site, so it is
       described as one. See globalPrivacyControl() in lib/consent.ts. */
    gpc: 'Your browser is sending a Global Privacy Control signal, so non-essential cookies are off.',
  },
  policyLabel: 'Privacy policy',
  policyHref: '/privacy',
  /* The footer control, and the accessible name the banner is announced by. */
  settingsLabel: 'Cookie settings',
  regionLabel: 'Cookie consent',
} as const

/**
 * The brand's own profiles elsewhere, supplied by the client.
 *
 * TWO CONSUMERS NOW, WHICH IS WHY THESE ARE OBJECTS AND NOT BARE URLS. They still feed
 * `sameAs` on the Organization JSON-LD in lib/schema.tsx — that is how a search engine is
 * told this site and these accounts are the same entity rather than several companies with
 * a similar name, which is what lets the profiles reinforce the site's authority instead of
 * competing with it for the brand query. They are now ALSO rendered as the footer's icon
 * row, and a row of icons needs two things a URL string does not carry: which glyph to draw
 * and what to call the link for someone who cannot see it.
 *
 * `platform` IS THE GLYPH KEY, and it is a closed union rather than free text: a typo in it
 * is a compile error at the footer's lookup rather than a missing icon nobody notices. The
 * glyphs themselves live in components/ui/social-icons.tsx, because a brand mark is markup,
 * and this file is deliberately data with no React in it — the same rule PRACTICES.nodes and
 * COMPARE.rows already follow with their `icon` keys.
 *
 * `label` IS THE PLATFORM'S OWN NAME, not a sentence. The footer builds "Zefract on
 * LinkedIn" around it for the accessible name, so writing that phrase here would produce
 * "Zefract on Zefract on LinkedIn" the day someone reuses the field.
 *
 * FACEBOOK AND INSTAGRAM ARE NEW, supplied by the client alongside the three that were
 * already here. Both are live accounts on the client's word rather than anything this
 * codebase can verify — worth a click before launch, since a `sameAs` pointing at a profile
 * that does not exist is a claim about identity that a search engine will check.
 *
 * Order is not meaningful to a consumer of the schema and IS meaningful in the footer, where
 * it is the reading order of the row. Alphabetical by platform serves both: it gives a new
 * entry an obvious place to go, and it is a rule rather than a ranking, so nobody has to
 * argue about which network deserves to be first.
 */
export const SOCIAL = [
  { platform: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/zefract' },
  { platform: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/zefract_tech/' },
  { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/zefract/' },
  { platform: 'x', label: 'X', url: 'https://x.com/zefract_tech' },
  { platform: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@zefract' },
] as const

/** The platforms above, as a type — what components/ui/social-icons.tsx keys its glyphs by. */
export type SocialPlatform = (typeof SOCIAL)[number]['platform']

export const NAV = [
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

export const FOOTER_NAV = [
  {
    heading: 'Services',
    links: [
      { label: 'Engineering', href: '/services/engineering' },
      { label: 'Experience & Design', href: '/services/experience-and-design' },
      { label: 'AI & Automation', href: '/services/ai-and-automation' },
      { label: 'Cloud, Data & Security', href: '/services/cloud-data-and-security' },
      { label: 'Marketing & Growth', href: '/services/marketing-and-growth' },
      { label: 'Managed Services', href: '/services/managed-services' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Work', href: '/work' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
] as const

/**
 * Hero proof line. These numbers came from the approved design and are NOT
 * client-verified — the brief names "unverifiable stats" as an anti-goal, and both
 * entries below are on the hand-back list via `verified: false`.
 *
 * THE STAR RATING IS BACK, AT THE CLIENT'S REQUEST, and "100+ launches since 2019" is
 * out in its place. Both were asked for in one instruction: the rating had been removed
 * earlier — the whole entry, not just the glyphs, because `5.0` on its own IS the rating
 * and a score with nothing saying what it is out of reads as broken — and this restores
 * it exactly as it was, alongside the glyph span in hero.tsx that renders it.
 *
 * `stars` IS AN EXPLICIT FLAG, NOT A STRING TEST. The original rendered the glyphs for
 * whichever entry's label happened to contain the word "clients", which meant a future
 * line like "300+ clients served" would have silently sprouted a five-star rating it
 * never claimed. The flag says what it means and nothing else can trip it.
 *
 * IT RE-PINS THE PLACEHOLDER TESTIMONIAL RATINGS. A 5.0 average stated here cannot sit
 * on the same site as a 4.5 in the carousel, so every entry in TESTIMONIALS that carries
 * a score has to stay at 5 while this line exists — see the note there. The two real
 * testimonials carry no score at all and are unaffected.
 */
export const HERO_PROOF: {
  value: string
  label: string
  /** Renders ★★★★★ before the value. Only ever true for an actual rating. */
  stars?: boolean
  verified: boolean
}[] = [
  { value: '5.0', label: 'from 40+ clients', stars: true, verified: false },
  { value: '6 wks', label: 'median to production', verified: false },
]

/**
 * The clients whose logos run in the strip between the hero and the proof bento.
 *
 * REAL COMPANIES, REPLACING EIGHT INVENTED ONES. What was here was a list of wordmarks from
 * the design comp — Northwind, CLOUDSCALE, meridian, VELOCE, Cobalt&Co, DATALINK, bluepeak,
 * HALE+CO — none of them customers of this business, and three of them (CloudScale, Veloce,
 * DataLink) the very firms whose placeholder case studies had already been deleted for
 * being fabricated. The strip named as clients three companies the site had decided it
 * could not claim. That is now seven businesses that exist, each linked to its own website
 * so a reader can check.
 *
 * THE LOGOS WERE TAKEN FROM EACH COMPANY'S OWN SITE, NOT SUPPLIED BY THEM. That distinction
 * matters and is not a technical one:
 *
 *   — Clause 15 of this site's published terms says logos require the client's PRIOR
 *     WRITTEN CONSENT. Scraping a public asset is not consent. Every one of these needs a
 *     yes on record before launch, and that is a real task, not a formality.
 *   — They are the marks as each site publishes them today. A company that later refreshes
 *     its identity will not tell us, so these go stale silently. Supplied artwork, asked for
 *     once, is the version that does not.
 *
 * TWO WERE MODIFIED TO BE VISIBLE AT ALL, and both are recorded because altering someone's
 * trade mark is not a free action:
 *
 *   — EXIMPEDIA publishes only a white mark, drawn for its own dark header; on this page it
 *     rendered as nothing. The white fills were swapped for #231F20 — a colour already
 *     inside their own artwork, so it is their ink and not a shade invented here. It is the
 *     positive version of a mark they only publish in reverse. Ask them for a dark original.
 *   — 4TH GENERATION RESOURCES ships its logo as a bitmap on an opaque white plate, which
 *     read as a white card sitting in the middle of the strip. Near-white pixels were made
 *     transparent; nothing else changed.
 *
 * `width` AND `height` ARE THE FILE'S OWN, at 96px tall — three times the ~32px the strip
 * draws them at. They are declared so the browser can reserve the right box before the image
 * arrives; without them a row of six logos pops into place as each one loads, which on a
 * strip that is already moving reads as a fault.
 *
 * THE EVEN-LENGTH RULE NO LONGER APPLIES TO THIS LIST. It existed because <Marquee>
 * alternated mono and bold on `i % 2`, which an odd count flipped at the loop seam. That
 * styling moved to the call site when the component started taking rendered nodes, and a
 * logo has no such alternation — so a seventh client can simply be added. The rule still
 * governs STACK in content/home.ts, which is still text.
 */
export const CLIENT_LOGOS = [
  {
    name: 'Eximpedia',
    logo: '/images/clients/eximpedia.webp',
    width: 598,
    height: 96,
  },
  {
    name: 'Seair Exim Solutions',
    logo: '/images/clients/seair.webp',
    width: 544,
    height: 96,
  },
  {
    name: 'Proffer IT Consultancy',
    logo: '/images/clients/proffer.webp',
    width: 697,
    height: 96,
  },
  {
    name: 'Decor Masters',
    logo: '/images/clients/decor-masters.webp',
    width: 113,
    height: 96,
  },
  {
    name: 'Tracks 2 Curtains',
    logo: '/images/clients/tracks2curtains.webp',
    width: 158,
    height: 96,
  },
  {
    name: '4th Generation Resources',
    logo: '/images/clients/4th-generation.webp',
    width: 342,
    height: 96,
  },
  {
    /* The seventh, and the one that needed no intervention: the mark is published in
       full colour on a transparent ground, so it went from their site into the strip
       with nothing done to it but the resize and the format change every entry gets.
       The wordmark reads "APRICUS" alone; the name here is the company's, which is what
       the link is announced as. */
    name: 'Apricus Premium Solar',
    logo: '/images/clients/apricus.webp',
    width: 436,
    height: 96,
  },
] as const

/**
 * The legal entity: the identifiers the two legal documents publish.
 *
 * SEPARATE FROM `CONTACT`, WHICH IS HOW YOU REACH US. This is who we are on
 * paper — the numbers a client's finance team needs to raise a purchase order and
 * the address a formal notice is served at. They appear in the masthead of both
 * legal pages and in the contact clause at the foot of each, which is three
 * places one typo could disagree with itself, so they are written once here.
 *
 * THE REGISTERED OFFICE IS NOT THE SAME FIELD AS `CONTACT.address`, even though
 * the client's documents give the same street address for both. `CONTACT.address`
 * gates the map embed and the LocalBusiness schema — a claim about where you can
 * turn up and find us. This is the address on the incorporation certificate. They
 * are the same today and could stop being the same the day the team moves, which
 * is why filling one in does not silently fill in the other.
 */
export const COMPANY = {
  /**
   * Corporate Identity Number, transcribed from the client's documents verbatim.
   *
   * NOT CORRECTED, THOUGH THE STATE CODE LOOKS WRONG. Characters 6-7 of a CIN are
   * the registrar's state code, and for Uttar Pradesh that is `UP`; `UW` is not a
   * code the MCA issues. Either the client's document has a typo or this reading
   * does — and a company registration number is exactly the kind of value where
   * guessing at a fix is worse than publishing what you were given. Flagged to the
   * client rather than edited here.
   */
  cin: 'U62011UW2026PTC256771',
  pan: 'AADCZ1261G',
  /** Tax deduction account number. Clients deducting TDS need it to file. */
  tan: 'MRTZ01600E',
  /* NO GSTIN FIELD, DELIBERATELY. Both legal documents printed a GSTIN row and
     neither supplied the number, so it stood here as a placeholder and rendered as
     a stub on both pages. The client asked for the row to be removed rather than
     filled, so the field went with it — an exported constant nothing reads is a
     worse record of the decision than this comment.

     WHAT THAT LEAVES UNSTATED. Clause 09 of the terms says GST is charged at the
     applicable rate on Indian engagements, and a client's finance team needs the
     GSTIN to claim input credit on that. It will still appear on the invoices;
     it is only absent from the two published pages. If the number should be back
     on them, restore `gstin` here and the row in each document — the positions
     are marked in content/privacy.ts and content/terms.ts. */
  registeredOffice: 'T-8, Ace Parkway, Sector 150, Noida 201310, Uttar Pradesh, India',
} as const

/**
 * The role-based addresses the legal documents route people to.
 *
 * ONE ADDRESS PER JOB, not a single inbox with a subject-line convention, because
 * each of these carries a promise about who reads it and how fast. The privacy
 * policy commits to acknowledging a rights request in three working days and a
 * grievance in three; the terms make `legal@` the address formal notice is served
 * at, which means a notice sent there is legally delivered whether or not anyone
 * is watching the inbox.
 *
 * EVERY ONE OF THESE HAS TO EXIST AND BE MONITORED BEFORE THESE PAGES GO LIVE.
 * Publishing a grievance address that bounces is worse than publishing none: the
 * Act requires the route, and a dead one is a breach with a paper trail.
 */
export const LEGAL_EMAILS = {
  privacy: 'privacy@zefract.com',
  grievance: 'grievance@zefract.com',
  security: 'security@zefract.com',
  legal: 'legal@zefract.com',
  accounts: 'accounts@zefract.com',
} as const

/**
 * The person accountable for privacy grievances, named on the privacy page.
 *
 * REQUIRED, NOT OPTIONAL. Section 13(1) of the DPDP Act obliges a Data Fiduciary to
 * publish the contact details of the person who answers a Data Principal's
 * grievance, and the Board has been accepting complaints since the Rules were
 * notified. The client's own editorial note in the source document says the same
 * thing: this should be live at launch rather than deferred.
 *
 * ALL FOUR FIELDS ARE NOW SUPPLIED, so the row renders in production. The name and
 * designation came from the client; the phone number is deliberately not retyped
 * here — see the note on it below.
 *
 * "DEVENDER" IS THE NAME AS GIVEN, and it is one word where the client's own
 * template asked for "full name of the officer". Published as supplied rather than
 * padded out, because the alternative is inventing half of a named individual's
 * identity in a statutory disclosure. Worth confirming with them: a Data Principal
 * escalating to the Board, or a regulator checking the s.13(1) route exists, is
 * matching this against a real person, and a single given name is thinner evidence
 * of that than a full one.
 */
export const GRIEVANCE_OFFICER = {
  name: 'Devender',
  designation: 'Director',
  /**
   * The company line, not a second number.
   *
   * READ FROM CONTACT RATHER THAN COPIED, because it is the same line the footer,
   * the contact page and the Organization schema already publish, and the client
   * confirmed it is where a grievance should land. Copying the digits would create
   * a second place to change them, and the failure mode is one a reader cannot
   * see: a stale number on the privacy page still looks like a working route to
   * the officer, right up until someone with a rights request dials it.
   *
   * Give this its own literal the day the officer gets a direct line.
   */
  phone: CONTACT.phone,
  email: LEGAL_EMAILS.grievance,
} as const

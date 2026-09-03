/**
 * Content model for the Zefract site.
 *
 * Content currently lives in typed files under content/. Components never import
 * these directly — they go through the async accessors in lib/content.ts, so a
 * headless CMS can replace the source later without touching a single component.
 */

export interface SeoMeta {
  title: string
  description: string
  ogImage?: string
}

/** A deliverable chip. The brief wants 1-3 words on the live site, but Appendix D
 *  supplies many longer ones, so `short` is an optional editorial override. */
export interface Chip {
  label: string
  short?: string
}

export interface SubServiceGroup {
  name: string
  /** The short benefit line that follows the group name in Appendix D. */
  benefit: string
  chips: Chip[]
}

export const PILLAR_SLUGS = [
  'engineering',
  'experience-and-design',
  'ai-and-automation',
  'cloud-data-and-security',
  'marketing-and-growth',
] as const

export type PillarSlug = (typeof PILLAR_SLUGS)[number]

/** Managed Services sits outside the five pillars — Appendix B files it as cross-cutting. */
export type ServiceParent = PillarSlug | 'cross-cutting'

/** The shape emitted by scripts/generate-services.mjs, parsed from Appendix D. */
export interface GeneratedService {
  slug: string
  name: string
  parent: ServiceParent
  groups: SubServiceGroup[]
}

/**
 * One named part of a service, defined in full rather than summarised.
 *
 * Appendix D gives every service a set of groups with a three-word benefit line and a few
 * chips, which is enough to scan but not enough to understand. Where the client has written
 * a service document, its numbered sections carry a real explanation, and those become
 * points: each one keeps its own heading, its own prose and its own list of deliverables, so
 * nothing gets merged into a neighbour or dropped for being hard to fit.
 */
export interface ServicePoint {
  name: string
  /** Paragraphs, in order. Same reasoning as Service.description — an array, not one blob. */
  body: string[]
  /** The document's own INCLUDES line, split into its separate items. */
  includes: string[]
}

/** One of the returns listed under a service's "why it matters" section. */
export interface ServiceReturn {
  title: string
  body: string
}

/**
 * The editorial spine of a service page, as the client's own document tells it.
 *
 * Appendix D and `points` between them cover WHAT a service is. A service document also
 * argues WHY it is worth buying, and that argument has a shape of its own: an opening that
 * names the reader's suspicion, a list of returns, a closing reason to buy it here rather
 * than elsewhere. None of that fits `points`, which is why it lands in its own type instead
 * of being flattened into more prose paragraphs.
 *
 * Every field is optional and the page renders each section only when it is present, so a
 * service whose document has not been written yet keeps exactly the page it has today.
 */
export interface ServiceStory {
  /** The document's own tagline, used under the h1 in place of the shorter `outcome`. */
  tagline?: string
  /**
   * Opening paragraphs, above the parts rather than buried under them.
   *
   * No heading sits between these and the first part, because the source document has none:
   * it runs title, tagline, these paragraphs, then straight into "01". An earlier version
   * invented one out of a sentence in the intro, which put words in the client's mouth.
   */
  intro?: string[]
  /**
   * The named surfaces a service works against, listed under the intro.
   *
   * The GEO document carries a PLATFORMS line — ChatGPT, Gemini, Perplexity and so on —
   * because for that service the list IS part of the pitch: it answers "where exactly does
   * this apply" before the reader has to ask. Absent for services whose document does not
   * name any, which is most of them.
   */
  platforms?: string[]
  whyItMatters?: {
    heading: string
    body: string[]
    /** The line that introduces the list — "Here's what that investment returns:". */
    kicker?: string
    returns: ServiceReturn[]
    /** The document's closing argument, set apart from the list above it. */
    bottomLine?: string
  }
  whyUs?: { heading: string; body: string[] }
  /** The document's own closing ask, which is usually more specific than "get a quote". */
  closingCta?: { line: string; label: string; href: string }
}

/** A service page: generated content plus hand-authored positioning. */
export interface Service extends GeneratedService {
  /**
   * The page's <h1>, when it should differ from `name`.
   *
   * A SEPARATE FIELD RATHER THAN A LONGER `name`, and the separation is the point.
   * `name` is the label: it is the mega-menu entry, the pillar card, the breadcrumb, the
   * llms.txt line and the JSON-LD `name`. The h1 is a heading someone arrives on, and the
   * client's SEO pass rewrote those to carry the terms people search — "Platform
   * Engineering: CI/CD, IaC, Kubernetes & SRE" is a good heading and an unusable nav item.
   *
   * Consumers read `h1 ?? name`, so a service without one keeps exactly the heading it has
   * today. Two do: /services/managed-services and /services/local-reputation were not in
   * the client's sheet.
   */
  h1?: string
  /** One-line outcome for the page hero and the mega-menu flyout. */
  outcome?: string
  /**
   * The prose section that explains the service in the client's own words, rather than as a
   * list of deliverables. An array of paragraphs, not one string with newlines in it, so the
   * renderer never has to split on whitespace to find its own paragraph breaks.
   */
  description?: string[]
  /**
   * The service's parts, each defined separately. Where present these replace the generated
   * groups on the page, because the two describe the same work and showing both would list
   * "Local SEO" twice with different amounts of detail. The groups stay in the data — the
   * pillar cards and the JSON-LD still read them.
   */
  points?: ServicePoint[]
  /**
   * The argument for the service, from the client's own document. Where present it
   * restructures the page — see <ServiceStorySections> and the note on ServiceStory.
   */
  story?: ServiceStory
  /** Everyday phrasings buyers actually search for (Appendix C alias map). */
  aliases?: string[]
  seo?: Partial<SeoMeta>
}

export interface Pillar {
  slug: PillarSlug
  name: string
  /** The page's <h1> where it differs from `name`. Same split as Service.h1 — see there. */
  h1?: string
  outcome: string
  blurb: string
  /** Service slugs belonging to this pillar, in display order. */
  services: string[]
  seo?: Partial<SeoMeta>
}

export interface Stat {
  value: string
  label: string
  /** False until the client confirms the number. Renders a stub marker in dev. */
  verified?: boolean
}

/**
 * One block of a case study's written narrative.
 *
 * AN ORDERED SEQUENCE, NOT A SET OF NAMED FIELDS, because the order IS the
 * content. A case study argues: here is what we found, here is what it meant,
 * here is what we did about it, here is what changed. Modelling that as
 * `findings`, `diagnosis`, `roadmap`, `results` would fix one document's shape
 * as the schema for every future one, and the next study that puts the email
 * work before the technical work would have nowhere to say so.
 *
 * A discriminated union rather than one shape with everything optional: a
 * callout is genuinely a different thing from a section, and the renderer should
 * be a switch over what a block IS rather than a pile of `?` checks guessing at
 * it from which fields happen to be present.
 */
export type CaseStudyBlock =
  | {
      kind: 'section'
      heading: string
      /** Paragraphs, in order — an array, not one string with newlines in it, so
       *  the renderer never has to split on whitespace to find its own breaks.
       *  Same reasoning as Service.description. */
      body: string[]
      /** Named findings under the heading, where the document has them. */
      points?: { heading: string; body: string[] }[]
      /** A two-column table, where the document has one. Two columns is not a
       *  limitation to lift later: a case study table is "phase / what it
       *  covered", and anything wider stops fitting a phone. */
      table?: { columns: [string, string]; rows: [string, string][] }
      /** A closing paragraph, after the points or the table. */
      outro?: string
    }
  /** The line the document sets apart from its own prose — the conclusion the
   *  reader is meant to leave with, not another paragraph. */
  | { kind: 'callout'; label: string; body: string }

export interface CaseStudy {
  slug: string
  client: string
  sector: string
  title: string
  problem: string
  what: string[]
  outcomes: Stat[]
  /**
   * The client's own words about the engagement, and who said them.
   *
   * `avatar` IS OPTIONAL AND ONLY EVER A REAL PHOTOGRAPH OF THE PERSON NAMED. The field
   * exists because <FeaturedCase> lays this quote out with a portrait beside it, and for a
   * long time it had none — the card hardcoded a stock face from the design comp, which was
   * survivable while every case study was invented and stopped being survivable the moment
   * cases[0] was a real, named client. It fell back to a monogram, and it still does when
   * this is absent: initials assert nothing, where a borrowed face asserts a likeness.
   */
  quote?: { text: string; author: string; role: string; avatar?: string }
  image?: string
  /**
   * What the cover actually shows.
   *
   * WHY THIS IS NOT DERIVED FROM `client` AND `title`. It used to be, producing
   * alt text like "Seair Exim Solutions: They were getting found." That reads as
   * a claim that the photograph IS the client — their office, their product,
   * their screen — which is true for a commissioned shot and false for the
   * illustrative imagery a case study usually carries. Alt text describes the
   * picture; it is not a second caption.
   *
   * Falls back to the derived form when absent, so a study with a genuine
   * photograph of the client needs nothing here.
   */
  imageAlt?: string
  services: string[]
  seo?: Partial<SeoMeta>
  /**
   * The engagement's own facts — client, sector, dates, scope.
   *
   * A LABELLED LIST RATHER THAN FIXED FIELDS. `client` and `sector` already
   * exist as their own properties because the cards and the eyebrow read them;
   * these are the ones that only ever appear as a block at the top of the page,
   * and which vary by engagement. A retainer has a different set from a fixed
   * project, and neither should have to leave a field blank to say so.
   */
  facts?: { label: string; value: string }[]
  /** Opening paragraphs, above the first heading — the document's own lead-in. */
  intro?: string[]
  /**
   * The written case study, where the client has supplied one.
   *
   * Where this is present the page tells the story; where it is absent the page
   * is exactly what it was before — problem, what we did, outcomes — so a study
   * written as a summary keeps working without a document behind it.
   */
  narrative?: CaseStudyBlock[]
  /** The document's own closing ask, which is usually more specific than the
   *  site-wide CTA band that follows it. Same arrangement as ServiceStory. */
  closing?: { heading: string; body: string; ctaLabel: string; ctaHref: string; note?: string }
}

export interface Testimonial {
  quote: string
  author: string
  role: string
  company: string
  avatar?: string
  /**
   * Score out of 5. Halves render correctly.
   *
   * Unverified like every other number on the site: this is whatever the client's
   * real review platform says, not something to invent per quote. Left optional so
   * a testimonial with no score attached simply renders without stars rather than
   * defaulting to a flattering one.
   */
  rating?: number
}

export interface Faq {
  question: string
  answer: string
  /** Optional service slug — lets a service page pull only its own FAQs. */
  service?: string
}

/** One productised plan on a pillar page. See content/service-plans.ts. */
export interface PlanTier {
  /** The client's own "PLAN 01" marker. A label, not an index: the order is the price order. */
  number: string
  name: string
  tagline: string
  /** The headline figure, with its symbol and separators exactly as sold. */
  price: string
  /** What the figure is per, e.g. "/month". Prism's carries a trailing "+". */
  priceUnit: string
  /** The one-off that opens every engagement. */
  sprint: string
  features: string[]
  /** Who the tier is for, set after a "Fits:" label. */
  fits: string
  /** The tier the design pulls forward. At most one should carry it. */
  featured?: boolean
  /** The flag above a featured tier, e.g. "Most clients land here". */
  badge?: string
}

/** A pillar's plans, with the section that introduces them and the note that closes them. */
export interface ServicePlans {
  eyebrow: string
  heading: string
  intro: string
  tiers: PlanTier[]
}

/** One phase of a service's execution roadmap. See content/service-roadmaps.ts. */
export interface RoadmapPhase {
  /** The phase's own name, e.g. "Audit & Discovery". Numbered by position, not stored. */
  name: string
  /** The client's week range, e.g. "Weeks 1-2", or "Ongoing" for the phase that never ends. */
  timeline: string
  /** One sentence saying what the phase is for, in plain language. */
  lead: string
  /** What comes out of the phase. Two or more; the document never lists fewer than three. */
  items: string[]
}

/** A service's six-phase execution roadmap. */
export interface ServiceRoadmap {
  /** The service this roadmap belongs to, and the key it is filed under. */
  slug: string
  /** Display name, taken from the service catalogue so it matches the page it sits on. */
  name: string
  /** The document's own heading, "How we run it", or "How we build it" for strategy. */
  heading: string
  /** The one-line promise under the heading. */
  sub: string
  /** The opening paragraph, setting up why the phases are in this order. */
  intro: string
  phases: RoadmapPhase[]
}

export interface ProcessStep {
  number: string
  title: string
  body: string
}

export interface Industry {
  name: string
  slug: string
}

/* ---------------------------------------------------------------------------
   Legal documents — the privacy policy and the terms.

   THESE ARE DATA, NOT JSX, and that is the whole reason this shape exists. Both
   documents are supplied by the client as Word files, they run to sixteen and
   twenty-eight numbered clauses, and they will be reissued whenever the law or
   the company changes. Hand-marking that up as JSX means the next revision is a
   merge across hundreds of lines of markup instead of a diff of the words, and
   it means the two pages drift apart in styling the moment somebody edits one.

   The union below is deliberately small. It covers exactly the block kinds the
   two documents actually use and nothing speculative, so a reader can tell what
   a legal page can contain by reading twenty lines.
   --------------------------------------------------------------------------- */

/** One block inside a clause. Rendered in the order the document lists them. */
export type LegalBlock =
  /**
   * A paragraph, optionally opening with a bolded lead-in.
   *
   * `lead` IS PART OF THE SENTENCE, not a heading above it — both documents
   * repeatedly open a paragraph with a short bolded phrase and then continue in
   * the same breath ("Acceptance. Deliverables submitted for approval are…").
   * Splitting that into a sub-heading and a paragraph would read as a new
   * section; leaving it unbolded would lose the scanning cue the client wrote it
   * for. So it is one block that renders as one paragraph.
   */
  | { kind: 'p'; lead?: string; text: string }
  /** A sub-heading inside a clause — the document's own Heading 2. */
  | { kind: 'sub'; heading: string }
  /** A bulleted list. An item may carry the same bolded lead-in a paragraph can. */
  | { kind: 'list'; items: (string | { lead: string; text: string })[] }
  /** A numbered list, where the document numbers the steps itself. */
  | { kind: 'steps'; items: string[] }
  /** Label/value pairs: company details, the grievance officer, contact routes. */
  | { kind: 'defs'; items: { label: string; value: string; href?: string }[] }
  /** A real table. `columns` sets the header row; every row must match its length. */
  | { kind: 'table'; columns: string[]; rows: string[][] }
  /** A short statement the document sets apart from its own prose. */
  | { kind: 'callout'; label: string; text: string }

export interface LegalClause {
  /** Zero-padded, as the document numbers it. Also the anchor: `#c-07`. */
  n: string
  heading: string
  /**
   * The document's own "IN PLAIN ENGLISH" summary.
   *
   * NOT A SUBSTITUTE FOR THE CLAUSE and never rendered instead of one. It is the
   * client's own device for making a long clause scannable, and dropping it would
   * remove the thing that makes these documents readable at all.
   */
  plain?: string
  blocks: LegalBlock[]
}

export interface LegalDocument {
  /** Small label above the title — "Legal · Privacy". */
  eyebrow: string
  title: string
  /** The standfirst under the title. */
  standfirst: string
  /** The masthead: effective date, version, registered office and so on. */
  meta: { label: string; value: string }[]
  /** Paragraphs between the contents list and the first clause. */
  lede: string[]
  /**
   * An optional précis of the whole document, shown before clause 01.
   *
   * NOT A CLAUSE, which is why it is a field rather than an entry in the list
   * below. The terms open with one ("The short version"), and the paragraph
   * immediately after it says in as many words that it is not the contract. Filing
   * it as clause 00 would put it in the contents, give it an anchor, and let a
   * reader cite it — all three of which contradict what it says about itself.
   */
  summary?: { label: string; text: string; note: string }
  /** What the document calls its numbered parts — "Section" or "Clause". */
  unit: 'Section' | 'Clause'
  clauses: LegalClause[]
  /** Links to the sibling documents, shown at the foot of the page. */
  related: { label: string; href: string }[]
}

/**
 * Copy for the home page, transcribed from the approved design.
 *
 * NOTE ON NUMBERS: every statistic below came from the design comp, not from the
 * client. The brief lists "unverifiable stats" as an explicit anti-goal (L185-186),
 * so each carries `verified: false` until confirmed. `npm run check:todos` reports them.
 */
import type { ProcessStep, Industry } from "./types";

export const HERO = {
  eyebrow: "Engineering · Design · AI · Cloud · Growth",
  /**
   * The h1, in the three segments its responsive break needs.
   *
   * Two lines at every width — only the break MOVES. Below sm it falls after "big"
   * ("Turn your next big" / "idea into reality."); from sm up it falls after "idea"
   * ("Turn your next big idea" / "into reality."), which is the approved desktop setting
   * and is unchanged.
   *
   * Three segments rather than two sets of lines because the alternative — rendering both
   * versions and hiding one — puts the sentence in the DOM twice, which a crawler reads as
   * a duplicated h1. <Hero> joins these with a pair of <br>s that only ever hide
   * themselves, so the words exist once and are announced once.
   */
  heading: ["Turn your next big", "idea", "into reality."],
  sub: "One accountable team across engineering, design, AI, cloud and marketing. We build digital products, then we make them grow.",
  note: "Straight answers on scope, stack and cost. No deck.",
} as const;

export const BENTO = {
  eyebrow: "Measured results",
  heading: ["Shipped, measured,", "and still running."],
  caption: "Figures from the delivery ledger we keep on every engagement.",
  photo: {
    chip: "In production",
    value: "100+",
    caption: "Projects shipped and still running today",
    verified: false,
  },
  retention: {
    label: "Client retention",
    value: "98%",
    quote: "Most clients ship a second project with us within a year.",
    extra: "+37",
    verified: false,
  },
  launch: {
    label: "Median launch",
    value: "6 weeks",
    body: "Kickoff to production on the launch set. Phases after, not before.",
    verified: false,
  },
  strip: [
    {
      value: "0",
      label: "minutes of downtime across every migration",
      verified: false,
    },
    {
      value: "24/7",
      label: "managed monitoring after you go live",
      verified: false,
    },
  ],
} as const;

export const PAINS = {
  eyebrow: "Who we help",
  heading: "If this sounds familiar, you're in the right place.",
  body: "We have this conversation every week with founders and product owners who are stretched thin and quietly sure they’re falling behind.",
  cta: "Book the intro",
  cards: [
    {
      number: "01",
      title: "Your last redesign changed nothing",
      body: "New paint, same numbers. Traffic flat, pipeline flat, and a CMS nobody on your team can actually edit without calling the vendor.",
    },
    {
      number: "02",
      title: "Five vendors, nobody accountable",
      body: "Design blames dev, dev blames the brief, and the invoices arrive anyway. Every handoff loses a week and a little of the plot.",
    },
    {
      number: "03",
      title: "AI is on the roadmap, security keeps vetoing it",
      body: "The board wants agents and copilots. Your security lead wants audit trails and guardrails. You need a team that ships both at once.",
    },
  ],
} as const;

export const PRACTICES = {
  eyebrow: "What we run",
  heading: ["Five practices. One invoice.", "Zero handoffs."],
  sub: "Strategy through support, staffed from the same bench. Nothing falls between vendors because there are no other vendors.",
  /**
   * The five pillars plus managed services, as a grid of links.
   *
   * `icon` is a key, not a component: this file is data and is imported by Server
   * Components, so keeping React out of it means the content layer stays swappable
   * for a CMS. The keys are resolved to lucide icons in practices.tsx.
   */
  nodes: [
    {
      label: "Engineering",
      sub: "Digital · Product · Mobile · QA",
      icon: "code",
      href: "/services/engineering",
    },
    {
      label: "Experience & Design",
      sub: "UX · UI · Branding",
      icon: "design",
      href: "/services/experience-and-design",
    },
    {
      label: "AI & Automation",
      sub: "Agents · Copilots · RPA",
      icon: "ai",
      href: "/services/ai-and-automation",
    },
    {
      label: "Cloud, Data & Security",
      sub: "Cloud · Platform · Data",
      icon: "cloud",
      href: "/services/cloud-data-and-security",
    },
    {
      label: "Marketing & Growth",
      sub: "SEO · AEO · PPC · CRM",
      icon: "growth",
      href: "/services/marketing-and-growth",
    },
    {
      label: "Managed Services & Support",
      sub: "Care plans · SLA",
      icon: "support",
      href: "/services/managed-services",
    },
  ],
  cards: [
    {
      art: "browser",
      title: "Design that converts",
      body: "UX research, interface design and brand identity built to earn attention and turn it into pipeline, not applause.",
      chips: [
        "User research",
        "Wireframes",
        "Design systems",
        "Prototyping",
        "Brand identity",
        "Responsive build",
      ],
      href: "/services/experience-and-design",
    },
    {
      art: "code",
      title: "Engineering that scales",
      body: "Web, SaaS and mobile builds that survive real traffic, real data and the engineer who joins your team after us.",
      chips: [
        "React / Next.js",
        "Flutter",
        "APIs",
        "CI/CD",
        "Test automation",
        "VAPT",
      ],
      href: "/services/engineering",
    },
    {
      art: "agents",
      title: "Build. Automate. Scale with AI",
      body: "Agents, copilots and automation wired into the tools you already run, with the guardrails your security lead will ask about.",
      chips: [
        "AI agents",
        "RAG",
        "Copilots",
        "RPA",
        "Guardrails",
        "Evaluations",
      ],
      href: "/services/ai-and-automation",
    },
    {
      art: "bars",
      title: "Growth you can audit",
      body: "SEO, AI search, paid and lifecycle programmes reported against revenue. If a channel stops earning, we tell you first.",
      chips: ["SEO", "AEO / GEO", "PPC", "Social", "Content", "Email & CRM"],
      href: "/services/marketing-and-growth",
    },
    /* The fifth practice. The heading above promises five and there were four cards, so
       Cloud, Data & Security had no card of its own — it was only reachable through the
       pillar hub that used to sit above these, which made the gap invisible until the hub
       came out. Kept in the same voice as its four neighbours rather than reusing the
       pillar's own outcome line, which already appears on the pillar page. */
    {
      art: "pipe",
      title: "Infrastructure that stays quiet",
      body: "Cloud migration, platform engineering and the pipelines feeding your analytics, with penetration testing that finds the gap before anyone else does.",
      chips: [
        "Cloud migration",
        "Kubernetes",
        "Terraform",
        "Data pipelines",
        "Analytics",
        "VAPT",
      ],
      href: "/services/cloud-data-and-security",
    },
  ],
  agentChips: ["Summarise", "Route", "Draft", "Approve"],
} as const;

/** Terminal-style readout in the "engineering" practice card. */
export const DEPLOY_LINES: { text: string; accent?: string }[] = [
  { text: "deploy: production", accent: "2m 14s" },
  { text: "tests: 412 passed, 0 flaky" },
  { text: "lighthouse: 98 / 100 mobile" },
  { text: "uptime: 99.99% last 90 days" },
];

export const INDUSTRIES: Industry[] = [
  { name: "SaaS & Startups", slug: "saas" },
  { name: "Ecommerce & Retail", slug: "ecommerce" },
  { name: "Fintech", slug: "fintech" },
  { name: "Healthcare", slug: "healthcare" },
  { name: "Education", slug: "education" },
  { name: "Logistics", slug: "logistics" },
  { name: "Real Estate", slug: "real-estate" },
  { name: "Hospitality", slug: "hospitality" },
];

export const INDUSTRIES_INTRO = {
  eyebrow: "Industries",
  heading: "Context we already have.",
  sub: "Startups, SMEs and growing businesses worldwide. These are the rooms we have been in often enough to know the traps.",
} as const;

/**
 * The technology marquee.
 *
 * ISO 27001 AND SOC 2 WERE REMOVED, and the reason is not that they were unconfirmed —
 * it is that they were never claims of the same KIND as the rest of this list. Every
 * other entry is a tool the work is done with. Those two are certifications, and the
 * site's own copy is explicit that they are something Zefract does FOR a client rather
 * than something it holds: they appear as a cybersecurity deliverable
 * (`includes: ['ISO 27001', 'SOC 2', 'GDPR', 'Audit readiness']` in service-points.ts),
 * and the service FAQ answers "Can you help us get ISO 27001 or SOC 2?" with
 * "Certification itself is issued by an accredited external auditor, not by us."
 *
 * In a strip that read "Technologies and certifications we work with", between Power BI
 * and the loop, they said the opposite of that FAQ. The brief names unverifiable claims
 * as an anti-goal, and a certification a company does not hold is the most consequential
 * kind. The compliance SERVICE is untouched and still sells on /services/cybersecurity,
 * which is where it belongs.
 *
 * KEEP THIS LIST EVEN-LENGTHED. The strip alternates mono and bold on `i % 2`, and the
 * marquee repeats the whole list — so with an odd count the last entry and the first would
 * fall on the same side of that test and sit next to each other in the same treatment,
 * every time the loop comes round. Twelve is fine; removing one more is not.
 *
 * The alternation itself moved to the call site in industries.tsx when <Marquee> started
 * carrying the client logos as well: styling is a decision about these words, and an image
 * has no mono-versus-bold to alternate between.
 *
 * The twelve that remain are each corroborated by the service catalogue rather than
 * assumed. Whether the client actually works with a given one is theirs to confirm.
 */
export const STACK = [
  "React",
  "Next.js",
  "Flutter",
  "AWS",
  "Azure",
  "GCP",
  "Kubernetes",
  "Terraform",
  "Snowflake",
  "Shopify",
  "HubSpot",
  "Power BI",
] as const;

export const COMPARE = {
  eyebrow: "Why Zefract",
  heading: ["The usual options,", "side by side."],
  columns: ["Zefract", "Freelancers", "Big agency"],
  /* `icon` is a key, not a component — this file is plain data, so the lookup to
     lucide lives in compare.tsx. Same arrangement as PRACTICES.nodes. */
  rows: [
    {
      label: "One accountable owner, end to end",
      icon: "owner",
      marks: ["yes", "no", "no"],
    },
    {
      label: "Design and engineering in the same room",
      icon: "craft",
      marks: ["yes", "no", "mid"],
    },
    {
      label: "Launches in weeks, not quarters",
      icon: "speed",
      marks: ["yes", "mid", "no"],
    },
    {
      label: "Security and audit trail by default",
      icon: "security",
      marks: ["yes", "no", "yes"],
    },
    {
      label: "Still answering the phone after launch",
      icon: "support",
      marks: ["yes", "no", "no"],
    },
  ],
} as const;

export const PROCESS_INTRO = {
  eyebrow: "How it works",
  heading: ["First call to launch,", "in five moves."],
} as const;

export const PROCESS: ProcessStep[] = [
  {
    number: "01",
    title: "Intro call",
    body: 'Twenty minutes. Fit, scope and a straight answer, sometimes "not us".',
  },
  {
    number: "02",
    title: "Roadmap",
    body: "Fixed quote, timeline and recommended stack, in writing, in a week.",
  },
  {
    number: "03",
    title: "Design sprint",
    body: "Wireframes to high fidelity. Nothing gets built off an unapproved screen.",
  },
  {
    number: "04",
    title: "Build & launch",
    body: "Two week increments on a staging link you can open any day.",
  },
  {
    number: "05",
    title: "Grow",
    body: "Managed support, monitoring and a monthly numbers call that keeps score.",
  },
];

export const CTA = {
  eyebrow: "Next step",
  heading: ["Ready when you have a brief.", "Or half of one."],
  sub: "Send whatever you have. You get scope, a timeline and a number back within three working days.",
  primary: "Start your project",
  note: "Prefer chat? We answer on WhatsApp too.",
} as const;

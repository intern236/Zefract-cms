/**
 * Generates content/services.generated.ts from the service catalogue.
 *
 * The catalogue holds 111 sub-service groups and 444 deliverable chips across 24
 * services. Retyping that by hand would be slow and would drift from the source,
 * so it is parsed instead. Re-run with `npm run gen:services` after editing
 * content/source/service-catalogue.md; the output is committed.
 *
 * The source lives INSIDE the repo on purpose. It used to be read from the client
 * brief two directories up, which meant a fresh clone could not regenerate.
 *
 * The format is regular but has two traps:
 *   - A chip line can BEGIN with the separator:      "> · Schema markup"
 *   - A chip can wrap mid-phrase across two lines:   "> ... Localized" / "> content"
 * Both are handled by joining a group's chip lines before splitting on the separator.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SOURCE = resolve(HERE, '../content/source/service-catalogue.md')
const OUT = resolve(HERE, '../content/services.generated.ts')

const SEPARATOR = '·'

/**
 * Service name -> URL slug. Appendix B is the source of truth for these URLs, and
 * naive slugification gets many of them wrong ("Data & AI" would become "data-ai",
 * not "data-and-ai"), so the mapping is explicit and validated below.
 */
const SLUGS = {
  'Digital Engineering': 'digital-engineering',
  'Software Product Engineering': 'software-product-engineering',
  'Mobile Engineering': 'mobile-engineering',
  'Quality Engineering': 'quality-engineering',
  'Digital Experience': 'digital-experience',
  'Experience Design': 'experience-design',
  'Branding & Creative': 'branding-creative',
  'Applied AI & Agentic Solutions': 'applied-ai',
  'AI Enablement': 'ai-enablement',
  'Conversational AI & Copilots': 'conversational-ai',
  'Intelligent Automation': 'intelligent-automation',
  'Cloud Modernization': 'cloud-modernization',
  'Platform Engineering': 'platform-engineering',
  'Data & AI': 'data-and-ai',
  'Data & Analytics': 'data-and-analytics',
  Cybersecurity: 'cybersecurity',
  SEO: 'seo',
  'AI Search (AEO / GEO)': 'ai-search',
  'Paid Advertising (PPC)': 'paid-advertising',
  'Social Media': 'social-media',
  'Content Marketing': 'content-marketing',
  'Email, CRM & Automation': 'email-crm-automation',
  'Local & Reputation': 'local-reputation',
  'Managed Services & Support': 'managed-services',
}

/** Appendix D pillar heading -> pillar slug used in our routes. */
const PILLARS = {
  Engineering: 'engineering',
  'Experience and Design': 'experience-and-design',
  'AI and Automation': 'ai-and-automation',
  'Cloud, Data and Security': 'cloud-data-and-security',
  'Marketing and Growth': 'marketing-and-growth',
}

/** Sits outside the five pillars — Appendix B files it under CROSS-CUTTING. */
const CROSS_CUTTING = new Set(['managed-services'])

/**
 * Deliberate divergences from Appendix D, applied AFTER parsing.
 *
 * Appendix D bundles answer-engine and generative-engine work into one "AI Search
 * (AEO / GEO)" service. They are separate disciplines with separate buyers — AEO is about
 * owning the direct answer (snippets, FAQ schema), GEO is about being the source an AI
 * cites — so they get a page each.
 *
 * A ONE-PART ENTRY IS A RENAME, not a split, and is used for exactly that below. The
 * mechanism is the same either way: name the source service, name the parts, assign every
 * group. One part with every group means the service keeps all its content under a new name
 * and slug.
 *
 * Declared here rather than by editing content/source/service-catalogue.md, so that file
 * stays a faithful copy of the client's appendix and can be re-vendored wholesale when the
 * brief changes. Every group named below must exist, and every group of the source service
 * must be claimed exactly once — both are asserted, so a brief edit that renames a group
 * fails the build instead of silently dropping it from the site.
 */
const SPLITS = {
  'AI Search (AEO / GEO)': [
    {
      name: 'AI Search (AEO)',
      slug: 'ai-search-aeo',
      groups: ['Answer Engine Optimization'],
    },
    {
      name: 'AI Search (GEO)',
      slug: 'ai-search-geo',
      // LLM Optimization and AI Visibility Tracking sit here rather than under AEO: both
      // are about being readable and traceable inside generated answers, not about winning
      // a snippet.
      groups: ['Generative Engine Optimization', 'LLM Optimization', 'AI Visibility Tracking'],
    },
  ],
  /* RENAMED, because the client has since written a document for this service and it is
     titled "Email Marketing Services" — eleven parts, of which CRM is one line inside part
     04 rather than a third of the name. The appendix name led on three things at once and
     read as a category; the document leads on the channel the buyer came for.

     All four appendix groups stay with it, so nothing from Appendix D is lost: they still
     feed the pillar card and the JSON-LD. The document's eleven parts render on the page
     itself, the same way SEO's ten do. The old URL redirects — see next.config.ts. */
  'Email, CRM & Automation': [
    {
      name: 'Email Marketing',
      slug: 'email-marketing',
      groups: ['Campaigns', 'Automation Flows', 'CRM Setup', 'Deliverability & Optimization'],
    },
  ],
}

/** Services in Appendix D itself. The split above is applied to these, not counted in them. */
const EXPECTED_SERVICES = 24
/** Pages actually emitted: the 24 above, less each split source, plus its replacements. */
const EXPECTED_EMITTED =
  EXPECTED_SERVICES +
  Object.values(SPLITS).reduce((n, parts) => n + parts.length - 1, 0)

// ---------------------------------------------------------------------------

if (!existsSync(SOURCE)) {
  console.error(
    `Service catalogue not found at ${relative(process.cwd(), SOURCE)}.\n` +
      `This file is the source of truth for all 24 service pages and must be committed.`
  )
  process.exit(1)
}

const raw = readFileSync(SOURCE, 'utf8')
const start = raw.indexOf('**Pillar 1.')
if (start === -1) {
  console.error(
    `Could not find "**Pillar 1." in ${relative(process.cwd(), SOURCE)}.\n` +
      `The catalogue format has changed - check the parsing rules in this script.`
  )
  process.exit(1)
}
const lines = raw.slice(start).split(/\r?\n/)

const services = []
let pillar = null
let service = null
let group = null
/** 'benefit' right after a group heading, 'chips' after the blank line that follows. */
let mode = 'benefit'

const pushGroup = () => {
  if (!service || !group) return
  const chips = group._chipLines
    .join(' ')
    .split(SEPARATOR)
    .map((c) => c.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((label) => ({ label }))
  service.groups.push({ name: group.name, benefit: group.benefit.trim(), chips })
  group = null
}

const pushService = () => {
  pushGroup()
  if (service) services.push(service)
  service = null
}

for (const line of lines) {
  const pillarMatch = line.match(/^\*\*Pillar \d+\.\s*(.+?)\*\*\s*$/)
  if (pillarMatch) {
    pushService()
    const name = pillarMatch[1].trim()
    pillar = PILLARS[name]
    if (!pillar) {
      console.error(`Unknown pillar heading: "${name}". Add it to the PILLARS map.`)
      process.exit(1)
    }
    continue
  }

  const serviceMatch = line.match(/^▸\s*\*\*(.+?)\*\*\s*$/)
  if (serviceMatch) {
    pushService()
    const name = serviceMatch[1].trim()
    const slug = SLUGS[name]
    if (!slug) {
      console.error(
        `Service "${name}" has no slug in the SLUGS map.\n` +
          `Add it, using the URL from Appendix B of the brief.`
      )
      process.exit(1)
    }
    service = {
      slug,
      name,
      parent: CROSS_CUTTING.has(slug) ? 'cross-cutting' : pillar,
      groups: [],
    }
    continue
  }

  if (!service) continue

  // Only blockquote lines carry group content.
  if (!line.startsWith('>')) continue
  const text = line.replace(/^>\s?/, '').trim()

  const groupMatch = text.match(/^\*\*(.+?):\*\*\s*(.*)$/)
  if (groupMatch) {
    pushGroup()
    group = { name: groupMatch[1].trim(), benefit: groupMatch[2] ?? '', _chipLines: [] }
    mode = 'benefit'
    continue
  }

  if (!group) continue

  if (text === '') {
    // The blank quoted line between the benefit and the chips.
    if (mode === 'benefit') mode = 'chips'
    continue
  }

  // A benefit line that wrapped keeps extending the benefit until the blank line.
  if (mode === 'benefit') group.benefit += ' ' + text
  else group._chipLines.push(text)
}
pushService()

// --- validation -------------------------------------------------------------

const problems = []
if (services.length !== EXPECTED_SERVICES) {
  problems.push(`Parsed ${services.length} services, expected ${EXPECTED_SERVICES}.`)
}
const seen = new Set()
for (const s of services) {
  if (seen.has(s.slug)) problems.push(`Duplicate slug: ${s.slug}`)
  seen.add(s.slug)
  if (!s.parent) problems.push(`Service "${s.name}" has no pillar.`)
  if (s.groups.length === 0) problems.push(`Service "${s.name}" parsed zero groups.`)
  for (const g of s.groups) {
    if (!g.benefit) problems.push(`Group "${g.name}" in "${s.name}" has no benefit line.`)
    if (g.chips.length === 0) problems.push(`Group "${g.name}" in "${s.name}" has no chips.`)
  }
}
const missing = Object.keys(SLUGS).filter((n) => !services.some((s) => s.name === n))
if (missing.length) problems.push(`Mapped but not found in Appendix D: ${missing.join(', ')}`)

if (problems.length) {
  console.error('\nGeneration failed:\n' + problems.map((p) => `  - ${p}`).join('\n'))
  process.exit(1)
}

// --- deliberate splits ------------------------------------------------------
// Runs after the checks above, so the count assertion still measures the appendix as
// written and this stays a visibly separate editorial decision.

const splitProblems = []
for (const [sourceName, parts] of Object.entries(SPLITS)) {
  const at = services.findIndex((s) => s.name === sourceName)
  if (at === -1) {
    splitProblems.push(`SPLITS names "${sourceName}", which is not in the catalogue.`)
    continue
  }
  const source = services[at]
  const byName = new Map(source.groups.map((g) => [g.name, g]))

  const claimed = new Set()
  const replacements = []
  for (const part of parts) {
    const groups = []
    for (const name of part.groups) {
      const g = byName.get(name)
      if (!g) {
        splitProblems.push(`"${sourceName}" has no group "${name}" to give to ${part.slug}.`)
        continue
      }
      if (claimed.has(name)) {
        splitProblems.push(`Group "${name}" of "${sourceName}" is claimed by two parts.`)
        continue
      }
      claimed.add(name)
      groups.push(g)
    }
    replacements.push({ slug: part.slug, name: part.name, parent: source.parent, groups })
  }
  // A group left unclaimed would vanish from the site without a word — the exact failure
  // this check exists to prevent.
  for (const g of source.groups) {
    if (!claimed.has(g.name)) {
      splitProblems.push(`Group "${g.name}" of "${sourceName}" was not assigned to any part.`)
    }
  }
  services.splice(at, 1, ...replacements)
}

if (services.length !== EXPECTED_EMITTED) {
  splitProblems.push(`About to emit ${services.length} services, expected ${EXPECTED_EMITTED}.`)
}
const emittedSlugs = new Set()
for (const s of services) {
  if (emittedSlugs.has(s.slug)) splitProblems.push(`Duplicate slug after splitting: ${s.slug}`)
  emittedSlugs.add(s.slug)
}
if (splitProblems.length) {
  console.error('\nSplitting failed:\n' + splitProblems.map((p) => `  - ${p}`).join('\n'))
  process.exit(1)
}

// --- emit -------------------------------------------------------------------

const totalGroups = services.reduce((n, s) => n + s.groups.length, 0)
const totalChips = services.reduce(
  (n, s) => n + s.groups.reduce((m, g) => m + g.chips.length, 0),
  0
)

const body = services
  .map((s) => {
    const groups = s.groups
      .map((g) => {
        const chips = g.chips.map((c) => `        { label: ${JSON.stringify(c.label)} },`).join('\n')
        return (
          `    {\n` +
          `      name: ${JSON.stringify(g.name)},\n` +
          `      benefit: ${JSON.stringify(g.benefit)},\n` +
          `      chips: [\n${chips}\n      ],\n` +
          `    },`
        )
      })
      .join('\n')
    return (
      `  {\n` +
      `    slug: ${JSON.stringify(s.slug)},\n` +
      `    name: ${JSON.stringify(s.name)},\n` +
      `    parent: ${JSON.stringify(s.parent)},\n` +
      `    groups: [\n${groups}\n    ],\n` +
      `  },`
    )
  })
  .join('\n')

const out =
  `// AUTO-GENERATED from content/source/service-catalogue.md.\n` +
  `// Do not edit by hand — edit the catalogue and run \`npm run gen:services\`.\n` +
  `// ${services.length} services, ${totalGroups} groups, ${totalChips} chips.\n\n` +
  `import type { GeneratedService } from './types'\n\n` +
  `export const GENERATED_SERVICES: GeneratedService[] = [\n${body}\n]\n`

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, out, 'utf8')

// --- report -----------------------------------------------------------------

console.log(`\n  ${services.length} services  ${totalGroups} groups  ${totalChips} chips`)
console.log(`  -> ${OUT.replace(process.cwd() + '\\', '')}\n`)

const long = []
for (const s of services)
  for (const g of s.groups)
    for (const c of g.chips)
      if (c.label.split(/\s+/).length > 3) long.push(`${s.slug} / ${g.name}: "${c.label}"`)

if (long.length) {
  console.log(
    `  ${long.length} chips exceed the catalogue's own 1-3 word rule.\n` +
      `  They are kept verbatim; add a \`short\` override in content/services.overrides.ts\n` +
      `  to shorten one without losing the source text.\n`
  )
  for (const l of long.slice(0, 12)) console.log(`    ${l}`)
  if (long.length > 12) console.log(`    ... and ${long.length - 12} more`)
  console.log('')
}

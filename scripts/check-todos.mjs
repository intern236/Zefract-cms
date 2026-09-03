/**
 * Lists every unresolved placeholder in the content layer.
 *
 * This is the client hand-back list: each entry is something the site is waiting
 * on. Exits 0 always — unresolved placeholders are expected during the build, not
 * an error. Run it before a launch review, not in CI as a gate.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIRS = ['content', 'app', 'components', 'lib']

/**
 * The file with its comments blanked out, line numbers intact.
 *
 * Every scanner below matches on raw text, so before this existed a comment that MENTIONED a
 * flag was counted as one. That was not hypothetical: the note at the top of content/home.ts
 * explaining what the unverified flag means was itself reported as an unverified statistic,
 * so these totals have always been one too high, and writing a comment about the mechanism
 * inflated the very number the comment was explaining.
 *
 * Comment bodies are replaced with spaces rather than removed, so a finding still reports the
 * line it is really on. Only block comments and lines that OPEN with a slash pair are blanked;
 * a trailing one is left alone, because the alternative is truncating any line holding a URL.
 */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/^([ \t]*)\/\/.*$/gm, (m, indent) => indent + ' '.repeat(m.length - indent.length))
}

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(ts|tsx)$/.test(full)) out.push(full)
  }
  return out
}

const findings = []
for (const d of DIRS) {
  const dir = join(ROOT, d)
  try {
    for (const file of walk(dir)) {
      stripComments(readFileSync(file, 'utf8'))
        .split(/\r?\n/)
        .forEach((line, i) => {
          // matchAll, not match: a line can carry more than one placeholder, and the
          // privacy policy's sub-processor table puts two on most of its rows — the
          // provider and the region it processes in. With .match() only the first was
          // ever listed, so the hand-back list silently undercounted what is owed.
          for (const m of line.matchAll(/TODO\(\s*['"](.+?)['"]\s*\)/g)) {
            findings.push({ file: relative(ROOT, file), line: i + 1, what: m[1] })
          }
        })
    }
  } catch {
    // directory may not exist yet
  }
}

// Unverified statistics are a separate class of gap: they render as real numbers
// but no client has confirmed them, which the brief calls out as an anti-goal.
const unverified = []
for (const d of ['content']) {
  for (const file of walk(join(ROOT, d))) {
    const text = stripComments(readFileSync(file, 'utf8'))
    const count = (text.match(/verified:\s*false/g) ?? []).length
    if (count) unverified.push({ file: relative(ROOT, file), count })
  }
}

// Copy written here rather than by the client is a third class of gap. It reads as the
// client's own words the moment it is on the page, so it has to be listed until they sign
// it off, the same way an unverified number is.
const unapproved = []
for (const file of walk(join(ROOT, 'content'))) {
  const text = stripComments(readFileSync(file, 'utf8'))
  const count = (text.match(/approved:\s*false/g) ?? []).length
  if (count) unapproved.push({ file: relative(ROOT, file), count })
}

console.log('\n  Outstanding content from the client\n')

if (findings.length === 0) {
  console.log('  No TODO() placeholders remain.')
} else {
  for (const f of findings) {
    console.log(`  needs ${f.what.padEnd(20)}  ${f.file}:${f.line}`)
  }
  console.log(`\n  ${findings.length} placeholder${findings.length === 1 ? '' : 's'}.`)
}

if (unverified.length) {
  const total = unverified.reduce((n, u) => n + u.count, 0)
  console.log(
    `\n  ${total} unverified statistic${total === 1 ? '' : 's'} (verified: false) across ` +
      unverified.map((u) => u.file).join(', ')
  )
  console.log(
    '  These render as real numbers but came from the design comp, not the client.\n' +
      '  The brief lists "unverifiable stats" as an explicit anti-goal (L185-186).'
  )
}
if (unapproved.length) {
  const total = unapproved.reduce((n, u) => n + u.count, 0)
  console.log(
    `\n  ${total} block${total === 1 ? '' : 's'} of copy awaiting sign-off (approved: false) in ` +
      unapproved.map((u) => u.file).join(', ')
  )
  console.log(
    '  We wrote these, the client has not agreed them. They read as the client speaking.'
  )
}
console.log('')

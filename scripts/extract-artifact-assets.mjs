/**
 * Pulls the base64-embedded images out of the approved design artifact and writes
 * them to public/images/ so the port can use real files instead of data URIs.
 *
 * Usage:  node scripts/extract-artifact-assets.mjs <path-to-artifact.html>
 *
 * The artifact embeds 9 JPEGs: 2 photographs and 7 avatars. They are matched by
 * document order, which is stable because the markup is generated, not authored.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const src = process.argv[2]
if (!src) {
  console.error('usage: node scripts/extract-artifact-assets.mjs <artifact.html>')
  process.exit(1)
}
if (!existsSync(src)) {
  console.error(`not found: ${src}`)
  process.exit(1)
}

const outDir = resolve(process.cwd(), 'public/images')
mkdirSync(outDir, { recursive: true })

const html = readFileSync(src, 'utf8')
const matches = [...html.matchAll(/data:image\/([a-z+]+);base64,([A-Za-z0-9+/=]+)/g)]

if (matches.length === 0) {
  console.error('no embedded images found — is this the right file?')
  process.exit(1)
}

// Document order: [0] team photo, [1..3] retention avatars, [4] case-study photo,
// [5..8] testimonial avatars. Anything unexpected falls back to a numbered name.
const NAMES = [
  'team-studio',
  'avatar-1',
  'avatar-2',
  'avatar-3',
  'case-study',
  'avatar-4',
  'avatar-5',
  'avatar-6',
  'avatar-7',
]

let written = 0
matches.forEach((m, i) => {
  const [, ext, b64] = m
  const buf = Buffer.from(b64, 'base64')
  const name = NAMES[i] ?? `asset-${String(i + 1).padStart(2, '0')}`
  const file = join(outDir, `${name}.${ext === 'jpeg' ? 'jpg' : ext}`)
  writeFileSync(file, buf)
  console.log(`  ${name}.${ext === 'jpeg' ? 'jpg' : ext}  ${(buf.length / 1024).toFixed(1)} KB`)
  written++
})

console.log(`\nwrote ${written} image${written === 1 ? '' : 's'} to public/images/`)
if (matches.length !== NAMES.length) {
  console.warn(
    `\n! expected ${NAMES.length} images but found ${matches.length} — ` +
      `check the name mapping in this script before trusting the filenames.`
  )
}

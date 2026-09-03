/**
 * Checks that the Cloudinary credentials are present and actually work.
 *
 * Usage:  node scripts/check-cloudinary.mjs
 *
 * WHY IT EXISTS. The three variables can be present and still wrong — a cloud
 * name pasted where the key goes, a secret truncated by a shell, a `$` eaten by
 * .env expansion. Every one of those produces the same symptom later: an upload
 * that fails in the browser with a message from Cloudinary rather than from us.
 * This asks Cloudinary directly, before anyone tries to publish anything.
 *
 * It prints masked values only: enough to spot a swapped pair, never enough to
 * leak a credential into a terminal log or a screenshot.
 */
import nextEnv from '@next/env'
import { v2 as cloudinary } from 'cloudinary'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error })

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

/** First and last two characters, the rest starred. Enough to compare against
 *  the dashboard by eye; useless to anyone reading over a shoulder. */
function mask(value) {
  if (!value) return '(not set)'
  if (value.length <= 6) return '*'.repeat(value.length)
  return `${value.slice(0, 2)}${'*'.repeat(value.length - 4)}${value.slice(-2)}`
}

console.log('\n  Cloudinary configuration\n')
console.log(`    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME  ${cloudName ?? '(not set)'}`)
console.log(`    CLOUDINARY_API_KEY                 ${mask(apiKey)}  (${apiKey?.length ?? 0} chars)`)
console.log(`    CLOUDINARY_API_SECRET              ${mask(apiSecret)}  (${apiSecret?.length ?? 0} chars)`)
console.log('')

const missing = [
  !cloudName && 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  !apiKey && 'CLOUDINARY_API_KEY',
  !apiSecret && 'CLOUDINARY_API_SECRET',
].filter(Boolean)

if (missing.length) {
  console.error(`  Missing: ${missing.join(', ')}.`)
  console.error('  Add them to .env.local — see .env.example.\n')
  process.exit(1)
}

/* The commonest paste error: the key is all digits and the cloud name is not,
   so a swap is detectable without asking Cloudinary anything. */
if (/^\d+$/.test(cloudName) && !/^\d+$/.test(apiKey)) {
  console.error('  The cloud name is all digits and the API key is not — these look swapped.')
  console.error('  In cloudinary://KEY:SECRET@CLOUD_NAME, the cloud name is the part AFTER the @.\n')
  process.exit(1)
}
if (apiSecret.includes('$') && !apiSecret.startsWith('$2')) {
  console.warn('  The secret contains a $. In a .env file it must be written \\$ or the loader')
  console.warn('  will expand it away. If the ping below fails, that is very likely why.\n')
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
})

try {
  const ping = await cloudinary.api.ping()
  if (ping.status !== 'ok') {
    console.error(`  Cloudinary answered "${ping.status}".\n`)
    process.exit(1)
  }
  console.log('  Credentials work — Cloudinary answered ok.')

  /* Usage is a second, stronger signal: ping only proves the key and secret
     verify, while this proves they address the account you think they do. */
  const usage = await cloudinary.api.usage()
  console.log(`  Plan: ${usage.plan}`)
  console.log(`  Stored assets: ${usage.resources ?? 0}`)
  console.log('\n  Uploads from the editor will work. Folders are created on first upload.\n')
} catch (error) {
  const message = error?.error?.message ?? error?.message ?? String(error)
  console.error(`\n  Cloudinary refused the credentials: ${message}`)
  if (/Invalid Signature|Unknown API key|cloud_name/i.test(message)) {
    console.error('  That usually means the key, the secret or the cloud name is wrong or swapped.')
  }
  console.error('')
  process.exit(1)
}

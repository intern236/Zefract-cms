/**
 * Generates the bcrypt hash for ADMIN_PASSWORD_HASH.
 *
 * Usage:  node scripts/hash-admin-password.mjs "the-password"
 *
 * The password itself is never stored anywhere — not in the repo, not in the
 * environment. Only this hash goes into .env.local (development) or the hosting
 * dashboard (deploys), and lib/admin-auth.ts compares against it with bcrypt,
 * which is deliberately slow and salted. Changing the password means running
 * this again and replacing the variable.
 *
 * Cost factor 12: ~250ms per attempt on current hardware. Slow enough to make
 * offline brute force expensive, fast enough that a legitimate login is not
 * noticeably delayed on a serverless function.
 *
 * Also prints a fresh SESSION_SECRET, since the two are set up together and a
 * secret invented by a person is invariably weaker than 32 random bytes.
 */
import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'

const password = process.argv[2]

if (!password) {
  console.error('usage: node scripts/hash-admin-password.mjs "the-password"')
  process.exit(1)
}
if (password.length < 12) {
  console.error(
    `That password is ${password.length} characters. The admin panel is a public URL,\n` +
      'so the password is the whole wall: use at least 12 characters.'
  )
  process.exit(1)
}

const hash = bcrypt.hashSync(password, 12)

/* EVERY $ IN THE .env LINE IS ESCAPED AS \$, AND THAT IS LOAD-BEARING. A bcrypt
   hash is full of $ characters, and Next's env loader expands $NAME references
   in .env values whatever the quoting — measured: "$2b$12$MNJ…" loaded as just
   the tail after the last $-run, single quotes included, and every login failed.
   Backslash-escaping is the one form that survives. Hosting dashboards
   (Netlify's env UI) do no expansion, so THERE the raw hash is pasted as-is —
   hence both forms below. */
const escaped = hash.replaceAll('$', '\\$')

console.log('\nFor .env.local (development) — the \\$ escapes are required:\n')
console.log(`ADMIN_PASSWORD_HASH="${escaped}"`)
console.log(`SESSION_SECRET="${randomBytes(32).toString('base64url')}"`)
console.log('\nFor a hosting dashboard (Netlify env UI) — the raw value, no escapes:\n')
console.log(`ADMIN_PASSWORD_HASH  ${hash}`)
console.log(
  '\nKeep SESSION_SECRET if one is already set — replacing it signs the admin out\n' +
    'everywhere, which is also exactly how to revoke a session on a lost device.\n'
)

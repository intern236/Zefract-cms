import { randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminCodeRecipient } from '@/lib/mail'
import { ADMIN_CHALLENGE_COLLECTION, getDb, LOGIN_ATTEMPTS_COLLECTION } from '@/lib/mongodb'
import {
  PENDING_COOKIE,
  PENDING_MAX_AGE_SECONDS,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signPendingToken,
  signSessionToken,
  verifyPendingToken,
  verifySessionToken,
} from '@/lib/admin-session'

/**
 * Admin authentication: the password check, the session cookie, and the login
 * rate limit. Node-only — bcrypt and the Mongo driver do not run on the edge;
 * the edge-safe token half lives in lib/admin-session.ts.
 *
 * WHERE THE SECURITY BOUNDARY ACTUALLY IS. proxy.ts redirects logged-out
 * visitors away from /admin, but a redirect at the routing layer is a
 * convenience, not a control — middleware-class checks have been bypassed
 * before (the x-middleware-subrequest header bug was exactly this). So the
 * rule here is: the protected admin layout calls requireAdmin(), and EVERY
 * server action and admin route handler calls verifySession() again before
 * touching anything. The proxy existing or not must never matter.
 */

/**
 * The visitor's password against ADMIN_PASSWORD_HASH.
 *
 * bcrypt.compare is deliberately slow (cost 12, ~250ms) and constant-time over
 * the hash, so an attacker learns nothing from timing. An unset hash returns
 * false rather than throwing: a deploy that forgot the variable fails closed,
 * and the login action tells the operator why in the server log, not the form.
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash || !password) return false
  /* A bcrypt hash starts $2a/$2b/$2y. Anything else here means the value was
     mangled on its way in — the usual culprit is a .env file where the hash's
     own $ runs were expanded as variable references (Next's loader does this
     whatever the quoting; only \$ escapes survive). Every login then fails
     with "not right" and no clue why, so this is the clue, in the server log
     where the operator is already looking. */
  if (!hash.startsWith('$2')) {
    console.error(
      '[admin] ADMIN_PASSWORD_HASH does not look like a bcrypt hash — in a .env ' +
        'file every $ must be escaped as \\$ or the loader mangles the value. ' +
        'Re-run scripts/hash-admin-password.mjs and paste its .env line. See .env.example.'
    )
    return false
  }
  return bcrypt.compare(password, hash)
}

export async function createSession(): Promise<boolean> {
  const token = await signSessionToken()
  if (!token) return false
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    /* Secure in production only: local dev is plain http, where a Secure cookie
       is silently dropped and login appears to do nothing. */
    secure: process.env.NODE_ENV === 'production',
    /* Lax, not Strict: the cookie still arrives on a top-level navigation to
       /admin from an external link (Strict would bounce the admin to login
       every time), while cross-site POSTs — the CSRF case — never carry it. */
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
  return true
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/** Is the current request the logged-in admin? Read-only; safe to call anywhere server-side. */
export async function verifySession(): Promise<boolean> {
  const store = await cookies()
  return verifySessionToken(store.get(SESSION_COOKIE)?.value)
}

/** For pages: verified admin or a redirect to the login form. */
export async function requireAdmin(): Promise<void> {
  if (!(await verifySession())) redirect('/admin/login')
}

// ---------------------------------------------------------------------------
// Two-factor: the emailed code
// ---------------------------------------------------------------------------

/** How long a code lives. Matches PENDING_MAX_AGE_SECONDS, so the cookie and
 *  the challenge behind it expire together rather than one outliving the other. */
export const CODE_TTL_MINUTES = 10
/** Wrong codes allowed per challenge before it is destroyed. Six digits is a
 *  million possibilities; five guesses inside ten minutes is nowhere near it,
 *  and destroying the challenge means an attacker cannot keep trying. */
const MAX_CODE_ATTEMPTS = 5

/**
 * Whether the second factor is on.
 *
 * THE ADDRESS ALONE DECIDES, deliberately NOT `adminCodeIsConfigured()`, which
 * also wants SMTP_HOST. Keying this on "can we currently send mail" was a
 * silent security downgrade waiting to happen: a production mail server going
 * down, or an SMTP variable being dropped in a deploy, would have quietly
 * turned two-factor OFF and let the password sign in on its own. Nobody would
 * have been told, because from the outside a working login looks like a working
 * login.
 *
 * So: an address means two-factor is required. Whether a code can be DELIVERED
 * is a separate question, answered at send time — the login action fails the
 * attempt in production and logs the code in development. Failing closed is
 * the only acceptable direction for a control that exists to stop someone who
 * already has the password.
 *
 * Unset means password-only, which is the behaviour this shipped with and is
 * still reasonable for one admin with a long password. Nothing in the browser
 * can change it either way.
 */
export function twoFactorEnabled(): boolean {
  return adminCodeRecipient() !== null
}

/** The address, masked for display — `d••••@example.com`. The full address is
 *  never sent to the browser: it is a second factor, not a label, and telling
 *  a stranger who guessed the password where the code went is a free hint. */
export function maskedCodeRecipient(): string | null {
  const address = adminCodeRecipient()
  if (!address) return null
  const [local, domain] = address.split('@')
  if (!domain) return null
  const head = local.slice(0, 1)
  return `${head}${'•'.repeat(Math.max(3, local.length - 1))}@${domain}`
}

declare global {
  var _zefractChallengeIndex: Promise<unknown> | undefined
}

async function challenges() {
  const db = await getDb()
  const col = db.collection(ADMIN_CHALLENGE_COLLECTION)
  if (!globalThis._zefractChallengeIndex) {
    /* Mongo deletes the document itself once expiresAt passes, so an abandoned
       challenge cannot sit around being guessable and nothing needs a cron. */
    globalThis._zefractChallengeIndex = col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  }
  await globalThis._zefractChallengeIndex
  return col
}

/**
 * Issues a code and stores it hashed, returning the plaintext ONCE for the
 * email. Nothing else ever sees it: the database holds a bcrypt hash, so a
 * dumped collection does not hand anyone a live code.
 *
 * randomInt, not Math.random: this is a credential, and Math.random is
 * predictable from a handful of prior outputs.
 */
export async function startChallenge(ip: string): Promise<{ id: string; code: string }> {
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0')
  const col = await challenges()
  /* One live challenge per admin: a new code silently retires any earlier one,
     so a resend cannot leave two valid codes in flight. */
  await col.deleteMany({})
  const inserted = await col.insertOne({
    codeHash: await bcrypt.hash(code, 10),
    ip,
    attempts: 0,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
  })
  return { id: String(inserted.insertedId), code }
}

export type CodeResult = 'ok' | 'wrong' | 'expired' | 'locked'

/**
 * Checks a code against its challenge and consumes it on success.
 *
 * `expired` covers a missing document too, which is what a TTL deletion looks
 * like from here — and what an id from an old cookie looks like. Both mean the
 * same thing to the person typing: start again.
 */
export async function verifyChallengeCode(id: string, code: string): Promise<CodeResult> {
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    return 'expired'
  }

  const col = await challenges()
  const doc = await col.findOne({ _id: objectId })
  if (!doc) return 'expired'
  if (doc.expiresAt instanceof Date && doc.expiresAt.getTime() < Date.now()) {
    await col.deleteOne({ _id: objectId })
    return 'expired'
  }
  if (typeof doc.attempts === 'number' && doc.attempts >= MAX_CODE_ATTEMPTS) {
    await col.deleteOne({ _id: objectId })
    return 'locked'
  }

  const ok = await bcrypt.compare(code, String(doc.codeHash))
  if (!ok) {
    const attempts = (typeof doc.attempts === 'number' ? doc.attempts : 0) + 1
    if (attempts >= MAX_CODE_ATTEMPTS) {
      await col.deleteOne({ _id: objectId })
      return 'locked'
    }
    await col.updateOne({ _id: objectId }, { $set: { attempts } })
    return 'wrong'
  }

  /* Single use: consumed the moment it works, so a code read over someone's
     shoulder is worthless the second time. */
  await col.deleteOne({ _id: objectId })
  return 'ok'
}

// ---- The half-way cookie ---------------------------------------------------

export async function createPendingSession(challengeId: string): Promise<boolean> {
  const token = await signPendingToken(challengeId)
  if (!token) return false
  const store = await cookies()
  store.set(PENDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: PENDING_MAX_AGE_SECONDS,
  })
  return true
}

/** The challenge this browser is part-way through, or null. */
export async function pendingChallengeId(): Promise<string | null> {
  const store = await cookies()
  return verifyPendingToken(store.get(PENDING_COOKIE)?.value)
}

export async function destroyPendingSession(): Promise<void> {
  const store = await cookies()
  store.delete(PENDING_COOKIE)
}

// ---------------------------------------------------------------------------
// Login rate limiting
// ---------------------------------------------------------------------------

/** Five wrong passwords per IP, then a fifteen-minute wait. Small numbers on
 *  purpose: there is exactly one legitimate user, and they know the password. */
const MAX_FAILURES = 5
const WINDOW_SECONDS = 15 * 60

declare global {
  var _zefractAttemptsIndex: Promise<unknown> | undefined
}

/**
 * The attempts collection, with its TTL index ensured once per process.
 *
 * A Mongo collection rather than an in-memory counter because this runs as a
 * serverless function: memory does not survive between invocations, so a
 * counter would reset on every request and limit nothing. The TTL index is the
 * whole cleanup story — Mongo deletes attempt documents itself once they age
 * past the window, so the count query below is already windowed and nothing
 * ever needs a cron. createIndex is idempotent; the globalThis cache just
 * saves a round trip per login, same pattern as the client in lib/mongodb.ts.
 */
async function attemptsCollection() {
  const db = await getDb()
  const col = db.collection(LOGIN_ATTEMPTS_COLLECTION)
  if (!globalThis._zefractAttemptsIndex) {
    globalThis._zefractAttemptsIndex = col.createIndex(
      { at: 1 },
      { expireAfterSeconds: WINDOW_SECONDS }
    )
  }
  await globalThis._zefractAttemptsIndex
  return col
}

/**
 * The caller's IP, best effort. x-nf-client-connection-ip is Netlify's own
 * header and cannot be forged past their proxy; x-forwarded-for's FIRST entry
 * is the client on well-behaved platforms. 'unknown' pools everyone the
 * platform failed to identify into one bucket, which throttles rather than
 * blocks — the right failure direction for a limit protecting one form.
 */
export async function clientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get('x-nf-client-connection-ip') ??
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

/** True while this IP still has attempts left in the window. */
export async function loginAllowed(ip: string): Promise<boolean> {
  const col = await attemptsCollection()
  const failures = await col.countDocuments({ ip })
  return failures < MAX_FAILURES
}

export async function recordFailedLogin(ip: string): Promise<void> {
  const col = await attemptsCollection()
  await col.insertOne({ ip, at: new Date() })
}

/** A successful login clears the slate, so a fumbled password earlier in the
 *  window cannot strand the real admin one typo from a lockout. */
export async function clearFailedLogins(ip: string): Promise<void> {
  const col = await attemptsCollection()
  await col.deleteMany({ ip })
}

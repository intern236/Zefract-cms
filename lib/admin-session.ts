import { SignJWT, jwtVerify } from 'jose'

/**
 * The admin session token: signing and verification, and nothing else.
 *
 * SPLIT OUT OF lib/admin-auth.ts ON PURPOSE. proxy.ts needs to verify the session
 * cookie, and proxy code runs in the edge runtime where lib/admin-auth.ts cannot
 * follow — it imports bcryptjs and the MongoDB driver, both Node-only. Everything
 * in THIS file is edge-safe (jose is built for it), so the cookie name and the
 * verification logic exist once and the proxy cannot drift from the server.
 *
 * The token is a JWT (HS256) carrying only `role: 'admin'`. There is exactly one
 * admin, so there is no user id to store; the signature IS the authentication.
 * Stateless by choice: no sessions collection to query on every admin request,
 * and revocation — the one thing statelessness gives up — is covered by rotating
 * SESSION_SECRET, which .env.example documents as the lost-device procedure.
 */

export const SESSION_COOKIE = 'zefract_admin'

/** Seven days. Long enough that writing a post over a week is one login, short
 *  enough that a stolen cookie has a horizon even if the secret never rotates. */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

/**
 * The signing key, or null when the environment cannot support sessions.
 *
 * Null rather than a throw: every caller treats a missing or short secret as
 * "verification failed", so a misconfigured deploy fails CLOSED — nobody can log
 * in, and nobody can be waved through. The 32-character floor is what makes
 * HS256 worth having; a short secret is brute-forceable offline from any
 * captured token.
 */
function secretKey(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) return null
  return new TextEncoder().encode(secret)
}

export function sessionConfigured(): boolean {
  return secretKey() !== null
}

// ---------------------------------------------------------------------------
// The half-way token, between the password and the emailed code
// ---------------------------------------------------------------------------

/**
 * A SECOND, DELIBERATELY WEAKER COOKIE. Getting the password right earns this
 * and nothing else: it says "someone knew the password and is owed a chance to
 * enter a code", which is not the same as being signed in.
 *
 * It is a separate cookie with a separate role claim, so nothing that guards
 * the admin can mistake one for the other — verifySessionToken below requires
 * `role === 'admin'` and a pending token carries `role === 'pending'`, so the
 * proxy and every server action reject it exactly as they reject a stranger.
 *
 * It carries the challenge id, which binds it to ONE emailed code. A pending
 * token cannot be replayed against a challenge issued later.
 */
export const PENDING_COOKIE = 'zefract_admin_pending'

/** Ten minutes: long enough to go and read an email, short enough that walking
 *  away from a half-finished login does not leave the door ajar. Matches the
 *  challenge's own expiry in lib/admin-auth.ts. */
export const PENDING_MAX_AGE_SECONDS = 10 * 60

export async function signPendingToken(challengeId: string): Promise<string | null> {
  const key = secretKey()
  if (!key) return null
  return new SignJWT({ role: 'pending', cid: challengeId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_MAX_AGE_SECONDS}s`)
    .sign(key)
}

/** The challenge id this token is for, or null if it is not a valid pending
 *  token. Never returns anything for an admin token: the two are not
 *  interchangeable in either direction. */
export async function verifyPendingToken(token: string | undefined): Promise<string | null> {
  if (!token) return null
  const key = secretKey()
  if (!key) return null
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    if (payload.role !== 'pending') return null
    return typeof payload.cid === 'string' ? payload.cid : null
  } catch {
    return null
  }
}

export async function signSessionToken(): Promise<string | null> {
  const key = secretKey()
  if (!key) return null
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(key)
}

/**
 * True only for a token this server signed, that has not expired, and that
 * carries the admin role. Any failure — no token, bad signature, expired,
 * wrong shape, missing secret — is the same false, because every one of them
 * means the same thing to a caller: not the admin.
 */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const key = secretKey()
  if (!key) return false
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    return payload.role === 'admin'
  } catch {
    return false
  }
}

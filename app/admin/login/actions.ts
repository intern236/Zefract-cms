'use server'

import { redirect } from 'next/navigation'
import { sessionConfigured } from '@/lib/admin-session'
import { sendAdminCode } from '@/lib/mail'
import {
  CODE_TTL_MINUTES,
  clearFailedLogins,
  clientIp,
  createPendingSession,
  createSession,
  destroyPendingSession,
  destroySession,
  loginAllowed,
  maskedCodeRecipient,
  pendingChallengeId,
  recordFailedLogin,
  startChallenge,
  twoFactorEnabled,
  verifyChallengeCode,
  verifyPassword,
} from '@/lib/admin-auth'

/**
 * Sign in, in one or two steps.
 *
 * ONE ACTION, NOT TWO, because the form is one form: which step it is showing
 * is a property of the attempt in progress, and the server is the only thing
 * that knows whether the password stage has been cleared. The client renders
 * from `state.step` and never decides it.
 *
 * THE SECOND FACTOR IS ON WHEN IT CAN BE. `twoFactorEnabled()` is true when
 * there is an address to mail a code to and a server to mail it with; with
 * neither, this is the password-only login it has always been. That is stated
 * rather than hidden: turning it on is setting ADMIN_2FA_EMAIL, and nothing in
 * the browser can turn it off.
 *
 * WHAT THE PASSWORD BUYS IS A CHANCE TO TYPE A CODE, and nothing else. The
 * pending cookie carries `role: 'pending'` and the challenge id; the proxy and
 * every server action require `role: 'admin'`, so a half-finished login opens
 * no doors at all.
 */

export type LoginState = {
  step: 'password' | 'code'
  error?: string
  notice?: string
  /** Masked, for the "we sent a code to…" line. Never the full address. */
  sentTo?: string
}

function asString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** Both steps report a failed attempt the same way, so a stranger cannot tell
 *  from the response which stage they got wrong. */
const GENERIC = 'That did not work. Try again.'

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const intent = asString(formData.get('intent'))

  if (!sessionConfigured() || !process.env.ADMIN_PASSWORD_HASH) {
    console.error(
      '[admin] login refused: ADMIN_PASSWORD_HASH and/or SESSION_SECRET are not set. ' +
        'Generate both with `node scripts/hash-admin-password.mjs` — see .env.example.'
    )
    return { step: 'password', error: 'Login is not available. Check the server log.' }
  }

  const ip = await clientIp()

  /* Backing out of the code step: drop the half-way cookie and start over.
     Checked before anything else, because it must work even when the challenge
     behind it has already expired. */
  if (intent === 'restart') {
    await destroyPendingSession()
    return { step: 'password' }
  }

  const challengeId = await pendingChallengeId()

  // ---- Step two: the emailed code ----------------------------------------
  if (challengeId) {
    if (!(await loginAllowed(ip))) {
      return { step: 'code', error: 'Too many attempts. Wait fifteen minutes and try again.' }
    }

    if (intent === 'resend') {
      const issued = await startChallenge(ip)
      const delivery = await sendAdminCode(issued.code, CODE_TTL_MINUTES)
      if (!delivery.sent && process.env.NODE_ENV !== 'production') {
        console.warn('[admin] 2FA email not sent (%s). Code: %s', delivery.error ?? 'not configured', issued.code)
      }
      if (!delivery.sent && process.env.NODE_ENV === 'production') {
        await destroyPendingSession()
        console.error('[admin] could not send the 2FA code: %s', delivery.error ?? 'not configured')
        return { step: 'password', error: 'Could not send the code. Check the server log.' }
      }
      await createPendingSession(issued.id)
      return {
        step: 'code',
        notice: 'A new code is on its way.',
        sentTo: maskedCodeRecipient() ?? undefined,
      }
    }

    const code = asString(formData.get('code')).replace(/\D/g, '')
    if (code.length !== 6) {
      return {
        step: 'code',
        error: 'Enter the six digits from the email.',
        sentTo: maskedCodeRecipient() ?? undefined,
      }
    }

    const result = await verifyChallengeCode(challengeId, code)
    if (result === 'ok') {
      await clearFailedLogins(ip)
      await destroyPendingSession()
      await createSession()
      redirect('/admin/blog')
    }

    /* A burnt or expired challenge cannot be retried, so the pending cookie
       goes with it rather than leaving a dead code box on screen. */
    if (result === 'expired' || result === 'locked') {
      await destroyPendingSession()
      await recordFailedLogin(ip)
      return {
        step: 'password',
        error:
          result === 'locked'
            ? 'Too many wrong codes. Start again.'
            : 'That code expired. Start again.',
      }
    }

    await recordFailedLogin(ip)
    return {
      step: 'code',
      error: 'That code is not right.',
      sentTo: maskedCodeRecipient() ?? undefined,
    }
  }

  // ---- Step one: the password --------------------------------------------
  if (!(await loginAllowed(ip))) {
    return { step: 'password', error: 'Too many attempts. Wait fifteen minutes and try again.' }
  }

  if (!(await verifyPassword(asString(formData.get('password'))))) {
    await recordFailedLogin(ip)
    return { step: 'password', error: GENERIC }
  }

  /* Password-only: no address to send a code to, so the password is the whole
     login. redirect() throws, so it comes last. */
  if (!twoFactorEnabled()) {
    await clearFailedLogins(ip)
    await createSession()
    redirect('/admin/blog')
  }

  const issued = await startChallenge(ip)
  const delivery = await sendAdminCode(issued.code, CODE_TTL_MINUTES)

  if (!delivery.sent) {
    /* IN PRODUCTION THIS FAILS THE ATTEMPT. Letting someone in because the code
       could not be delivered would make the second factor decorative — the one
       thing it must never be. In development the code goes to the server log
       instead, so the flow can be exercised without a mail server. */
    if (process.env.NODE_ENV === 'production') {
      console.error('[admin] could not send the 2FA code: %s', delivery.error ?? 'not configured')
      return { step: 'password', error: 'Could not send the code. Check the server log.' }
    }
    console.warn(
      '[admin] 2FA email not sent (%s). Code: %s',
      delivery.error ?? 'not configured',
      issued.code
    )
  }

  await createPendingSession(issued.id)
  return { step: 'code', sentTo: maskedCodeRecipient() ?? undefined }
}

export async function logout(): Promise<void> {
  await destroySession()
  await destroyPendingSession()
  redirect('/admin/login')
}

import nodemailer, { type Transporter } from 'nodemailer'
import { CONFIRMATION } from '@/content/contact-form'
import { absoluteUrl } from '@/lib/url'
import {
  adminCodeEmail,
  confirmationEmail,
  notificationEmail,
  type ContactSubmission,
} from '@/lib/mail-templates'

/**
 * Outbound email: the internal notification a contact submission triggers, and the
 * confirmation sent back to the person who filled the form in.
 *
 * WHY THE GLOBAL, same as lib/mongodb.ts: a transporter holds a connection pool, and building
 * one per request would open an SMTP connection per submission. In development it is worse —
 * every hot reload re-evaluates this module, so a long editing session would leak a pool per
 * save. Stashing it on `globalThis` survives module re-evaluation where a module-scope variable
 * does not.
 *
 * SERVER-ONLY. This reads credentials and opens a socket. It is imported by the route handler in
 * app/api/contact/route.ts and nowhere else; pulling it into a client component would be a build
 * error, which is the outcome we want.
 */

declare global {
  var _zefractMailer: Transporter | undefined
}

/** Who gets told. Comma-separated so more than one inbox can be added without a code change. */
function recipients(): string[] {
  return (process.env.MAIL_TO ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * True when real SMTP credentials are present.
 *
 * Exported so the route can say plainly in its logs that a submission was stored but nobody was
 * notified, rather than appearing to have sent something.
 */
export function mailIsConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && recipients().length > 0)
}

function transporter(): Transporter {
  if (globalThis._zefractMailer) return globalThis._zefractMailer

  /* KEYED ON SMTP_HOST ALONE, not on mailIsConfigured(). Whether we can send at
     all is a property of the server; MAIL_TO only says who the CONTACT form
     notifies. When this checked both, a deploy with SMTP set up but no MAIL_TO
     fell back to jsonTransport and silently swallowed the admin's two-factor
     code as well — a mail that has nothing to do with MAIL_TO. */
  if (!process.env.SMTP_HOST) {
    /* NO CREDENTIALS: capture instead of send. `jsonTransport` serialises the message and
       resolves, so local development works with no mail server and the message can be asserted
       on in a test. It does NOT deliver anything, which is why the route logs a warning whenever
       this path is taken — a deploy missing SMTP_HOST would otherwise look healthy while quietly
       telling nobody. */
    globalThis._zefractMailer = nodemailer.createTransport({ jsonTransport: true })
    return globalThis._zefractMailer
  }

  globalThis._zefractMailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    /* 465 is implicit TLS; 587 starts plaintext and upgrades with STARTTLS. Deriving it from the
       port rather than asking for a third variable, because getting these two out of step is the
       usual cause of "connection closed unexpectedly". Override with SMTP_SECURE if a provider
       does something unusual. */
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
    /* A submission is already saved by the time we get here, so a hanging mail server must not
       hold the visitor's request open. Fail in seconds and let the route log it. */
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  })
  return globalThis._zefractMailer
}

/**
 * Kept as a name because the route imports it, but the shape now lives with the templates:
 * they are what actually constrains it, and two copies of one record is how the two drift.
 */
export type ContactNotification = ContactSubmission

/**
 * The outcome of one send.
 *
 * `skipped` means there were no credentials, so nothing left the building — distinct from
 * `sent: false` with an `error`, which means we tried and failed. The caller logs the two
 * differently because they need different fixes: one is a missing environment variable, the
 * other is a mail server to go and look at.
 */
export type MailResult = { sent: boolean; skipped?: boolean; error?: string }

/* The bodies of both messages live in lib/mail-templates.ts, along with the escaping they
   depend on. This file is transport: who to send to, over which connection, and what to do
   when it fails. The split is what lets the templates be rendered and checked without a mail
   server, which matters more here than usual, since the tenant has SMTP AUTH disabled and
   nothing can currently be sent at all.

/**
 * Sends the internal "someone got in touch" email.
 *
 * Returns a result rather than throwing: the caller has already stored the submission, and an
 * email that fails is a problem for us, not a reason to tell the visitor their message did not
 * arrive. The route logs the outcome.
 */
export async function sendContactNotification(
  submission: ContactNotification
): Promise<MailResult> {
  const to = recipients()
  const configured = mailIsConfigured()
  /* The canonical origin, handed to the template rather than hardcoded in it — see the
     note on emailDocument's `siteUrl`. Every message this file sends links to the same
     host the site publishes as canonical. */
  const { subject, text, html } = notificationEmail(submission, absoluteUrl('/'))

  /* Nobody to tell. Returned before the send rather than after, because the
     transporter is now live whenever SMTP_HOST is set — without this, an unset
     MAIL_TO would post a real message to the placeholder address below. */
  if (to.length === 0) return { sent: false, skipped: true }

  try {
    await transporter().sendMail({
      from: process.env.MAIL_FROM ?? 'Zefract website <no-reply@zefract.com>',
      to: to.length > 0 ? to : 'unconfigured@localhost',
      /* Hitting Reply answers the person who filled the form in, rather than the sending
         mailbox. The `from` stays ours so the message passes SPF and DKIM — putting the
         visitor's address there is the classic way to get a notification binned as spoofed. */
      replyTo: `${submission.name} <${submission.email}>`,
      subject,
      text,
      html,
    })
    return configured ? { sent: true } : { sent: false, skipped: true }
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Sends the visitor their own confirmation.
 *
 * WHY THIS EXISTS AS A SECOND MESSAGE rather than a Cc on the internal one. A Cc would show the
 * visitor our inbox layout, our reference id and whatever else we choose to put in a staff
 * email, and it would show every future recipient of MAIL_TO the visitor's address. Two
 * messages means each is written for the person reading it.
 *
 * REPLY-TO IS THE TEAM INBOX, and that is not a detail. The success screen tells the visitor to
 * "reply to the confirmation email" if it is urgent, so a reply that bounced off a no-reply
 * sender would break a promise the site makes on the very same click. `from` stays MAIL_FROM
 * so the message still passes SPF and DKIM on our own domain.
 *
 * THEIR MESSAGE IS QUOTED BACK, escaped through the same `esc` the internal email uses. It is
 * their own text so there is nothing to defend against on their side, but it lands in an inbox
 * that renders HTML, and the rule here is that no free text reaches a mail body unescaped.
 *
 * Same contract as the notification: returns a result, never throws. A confirmation that fails
 * is a worse experience, not a lost lead — the submission is already stored and the internal
 * email is a separate send that is unaffected.
 *
 * A NOTE FOR WHOEVER ADDS RATE LIMITING. This is an autoresponder: it sends mail from our
 * domain to an address a stranger typed. That is normal and expected for a contact form, and
 * the honeypot plus the required-field checks stop the cheapest abuse, but there is no rate
 * limit on the route today. Anyone scripting it can make us mail an arbitrary address
 * repeatedly, which is a deliverability problem for us before it is a problem for them. Per-IP
 * throttling on /api/contact is the fix, and it is on the hand-back list.
 */
export async function sendContactConfirmation(
  submission: ContactNotification
): Promise<MailResult> {
  const to = recipients()
  const configured = mailIsConfigured()

  /* Substituted rather than interpolated inside the template, so content/contact-form.ts stays
     plain data and mail-templates.ts stays free of anything to import. One token, so a replace
     is the whole templating layer this needs. */
  const body = CONFIRMATION.body.map((line) => line.replace('{name}', submission.name))
  const { subject, text, html } = confirmationEmail(
    submission,
    CONFIRMATION,
    body,
    absoluteUrl('/')
  )

  try {
    await transporter().sendMail({
      from: process.env.MAIL_FROM ?? 'Zefract website <no-reply@zefract.com>',
      to: `${submission.name} <${submission.email}>`,
      /* The team inbox, so "reply to this email" works. Falls back to the sending address when
         MAIL_TO is unset — which is already the unconfigured path where nothing is delivered
         anyway, so this only keeps the header valid rather than doing any real work. */
      replyTo: to.length > 0 ? to.join(', ') : undefined,
      subject,
      text,
      html,
    })
    return configured ? { sent: true } : { sent: false, skipped: true }
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// ---------------------------------------------------------------------------
// The admin's two-factor code
// ---------------------------------------------------------------------------

/** Where the sign-in code goes. Separate from MAIL_TO on purpose: that is the
 *  sales inbox and may well be a shared one, which is the last place a
 *  credential should land. Unset means two-factor is off — see lib/admin-auth.ts. */
export function adminCodeRecipient(): string | null {
  const address = process.env.ADMIN_2FA_EMAIL?.trim()
  return address ? address : null
}

/** True when a code can actually be delivered: somewhere to send it, and a
 *  server to send it with. */
export function adminCodeIsConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && adminCodeRecipient())
}

/**
 * Sends the sign-in code.
 *
 * Returns a result rather than throwing, like everything else here — but the
 * CALLER MUST NOT PROCEED ON FAILURE. A contact email that does not arrive is
 * our problem to chase; a code that does not arrive is the second factor
 * missing, and continuing without it would turn two-factor into a formality.
 * The login action fails the attempt and says so.
 */
export async function sendAdminCode(code: string, minutes: number): Promise<MailResult> {
  const to = adminCodeRecipient()
  if (!to || !process.env.SMTP_HOST) return { sent: false, skipped: true }

  const { subject, text, html } = adminCodeEmail(code, minutes, absoluteUrl('/'))
  try {
    await transporter().sendMail({
      from: process.env.MAIL_FROM ?? 'Zefract website <no-reply@zefract.com>',
      to,
      subject,
      text,
      html,
    })
    return { sent: true }
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Both emails for one submission, sent concurrently.
 *
 * CONCURRENT, NOT SEQUENTIAL, because this runs inside the visitor's request on a serverless
 * function: awaiting one send after the other doubles the worst case they wait for, and the two
 * have nothing to say to each other. They share the pooled transporter, so this is two messages
 * over the same connection rather than two connections.
 *
 * `Promise.all` is safe here specifically because neither of these functions rejects — both
 * catch and return a result. If either ever starts throwing, this needs `allSettled`, or one
 * failure will take the other's result with it.
 */
export async function sendContactEmails(
  submission: ContactNotification
): Promise<{ notification: MailResult; confirmation: MailResult }> {
  const [notification, confirmation] = await Promise.all([
    sendContactNotification(submission),
    sendContactConfirmation(submission),
  ])
  return { notification, confirmation }
}

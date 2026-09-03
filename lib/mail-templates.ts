/**
 * The HTML and plain-text bodies of the two emails a contact submission sends.
 *
 * DELIBERATELY IMPORT-FREE. No nodemailer, no `@/` alias, no content module: everything it
 * needs arrives as an argument. That is what makes the templates renderable outside the mail
 * transport, and here that is not a nicety. The tenant has SMTP AUTH disabled, so nothing can
 * actually be sent from this codebase today, which means rendering IS the verification. A
 * module with no dependencies compiles standalone and can be executed to produce the exact
 * bytes the site would put in an inbox.
 *
 * WHY EMAIL HTML LOOKS LIKE 1999. Outlook on Windows renders through Word, which has no flex,
 * no grid, and unreliable support for bare block elements. Tables with explicit widths are the
 * only layout primitive that behaves in every client, and styles have to be inline because most
 * webmail strips <style>. None of the markup below is how you would build a web page, and all
 * of it is how you have to build an email.
 */

/** Site tokens, restated. Email cannot read a stylesheet, so these are the values by hand. */
const INK = '#0f2038'
const MUT = '#5a6676'
const MUT_2 = '#646d7a'
const LINE = '#e2e6ec'
const PAGE = '#f1f3f6'
const SURFACE = '#ffffff'
const BRAND = '#e6551e'

/**
 * A body font stack, not the site's.
 *
 * Plus Jakarta Sans is a webfont, and a webfont in email loads in roughly two clients and is
 * ignored by the rest, so specifying it only guarantees an inconsistent result. This is the
 * stack that resolves to the reader's own system face everywhere. `system-ui` is deliberately
 * absent: several clients parse it as an unknown family and fall through to Times.
 */
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const MONO = "Consolas,Monaco,'Courier New',monospace"

/**
 * Escapes text before it goes into an HTML body.
 *
 * The name, company and message are free text a stranger typed into a public form, and an
 * internal inbox is still an inbox. Moved here from mail.ts because escaping is a property of
 * the template, not of the transport, and keeping it beside the interpolation is what makes it
 * checkable that nothing gets interpolated without it.
 */
export function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Escaped text with its line breaks turned into <br>.
 *
 * REPLACES `white-space:pre-wrap`, which is what the message box used to rely on. Word ignores
 * pre-wrap, so in Outlook a message typed as several paragraphs arrived as one run-on block.
 * The visitor's own paragraphing is information about what they are asking for, so losing it in
 * the client most business readers use is a real loss, not a cosmetic one.
 */
function escMultiline(value: string): string {
  return esc(value).replace(/\r?\n/g, '<br>')
}

/**
 * The shared frame: document, background, container, header, footer.
 *
 * DARK MODE IS THE REASON THIS EXISTS AT ALL, beyond looks. The old shell set a text colour and
 * no background. Apple Mail and Outlook mobile invert the surrounding surface in dark mode while
 * preserving an explicitly-set colour, so dark navy text ended up on a near-black ground. Two
 * things fix it together: `color-scheme`/`supported-color-schemes` tell the client this message
 * has one intended appearance so it should not force-invert, and every element that states a
 * text colour also states its own background, so a client that inverts anyway has a ground to
 * honour rather than a transparent element to guess at.
 *
 * The preheader is the grey line a mail app shows after the subject. Left unset it becomes
 * whatever the first words of the body happen to be, so it is set on purpose.
 */
function emailDocument({
  title,
  preheader,
  body,
  siteUrl,
}: {
  title: string
  preheader: string
  body: string
  /**
   * The canonical origin, PASSED IN rather than imported.
   *
   * The footer link was hardcoded to `https://www.zefract.com` and so was the only
   * URL on the project that did not come from content/site.ts — it survived the move
   * to the apex host by not being connected to anything, which is exactly how a
   * hardcoded address drifts. It cannot be imported here: this module is deliberately
   * dependency-free so the templates can be rendered and checked without a mail
   * server, and its own contract is that everything it needs arrives as an argument.
   * So it arrives as an argument.
   */
  siteUrl: string
}): string {
  /* The display form, derived from the value we were handed rather than restated, so
     the label and the href can never name different hosts. */
  const siteLabel = siteUrl.replace(/^https?:\/\//, '')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${PAGE};color:${INK};font-family:${SANS};">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE}" style="background-color:${PAGE};">
<tr>
<td align="center" style="padding:28px 12px 36px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${SURFACE}" style="width:600px;max-width:100%;background-color:${SURFACE};border:1px solid ${LINE};border-radius:14px;">
<tr>
<td style="padding:20px 28px;border-bottom:1px solid ${LINE};background-color:${SURFACE};">
<span style="font-family:${SANS};font-size:17px;font-weight:700;letter-spacing:-0.02em;color:${INK};">Zefract</span><span style="font-family:${SANS};font-size:11px;color:${BRAND};" role="presentation">&#9679;</span>
</td>
</tr>
<tr>
<td style="padding:28px;background-color:${SURFACE};font-family:${SANS};font-size:15px;line-height:1.55;color:${INK};">
${body}
</td>
</tr>
<tr>
<td style="padding:16px 28px 20px;border-top:1px solid ${LINE};background-color:${PAGE};font-family:${SANS};font-size:12px;line-height:1.5;color:${MUT_2};">
<a href="${siteUrl}" style="color:${MUT_2};text-decoration:none;">${esc(siteLabel)}</a>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`
}

/** The fields of one submission, as the templates need them. */
export type ContactSubmission = {
  id: string
  name: string
  email: string
  company: string
  /** E.164 — `+919311441557` — or empty when the optional field was left blank. The route
   *  reduces it to this shape before it gets here, so the notification never has to
   *  reformat a number before it can be dialled. */
  phone: string
  budget: string
  message: string
  receivedAt: Date
}

/** The confirmation wording, passed in so content/contact-form.ts stays plain data. */
export type ConfirmationCopy = {
  subject: string
  heading: string
  body: readonly string[]
  echoLabel: string
  signoff: string
}

export type RenderedEmail = { subject: string; text: string; html: string }

/** The quoted-message block, shared so the two emails present a message identically. */
function messageBlock(label: string, message: string): string {
  return `<p style="margin:0 0 8px;font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUT_2};">${esc(label)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE}" style="background-color:${PAGE};border:1px solid ${LINE};border-radius:10px;">
<tr><td style="padding:14px 16px;font-family:${SANS};font-size:15px;line-height:1.55;color:${INK};background-color:${PAGE};">${escMultiline(message)}</td></tr>
</table>`
}

/**
 * The internal "someone got in touch" email.
 *
 * Shares the frame with the confirmation so the two cannot drift, but the body stays a dense
 * label/value table: this is read at the twentieth enquiry of the week, and scanning speed is
 * what it is for.
 */
export function notificationEmail(
  submission: ContactSubmission,
  siteUrl: string
): RenderedEmail {
  const subjectParts = [submission.name, submission.company].filter(Boolean)
  const subject = `New enquiry: ${subjectParts.join(' · ')}`

  const rows: [string, string][] = [
    ['Name', submission.name],
    ['Email', submission.email],
    /* Directly under the email, because the two are the same question — how to answer
       this person — and the row order is what someone triaging scans.

       THE "Not given" FALLBACK SHOULD NO LONGER FIRE, and it is kept anyway. The field
       became required, so the route refuses a submission without a number and this string
       can only appear if something upstream changes back or a message is rendered from an
       older record. That is exactly when a fallback earns its place: a row reading "Phone:"
       with nothing after it looks like a broken template, where the words say plainly that
       there is no number to ring. */
    ['Phone', submission.phone || 'Not given'],
    ['Company', submission.company || 'Not given'],
    ['Budget', submission.budget || 'Not given'],
    ['Received', submission.receivedAt.toISOString()],
    ['Reference', submission.id],
  ]

  /* What the inbox list shows after the subject: who, and how much. Enough to triage without
     opening anything. */
  const preheader = [submission.company || null, submission.budget || 'Budget not given']
    .filter(Boolean)
    .join(' · ')

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Message:',
    submission.message,
    '',
    'Reply to this email to answer the sender directly.',
  ].join('\n')

  const html = emailDocument({
    title: subject,
    preheader,
    siteUrl,
    body: `<p style="margin:0 0 4px;font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND};">New enquiry</p>
<p style="margin:0 0 20px;font-size:20px;font-weight:700;letter-spacing:-0.02em;color:${INK};">${esc(submission.name)}</p>
<!-- Every cell states its own background as well as its colour. A td that sets only a colour
     is the dark-mode hazard this rewrite exists to remove, and a detail table is the easiest
     place to reintroduce it one row at a time. -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${SURFACE}" style="margin:0 0 22px;background-color:${SURFACE};">
${rows
  .map(
    ([k, v], i) =>
      `<tr><td style="padding:7px 16px 7px 0;font-family:${MONO};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${MUT_2};white-space:nowrap;vertical-align:top;background-color:${SURFACE};${i === 0 ? '' : `border-top:1px solid ${LINE};`}">${esc(k)}</td><td style="padding:7px 0;font-family:${SANS};font-size:14px;font-weight:600;color:${INK};background-color:${SURFACE};${i === 0 ? '' : `border-top:1px solid ${LINE};`}">${esc(v)}</td></tr>`
  )
  .join('\n')}
</table>
${messageBlock('Message', submission.message)}
<p style="margin:22px 0 0;font-size:13px;color:${MUT};">Reply to this email to answer ${esc(submission.name)} directly.</p>`,
  })

  return { subject, text, html }
}

/**
 * The admin's sign-in code.
 *
 * DELIBERATELY BARE. There is no link in it, no button, and nothing to click:
 * a code that arrives beside a "sign in" link teaches the reader that clicking
 * links in emails about their account is normal, which is the exact habit
 * phishing depends on. The only thing to do with this message is read six
 * digits and type them into the tab already open.
 *
 * The code sits in a big monospace block because it is going to be transcribed,
 * often from a phone. Letter-spacing is applied per character rather than to
 * the run, since Outlook ignores `letter-spacing` on a block often enough that
 * spacing the digits by hand is the only reliable way.
 *
 * The subject line carries the code too: on a phone the notification is
 * frequently all anyone reads, and it saves opening the message at all.
 */
export function adminCodeEmail(
  code: string,
  minutes: number,
  siteUrl: string
): RenderedEmail {
  const subject = `${code} is your Zefract admin code`
  const spaced = code.split('').join(' ')

  const text = [
    `Your Zefract admin sign-in code is ${code}.`,
    '',
    `It expires in ${minutes} minutes and can be used once.`,
    '',
    'If you did not just try to sign in, someone else has the admin password.',
    'Change it, and rotate SESSION_SECRET to sign out every device.',
  ].join('\n')

  const html = emailDocument({
    title: subject,
    preheader: `Expires in ${minutes} minutes.`,
    siteUrl,
    body: `<p style="margin:0 0 4px;font-family:${MONO};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND};">Admin sign in</p>
<p style="margin:0 0 20px;font-size:20px;font-weight:700;letter-spacing:-0.02em;color:${INK};">Your sign-in code</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE}" style="background-color:${PAGE};border:1px solid ${LINE};border-radius:10px;">
<tr><td align="center" style="padding:22px 16px;font-family:${MONO};font-size:30px;font-weight:700;color:${INK};background-color:${PAGE};">${esc(spaced)}</td></tr>
</table>
<p style="margin:20px 0 0;font-size:15px;line-height:1.6;color:${MUT};">Type it into the sign-in page you already have open. It expires in ${minutes} minutes and works once.</p>
<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:${MUT_2};">If you did not just try to sign in, someone else has the admin password. Change it, and rotate SESSION_SECRET to sign every device out.</p>`,
  })

  return { subject, text, html }
}

/**
 * The visitor's own confirmation.
 *
 * The copy is the client's, from content/contact-form.ts, passed in rather than imported so
 * this module stays dependency-free. `{name}` is substituted by the caller.
 */
export function confirmationEmail(
  submission: ContactSubmission,
  copy: ConfirmationCopy,
  body: string[],
  siteUrl: string
): RenderedEmail {
  const text = [
    copy.heading,
    '',
    ...body,
    '',
    `${copy.echoLabel}:`,
    submission.message,
    '',
    copy.signoff,
  ].join('\n')

  const html = emailDocument({
    title: copy.subject,
    /* The first line of the message itself, which already opens by saying what happened. A
       second sentence written only for the preview would be one more thing to keep in step
       with copy the client owns. */
    preheader: body[0] ?? copy.heading,
    siteUrl,
    body: `<p style="margin:0 0 16px;font-size:22px;font-weight:700;letter-spacing:-0.02em;line-height:1.25;color:${INK};">${esc(copy.heading)}</p>
${body.map((line) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${MUT};">${esc(line)}</p>`).join('\n')}
<div style="height:10px;line-height:10px;font-size:10px;">&nbsp;</div>
${messageBlock(copy.echoLabel, submission.message)}
<p style="margin:22px 0 0;font-size:15px;color:${INK};">${esc(copy.signoff)}</p>`,
  })

  return { subject: copy.subject, text, html }
}

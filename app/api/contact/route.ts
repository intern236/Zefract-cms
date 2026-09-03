import { getDb, CONTACT_COLLECTION } from '@/lib/mongodb'
import { sendContactEmails } from '@/lib/mail'
import { BUDGETS } from '@/content/contact-form'
import { DEFAULT_DIAL_ISO, validatePhone } from '@/lib/phone'

/**
 * Receives a start-a-project submission and stores it.
 *
 * POST is never cached by Next, so there is no route config to add here.
 *
 * WHY VALIDATION IS REPEATED SERVER-SIDE. The form marks fields `required` and types the email
 * input, but those are conveniences for the person filling it in, not a control — anyone can
 * POST this endpoint directly with curl. Everything below is re-checked here, and this is the
 * only check that actually protects the collection.
 *
 * Hand-rolled rather than reaching for a schema library: five fields, and the rules are short
 * enough to read in one screen. Worth revisiting if this grows a second form.
 */

/** Guards against someone pasting a novel into a text field and filling the collection. */
const LIMITS = {
  name: 120,
  email: 200,
  company: 160,
  budget: 60,
  /* The number as typed, before cleaning. 32 is generous for a longest-in-the-world
     national number plus the spaces, brackets and country code someone might paste in
     front of it — and short enough that this field cannot be used to store prose. */
  phone: 32,
  /* An ISO 3166-1 alpha-2 code, so two characters. Anything longer did not come from the
     menu, and `validatePhone` refuses it regardless. */
  phoneCountry: 2,
  message: 4000,
} as const

type Field = keyof typeof LIMITS

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Deliberately permissive: one @, something either side, a dot in the domain.
 *
 * Stricter regexes reject real addresses — the RFC grammar allows quoted local parts and plenty
 * else that looks wrong — and the real proof an address works is whether the reply arrives. This
 * is here to catch typos and obvious junk, not to be a spec.
 */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Expected a JSON body.' }, { status: 400 })
  }

  /* The honeypot. A bot that fills every field it finds trips this, and we answer 200 so it
     never learns the submission was dropped — a 400 here is free feedback for whoever is
     tuning the bot. Nothing is written. */
  if (asString(payload.botField)) {
    return Response.json({ ok: true }, { status: 200 })
  }

  const values = {} as Record<Field, string>
  for (const field of Object.keys(LIMITS) as Field[]) {
    values[field] = asString(payload[field])
  }

  const errors: Record<string, string> = {}
  if (!values.name) errors.name = 'Tell us your name.'
  if (!values.email) errors.email = 'We need an email to reply to.'
  else if (!looksLikeEmail(values.email)) errors.email = 'That email does not look right.'
  if (!values.message) errors.message = 'Tell us what you are trying to ship.'

  for (const field of Object.keys(LIMITS) as Field[]) {
    if (values[field].length > LIMITS[field]) {
      errors[field] = `That is longer than we can store (${LIMITS[field]} characters).`
    }
  }

  /* Budget is a fixed list, so anything else was not chosen from the menu. Rejected rather than
     stored, because a value outside the list would quietly break any later reporting on it. The
     empty string is allowed: the field is optional. */
  /* Widened to readonly string[] because BUDGETS is a const tuple of literals, and `includes`
     on that type only accepts one of those literals — which is exactly the value we do not have
     yet. The cast is the check, not a way around it. */
  if (values.budget && !(BUDGETS as readonly string[]).includes(values.budget)) {
    errors.budget = 'Choose a budget from the list.'
  }

  /**
   * The phone number, checked against its country's numbering plan and reduced to E.164.
   *
   * THE SAME FUNCTION THE FORM RUNS, from lib/phone.ts, which is the point of it living
   * there. The form's copy tells the visitor at the field; this one is the control, because
   * this endpoint takes a POST from anywhere and a browser check protects nothing. Sharing
   * the function means the two can never disagree about what a valid number is — the
   * failure mode that would otherwise be silent, and the reason BUDGETS is shared too.
   *
   * OPTIONAL, SO AN EMPTY FIELD IS NOT AN ERROR. Only a number someone actually typed is
   * judged; the form's own copy promises that a name, an email and a message are all we
   * need, and a required phone would quietly break that promise on the same screen.
   *
   * WHAT IS STORED IS E.164, NOT WHAT WAS TYPED — `+919311441557`, never "093114 41557" or
   * "(0)93114-41557". The database holds one shape, so a number is dialable from the
   * notification email without anyone reformatting it, and a later export cannot contain
   * three spellings of the same number. The country is stored beside it because +1 alone
   * cannot say whether an enquiry came from the United States or Canada.
   */
  let phoneE164: string | null = null
  let phoneIso: string | null = null
  if (values.phone) {
    const check = validatePhone(values.phone, values.phoneCountry || DEFAULT_DIAL_ISO)
    if (!check.ok) errors.phone = check.error
    else {
      phoneE164 = check.e164
      phoneIso = (values.phoneCountry || DEFAULT_DIAL_ISO).toUpperCase()
    }
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 })
  }

  try {
    const db = await getDb()
    const receivedAt = new Date()
    const inserted = await db.collection(CONTACT_COLLECTION).insertOne({
      ...values,
      /* AFTER the spread, so these overwrite the raw strings `values` carries. What was
         typed is deliberately not kept: a second copy of the same number in a different
         shape is the thing a later export would have to reconcile. */
      phone: phoneE164,
      phoneCountry: phoneIso,
      /* Stored, not derived at read time, so a submission is self-describing if it is ever
         exported. `receivedAt` rather than `createdAt` because the server clock is the only one
         we trust — the browser's is whatever the visitor's machine says. */
      receivedAt,
      /* Enough to tell a real submission from a scripted one after the fact, without storing
         anything identifying beyond what the visitor typed. No IP address: it is personal data
         under GDPR, it would need a lawful basis and a retention policy, and it is not worth
         that for a contact form. */
      source: 'contact-page',
      userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
    })

    /* NEITHER EMAIL CAN COST US THE LEAD.
       The submission is already committed at this point, so both emails are a best-effort step
       after the fact. `sendContactEmails` returns results rather than throwing, and either way
       the visitor gets a 201 — a mail server that is down is our problem to fix, not a reason to
       tell someone their message did not arrive and lose it entirely.

       Two messages go out: the internal notification to MAIL_TO, and the confirmation back to
       the address on the form. They are sent concurrently and reported separately, because they
       fail for different reasons and only one of them is recoverable by hand — a notification
       that never arrives is still sitting in the database, while a confirmation that never
       arrives is a promise the success screen already made on the visitor's behalf.

       Awaited rather than fired and forgotten, because this runs as a serverless function on
       Netlify: work still in flight when the response returns can be killed with the container.
       The transporter's own timeouts cap how long that wait can be, and sending in parallel
       means the wait is one send long rather than two. */
    const { notification, confirmation } = await sendContactEmails({
      id: String(inserted.insertedId),
      ...values,
      /* The dialable form, same as the stored one — the notification prints it as a row
         someone acts on, and "093114 41557" is not a number anyone abroad can ring. */
      phone: phoneE164 ?? '',
      receivedAt,
    })

    /* One warning for the missing-credentials case rather than one per message: both are
       skipped by the same unset variables, and saying so twice per submission makes the log
       harder to read, not more informative. */
    if (notification.skipped || confirmation.skipped) {
      console.warn(
        '[contact] submission %s stored, but NO EMAIL WAS SENT: SMTP_HOST/MAIL_TO are not set',
        inserted.insertedId
      )
    } else {
      if (!notification.sent) {
        console.error(
          '[contact] submission %s stored, but the notification failed: %s',
          inserted.insertedId,
          notification.error
        )
      }
      if (!confirmation.sent) {
        console.error(
          '[contact] submission %s stored, but the confirmation to %s failed: %s',
          inserted.insertedId,
          values.email,
          confirmation.error
        )
      }
    }

    return Response.json({ ok: true }, { status: 201 })
  } catch (error) {
    /* Logged server-side, deliberately not returned. A driver error can name the cluster, the
       database and sometimes the credentials; the visitor gets a message telling them what to
       do instead. */
    console.error('[contact] failed to store submission', error)
    return Response.json(
      { error: 'We could not save that. Please email us directly.' },
      { status: 503 }
    )
  }
}

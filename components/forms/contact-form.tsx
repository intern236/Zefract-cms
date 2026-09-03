'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { PillButton } from '@/components/ui/pill'
import { Field, FIELD_BASE, FIELD_HEIGHT, SELECT_BASE } from '@/components/forms/field'
import { BUDGETS } from '@/content/contact-form'
import { DEFAULT_DIAL_ISO, DIAL_CODES, dialCodeFor, validatePhone } from '@/lib/phone'

/**
 * Start-a-project form. Submissions are stored in MongoDB.
 *
 * WHAT CHANGED, AND WHAT IT COST. This used to post to Netlify Forms, which detects forms by
 * parsing deployed HTML at build time — hence the static declaration in public/__forms.html that
 * this component posted to. Submissions now go to our own route handler at /api/contact, which
 * writes them to a collection we control and can query.
 *
 * The thing Netlify was also providing was an email notification on every submission. Nothing
 * here replaces that: a submission lands in the database and nobody is told. That is a launch
 * blocker, not a detail — see the hand-back notes. public/__forms.html is left in place so the
 * old path can be restored in one edit if that turns out to be the wrong trade.
 *
 * VALIDATION IS SERVER-SIDE AND MIRRORED HERE. The `required` attributes below are a convenience
 * for the person filling the form in; the route re-checks everything, because that is the only
 * check a curl request has to pass. Errors come back per field and are rendered against their
 * own control by <Field>.
 */

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [failure, setFailure] = useState<string | null>(null)
  /**
   * Tracked only so the placeholder can look like one.
   *
   * A <select> has no ::placeholder, and the CSS route (`:has(option[value=""]:checked)`)
   * measured as not re-evaluating reliably when the value changed. State is three lines and
   * leaves nothing to chance.
   */
  const [budget, setBudget] = useState('')
  /**
   * The phone country and the number, as separate pieces of state.
   *
   * TWO CONTROLS, ONE VALUE. They are posted as two fields and stored as one E.164 string,
   * because a number without its country code is not a number you can dial — and the code
   * is what decides how many digits the rest should be. Keeping them apart in the form and
   * joining them on the server means the visitor never has to type "+91" and the database
   * never holds "93114 41557" with no way to know where it rings.
   *
   * The country is state rather than an uncontrolled select for the same reason `budget`
   * is: the number field re-validates the moment the country changes, since the same digits
   * can be a valid Indian mobile and an invalid Singaporean one.
   */
  const [phoneIso, setPhoneIso] = useState(DEFAULT_DIAL_ISO)
  const [phone, setPhone] = useState('')

  /**
   * The placeholder states the rule the field is about to be judged against.
   *
   * A CONCRETE EXAMPLE WOULD BE THE HOUSE STYLE — every other placeholder here is one
   * ("you@company.com", "Where you work") — and it is the wrong choice for this field.
   * A sample number is either the company's own, which people do type in, or an invented
   * one, which is a fake number sitting in the middle of a form. The digit count says the
   * same thing more usefully and changes with the country, so the rule arrives before the
   * error rather than after it.
   */
  const phoneCountry = dialCodeFor(phoneIso)
  const phonePlaceholder = !phoneCountry
    ? 'Phone number'
    : phoneCountry.lengths.length === 1
      ? `${phoneCountry.lengths[0]} digits`
      : `${phoneCountry.lengths[0]}–${phoneCountry.lengths.at(-1)} digits`

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    /* Checked before the request rather than after it. The route re-checks and is the
       actual control — see the note at the top of this file — but a number the browser can
       already see is wrong should not cost a round trip to be told so. Empty is fine: the
       field is optional, and only a filled one is judged. */
    if (phone.trim()) {
      const check = validatePhone(phone, phoneIso)
      if (!check.ok) {
        setErrors({ phone: check.error })
        setStatus('idle')
        return
      }
    }

    setStatus('sending')
    setErrors({})
    setFailure(null)

    const data = new FormData(event.currentTarget)
    /* Sent as JSON rather than form-encoded so the route can read a typed object and reject a
       body that is not one. Keys match the field names the route validates. */
    const body = {
      name: data.get('name'),
      email: data.get('email'),
      company: data.get('company'),
      budget: data.get('budget'),
      /* Sent raw, exactly as typed, with the country beside it. The server does the
         cleaning and the joining — if this posted a pre-assembled E.164 string, the route
         would be trusting the browser to have built it, which is the one thing it is not
         allowed to do. */
      phone: data.get('phone'),
      phoneCountry: data.get('phoneCountry'),
      message: data.get('message'),
      botField: data.get('botField'),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setStatus('sent')
        return
      }

      const payload = (await res.json().catch(() => ({}))) as {
        errors?: Record<string, string>
        error?: string
      }
      if (payload.errors) {
        setErrors(payload.errors)
        setStatus('idle')
        return
      }
      setFailure(payload.error ?? 'That did not send.')
      setStatus('error')
    } catch {
      /* Network-level failure: the request never reached us, so there is nothing to report but
         the fact of it. */
      setFailure('That did not send. Check your connection, or email us directly.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="card-pop rounded-card border border-line bg-surface p-9 text-center"
      >
        <h2 className="text-[26px] font-extrabold tracking-[-0.025em] text-head">
          Thanks, that reached us.
        </h2>
        <p className="mx-auto mt-3 max-w-[42ch] text-[16px] text-mut">
          You will get scope, a timeline and a number back within three working days. If it is
          urgent, reply to the confirmation email and say so.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      /* Same .card-pop as every other card, per the client's call. The one wrinkle a form has is
         that the pointer stays inside it for the whole time someone is filling it in, so an
         unqualified hover would sit lifted and glowing while they type. `form.card-pop:focus-within`
         in globals.css settles it back the moment focus lands in a field. */
      className="card-pop rounded-card border border-line bg-surface p-7 md:p-9"
    >
      {/* Honeypot: hidden from people, tempting to bots. The route drops any submission that
          fills it and answers 200 anyway, so a bot never learns it was caught. */}
      <p className="hidden">
        <label>
          Do not fill this in <input name="botField" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Your name"
          name="name"
          required
          autoComplete="name"
          placeholder="Full name"
          error={errors.name}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email}
        />
        {/* PHONE SPANS BOTH COLUMNS, which is a consequence of it being two controls
            rather than a preference. At the sm breakpoint a half-width cell is ~258px;
            the country select needs ~150px of it before the number has anywhere to go,
            which leaves about a hundred pixels for eleven digits. Across the full row the
            select keeps its width and the number takes the rest.

            It also keeps the rows even: five fields in a two-column grid would otherwise
            leave one stranded alone on the last row. Name and email, then how else to
            reach you, then the two optional ones. */}
        <div className="space-y-1.5 sm:col-span-2">
          {/* NO `justify-between` HERE, unlike every other field on this form, and the
              difference is the full-width row rather than an inconsistency.

              That rule puts the Optional tag on the right edge of the control it describes,
              which is exactly right in a half-width cell — Company's sits a couple of
              hundred pixels from its label and reads as belonging to it. Across the whole
              form the same rule threw it about three hundred pixels out, against the far
              margin, where it stopped reading as this field's marker and started reading as
              a stray word floating above the row.

              Beside the label it is unambiguous at any width, which is what the tag is for. */}
          <div className="flex items-baseline gap-3">
            {/* Points at the NUMBER, not the country select — that is the control someone
                clicking this label wants focus in, and the select carries its own
                aria-label because its options say what it is. */}
            <Label htmlFor="phone" className="text-[13.5px] font-semibold text-head">
              Phone
            </Label>
            <span className="font-mono text-[12px] tracking-[0.12em] text-mut-2 uppercase sm:text-[10px]">
              Optional
            </span>
          </div>

          <div className="flex gap-2">
            {/* The country code. A native select for exactly the reasons the budget one
                below gives, and now sharing SELECT_BASE with it rather than restating the
                treatment a second time.

                THE DIAL CODE LEADS THE COUNTRY NAME — "+91 India", not "India +91" — and
                that ordering is load-bearing. A native select shows the selected option's
                own text in a box this narrow, so a long name is clipped; leading with the
                code means what survives the clip is the part that matters. It is also what
                the visitor is checking when they glance back at the field.

                No autoComplete: the browser's `tel-country-code` expects "+91" and this
                posts an ISO code, so offering it would invite a fill that silently sets the
                wrong country. The number beside it takes the autofill instead. */}
            <div className="relative w-[9.5rem] shrink-0 sm:w-[12rem]">
              <select
                id="phoneCountry"
                name="phoneCountry"
                aria-label="Country dialling code"
                value={phoneIso}
                onChange={(event) => {
                  setPhoneIso(event.target.value)
                  /* The same digits can be a valid Indian mobile and an invalid
                     Singaporean one, so a message about the old country is worse than no
                     message — it is now describing a rule that no longer applies. */
                  setErrors((previous) => {
                    if (!previous.phone) return previous
                    /* A copy with the key deleted, not a rest-spread. The inline
                       `({ phone, ...rest }) => rest` is the obvious form and trips the
                       unused-variable rule on the very name it exists to discard — the
                       same snag lib/author-display.ts documents at toAuthorOption. */
                    const next = { ...previous }
                    delete next.phone
                    return next
                  })
                }}
                className={cn(SELECT_BASE, FIELD_HEIGHT, 'pr-10 text-head')}
              >
                {DIAL_CODES.map((country) => (
                  /* ONE INTERPOLATION, NOT THREE. Written as `+{dial} {name}` React sees
                     three children and separates them with `<!-- -->` comment nodes so it
                     can find the boundaries again when it hydrates — which is correct and
                     invisible, but it is three of them in each of forty-nine options, in
                     the HTML and again in the flight payload beneath it. A single template
                     string is one text node and renders identically. */
                  <option key={country.iso} value={country.iso}>
                    {`+${country.dial} ${country.name}`}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-mut-2"
              />
            </div>

            {/* type="tel" rather than "number": a number input strips a leading zero,
                rejects the spaces and brackets people write numbers with, and puts a
                spinner on a value nothing should increment. inputMode gives a phone the
                keypad without any of that. */}
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={phonePlaceholder}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={cn(FIELD_BASE, FIELD_HEIGHT, 'min-w-0 flex-1')}
            />
          </div>

          {errors.phone ? (
            <p id="phone-error" className="text-[13px] text-red-600">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <Field
          label="Company"
          name="company"
          optional
          autoComplete="organization"
          placeholder="Where you work"
          error={errors.company}
        />

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="budget" className="text-[13.5px] font-semibold text-head">
              Budget
            </Label>
            {/* Matches <Field optional> exactly. Hand-written because this control is a native
                select rather than a <Field>, for the reason below. */}
            <span className="font-mono text-[12px] tracking-[0.12em] text-mut-2 uppercase sm:text-[10px]">
              Optional
            </span>
          </div>
          {/* A native select, not the shadcn/Radix one. Radix renders a custom listbox that needs
              JavaScript to work at all, and a budget field is not worth making conditional on
              that — a native select is always usable and always submits.

              The open list is styled in globals.css, in two tiers. Where `appearance:
              base-select` is supported — Chrome 135+ — the popup becomes a real element in the
              page and gets our surface, radius, shadow, rounded rows and checkmark. Everywhere
              else it falls back to two colour properties on the options, which is all a legacy
              select allows, and on macOS to the platform's own popup. Function is identical in
              every case: it is a native select throughout and always submits.

              Height and inline padding come from FIELD_HEIGHT so this stays level with the
              <Field> controls either side of it. */}
          <div className="relative">
            <select
              id="budget"
              name="budget"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              aria-invalid={errors.budget ? true : undefined}
              aria-describedby={errors.budget ? 'budget-error' : undefined}
              className={cn(
                /* SELECT_BASE, not a hand-copy of FIELD_BASE. This used to restate every
                   class in it with a comment promising to keep the two in step by hand;
                   the phone country select above would have made that two promises, so
                   the treatment moved into field.tsx where both read it. */
                SELECT_BASE,
                FIELD_HEIGHT,
                // pr-10 after the shared padding, so the chevron keeps its own gutter.
                'pr-10',
                budget === '' ? 'text-mut-2' : 'text-head'
              )}
            >
              <option value="" disabled>
                Select a range
              </option>
              {BUDGETS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {/* Our own chevron, inset 12px from the edge — the native arrow sat hard against the
                border with nothing to separate it. `pointer-events-none` so clicking the icon
                still opens the select. */}
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-mut-2"
            />
          </div>
          {errors.budget ? (
            <p id="budget-error" className="text-[13px] text-red-600">
              {errors.budget}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <Field
          as="textarea"
          label="What are you trying to ship?"
          name="message"
          required
          placeholder="A brief, a deck, or three bullet points. What are you building, what is not working, and when does it need to be live?"
          error={errors.message}
        />
      </div>

      {/* One announcement for the whole submission, rather than a live region per field. Covers
          both a failed request and a rejected one, since either way the visitor needs telling
          that nothing was sent. */}
      {status === 'error' || Object.keys(errors).length > 0 ? (
        <p
          role="alert"
          className="mt-5 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700"
        >
          {failure ?? 'Check the fields marked above and send it again.'}
        </p>
      ) : null}

      {/* A ruled footer rather than a button floating alone in the card's whitespace, which is
          how it read before: 52px of ink at the bottom-left with nothing balancing it. The rule
          closes the field group off, and the note fills the space to the button's right on wide
          screens while stacking under it on a phone.

          The note says which fields are required, which is the one thing the labels above cannot
          tell you at a glance now that the convention here is to mark the OPTIONAL ones. */}
      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <PillButton
          type="submit"
          variant="ink"
          className="w-full sm:w-auto"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Sending…' : 'Send it over'}
        </PillButton>
        <p className="text-[13.5px] text-mut-2">
          Name, email and a message are all we need.
        </p>
      </div>
    </form>
  )
}

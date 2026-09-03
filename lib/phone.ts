/**
 * One country's dialling code and what a valid national number looks like there.
 *
 * `iso` IS THE KEY, NOT `dial`, because dialling codes are not unique — the United States
 * and Canada share +1, and a form that stored "+1" could not say which country was picked.
 * The ISO code is also what a stored submission stays readable as years later.
 *
 * `lengths` IS THE NATIONAL SIGNIFICANT NUMBER, i.e. what is left after the country code
 * and after the trunk prefix a domestic caller dials — the `0` in the UK's 07911 or India's
 * 011. `validatePhone` strips one leading zero before measuring, because typing it is the
 * habit of everyone who has ever dialled the number at home, and rejecting a real number
 * over a digit the international format does not use would be the worst possible outcome
 * for a contact form.
 */
export type DialCode = {
  /** ISO 3166-1 alpha-2. */
  iso: string
  name: string
  /** Country calling code, digits only, no plus. */
  dial: string
  /** Every national-number length the country's plan allows, ascending. */
  lengths: readonly number[]
}

/**
 * The countries the contact form offers, with the digit counts their numbering plans
 * allow.
 *
 * WHAT THIS LIST IS FOR, AND WHAT IT IS NOT. It exists so a mistyped number is caught while
 * the visitor still has the right one in front of them, which is the only moment the
 * correction is free. It is length-and-shape validation, in the same spirit as
 * `looksLikeEmail` in app/api/contact/route.ts and with the same honest limit: it catches
 * typos, transpositions, pasted rubbish and numbers pasted into the wrong country. It
 * cannot tell you a well-formed number is disconnected, and nothing short of dialling it
 * can. The real proof a number works is that someone answers it.
 *
 * WHY NOT libphonenumber-js, which would know the prefixes as well as the lengths. It is
 * ~145KB with full metadata for one optional field on one form, on a site held to an LCP
 * budget, and its strictness cuts both ways: a plan that has just issued a new mobile
 * prefix rejects real customers until the library is updated. Length rules go stale far
 * more slowly. If this form ever becomes the main way business arrives, that trade is worth
 * revisiting — it is a swap of this table for the library and nothing else, because every
 * caller goes through `validatePhone` below.
 *
 * WHERE A PLAN IS GENUINELY VARIABLE THE RANGE IS DELIBERATELY PERMISSIVE. Germany and
 * Italy issue numbers across several lengths, so those entries accept several; being
 * slightly too generous costs nothing, while being too strict silently turns away an
 * enquiry and tells nobody it happened. That asymmetry decides every judgement call here.
 *
 * NO LEADING-DIGIT RULES, deliberately, though they were the obvious next check. India's
 * mobile numbers all start 6-9, so "reject anything else" looks safe — until a Delhi
 * landline arrives as 11xxxxxxxx and is refused. The rule would be right about the common
 * case and wrong about a real customer, which is the wrong way round for a form whose whole
 * job is to let people reach us.
 *
 * INDIA IS FIRST AND THE REST ARE ALPHABETICAL. The company is Indian and most enquiries
 * are, so the default costs nobody a scroll; after that, alphabetical is a rule rather than
 * a ranking, so nobody has to argue about who comes next.
 *
 * A COUNTRY THAT IS NOT HERE IS NOT A DEAD END, because the whole field is optional — the
 * form still submits with the number left blank, and the message field takes anything. Add
 * an entry rather than loosening the rules if a market starts mattering.
 */
export const DIAL_CODES: readonly DialCode[] = [
  { iso: 'IN', name: 'India', dial: '91', lengths: [10] },
  { iso: 'AR', name: 'Argentina', dial: '54', lengths: [10] },
  { iso: 'AU', name: 'Australia', dial: '61', lengths: [9] },
  { iso: 'BH', name: 'Bahrain', dial: '973', lengths: [8] },
  { iso: 'BD', name: 'Bangladesh', dial: '880', lengths: [10] },
  { iso: 'BE', name: 'Belgium', dial: '32', lengths: [8, 9] },
  { iso: 'BR', name: 'Brazil', dial: '55', lengths: [10, 11] },
  { iso: 'CA', name: 'Canada', dial: '1', lengths: [10] },
  { iso: 'CN', name: 'China', dial: '86', lengths: [11] },
  { iso: 'DK', name: 'Denmark', dial: '45', lengths: [8] },
  { iso: 'EG', name: 'Egypt', dial: '20', lengths: [9, 10] },
  { iso: 'FR', name: 'France', dial: '33', lengths: [9] },
  { iso: 'DE', name: 'Germany', dial: '49', lengths: [7, 8, 9, 10, 11] },
  { iso: 'HK', name: 'Hong Kong', dial: '852', lengths: [8] },
  { iso: 'ID', name: 'Indonesia', dial: '62', lengths: [9, 10, 11, 12] },
  { iso: 'IE', name: 'Ireland', dial: '353', lengths: [7, 8, 9] },
  { iso: 'IL', name: 'Israel', dial: '972', lengths: [9] },
  { iso: 'IT', name: 'Italy', dial: '39', lengths: [9, 10, 11] },
  { iso: 'JP', name: 'Japan', dial: '81', lengths: [9, 10] },
  { iso: 'KE', name: 'Kenya', dial: '254', lengths: [9] },
  { iso: 'KW', name: 'Kuwait', dial: '965', lengths: [8] },
  { iso: 'MY', name: 'Malaysia', dial: '60', lengths: [9, 10] },
  { iso: 'MX', name: 'Mexico', dial: '52', lengths: [10] },
  { iso: 'NP', name: 'Nepal', dial: '977', lengths: [10] },
  { iso: 'NL', name: 'Netherlands', dial: '31', lengths: [9] },
  { iso: 'NZ', name: 'New Zealand', dial: '64', lengths: [8, 9, 10] },
  { iso: 'NG', name: 'Nigeria', dial: '234', lengths: [8, 10] },
  { iso: 'NO', name: 'Norway', dial: '47', lengths: [8] },
  { iso: 'OM', name: 'Oman', dial: '968', lengths: [8] },
  { iso: 'PK', name: 'Pakistan', dial: '92', lengths: [10] },
  { iso: 'PH', name: 'Philippines', dial: '63', lengths: [10] },
  { iso: 'PL', name: 'Poland', dial: '48', lengths: [9] },
  { iso: 'PT', name: 'Portugal', dial: '351', lengths: [9] },
  { iso: 'QA', name: 'Qatar', dial: '974', lengths: [8] },
  { iso: 'SA', name: 'Saudi Arabia', dial: '966', lengths: [9] },
  { iso: 'SG', name: 'Singapore', dial: '65', lengths: [8] },
  { iso: 'ZA', name: 'South Africa', dial: '27', lengths: [9] },
  { iso: 'KR', name: 'South Korea', dial: '82', lengths: [9, 10] },
  { iso: 'ES', name: 'Spain', dial: '34', lengths: [9] },
  { iso: 'LK', name: 'Sri Lanka', dial: '94', lengths: [9] },
  { iso: 'SE', name: 'Sweden', dial: '46', lengths: [7, 8, 9] },
  { iso: 'CH', name: 'Switzerland', dial: '41', lengths: [9] },
  { iso: 'TW', name: 'Taiwan', dial: '886', lengths: [9] },
  { iso: 'TH', name: 'Thailand', dial: '66', lengths: [9] },
  { iso: 'TR', name: 'Turkey', dial: '90', lengths: [10] },
  { iso: 'AE', name: 'United Arab Emirates', dial: '971', lengths: [8, 9] },
  { iso: 'GB', name: 'United Kingdom', dial: '44', lengths: [9, 10] },
  { iso: 'US', name: 'United States', dial: '1', lengths: [10] },
  { iso: 'VN', name: 'Vietnam', dial: '84', lengths: [9] },
]

/** What the form opens on. India, for the reason the list order gives. */
export const DEFAULT_DIAL_ISO = 'IN'

/** The entry for an ISO code, or undefined — which is how the server rejects a country
 *  that did not come from the menu, exactly as it does for a budget band. */
export function dialCodeFor(iso: string): DialCode | undefined {
  return DIAL_CODES.find((entry) => entry.iso === iso.toUpperCase())
}

/**
 * Everything a person might reasonably type between the digits of a phone number.
 *
 * Spaces, dashes, dots and brackets are how numbers are WRITTEN — "(020) 7946-0958" is a
 * correctly formatted London number — so they are separators to be ignored, not errors. A
 * leading `+` is allowed too, because someone pasting a full international number into a
 * field that already shows a country code is making an understandable mistake rather than a
 * typo; `validatePhone` strips the country code back off if it is there.
 *
 * Anything else — a letter, a comma, a second number after a slash — is a sign the field
 * holds something that is not one phone number, and it is refused with a message saying so.
 */
const SEPARATORS = /[\s\-().]/g

export type PhoneCheck =
  /** `e164` is what gets stored and dialled: +, country code, national number, no spaces. */
  | { ok: true; e164: string; national: string }
  | { ok: false; error: string }

/**
 * Checks a typed number against its country's numbering plan.
 *
 * SHARED BY THE FORM AND THE ROUTE, and that is the point of it being here rather than in
 * either. The form runs it so the visitor is told at the field; the route runs it again
 * because the form is a convenience and the route is the control — the same arrangement,
 * and the same reasoning, as every other field on this form. Two copies of a numbering rule
 * would drift, and the failure would be silent: a number the browser accepted and the
 * server rejected, or worse, the other way round.
 *
 * IT IS A PURE FUNCTION OF ITS ARGUMENTS. No `navigator`, no locale sniffing, no network —
 * so it behaves identically in a client component and in a route handler, and the same
 * input always produces the same message.
 */
export function validatePhone(raw: string, iso: string): PhoneCheck {
  const country = dialCodeFor(iso)
  if (!country) return { ok: false, error: 'Choose a country code from the list.' }

  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, error: 'Enter a phone number.' }

  /* Checked BEFORE stripping, so "555-CALL-NOW" is refused rather than quietly becoming
     "555". Stripping first and then measuring what survived would accept any string that
     happened to contain the right number of digits. */
  const cleaned = trimmed.replace(/^\+/, '').replace(SEPARATORS, '')
  if (!/^\d+$/.test(cleaned)) {
    return { ok: false, error: 'Use digits only — spaces, dashes and brackets are fine.' }
  }

  /* A full international number pasted into a field that already shows the country code.
     The country code is removed rather than the entry refused, because the person has given
     us exactly the right number and only put it in twice. Guarded on the remainder still
     being a plausible length, so a national number that merely happens to start with its
     own country's digits is not truncated: India's 917... is a real mobile. */
  let national = cleaned
  if (national.startsWith(country.dial)) {
    const withoutDial = national.slice(country.dial.length)
    if (country.lengths.includes(withoutDial.length)) national = withoutDial
  }

  /* The trunk prefix — the 0 in 07911 or 011 — belongs to domestic dialling and is not part
     of an international number. Everyone types it, so it is removed rather than rejected. */
  if (national.startsWith('0')) national = national.slice(1)

  if (!national) return { ok: false, error: 'Enter a phone number.' }

  /* Every digit the same is not a number anyone was given; it is a field being filled in to
     get past it. Cheap to catch, and there is no real number it can refuse. */
  if (new Set(national).size === 1) {
    return { ok: false, error: 'That does not look like a real number.' }
  }

  if (!country.lengths.includes(national.length)) {
    const expected =
      country.lengths.length === 1
        ? `${country.lengths[0]} digits`
        : `${country.lengths.slice(0, -1).join(', ')} or ${country.lengths.at(-1)} digits`
    return {
      ok: false,
      /* Says the rule AND what was typed. "Invalid phone number" makes someone recount by
         hand; "10 digits — that is 9" tells them they dropped one.

         "A NUMBER IN INDIA", NOT "AN INDIAN NUMBER". The country names in the table are
         nouns, so the adjective form would need a second column of demonyms — and the
         naive `A ${name} number` reads "A India number", which is the kind of thing that
         ships because nobody says the error message out loud. Putting the name after a
         preposition sidesteps both the adjective and the a/an. */
      error: `A number in ${country.name} is ${expected} — that is ${national.length}.`,
    }
  }

  return { ok: true, e164: `+${country.dial}${national}`, national }
}

/**
 * Click-to-call URL for a phone number.
 *
 * `tel:` wants digits and, for anything that has to work from outside the country, a leading `+`
 * for the country code. Everything else in a human-readable number — spaces, dashes, brackets —
 * is stripped: some dialers cope with them, older Android ones drop the call.
 *
 * The display string in content/site.ts stays formatted for reading; only the href is flattened,
 * exactly as `whatsappHref` does for wa.me.
 */
export function telHref(number: string): string {
  return `tel:${telE164(number)}`
}

/**
 * The same number without the `tel:` scheme — for structured data.
 *
 * schema.org's `telephone` is parsed by machines, and Google's guidance is an unambiguous
 * international number. Handing it the display string with spaces in it works but leaves the
 * parsing to them; `+919311441557` does not.
 */
export function telE164(number: string): string {
  const digits = number.replace(/\D/g, '')
  /* Keeps the + only if the source had one. A number written without a country code is a local
     number, and inventing a prefix for it would dial the wrong place. */
  return `${number.trim().startsWith('+') ? '+' : ''}${digits}`
}

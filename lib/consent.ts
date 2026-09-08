/**
 * The visitor's cookie decision: where it is kept, how it is read, and who is told.
 *
 * WHY THIS IS A MODULE AND NOT REACT STATE. Three things need the answer and none of
 * them can hold it for the others: the inline Google Tag Manager loader in
 * components/analytics/google-tag-manager.tsx, which runs before React does and has to
 * know whether to release the container's cookies; <ConsentBanner>, which asks the
 * question; and the "Cookie settings" control in the footer, which sits in a different
 * subtree entirely and has to be able to reopen the banner. A context provider wrapping
 * the whole app would serve the last two and could never serve the first, because the
 * first is a string of JavaScript in the document head.
 *
 * SO THE COOKIE IS THE SOURCE OF TRUTH and this file is the only thing that reads or
 * writes it. Everything else subscribes.
 *
 * WHY A COOKIE AND NOT localStorage. Section 05 of the privacy policy already documents
 * the storage this uses: its table lists "consent record" under strictly necessary
 * cookies, alongside the session cookie. Putting the decision in localStorage instead
 * would keep the site's own record of consent somewhere the published disclosure does
 * not mention, which is the kind of small inconsistency the whole banner exists to
 * remove. It also survives in the one place localStorage does not: a cookie rides along
 * with the document request, so a future server-rendered variant of this gate can read
 * it with no round trip.
 *
 * WHY IT IS NOT READ ON THE SERVER TODAY, though it could be. Reading cookies in the
 * root layout opts EVERY route on the site out of static rendering, because a layout
 * that reads a request header cannot be prerendered. That is a heavy price for removing
 * a few hundred milliseconds of banner delay on one visit in a visitor's lifetime, so
 * the decision is resolved in the browser and the server renders no banner at all. See
 * <ConsentBanner> for how that stays clear of a hydration mismatch.
 */

/**
 * The cookie's name. Read here, written here, and interpolated into the GTM loader's
 * inline script, so the two cannot drift apart on it.
 */
export const CONSENT_COOKIE = 'zf_consent'

/**
 * The banner version a decision was given to.
 *
 * IT IS PART OF THE STORED RECORD BECAUSE THE POLICY SAYS IT IS: section 05 commits to
 * keeping "what you agreed to, when, and from which banner version". It is also the
 * re-ask mechanism. A record carrying an older version is treated as absent by
 * parseConsent() below, so the day this site starts setting a category of cookie the
 * banner did not describe, raising this number asks everyone again rather than quietly
 * reusing permission that was given for something else.
 *
 * RAISING IT IS A DECISION, NOT A CHORE. Every visitor sees the banner again.
 */
export const CONSENT_VERSION = 1

/**
 * Six months, which is a choice rather than a default.
 *
 * Consent that never expires is consent that outlives the visitor's memory of giving it.
 * Six months is the CNIL's long-standing recommendation and the interval most European
 * supervisory authorities have converged on, and it is short enough that a change in what
 * the site does reaches everybody within one cycle even if nobody remembers to raise
 * CONSENT_VERSION.
 */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 182

/** What the visitor decided about non-essential cookies. Necessary ones are not on offer. */
export type ConsentDecision = 'granted' | 'denied'

export type ConsentRecord = {
  version: number
  decision: ConsentDecision
  at: number
}

/**
 * The stored format: `v1.granted.1712345678901`.
 *
 * FLAT TEXT RATHER THAN JSON, and that is worth a line. The GTM loader has to read this
 * value out of `document.cookie` inside an inline script that runs before any of the
 * app's JavaScript, with a regular expression and nothing else. A JSON payload would
 * have to be decoded and parsed there, in a string of code that cannot import a helper
 * and must not throw, and that parse would be a second implementation of a format which
 * already has one here. Three dot-separated fields need neither.
 */
function serialise(decision: ConsentDecision): string {
  return `v${CONSENT_VERSION}.${decision}.${Date.now()}`
}

/**
 * The prefix the loader script matches to release the container's cookies on a return
 * visit. Exported so that script is built from this constant rather than from the same
 * string typed out a second time.
 */
export const CONSENT_GRANTED_PREFIX = `v${CONSENT_VERSION}.granted.`

export function parseConsent(raw: string): ConsentRecord | null {
  const match = /^v(\d+)\.(granted|denied)\.(\d+)$/.exec(raw)
  if (!match) return null
  const version = Number(match[1])
  /* A record from an older banner is not a record. See CONSENT_VERSION. */
  if (version !== CONSENT_VERSION) return null
  return { version, decision: match[2] as ConsentDecision, at: Number(match[3]) }
}

function readCookie(): string {
  const match = new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`).exec(document.cookie)
  return match ? decodeURIComponent(match[1]) : ''
}

/**
 * Global Privacy Control, honoured because the privacy policy says it is.
 *
 * `navigator.globalPrivacyControl` is `true` when the visitor's browser or an extension
 * is broadcasting an opt-out. It is a standing instruction rather than a page-level one,
 * so it is read fresh on every snapshot rather than captured once.
 *
 * IT DECIDES ONLY WHERE THERE IS NO ON-SITE CHOICE, and that ordering is deliberate
 * enough to be worth arguing with. A visitor who has clicked "Accept all" on this banner
 * has said something specific about this site, and treating a browser-wide default as
 * overriding it would mean they could never opt in at all while the signal is on, with
 * no explanation of why their click did nothing. The reverse reading is defensible too,
 * and under CPRA a GPC signal is a valid opt-out in its own right. If this site ever
 * takes Californian traffic seriously enough for that to bite, the change is one line in
 * getConsentSnapshot(): test GPC before the cookie rather than after it.
 */
function globalPrivacyControl(): boolean {
  return (
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
  )
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    /** Defined by the GTM loader's inline script. Absent if that script never ran. */
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Google Consent Mode v2 signals, pushed the moment the visitor decides.
 *
 * THROUGH `window.gtag` RATHER THAN `dataLayer.push` DIRECTLY, and this is the detail
 * that quietly breaks a hand-rolled consent gate. `gtag` is
 * `function(){dataLayer.push(arguments)}` — it pushes the *arguments object*, and
 * Google's consent API identifies a consent command by that object's type. Pushing the
 * equivalent plain array `['consent','update',{...}]` looks identical in the dataLayer
 * preview and is ignored. So the function the loader defines is the one called here,
 * rather than a second one written to look like it.
 *
 * The optional call is not defensive noise: an ad blocker that strips the GTM script
 * leaves `gtag` undefined, and in that case there is nothing to tell.
 */
function pushConsentUpdate(decision: ConsentDecision): void {
  const value: ConsentDecision = decision
  window.gtag?.('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
    personalization_storage: value,
  })
  /* A named event as well, so the container can fire tags on the decision itself. A
     consent update is a state change rather than a trigger, and GTM has no built-in
     event for it. */
  window.dataLayer?.push({ event: 'zf_consent_update', zf_consent: decision })
}

/* ---- The store -----------------------------------------------------------------
   A hand-written external store read through useSyncExternalStore, rather than React
   state. Two things live in it: the cookie, which is real storage, and whether the
   footer has asked for the banner to be reopened, which is not.

   BOTH SNAPSHOTS ARE PRIMITIVES. useSyncExternalStore compares snapshots with Object.is
   and re-renders whenever they differ, so a getter that built a fresh object on every
   call would loop forever. Returning the raw cookie string sidesteps that with no cache:
   two reads of an unchanged cookie produce the same string, and strings compare by
   value.

   NOTHING SYNCHRONISES ACROSS TABS. Cookies fire no storage event, so a decision made in
   one tab reaches another only on its next navigation. That is acceptable for a banner
   nobody sees twice, and it is the reason this is worth stating rather than discovering. */

const listeners = new Set<() => void>()
let reopened = false

function emit(): void {
  for (const listener of listeners) listener()
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * The snapshot for a render that has not reached the browser yet: the server pass, and
 * the hydration pass that has to match it.
 *
 * IT CANNOT BE `''`. That value means "no decision on record", which would put the banner
 * into the server-rendered HTML for everybody, including the returning visitor who
 * accepted months ago, and then tear it out a moment later. A sentinel keeps the
 * pre-browser state distinct from every real one. Stored records always begin with `v`,
 * so nothing can collide with it.
 */
export const CONSENT_UNRESOLVED = 'unresolved'

/** No decision on record, and the browser is asking us not to track. See globalPrivacyControl(). */
export const CONSENT_GPC = 'gpc'

export function getConsentSnapshot(): string {
  const raw = readCookie()
  if (raw && parseConsent(raw)) return raw
  return globalPrivacyControl() ? CONSENT_GPC : ''
}

export function getConsentServerSnapshot(): string {
  return CONSENT_UNRESOLVED
}

export function getReopenedSnapshot(): boolean {
  return reopened
}

export function getReopenedServerSnapshot(): boolean {
  return false
}

/**
 * Reopen the banner so a decision can be changed. What the footer's "Cookie settings"
 * control calls, and the second half of the withdrawal route section 05 promises.
 */
export function openConsentSettings(): void {
  reopened = true
  emit()
}

/** Close it again without recording anything. The banner's "Cancel", when reopened. */
export function closeConsentSettings(): void {
  reopened = false
  emit()
}

/**
 * Record a decision: the cookie, then the tag manager, then every subscriber.
 *
 * THE ORDER IS THE POINT. The cookie is written first so a tag firing off the update
 * below finds the record already in place, and so a visitor who navigates away in the
 * same instant still has their answer stored.
 */
export function writeConsent(decision: ConsentDecision): void {
  /* Secure only where there is a secure context to have it. Setting it unconditionally
     would make the cookie unwritable over plain http, which is `next dev` reached from a
     phone across the local network. */
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${serialise(decision)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`

  pushConsentUpdate(decision)

  reopened = false
  emit()
}

'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Cookie } from 'lucide-react'
import { PillButton } from '@/components/ui/pill'
import { CONSENT } from '@/content/site'
import {
  CONSENT_GPC,
  CONSENT_UNRESOLVED,
  closeConsentSettings,
  getConsentServerSnapshot,
  getConsentSnapshot,
  getReopenedServerSnapshot,
  getReopenedSnapshot,
  parseConsent,
  subscribeConsent,
  writeConsent,
  type ConsentDecision,
} from '@/lib/consent'

/**
 * The cookie banner: the question, asked once.
 *
 * WHAT IT IS FOR. Section 05 of the privacy policy promises a consent banner on first
 * visit, non-essential cookies off by default, and a way to change your mind later. This is
 * the first and third of those; the second is the Consent Mode default in
 * components/analytics/google-tag-manager.tsx, which is where it has to be because it runs
 * before React does. Neither half works alone.
 *
 * IT RENDERS NOTHING ON THE SERVER, AND THAT IS THE WHOLE HYDRATION STORY. Whether to show
 * this depends on a cookie, and reading a cookie during the server render would opt every
 * route on the site out of static rendering — see the note in lib/consent.ts. So the store's
 * server snapshot is a sentinel meaning "not resolved yet", React renders `null` for it on
 * the server AND on the hydrating pass that has to match, and only the pass after that reads
 * the real cookie. A returning visitor never sees the banner flash.
 *
 * useSyncExternalStore RATHER THAN A useEffect THAT SETS STATE. The obvious version reads
 * the cookie in an effect and calls setState, which is a cascading render and exactly what
 * the `react-hooks/set-state-in-effect` rule refuses — the same rule that already shaped
 * components/admin/html-source.tsx. This hook exists for precisely this shape: an external
 * value, read at the right moment, with a server snapshot that keeps hydration honest.
 *
 * IT DOES NOT TAKE FOCUS ON A FIRST VISIT. Moving focus here on every first page load would
 * put a keyboard user inside a banner they did not navigate to and strand the skip link,
 * which is the first thing they need. It is a labelled region instead, reachable by landmark
 * navigation and by Tab, in the standard place at the end of the document. It DOES take
 * focus when reopened from the footer, because then the visitor asked for it and would
 * otherwise have to hunt for what their click did.
 *
 * THERE IS NO CLOSE BUTTON ON A FIRST VISIT, deliberately. An X that dismisses the banner
 * without recording anything means the visitor is asked again on the next page and the site
 * has no answer either way, and read the other way round it is consent by dismissal, which
 * is the thing the policy explicitly disclaims. The only ways out are the two answers.
 * Reopened from the footer there IS a way out, because then a decision already exists to
 * fall back to.
 *
 * IT IS NOT MODAL. No scrim, no focus trap, no scroll lock: the page underneath stays
 * usable, which is both the accessible choice for a persistent notice and the honest one.
 * A wall in front of the content is pressure to click through it.
 */
export function ConsentBanner() {
  const record = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  )
  const reopened = useSyncExternalStore(
    subscribeConsent,
    getReopenedSnapshot,
    getReopenedServerSnapshot
  )

  /**
   * Kept mounted for the length of the exit animation.
   *
   * WHY IT IS NEEDED AT ALL. Answering writes the cookie, which changes the snapshot, which
   * makes this component return `null` on the very next render — so the card would vanish
   * mid-frame with nothing to animate. Delaying the write until an animation finished was
   * the alternative and is worse: the decision has to reach the tag manager the instant it
   * is made, not 200ms later, and a visitor who navigates away during those 200ms would
   * have answered a question the site never recorded. So the write stays immediate and this
   * flag holds the element in the tree until the animation says it is done with it.
   */
  const [leaving, setLeaving] = useState(false)

  const heading = useRef<HTMLHeadingElement>(null)

  const resolved = record !== CONSENT_UNRESOLVED
  const open = resolved && (record === '' || reopened)

  useEffect(() => {
    /* Focus, not state. An effect that only touches the DOM is not a cascading render, so
       this is clear of the rule described above. `preventScroll` because the banner is
       already in the viewport by definition, and without it Safari jumps the page. */
    if (reopened) heading.current?.focus({ preventScroll: true })
  }, [reopened])

  /**
   * Tell the page the bar is up, so the two floating controls can get out of its way.
   *
   * WHY THEY HAVE TO. The bar is centred on the bottom edge, and <WhatsAppButton> and
   * <BackToTop> live on that same edge at the right. Whether the two actually meet depends
   * on the viewport: the bar stops growing at 56rem, so above roughly 1050px they clear
   * each other and below it they overlap, with the worst case being a laptop at 1024px
   * where the WhatsApp disc pokes out past the bar's right end by a few pixels. That is a
   * band of widths, not an edge case, and no amount of tuning the bar's width makes it go
   * away without pinning the bar off-centre.
   *
   * SO THEY ARE HIDDEN RATHER THAN MOVED. Nudging them upward is the more polished answer
   * and it needs a number: how tall the bar is. That changes with the copy, with the
   * viewport, and with whether the reopened state adds a line, so the number would be a
   * guess maintained by hand in a second file — which is the exact coupling
   * back-to-top.tsx already warns about for its own offsets. Hiding needs no number.
   *
   * WHAT IT COSTS. The WhatsApp CTA is unavailable for as long as the banner is up, which
   * is one decision on one page load. It returns the instant an answer is given, and the
   * cleanup runs when `open` goes false rather than on unmount, so it comes back WHILE the
   * bar is still sliding out rather than after it.
   *
   * An attribute and a CSS rule, not state: nothing in React needs to know, and this way
   * the whole effect is one DOM write. The rules live beside the banner's animation in
   * globals.css.
   */
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.dataset.consentOpen = 'true'
    return () => {
      delete root.dataset.consentOpen
    }
  }, [open])

  if (!open && !leaving) return null

  function choose(decision: ConsentDecision) {
    setLeaving(true)
    writeConsent(decision)
  }

  function cancel() {
    setLeaving(true)
    closeConsentSettings()
  }

  /* What the visitor is currently on, shown only when they came here to change it. On a
     first visit there is nothing to report and the line would be noise. */
  const stored = record === CONSENT_GPC ? null : parseConsent(record)
  const current = !reopened
    ? null
    : record === CONSENT_GPC
      ? CONSENT.current.gpc
      : stored
        ? CONSENT.current[stored.decision]
        : null


  return (
    <aside
      data-consent-banner
      /* Drives the exit animation in globals.css. `undefined` rather than "false" so the
         attribute is absent rather than present-and-falsy, which is what the CSS selects on. */
      data-leaving={leaving ? 'true' : undefined}
      onAnimationEnd={(event) => {
        /* Only this element's own animation. Nothing inside currently animates, but an
           animated child would otherwise cut the exit short by ending it early. */
        if (event.target === event.currentTarget) setLeaving(false)
      }}
      role="region"
      aria-label={CONSENT.regionLabel}
      /**
       * A BAR ON THE BOTTOM EDGE, CENTRED. It was a card in the bottom-left corner, and
       * that shape was the problem rather than its size: a portrait panel stacks a heading,
       * two paragraphs, a row of buttons and a divided footer into five bands, so it reads
       * as a dialog that has appeared uninvited no matter how small the type gets. The same
       * content laid out horizontally is two lines of text with the answers beside them,
       * around 90px tall, and it reads as a strip along the edge of the page instead of a
       * thing sitting on top of it.
       *
       * CENTRED RATHER THAN IN A CORNER. A corner treatment has to pick a side, and the
       * right-hand one is taken by two floating controls. Centred, it belongs to the page
       * rather than to a corner of it, which is also what makes it read as furniture.
       *
       * 56rem AND NO WIDER. Past about 900px of text the eye loses the start of the next
       * line, and a bar that spans a 27-inch display is a banner in the advertising sense.
       * `left-4 right-4` under that width, so it is a full-width strip on a phone and a
       * centred one everywhere else, with `mx-auto` doing the centring rather than a
       * translate — a transform here would fight the entrance animation for the same
       * property.
       *
       * THE TWO FLOATING CONTROLS ARE HIDDEN WHILE IT IS UP, because a centred 56rem bar
       * and a bottom-right button overlap on any viewport under roughly 1050px. See the
       * effect above for why they are hidden rather than nudged.
       *
       * z-85: above the header (80) so a sticky header cannot overlap it, below the cursor
       * ring (90) and the mobile nav sheet (95). Below the sheet is the load-bearing one —
       * an open mobile menu should cover this, not fight it.
       */
      className="fixed right-4 bottom-4 left-4 z-85 mx-auto max-w-[56rem] sm:right-6 sm:bottom-6 sm:left-6"
    >
      {/**
       * THE WHOLE BAR IS ONE FLEX ROW FROM sm UP, and a stack below it. `items-center` is
       * what makes it a bar: the answers sit on the vertical middle of the text rather than
       * under it, which is the difference between a strip and a card that happens to be
       * wide.
       *
       * `rounded-tile` (18px), not `rounded-card` (26px). A card radius is drawn for the
       * full-width panels on the page; on something 90px tall it curls the ends up and the
       * padding has to grow to keep the text off the curve.
       */}
      <div className="flex flex-col gap-3.5 rounded-tile border border-line bg-surface p-4 shadow-[0_18px_44px_-18px_rgba(8,20,34,0.4)] sm:flex-row sm:items-center sm:gap-6 sm:py-3.5 sm:pr-4 sm:pl-5">
        <div className="flex min-w-0 items-start gap-3">
          {/* Decoration, not information: the heading beside it says the same thing in
              words, so it is hidden from assistive technology rather than given a label
              that would be read out immediately before the identical text. */}
          <span className="mt-px flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-strong">
            <Cookie className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            {/* tabIndex -1 so it can receive focus when the banner is reopened, without
                entering the tab order for everyone else. The outline is removed because
                focus arrives here programmatically, from a click the visitor just made. */}
            <h2
              ref={heading}
              tabIndex={-1}
              className="text-[13.5px] leading-[1.3] font-bold text-head outline-none"
            >
              {CONSENT.heading}
            </h2>

            {/* ONE PARAGRAPH, THREE WEIGHTS. The body, the withdrawal route in a dimmer
                colour, and the policy link, all in a single flowing sentence rather than
                three stacked blocks with margins between them. Stacking them was most of
                what made the first version read as a panel: every block boundary is a line
                the eye has to stop at, and there were four of them for six lines of text.

                It also removes the divided footer strip the link used to sit in, which was
                a whole band of the card carrying one 12px link. */}
            <p className="mt-1 text-[12.5px] leading-[1.55] text-mut">
              {current ? (
                <span className="font-semibold text-head">{current} </span>
              ) : null}
              {CONSENT.body}{' '}
              {!reopened ? <span className="text-mut-2">{CONSENT.withdrawal} </span> : null}
              <Link
                href={CONSENT.policyHref}
                className="font-medium text-brand-strong underline-offset-3 hover:underline"
              >
                {CONSENT.policyLabel}
              </Link>
            </p>
          </div>
        </div>

        {/* THE TWO ANSWERS, SAME SIZE, SIDE BY SIDE, ACCEPT FIRST. Weighting one over the
            other is the deceptive-design pattern the EDPB names and enforcement actions
            keep turning on — see the note on CONSENT in content/site.ts. `ink` against
            `ghost` is a difference in colour only; both pills are the same size, so neither
            is easier to hit than the other.

            `shrink-0` and `ml-auto` are what pin them to the right end of the bar and stop
            the text column from squeezing them into two lines at an awkward width. Below sm
            they drop under the text and sit left, which is where a thumb is. */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 pl-11 sm:ml-auto sm:pl-0">
          <PillButton type="button" variant="ink" size="mini" onClick={() => choose('granted')}>
            {CONSENT.accept}
          </PillButton>
          <PillButton type="button" variant="ghost" size="mini" onClick={() => choose('denied')}>
            {CONSENT.reject}
          </PillButton>
          {/* Only where there is something to go back to. See the note on the missing close
              button above. A text button rather than a third pill: three equal controls
              would undo the "two answers, equal weight" reading the pair is built on. */}
          {reopened ? (
            <button
              type="button"
              onClick={cancel}
              className="inline-flex min-h-9 items-center px-2 text-[12.5px] text-mut underline-offset-4 transition-colors hover:text-brand-strong hover:underline"
            >
              {CONSENT.cancel}
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

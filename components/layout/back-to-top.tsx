'use client'

import { useEffect, useRef } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * The floating "back to top" control, bottom-right, on every page.
 *
 * NO REACT STATE, deliberately. Whether the button is shown is written straight to a
 * data attribute on the DOM node from a rAF-throttled scroll listener, so scrolling a
 * long page costs at most one attribute write per frame and never re-renders the tree.
 * All the visual change lives in CSS — see the [data-to-top] rules in globals.css. This
 * is the same arrangement the header collapse uses, for the same INP reason.
 *
 * WHERE IT SITS IN THE STACK. z-75: above page content and the header's scrim (70),
 * below the header itself (80), the cursor ring (90) and the mobile sheet (95). Below
 * the sheet is the load-bearing one — a button floating over an open mobile menu reads
 * as a bug. It does not overlap the header spatially in any case.
 *
 * THE BOTTOM-RIGHT CORNER IS NO LONGER THIS BUTTON'S ALONE. <WhatsAppButton> takes the base
 * position and this one sits above it — the note that used to be here predicted exactly that
 * and asked for the two to be offset rather than stacked. The arithmetic is written out at
 * the className below, because that is where it can go wrong.
 *
 * WHY THIS ONE MOVED AND NOT THE OTHER. WhatsApp is permanent; this appears only past 600px
 * of scroll. The control that is always there belongs in the corner the thumb reaches, and
 * the intermittent one goes above it.
 */
export function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    /**
     * Separate show and hide points, not one threshold.
     *
     * With a single value, resting the scroll position on it makes the button flicker
     * in and out on every small movement. The 200px dead zone means a deliberate scroll
     * is needed to change state either way — the same hysteresis, and the same reason,
     * as COLLAPSE_AT/EXPAND_AT in header-shell.tsx.
     *
     * 600px is roughly one viewport on a laptop: far enough down that "back to top" is
     * a real offer rather than a button covering the hero.
     */
    const SHOW_AT = 600
    const HIDE_AT = 400
    let queued = false

    const apply = () => {
      queued = false
      const y = window.scrollY
      const shown = el.dataset.show === 'true'
      const next = shown ? (y < HIDE_AT ? 'false' : 'true') : y > SHOW_AT ? 'true' : 'false'
      if (el.dataset.show !== next) el.dataset.show = next
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(apply)
    }

    apply() // handle a restored scroll position, or a load straight into a #hash
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function onClick(event: React.MouseEvent<HTMLButtonElement>) {
    /* THE MEDIA QUERY HAS TO BE READ HERE, in JS. globals.css sets
       `scroll-behavior: auto !important` under prefers-reduced-motion, but that governs
       the CSS property only — the `behavior` option passed to scrollTo is independent of
       it and would still animate. So a smooth scroll would survive the very setting that
       exists to stop it. */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })

    /* KEYBOARD ONLY: move focus as well as the viewport.
       Activating this from the keyboard otherwise leaves focus on a button that is about
       to be hidden, and where focus lands next is then the browser's guess rather than
       ours. The skip link is the first focusable element in the document, so handing it
       focus puts the next Tab at the top of the header — which is where someone who just
       asked to go back to the top expects to be.
       `detail === 0` is how a keyboard-activated click is distinguished from a real one;
       a mouse click reports 1 or more. It matters because the skip link reveals itself on
       plain :focus, so focusing it after a MOUSE click would flash "Skip to content" into
       the top-left corner for someone who never asked for it. */
    if (event.detail === 0) {
      document.querySelector<HTMLElement>('[data-skip-link]')?.focus()
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      data-to-top
      data-show="false"
      onClick={onClick}
      /* The button carries no text, so the label is the whole accessible name. Not
         `title` as well: a native tooltip adds a delayed grey box that belongs to no
         part of this design. */
      aria-label="Back to top"
      /* LAYOUT AND SIZE ONLY. The surface — the orange glass fill, the rim, the blur, the
         shadow and the whole transition — belongs to [data-to-top] in globals.css, which
         is unlayered and would beat any utility set here anyway. So no `bg-*`, no
         `shadow-*` and no `transition-*` on this element: each would either be silently
         inert or, in the transition's case, win and strand the fade.
         `text-brand-strong` is the exception and stays here because the icon reads it
         through currentColor. #c2410c, and it is not a free choice: the disc has no fill,
         so the arrow sits against the page itself over most of the site and against the CTA
         band's bg-ink over one section. That leaves a narrow window — 4.66:1 over the page
         and 3.62:1 over the band, where brand-hover fails the page outright at 2.67:1 and
         flat brand is thin at 3.24:1. Full derivation in globals.css.
         size-9 is 36px, down from 40. Still half again the 24px SC 2.5.8 asks for at AA, so
         there is real headroom left, but it is now well under the 44px of SC 2.5.5 at AAA —
         a deliberate trade for a lighter control, and the first thing to put back if AAA
         target size ever becomes a requirement rather than a preference. 36px is about as
         small as this should go: the next step down starts eating the AA margin, and the
         arrow inside is already a 1.5px stroke.
         The safe-area inset keeps it off the iOS home indicator, where a bottom-right
         floating button otherwise sits underneath the gesture bar.

         BOTH OFFSETS ARE DERIVED FROM <WhatsAppButton>, NOT CHOSEN. Its disc is 44px
         (size-11) at the base inset, this one is 36px, and it clears the pair by a 12px gap:

           bottom = inset + 44 + 12        right = inset + (44 - 36) / 2
           phone  = 20 + 44 + 12 = 76px -> 4.75rem  |  20 + 4 = 24px -> right-6
           md     = 32 + 44 + 12 = 88px -> 5.5rem   |  32 + 4 = 36px -> right-9

         THE `right` TERM IS THE CENTRING ONE and exists only because the two discs are
         different sizes. Equal right insets would pin their right EDGES, which leaves the
         smaller disc 4px off the column's axis — close enough to look like a mistake rather
         than a choice. Half the size difference puts their centres on one line. It briefly
         went away when both were 36px; it is back because they diverged again, which is
         exactly the case this note exists to catch.

         ONLY THE DISC MATTERS, NOT THE OPEN PILL. The WhatsApp control widens leftward on
         hover, so its height and its right edge never move — this button cannot be pushed by
         it, and no gap has to be reserved for the label.

         IF EITHER BUTTON'S SIZE OR INSET CHANGES, ALL FOUR VALUES HERE MOVE. There is no
         shared token doing this for us — it is two files agreeing by hand, which is why the
         derivation is written out rather than left as magic numbers. */
      className="fixed right-6 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-75 inline-flex size-9 items-center justify-center rounded-full text-brand-strong md:right-9 md:bottom-[calc(5.5rem+env(safe-area-inset-bottom))]"
    >
      {/* 14px in a 36px disc — scaled with the button so the proportion holds at 39%, the
          same as the 16-in-40 it replaces. Shrinking the disc alone would have left the
          arrow looking oversized inside it.
          Stroke stays at 1.5 rather than thinning with the glyph. Stroke width does not
          affect the contrast ratio, which is a property of the two colours, so the 4.66:1
          over the page and 3.62:1 over the CTA band are untouched by this change — but a
          finer line on a smaller mark is harder to make out for reasons contrast maths does
          not capture, so this is the floor. */}
      <ArrowUp aria-hidden="true" strokeWidth={1.5} className="size-3.5" />
    </button>
  )
}

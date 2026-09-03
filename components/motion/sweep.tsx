'use client'

import Link from 'next/link'
import { useRef, type CSSProperties, type ReactNode } from 'react'

/**
 * A card whose fill grows as a circle out of the exact point the pointer entered, and
 * shrinks back toward the point it leaves from — the effect on gsap.com's "Get GSAP"
 * button.
 *
 * ORIGIN IS A POINT, NOT AN EDGE. The first build slid a rectangular panel in from
 * whichever of the four edges was nearest. That looks right entering from a corner and
 * wrong everywhere else: enter slowly across the middle of the top edge and the fill
 * still arrives from a side, and there is no way at all to express "started in the
 * middle". A circle keyed to the pointer's own coordinates has no such cases — the
 * origin is wherever the cursor was, including the centre.
 *
 * IT IS A CLIP, NOT A TRANSFORM. `clip-path: circle(r at x y)` grows the reveal without
 * moving anything, so the copy of the content inside sits still and stays sharp. The
 * transform version needed the content counter-translated by exactly the panel's offset
 * to keep it from sliding, and a scaled circle would need counter-scaling too, which
 * blurs text. Clipping removes that whole class of problem: at every radius, the text
 * inside the circle is already in its final position on its final background.
 *
 * The radius runs to the farthest of the four corners, so the circle always finishes by
 * covering the card completely whichever point it started from.
 *
 * `face` and `fill` are two ReactNodes because each card decides what its light-on-navy
 * version looks like: a keyword row and a numbered pain card do not recolour the same
 * way. Both are built in the server component that calls this, so nothing extra ships.
 * `fill` carries the card's own padding, since the layer under it is a bare full-size box.
 *
 * WHY JAVASCRIPT. CSS cannot know where a pointer crossed the boundary. Nothing here
 * re-renders though — the handlers drive the Web Animations API directly, so a fast
 * pointer cannot generate React work.
 */
/* TUNED FOR A CARD, NOT A BUTTON — and that distinction is the whole reason these numbers
   are what they are.

   The first version copied gsap.com directly. Sampling the "Get GSAP" button there every
   40ms, its flair scales 0 -> 1 in about 380ms and back in about 290ms, so this ran at
   400/300. On a button that is right. On these cards it was visibly too fast, because
   duration is not what the eye judges — speed is. Measured on a pain card at desktop width,
   587x208, the radius from a corner entry is 609px, where that button's is nearer 130px.
   Same duration, nearly five times the distance, so nearly five times the speed.

   So the entry is longer than the reference on purpose. Not proportionally longer, which
   would be about 1.8s and feel broken: a hover has to acknowledge the pointer promptly, so
   this is the slowest that still reads as responsive rather than laggy. At 700ms the fill
   travels 0.87px/ms, against roughly 0.34 for the button it was copied from.

   The exit stays quicker than the entry, which is the one thing worth keeping from the
   original — it stops a pointer skimming the stack from leaving a trail of half-open fills
   behind it.

   The easing changed with the duration. `cubic-bezier(0.22, 1, 0.36, 1)` is quint-like and
   puts about half the travel into the first 14% of the time; stretched over 700ms that
   front-loading reads as a lurch followed by a long crawl. Cubic ease-out covers ~36% in
   the same fraction, which spreads the motion evenly and is what actually makes it feel
   smoother rather than merely slower.

   Anything reusing this at button scale should pass ~380/290 and the quint curve back in. */
const DURATION_IN = 700
const DURATION_OUT = 520
const EASE = 'cubic-bezier(0.33, 1, 0.68, 1)'

export function Sweep({
  href,
  className,
  style,
  face,
  fill,
}: {
  /** Renders an anchor when given, otherwise a plain card. */
  href?: string
  className?: string
  /** For per-card positioning the class list cannot express — the pain cards' sticky
      `top` offsets are computed from their index. */
  style?: CSSProperties
  face: ReactNode
  fill: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)

  const run = (clientX: number, clientY: number, direction: 'in' | 'out') => {
    const el = ref.current
    if (!el) return
    const panel = el.querySelector<HTMLElement>('[data-sweep-fill]')
    if (!panel) return

    const r = el.getBoundingClientRect()
    const x = clientX - r.left
    const y = clientY - r.top
    // Far enough to swallow the whole card from wherever it started.
    const radius = Math.max(
      Math.hypot(x, y),
      Math.hypot(r.width - x, y),
      Math.hypot(x, r.height - y),
      Math.hypot(r.width - x, r.height - y)
    )

    const open = `circle(${radius}px at ${x}px ${y}px)`
    const shut = `circle(0px at ${x}px ${y}px)`

    /* Opening always starts as a zero circle AT THE POINTER, never from the computed
       value. Reading the current clip on the way in looked like a smart way to survive
       an interruption, but the resting value is the stylesheet's `circle(0px at 50%
       50%)` — so the centre interpolated from the middle of the card to the cursor and
       the circle visibly slid into place instead of growing where it was asked to. It
       showed up as clip origins reading `calc(0% - 61px)` rather than the pointer's own
       coordinates.

       Closing is the opposite case and genuinely wants the current value: the circle
       should shrink from wherever it got to, toward the point the pointer left by. */
    const from =
      direction === 'in'
        ? shut
        : (() => {
            const current = getComputedStyle(panel).clipPath
            return current && current !== 'none' ? current : open
          })()

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    panel.getAnimations().forEach((a) => a.cancel())
    panel.animate([{ clipPath: from }, { clipPath: direction === 'in' ? open : shut }], {
      duration: reduced ? 0 : direction === 'in' ? DURATION_IN : DURATION_OUT,
      easing: EASE,
      fill: 'forwards',
    })
  }

  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => run(e.clientX, e.clientY, 'in'),
    onPointerLeave: (e: React.PointerEvent) => run(e.clientX, e.clientY, 'out'),
  }

  /** Keyboard has no pointer, so the circle grows from the middle of the card. */
  const fromCentre = (direction: 'in' | 'out') => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    run(r.left + r.width / 2, r.top + r.height / 2, direction)
  }

  const layers = (
    <>
      {face}
      <span data-sweep-fill aria-hidden="true" className="sweep-fill">
        {fill}
      </span>
    </>
  )

  if (href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={className}
        style={style}
        {...handlers}
        onFocus={(e) => {
          // Only for keyboard focus. A click focuses too, and re-running the reveal on
          // top of the pointer's own animation would fight it.
          if (e.target.matches(':focus-visible')) fromCentre('in')
        }}
        onBlur={() => fromCentre('out')}
      >
        {layers}
      </Link>
    )
  }

  return (
    <article ref={ref as React.Ref<HTMLElement>} className={className} style={style} {...handlers}>
      {layers}
    </article>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

/**
 * The slide list is repeated this many times, and the scroll position is kept in
 * the middle copy. That is what makes the loop seamless: when the position drifts
 * out of the middle copy it is shifted by exactly one copy's width, and because
 * every copy is identical there is nothing to see. Two copies would not do - at
 * the seam one side of the viewport would run out of cards.
 */
const COPIES = 3
const MIDDLE = 1

export type CarouselSlide = { key: string; node: ReactNode }

/**
 * Auto-advancing carousel showing whole cards, looping seamlessly.
 *
 * Native scroll-snap underneath: trackpad, touch and arrow keys work before any
 * JavaScript runs, and the buttons only automate what a visitor could do by hand.
 * Autoplay and the loop are the parts that need JS, and both degrade to a plain
 * scrollable row without it.
 *
 * ACCESSIBILITY NOTE. This advances on its own, which engages WCAG 2.2 SC 2.2.2
 * (Pause, Stop, Hide) — Level A. It had a visible pause button, removed at the
 * client's explicit request. What remains: autoplay holds while the pointer is
 * over the carousel or focus is inside it, any arrow, dot or swipe resets the
 * clock, and it never starts under prefers-reduced-motion. That covers a reader
 * with a pointer and a reader who has asked the OS to stop motion, but it is not
 * a mechanism a touchscreen user can reach — so this is a known, accepted gap
 * rather than a pass. Restoring the button is a one-line change if that shifts.
 *
 * Slides are passed as data rather than a render function: this is a client
 * component, and a function prop cannot cross the server boundary. React elements
 * can, so the caller hands over the finished nodes.
 */
export function Carousel({
  slides,
  label,
  autoplayMs = 5500,
  className,
}: {
  slides: CarouselSlide[]
  /** Names the scrollable region and the controls for assistive tech. */
  label: string
  autoplayMs?: number
  className?: string
}) {
  const n = slides.length
  const vpRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  /** Pointer is over the carousel, or focus is inside it. */
  const [held, setHeld] = useState(false)
  const [reduced, setReduced] = useState(false)

  /**
   * Everything positional is measured, never assumed. Slide width is a percentage
   * that changes at two breakpoints and the gap comes from CSS, so hard-coding
   * either here would silently drift the moment the design changed.
   */
  const geom = useCallback(() => {
    const vp = vpRef.current
    if (!vp) return null
    const els = vp.querySelectorAll<HTMLElement>('.carousel-slide')
    if (els.length < 2) return null
    const stride = els[1].offsetLeft - els[0].offsetLeft
    if (stride <= 0) return null
    return { vp, stride, base: els[0].offsetLeft, span: stride * n }
  }, [n])

  type Geom = NonNullable<ReturnType<typeof geom>>
  /* Slides are start-aligned, so a slide's scroll offset is just its index times
     the stride — no centring term. */
  const absAt = (g: Geom) => Math.round((g.vp.scrollLeft - g.base) / g.stride)
  const leftFor = (g: Geom, abs: number) => g.base + abs * g.stride

  /* A programmatic smooth scroll ignores the stylesheet's scroll-behavior, so
     reduced motion has to be honoured at the call. */
  const behavior = (): ScrollBehavior => (reduced ? 'auto' : 'smooth')

  const step = useCallback(
    (dir: -1 | 1) => {
      const g = geom()
      if (!g) return
      g.vp.scrollTo({ left: leftFor(g, absAt(g) + dir), behavior: behavior() })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [geom, reduced]
  )

  const goTo = (index: number) => {
    const g = geom()
    if (!g) return
    const cur = absAt(g)
    // Scroll to whichever copy of this slide is nearest, so tapping a dot never
    // travels the long way round the track.
    let best = index
    for (let copy = 0; copy < COPIES; copy++) {
      const cand = index + copy * n
      if (Math.abs(cand - cur) < Math.abs(best - cur)) best = cand
    }
    g.vp.scrollTo({ left: leftFor(g, best), behavior: behavior() })
  }

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const start = geom()
    if (!start) return
    const vp = start.vp
    // Open in the middle copy, so there is already a full copy of cards on either
    // side and the first wrap in either direction has somewhere to go.
    vp.scrollLeft = leftFor(start, MIDDLE * n)

    let raf = 0
    let settle = 0

    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0
          const g = geom()
          if (!g) return
          // Guarded by an equality check inside setState: this runs every scroll
          // frame, and re-rendering on each one would put a swipe on the INP
          // budget. In practice it changes once per slide.
          const next = ((absAt(g) % n) + n) % n
          setActive((p) => (p === next ? p : next))
        })
      }

      /* Re-centring waits for the scroll to settle. Doing it mid-flight would
         cancel the browser's own smooth-scroll animation and stutter. */
      clearTimeout(settle)
      settle = window.setTimeout(() => {
        const g = geom()
        if (!g) return
        const abs = absAt(g)
        if (abs < n) g.vp.scrollLeft += g.span
        else if (abs >= 2 * n) g.vp.scrollLeft -= g.span
      }, 170)
    }

    vp.addEventListener('scroll', onScroll, { passive: true })
    // Slide width is a percentage, so the geometry changes with the viewport.
    const ro = new ResizeObserver(onScroll)
    ro.observe(vp)
    return () => {
      vp.removeEventListener('scroll', onScroll)
      ro.disconnect()
      cancelAnimationFrame(raf)
      clearTimeout(settle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geom, n])

  const playing = !held && !reduced && n > 1

  /**
   * A timeout keyed on `active`, not an interval.
   *
   * Any change of slide restarts the clock, whether it came from autoplay, an
   * arrow, a dot or a swipe. An interval would keep firing on its own schedule and
   * yank the track a fraction of a second after someone swiped it by hand.
   */
  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => step(1), autoplayMs)
    return () => clearTimeout(id)
  }, [playing, active, autoplayMs, step])

  const arrowClass =
    'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-head transition-colors hover:border-brand/45'

  return (
    <div
      className={cn('relative', className)}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      {/* The scroll viewport is a div, not the list. role="group" here would
          override the <ul>'s list role and orphan its items, costing a screen
          reader the item count. */}
      <div
        ref={vpRef}
        tabIndex={0}
        role="group"
        aria-label={`${label}, scrollable`}
        className="carousel-viewport"
      >
        <ul className="carousel-track">
          {Array.from({ length: COPIES }, (_, copy) =>
            slides.map((slide) => (
              <li
                key={`${copy}-${slide.key}`}
                className="carousel-slide"
                /* The outer copies exist only to fill the peeks across the loop
                   seam. One testimonial announced three times would be a bug. */
                aria-hidden={copy !== MIDDLE || undefined}
              >
                {slide.node}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Hidden without JavaScript — see the noscript rule in the root layout. A
          visible arrow that does nothing is worse than no arrow. */}
      <div
        data-carousel-controls
        /* NOWRAP, and the dots absorb the shortfall. As a wrapping row this broke at every
           phone width: six 40px dots between two 44px arrows need 352px and a 390px screen
           offers 342, so the Next arrow alone fell to a second line and the control read as
           two separate broken pieces. Wrapping was the wrong lever, because the arrows are
           the one part that must stay put. */
        className="mt-9 flex items-center justify-center gap-3 sm:gap-4"
      >
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={`Previous ${label.toLowerCase()}`}
          className={arrowClass}
        >
          <ChevronLeft className="size-4.5" aria-hidden="true" />
        </button>

        {/* Wraps rather than clipping: one dot per slide, and the count grows with
            the content. `min-w-0` is what lets it: without it a flex item refuses to
            shrink below its content, so the overflow was pushed out to the parent and
            took an arrow with it. With it, this is the only part that can give, and a
            count that outgrows the row wraps its dots here instead. */}
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-1">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${label.toLowerCase()} ${i + 1} of ${n}`}
              aria-current={i === active ? 'true' : undefined}
              /* Hit area around an 8px dot: 28x40 on touch-sized screens, 32px square
                 from sm up. SC 2.5.8 only asks for 24x24 and the dot is nowhere near
                 that on its own, so the padding is what satisfies it. The dot itself
                 does not change size; only the button around it does.

                 THE PHONE TARGET IS NARROW BUT NOT SHORT, and that asymmetry is the
                 point. It was 40px square, which is the right size for a thumb but does
                 not fit: six of them plus two arrows and the gaps come to 352px against
                 342px at 390px, and 272px at 320px. Height is where a thumb misses on a
                 horizontal row of dots, so the 40px stays there and only the width
                 gives. At 28px the whole control holds one line down to 320px, and the
                 target stays comfortably over the 24px floor. */
              className="grid h-10 w-7 place-items-center rounded-full sm:size-8"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'block size-2 rounded-full transition-[background-color,transform] duration-300',
                  i === active ? 'scale-125 bg-brand' : 'bg-line-strong/60'
                )}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          aria-label={`Next ${label.toLowerCase()}`}
          className={arrowClass}
        >
          <ChevronRight className="size-4.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

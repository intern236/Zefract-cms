'use client'

import { useState, type ReactNode } from 'react'

/**
 * Scrolling logo/tech strip.
 *
 * ACCESSIBILITY NOTE. This loops forever, which engages WCAG 2.2 SC 2.2.2 (Pause,
 * Stop, Hide) — Level A. It had a visible pause button, removed at the client's
 * explicit request, along with the carousel's. What remains: it halts while the
 * pointer is over it or keyboard focus is inside it, and the CSS stops it entirely
 * under prefers-reduced-motion. That covers a reader with a pointer and a reader
 * who has asked the OS to stop motion, but it leaves a touchscreen user with no
 * mechanism at all — so this is a known, accepted gap rather than a pass.
 * Restoring the button is a handful of lines; the hover/focus wiring below is
 * already the state it needs.
 *
 * The items are duplicated once; the keyframe translates by -50%, which lands
 * exactly on the start of the second copy for a seamless loop.
 *
 * IT TAKES RENDERED NODES RATHER THAN STRINGS, which is what let the same component
 * carry a row of client logos as well as the technology wordmarks it was built for.
 * It used to take `readonly string[]` and style them itself, alternating mono and
 * bold on `i % 2` — a typographic rule that means nothing to an image and that forced
 * an even-length list on every caller. Deciding how an item looks is the call site's
 * business; looping them is this component's.
 *
 * THE DUPLICATE COPY IS `inert`, NOT MERELY `aria-hidden`. Hiding it was enough while
 * the items were text: nothing in them could be focused. A logo strip puts a LINK in
 * every item, and an aria-hidden element containing focusable children is a genuine
 * defect — a keyboard lands on a link that assistive tech has been told does not
 * exist, twice per loop. `inert` removes the whole subtree from the tab order and the
 * accessibility tree together, which is exactly what a decorative second copy needs.
 */
export type MarqueeItem = {
  /** Stable across the two copies; the duplicate is keyed separately. */
  key: string
  node: ReactNode
}

/**
 * How many times the list is repeated along the track.
 *
 * THE LOOP NEEDS MORE RUNWAY THAN THE SCREEN IS WIDE, and this is the number that buys
 * it. The animation travels exactly one copy and then restarts; at the far end of that
 * travel the remaining content is (copies − 1) sets, so that much has to cover the
 * viewport or the strip scrolls a stretch of empty page into view before it wraps.
 *
 * Two used to be the fixed, unstated assumption, and it held only because the first
 * thing through here was twelve wide wordmarks. Six logos are about 1,200px, so two
 * copies left roughly 700px of nothing on a 1,850px screen — visible, and the reason
 * this is now a number rather than a guess.
 *
 * FOUR COVERS EVERYTHING REASONABLE: three sets of runway, which for a ~1,200px set is
 * about 3,600px, past any laptop and most ultrawides. It is cheap — a set is a handful
 * of nodes and every extra copy is inert — so the default is generous rather than
 * minimal. A caller with a much shorter set can raise it.
 */
const DEFAULT_COPIES = 4

export function Marquee({
  items,
  duration = 36,
  reverse = false,
  label,
  className,
  copies = DEFAULT_COPIES,
}: {
  items: readonly MarqueeItem[]
  duration?: number
  reverse?: boolean
  label: string
  className?: string
  copies?: number
}) {
  const [paused, setPaused] = useState(false)

  return (
    /* No `group relative` any more — both existed only to position the pause
       button that used to sit here. */
    <div className={className}>
      <div
        className="marquee-mask overflow-hidden py-2.5"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <ul
          aria-label={label}
          /* NO `gap` HERE, DELIBERATELY — the spacing is on each item instead. A gapped
             flex row has one fewer gap than it has items, so one k-th of the track is not
             one whole copy and the loop jumps by a fraction of a gap every cycle. Giving
             each item its own trailing space makes a copy a whole number of item boxes,
             which is what lets the keyframe divide exactly. See the note on the keyframe
             in globals.css. */
          className="marquee-track flex w-max items-center"
          style={
            {
              '--marquee-duration': `${duration}s`,
              '--marquee-state': paused ? 'paused' : 'running',
              '--marquee-copies': copies,
              animationDirection: reverse ? 'reverse' : 'normal',
            } as React.CSSProperties
          }
        >
          {Array.from({ length: copies }).flatMap((_, copy) =>
            items.map((item) => (
              <li
                key={`${copy}-${item.key}`}
                /* Only the first copy is real. Every other exists to close the loop, so
                   each is hidden from assistive tech AND removed from the tab order — see
                   the note above on why hiding alone is not enough once an item contains
                   a link. */
                aria-hidden={copy > 0 || undefined}
                inert={copy > 0 || undefined}
                className="shrink-0 pr-[84px] whitespace-nowrap"
              >
                {item.node}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

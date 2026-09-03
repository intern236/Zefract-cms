'use client'

import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

/**
 * A card that tilts AWAY from the pointer: hover the left edge and the right edge rises
 * toward you, hover the bottom and the top rises. The side under the cursor is the side
 * that dips, as though the card were being pressed there.
 *
 * That is the opposite of the usual "tilt toward the cursor" treatment, and the sign is
 * the whole trick, so here is where it comes from. CSS puts +x right, +y DOWN and +z
 * toward the viewer, and `rotateX`/`rotateY` map a corner to z' as:
 *
 *     rotateY(t):  z' = -x * sin(t)      rotateX(t):  z' =  y * sin(t)
 *
 * Rising toward the viewer means z' > 0. Take the pointer at the left edge (nx = -1) and
 * ask the right edge (x > 0) to rise: z' > 0 needs sin(t) < 0, so --ry carries the same
 * sign as nx. Take the pointer at the bottom (ny = +1) and ask the top edge (y < 0) to
 * rise: z' > 0 again needs sin(t) < 0, so --rx carries the OPPOSITE sign to ny.
 *
 *     --ry =  MAX * nx        --rx = -MAX * ny
 *
 * Both signs are asserted against the browser's own computed matrix rather than trusted —
 * the corner opposite the pointer must come out with positive z.
 *
 * The rotation is written to two custom properties instead of `transform` directly,
 * because .card-pop already owns this element's transform for its 3px hover lift. One of
 * the two would silently win. Composing both in a single transform in globals.css keeps
 * the lift and the tilt from cancelling each other out — see .card-pop.tilt there.
 */

/** Degrees at the very edge. Past about 6 the type inside starts to read as skewed. */
const MAX_DEG = 4.5

export function Tilt({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const track = (e: ReactPointerEvent<HTMLDivElement>) => {
    /* Mouse only. A finger or pen drags ACROSS a card to scroll the page, and a tilt
       chasing that would both fight the gesture and stick at whatever angle the finger
       lifted at. */
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const b = el.getBoundingClientRect()
    if (!b.width || !b.height) return
    // -1 at the left/top edge, 0 dead centre, +1 at the right/bottom edge.
    const nx = ((e.clientX - b.left) / b.width) * 2 - 1
    const ny = ((e.clientY - b.top) / b.height) * 2 - 1

    // One write per frame: pointermove fires far more often than the compositor paints.
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--ry', `${(nx * MAX_DEG).toFixed(2)}deg`)
      el.style.setProperty('--rx', `${(-ny * MAX_DEG).toFixed(2)}deg`)
      el.dataset.tilt = 'on'
    })
  }

  const release = () => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(frame.current)
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    /* Dropping the attribute restores the long ease, so the card settles back flat
       instead of snapping. */
    delete el.dataset.tilt
  }

  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={track}
      onPointerLeave={release}
      onPointerCancel={release}
    >
      {children}
    </div>
  )
}

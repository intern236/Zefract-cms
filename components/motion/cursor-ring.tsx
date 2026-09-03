'use client'

import { useEffect, useRef } from 'react'

/**
 * A soft ring that trails the pointer, becoming a rounded square over anything
 * clickable — echoing the modules of the Modular Z mark, so the effect reads as
 * this brand rather than as a generic cursor gimmick.
 *
 * Deliberate constraints:
 *
 * - The native cursor is NOT hidden. Replacing it with a lagging div is the usual
 *   version of this effect and it makes precise pointing worse, hurts anyone who
 *   relies on the OS cursor, and breaks text I-beams. This decorates; it does not
 *   replace.
 * - Only runs on a fine pointer that hovers. On touch there is no cursor to
 *   follow, and on a coarse pointer the ring would just be litter.
 * - Off entirely under prefers-reduced-motion — a lagging element that chases the
 *   pointer is exactly the kind of continuous motion that setting asks to stop.
 * - No React state. Pointer moves write `transform` straight to the node inside a
 *   rAF loop, so a fast mouse cannot generate re-renders and push INP up.
 * - The loop parks itself once the ring catches up and restarts on the next move,
 *   so an idle page runs no animation frames at all.
 */

/** Inputs are excluded on purpose: an enlarged ring fights the text I-beam. */
const INTERACTIVE = 'a[href], button, [role="button"], summary, [data-cursor-hover]'

/**
 * How much of the remaining distance is closed each frame. Higher = tighter.
 *
 * 0.13, down from 0.18. Easing like this is exponential, so quote a threshold or the
 * number means nothing: closing 90% of a gap goes from ~11.6 frames (~194ms at
 * 60fps) to ~16.5 frames (~276ms). The long tail is much longer again — measured on
 * an 800px jump, the gap was 28px at 400ms and under 1px at 762ms.
 *
 * That tail is the point. It is what makes the ring read as gliding to a stop rather
 * than snapping to one, and it is invisible in normal use because a real pointer
 * moves continuously and never leaves the ring far behind.
 *
 * There is a floor. Much below ~0.10 the ring stops feeling attached to the pointer
 * and starts feeling laggy, which is a different and worse problem.
 */
const EASE = 0.13

export function CursorRing() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let raf = 0
    let seen = false

    const draw = () => {
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
    }

    const step = () => {
      const dx = targetX - x
      const dy = targetY - y

      // Close enough: snap, stop the loop, and wait for the next move.
      if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
        x = targetX
        y = targetY
        draw()
        raf = 0
        return
      }

      x += dx * EASE
      y += dy * EASE
      draw()
      raf = requestAnimationFrame(step)
    }

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step)
    }

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY

      if (!seen) {
        // Start where the pointer already is, so it does not fly in from 0,0.
        seen = true
        x = targetX
        y = targetY
        draw()
        el.dataset.visible = 'true'
      }
      kick()
    }

    const onOver = (e: Event) => {
      const target = e.target
      const hit = target instanceof Element ? target.closest(INTERACTIVE) : null
      el.dataset.hover = hit ? 'true' : 'false'
    }

    const onDown = () => {
      el.dataset.down = 'true'
    }
    const onUp = () => {
      el.dataset.down = 'false'
    }
    const onLeave = () => {
      el.dataset.visible = 'false'
    }
    const onEnter = () => {
      if (seen) el.dataset.visible = 'true'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [])

  return (
    <div ref={ref} aria-hidden="true" className="cursor-ring" data-visible="false">
      <span />
    </div>
  )
}

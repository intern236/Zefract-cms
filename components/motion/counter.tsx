'use client'

import { animate, useInView } from 'motion/react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Splits a display stat into a fixed prefix, the number to count, and a fixed
 * suffix: "100+" -> 100 and "+", "6 weeks" -> 6 and " weeks", "24/7" -> 24 and
 * "/7", "₹1.2Cr" -> "₹", 1.2 and "Cr".
 */
const PARTS = /^(\D*?)(\d+(?:\.\d+)?)(.*)$/

/**
 * A statistic that counts up when it scrolls into view.
 *
 * The final value is what renders on the server, so the real number is in the
 * HTML for crawlers and for anyone without JavaScript. The count is applied
 * afterwards, on the client, and only when it can run unnoticed.
 *
 * Deliberate choices:
 *
 * - **Nothing already on screen animates.** A stat visible at mount would have to
 *   snap back to zero before counting, and a number visibly resetting itself is
 *   worse than a number that simply arrived. So the primer checks the element's
 *   position first: below the fold, it starts at zero; already in view, it stays
 *   put. Nobody sees it change to zero, because by the time it is on screen it
 *   has already been counting.
 * - **No React state.** Every frame writes textContent through a ref. Counting
 *   through state would re-render ~85 times per stat, on a page where four of
 *   these can be in flight at once.
 * - **The width never changes.** An invisible copy of the final value holds the
 *   box open and the live number is absolutely positioned inside it. Without
 *   that, "0" -> "100+" would widen the element mid-count and shove whatever sits
 *   beside it along - a layout shift, right in the CLS budget.
 * - **Reduced motion is checked here.** MotionConfig's `reducedMotion` setting
 *   governs motion components; `animate()` is imperative and never sees it, so
 *   the media query is read directly.
 */
export function Counter({
  value,
  className,
  duration = 1.5,
}: {
  value: string
  className?: string
  /** Seconds. */
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const primed = useRef(false)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })

  const parts = PARTS.exec(value)
  const prefix = parts?.[1] ?? ''
  const digits = parts?.[2] ?? ''
  const suffix = parts?.[3] ?? ''
  const target = Number(digits)
  const decimals = digits.includes('.') ? digits.split('.')[1].length : 0
  // "0" and "24/7"'s own zero are nothing to count towards, and a value with no
  // digits at all ("TBD") has nothing to count at all.
  const countable = parts !== null && Number.isFinite(target) && target > 0

  useEffect(() => {
    const el = ref.current
    if (!el || !countable) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return

    primed.current = true
    el.textContent = `${prefix}${(0).toFixed(decimals)}${suffix}`
  }, [countable, prefix, suffix, decimals])

  useEffect(() => {
    const el = ref.current
    if (!el || !inView || !primed.current) return
    primed.current = false

    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`
      },
      // Land on the authored string rather than a formatted number, so a value
      // written "6 weeks" ends as "6 weeks" and not "6.0 weeks".
      onComplete: () => {
        el.textContent = value
      },
    })
    return () => controls.stop()
  }, [inView, target, duration, prefix, suffix, decimals, value])

  if (!countable) return <span className={className}>{value}</span>

  return (
    <span className={cn('relative inline-block tabular-nums', className)}>
      <span aria-hidden="true" className="invisible">
        {value}
      </span>
      <span ref={ref} className="absolute inset-0">
        {value}
      </span>
    </span>
  )
}

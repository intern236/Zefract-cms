'use client'

import { motion } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Heading lines that wipe up from behind their own baseline.
 *
 * Each line sits in an overflow-hidden mask, so the type slides into view rather
 * than fading in place. It reads as the heading being set, which suits a wordmark
 * built out of sliding modules.
 *
 * Three things this does NOT do, each for a reason:
 *
 * - It has no viewport trigger. It takes `hidden` -> `show` from the enclosing
 *   <Group>, so the eyebrow, the heading and the standfirst run off one
 *   observer on one timeline instead of three that drift apart.
 * - It never touches an <h1>. The h1 is the LCP element on every page, and an
 *   element that starts fully clipped is an element the browser has not painted
 *   yet - which is exactly how the hero once measured a 3.5s LCP. Above the fold,
 *   use <Rise>.
 * - It does not animate opacity. The mask is the effect; fading as well just
 *   muddies it.
 *
 * The mask needs padding to clear descenders. At the heading's leading of 1.12 a
 * bare overflow-hidden still slices the tail off every g, y and p on the last
 * line; the padding opens the box up and the equal negative margin takes the space
 * back so line spacing is untouched. The padding is in `em`, so it tracks the font
 * size and survives a leading change in either direction.
 *
 * Under reduced motion, MotionConfig drops the transform from both variants and
 * the lines are simply present. `data-reveal` covers the no-JS case, where the
 * root layout's noscript rule resets the transform Motion inlined during SSR.
 */
export function MaskedLines({
  lines,
  as: Tag = 'h2',
  className,
  delay = 0,
  step = 0.07,
}: {
  lines: readonly string[] | string
  as?: 'h2' | 'h3' | 'p'
  className?: string
  delay?: number
  step?: number
}) {
  const arr = typeof lines === 'string' ? [lines] : lines
  return (
    <Tag className={className}>
      {arr.map((line, i) => (
        <span key={line} className="-mb-[0.18em] block overflow-hidden pb-[0.18em]">
          <motion.span
            data-reveal
            className="block"
            variants={{
              hidden: { y: '110%' },
              show: {
                y: 0,
                transition: { duration: 0.7, ease: EASE, delay: delay + i * step },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

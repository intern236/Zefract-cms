'use client'

import { motion, type Variants } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Scroll reveal wrapper.
 *
 * Takes `children` as a slot so what it wraps stays a Server Component - only
 * this file crosses into the client bundle.
 *
 * Reduced motion is handled globally by <MotionProvider> (`reducedMotion="user"`),
 * which drops the transform and keeps the fade. Do not branch on useReducedMotion()
 * here: it resolves differently on server and client and breaks hydration.
 *
 * `data-reveal` exists so the no-JS stylesheet in the root layout can force these
 * back to full opacity. Without it, anything wrapped here would stay invisible
 * for a visitor whose JS never runs.
 */
const EASE = [0.22, 1, 0.36, 1] as const

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  once?: boolean
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

const defaultContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

/** Staggers direct children into view. Pair with <StaggerItem>. */
export function Stagger({
  children,
  className,
  step = 0.06,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  step?: number
  delay?: number
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      variants={
        step === 0.06 && delay === 0
          ? defaultContainer
          : { hidden: {}, show: { transition: { staggerChildren: step, delayChildren: delay } } }
      }
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * A scroll-triggered group whose members set their own delays.
 *
 * <Stagger> spaces its children evenly, which is right for a grid of equal
 * things. This is for a composition - eyebrow, then heading lines, then a
 * standfirst - where the timing between the parts is a design decision rather
 * than a constant. The group only broadcasts `hidden` -> `show`; each descendant
 * declares when it moves.
 *
 * Motion propagates the variant label through React context, so plain server-
 * rendered elements can sit in between - a <FadeItem> inside a <div> inside this
 * still receives `show`.
 */
export function Group({
  children,
  className,
  once = true,
}: {
  children: ReactNode
  className?: string
  once?: boolean
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-70px' }}
    >
      {children}
    </motion.div>
  )
}

/** A <Group> member. Same fade as <StaggerItem>, but on its own clock. */
export function FadeItem({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * A rule that draws itself from one end - connectors, dividers, chart bars.
 *
 * Belongs to whatever <Group> or <StaggerItem> encloses it - it has no viewport
 * of its own, so a connector between two cards moves with the card it belongs to
 * rather than on a second, independent trigger.
 *
 * scale rather than width or height: either of those would relayout the element
 * on every frame, and for a bar in a chart that means relaying out its siblings
 * too. `origin` is where the growth starts from, so a bar uses 'bottom'.
 *
 * Always decorative, hence the unconditional aria-hidden. Anything load-bearing
 * needs a text equivalent next to it.
 */
export function DrawLine({
  className,
  style,
  delay = 0,
  origin = 'left',
}: {
  className?: string
  style?: CSSProperties
  delay?: number
  origin?: 'left' | 'top' | 'bottom'
}) {
  return (
    <motion.span
      aria-hidden="true"
      data-reveal
      className={className}
      style={{ ...style, transformOrigin: origin }}
      variants={{
        hidden: origin === 'left' ? { scaleX: 0 } : { scaleY: 0 },
        show: {
          scaleX: 1,
          scaleY: 1,
          transition: { duration: 0.5, ease: EASE, delay },
        },
      }}
    />
  )
}

/**
 * Table-row reveal.
 *
 * A <tbody>/<tr> pair rather than a wrapping <div>, because putting anything
 * between a table and its rows breaks the row/column association screen readers
 * rely on to read a matrix of ticks.
 *
 * Opacity only. `transform` on a table-row is not reliably supported across
 * engines, so a y-offset here would work in some browsers and silently do
 * nothing in others.
 */
export function RevealTBody({
  children,
  className,
  step = 0.05,
}: {
  children: ReactNode
  className?: string
  step?: number
}) {
  return (
    <motion.tbody
      data-reveal
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: step } } }}
    >
      {children}
    </motion.tbody>
  )
}

export function RevealRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.tr
      data-reveal
      className={className}
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
      }}
    >
      {children}
    </motion.tr>
  )
}

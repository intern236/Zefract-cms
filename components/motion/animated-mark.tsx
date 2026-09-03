'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

/**
 * The brand mark with its fracture animated on hover.
 *
 * The identity's whole idea is that the centre module has "slipped off the grid",
 * so hovering slides that module between its grid-aligned position and the
 * fractured one. Nothing else moves.
 *
 * Reduced motion is handled by <MotionProvider> (`reducedMotion="user"`): the
 * transform is applied instantly, so the mark simply renders fractured, which is
 * its resting state anyway.
 */
const MODULES = [
  [0, 0], [7, 0], [14, 0], [21, 0], [28, 0],
  [21, 7],
  [7, 21],
  [0, 28], [7, 28], [14, 28], [21, 28], [28, 28],
] as const

const ALIGNED = 14
const FRACTURED = 15.5

export function AnimatedMark({ className }: { className?: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <svg
      viewBox="0 0 34 34"
      className={className}
      role="presentation"
      aria-hidden="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <g fill="currentColor">
        {MODULES.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="0.5" />
        ))}
      </g>
      <motion.rect
        width="6"
        height="6"
        rx="0.5"
        fill="var(--color-brand)"
        initial={{ x: FRACTURED, y: FRACTURED }}
        animate={{ x: hovered ? ALIGNED : FRACTURED, y: hovered ? ALIGNED : FRACTURED }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

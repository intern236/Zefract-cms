'use client'

import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * `reducedMotion="user"` makes Motion honour the OS setting globally: transform
 * and layout animations are applied instantly, while opacity still animates.
 *
 * This replaces branching on useReducedMotion() inside each component, which
 * caused a hydration mismatch — the hook resolves differently on the server than
 * in the browser, so `initial` disagreed across hydration and React bailed out.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

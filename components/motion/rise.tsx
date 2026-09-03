import { cn } from '@/lib/utils'
import type { CSSProperties, ReactNode } from 'react'

/**
 * CSS-only entrance animation for above-the-fold content.
 *
 * Deliberately NOT a client component. <Reveal> is driven by Motion, which means
 * anything it wraps stays at opacity 0 until the JS bundle downloads, hydrates and
 * fires an IntersectionObserver. For the hero - which contains the LCP element -
 * that turned a 1.0s first paint into a 3.5s LCP.
 *
 * This renders on the server, animates at first paint, and needs no JavaScript at
 * all. Use it above the fold; use <Reveal> for scroll-triggered content below it.
 */
export function Rise({
  children,
  delay = 0,
  y = 20,
  liftOnly = false,
  className,
}: {
  children: ReactNode
  /** Seconds. */
  delay?: number
  y?: number
  /**
   * Animate the lift WITHOUT the fade. Set this on whatever is the page's LCP
   * element, and nowhere else.
   *
   * Chrome ignores anything at `opacity: 0` when it picks the largest contentful
   * paint, and this component's `both` fill mode holds that first frame through
   * the delay — so the default makes the element it wraps invisible to the
   * metric. On the home page that cost the hero its place entirely: LCP was being
   * reported against the 22px header wordmark. The full derivation is on
   * `.rise-lift` in globals.css.
   *
   * The default stays the fade, because everything below the fold should keep it
   * — there is no metric to protect down there and the fade is the better effect.
   */
  liftOnly?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(liftOnly ? 'rise-lift' : 'rise', className)}
      style={
        {
          '--rise-delay': `${delay}s`,
          '--rise-y': `${y}px`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

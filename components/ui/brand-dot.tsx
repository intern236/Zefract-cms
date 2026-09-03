import { cn } from '@/lib/utils'

/**
 * The brand dot that bullets every section eyebrow, with a soft pulse.
 *
 * The dot itself is unchanged - same 6px, same brand orange, same shape. The pulse
 * is a `::after` halo (see .dot-pulse in globals.css), so nothing about the dot's
 * own appearance is touched.
 *
 * Pure CSS, so this stays a Server Component - no client boundary on ten-plus
 * eyebrows, and no Lottie runtime (lottie-web is ~250KB gzipped, absurd for a 6px
 * decoration on a site held to an LCP budget).
 *
 * Infinite by request. The global prefers-reduced-motion rule collapses it to a
 * plain static dot.
 */
export function BrandDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('dot-pulse size-1.5 shrink-0 rounded-full bg-brand', className)}
    />
  )
}

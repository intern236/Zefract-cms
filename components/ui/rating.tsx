import { cn } from '@/lib/utils'

const STARS = '★★★★★'

/**
 * A five-star rating.
 *
 * Two stacked copies of the same glyph run: a grey track underneath and a brand
 * copy on top, clipped to the score. That handles halves (4.5) without needing a
 * half-star glyph or an icon set, and the two runs always align because they are
 * literally the same string in the same font.
 *
 * `brand-strong` rather than `brand`: these are small marks on a light card, where
 * #E6551E measures 3.32:1 and misses AA. Same reasoning as every other small
 * orange label on the site.
 *
 * The glyphs are decorative and the score is announced as text - a screen reader
 * reading "black star black star black star" five times is worse than useless.
 */
export function Rating({
  value,
  outOf = 5,
  className,
}: {
  value: number
  outOf?: number
  className?: string
}) {
  const clamped = Math.max(0, Math.min(outOf, value))
  const pct = (clamped / outOf) * 100

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span aria-hidden="true" className="relative inline-block tracking-[2px]">
        <span className="text-line-strong">{STARS}</span>
        <span
          className="absolute inset-y-0 left-0 overflow-hidden text-brand-strong"
          style={{ width: `${pct}%` }}
        >
          {STARS}
        </span>
      </span>
      <span className="sr-only">
        Rated {clamped} out of {outOf}
      </span>
    </span>
  )
}

import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

/**
 * The design's pill button. Kept separate from shadcn's <Button> because the
 * comp's treatment (mono uppercase, 999px radius, lift on hover) is specific
 * enough that overriding Button everywhere would be noisier than owning it.
 *
 * Min height is 44px in every size, which clears WCAG 2.2 SC 2.5.8 (Target Size)
 * with room to spare.
 *
 * Deliberately NOT a client component: labels render as plain text, so there is no
 * behaviour here that needs the browser. It stays a shared module, which means a pill
 * inside a Server Component costs no JavaScript at all.
 */
/**
 * TRACKING LIVES ON THE SIZE, not on the base, and that is deliberate. Mono uppercase at
 * 0.14em is most of what makes a long label wide, so a size that shrinks the type has to be
 * able to shrink the tracking with it. Left on the base it would collide with the variant's
 * own value: cva concatenates rather than merging, so both letter-spacing utilities would
 * ship and the winner would be whichever Tailwind happened to sort later. `default` and `sm`
 * both restate 0.14em, so nothing outside `compact` changes.
 */
const pill = cva(
  'inline-flex items-center justify-center gap-2.5 rounded-full border border-transparent font-mono font-medium uppercase transition-[transform,box-shadow,background-color,border-color] duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
  {
    variants: {
      variant: {
        ink: 'bg-ink text-white shadow-[0_14px_30px_-12px_rgba(8,20,34,0.45)] hover:bg-ink-2',
        brand:
          'bg-brand text-ink shadow-[0_16px_34px_-12px_rgba(230,85,30,0.55)] hover:bg-brand-hover',
        ghost: 'border-[#CBD3DD] text-head hover:border-brand/55',
        ghostOnInk: 'border-white/30 text-white hover:border-white',
      },
      size: {
        default: 'px-7 py-[17px] text-xs tracking-[0.14em]',
        sm: 'min-h-11 px-5 py-3 text-[12px] tracking-[0.14em] sm:text-[11px]',
        /**
         * `default`, wound down for a long label on a small screen. Used by the Services
         * pages, whose CTAs are written as whole sentences: "Start with a mobile scoping
         * call" is 32 characters, and at the default 12px/0.14em/28px it needs 340px inside
         * a 259px card, so it broke to two ragged lines that hugged the label.
         *
         * ONE LINE WAS NOT ON OFFER. Measured against the real font, the longest label only
         * fits at 10px type, which is too small to label a tap target. So this stops fighting
         * the wrap and makes it deliberate: below sm the button fills its container and
         * centres both lines, which reads as a block button rather than an accident.
         *
         * `w-full` stops at sm, the type at lg. Those are different on purpose. A full-width
         * pill is right on a phone and absurd at 720px, while the smaller type is still worth
         * having across the tablet range, where it comfortably holds one line.
         *
         * Every `lg:` value here is `default`'s, so from 1024px up the two are identical.
         */
        compact:
          'w-full px-5 py-3.5 text-center text-[11px] tracking-[0.1em] sm:w-auto lg:px-7 lg:py-[17px] lg:text-xs lg:tracking-[0.14em]',
        /**
         * Two pills that must share one line on a phone. The hero's pair is the case: at the
         * default size "Start a project" and "Explore services" need 403px side by side and
         * the widest phone offers 382px, so they stacked.
         *
         * Measured against the real font, 11px over 14px of padding brings the pair to 307px,
         * which holds one line from 360px up. It is `sm` and not `lg` that restores the
         * default, unlike `compact`: by 640px there is room for the full size twice over, so
         * there is no reason to keep the small type across the tablet range.
         *
         * NOT `compact` reused, which carries `w-full` and is built for one button owning the
         * width. Here the whole point is that neither pill does.
         */
        pair: 'px-3.5 py-3.5 text-[11px] tracking-[0.1em] sm:px-7 sm:py-[17px] sm:text-xs sm:tracking-[0.14em]',
      },
    },
    defaultVariants: { variant: 'ink', size: 'default' },
  }
)

type PillProps = VariantProps<typeof pill> & { className?: string }

export function PillLink({
  variant,
  size,
  className,
  children,
  ...props
}: PillProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(pill({ variant, size }), className)} {...props}>
      {children}
    </Link>
  )
}

export function PillAnchor({
  variant,
  size,
  className,
  children,
  ...props
}: PillProps & ComponentProps<'a'>) {
  return (
    <a className={cn(pill({ variant, size }), className)} {...props}>
      {children}
    </a>
  )
}

export function PillButton({
  variant,
  size,
  className,
  children,
  ...props
}: PillProps & ComponentProps<'button'>) {
  return (
    <button className={cn(pill({ variant, size }), className)} {...props}>
      {children}
    </button>
  )
}

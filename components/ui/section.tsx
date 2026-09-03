import { cn } from '@/lib/utils'
import { BrandDot } from '@/components/ui/brand-dot'
import { Group, FadeItem } from '@/components/motion/reveal'
import { MaskedLines } from '@/components/motion/masked-lines'
import type { ReactNode } from 'react'

/**
 * The two heading sizes, shared between the static <Heading> and the animated
 * <MaskedLines> so a section head and a page head are never a hair apart.
 */
/**
 * Two phone-only adjustments to the h1, both measured at 375/390/430.
 *
 * FLOOR 2.5rem, not 2.75rem. The old clamp floor pinned the h1 at a flat 44px for every
 * width below 550px, because 8vw does not reach 44px until then. At 44px the hero's two
 * authored lines wrapped into FOUR on a phone, orphaning "rivals" on a line of its own.
 * 40px renders three. Nothing at or above 550px changes: 8vw is the binding term there,
 * so desktop is byte-identical.
 *
 * THE HERO NO LONGER USES THIS FLOOR and no longer renders three lines. It passes its own
 * `text-[clamp(min(2.5rem,...),8vw,6rem)]` so the floor drops with the viewport below
 * ~378px, which is what lets its heading hold two lines all the way down to 320px — the
 * derivation is at the call site in hero.tsx. The floor here still governs every OTHER h1
 * (the 404, every <PageHero>), which is why it stays.
 *
 * ANY CALL SITE OVERRIDING `text-[...]` MUST RESTATE `leading` after it. tailwind-merge
 * treats font-size as conflicting with leading, so an override silently deletes the
 * `leading-[1.05]` below — but not the `sm:leading-[0.98]`, which carries a modifier. The
 * h1 then inherits body's 1.6 on phones only. That shipped once; see hero.tsx.
 *
 * LEADING 1.05 below sm. 0.98 is a display setting — the line box is deliberately
 * shorter than the glyphs, which reads as tight typography across two long lines. Across
 * three or four short ones it reads as broken, because consecutive ascenders and
 * descenders nearly collide.
 *
 * A correction worth recording, because it nearly shipped as fact in this comment: an
 * earlier measurement concluded the line count was identical from 34px to 44px, i.e.
 * that size could not help. That was a broken probe — it mutated font-size and read
 * getComputedStyle in the same task, which returns stale values. Re-measured one frame
 * later, 44px gives 4 lines at 390px and 40px gives 3. Mutate, yield a frame, then read.
 */
/**
 * THE h2 IS DELIBERATELY LOOSER THAN THE h1, in both tracking and leading, and the two
 * are not meant to converge. The h1 runs to 96px, where heavy negative tracking is what
 * stops a short line reading as spaced-out capitals. The h2 tops out at 56px and usually
 * carries a full sentence over two lines, where the same -0.045em closed the word gaps up
 * until "Email isn't a cost. It's a" read as one long word. So h2 sits at -0.02em, and its
 * leading is 1.12 rather than a display setting under 1, because two long lines an em
 * apart at this size read as cramped rather than tight.
 */
const HEAD_SIZE = {
  h1: 'text-[clamp(2.5rem,8vw,6rem)] leading-[1.05] font-extrabold tracking-[-0.045em] sm:leading-[0.98]',
  h2: 'text-[clamp(2.125rem,4.6vw,3.5rem)] leading-[1.12] font-extrabold tracking-[-0.02em]',
} as const

export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('mx-auto w-full max-w-site px-6', className)}>{children}</div>
}

/**
 * Top spacing as a named choice rather than a class to override.
 *
 * A PROP, NOT A CLASSNAME, and this is the whole reason it exists. The default is a
 * RESPONSIVE pair, and tailwind-merge resolves `pt-24` against `pt-4` but treats `md:pt-32`
 * as a different group and keeps it. So `<Section className="pt-4">` — which ten call sites
 * were using — quietly did nothing at md and above: every interior page asked for 16px after
 * its hero and rendered 128px. It looked deliberate, which is why it survived so long.
 *
 * Selecting the whole pair by name means there is nothing left to half-override.
 *
 *   default — a section following another section, which needs the full break
 *   compact — the same, on the Services pages, where the break is smaller below lg
 *   tight   — a section directly under a <PageHero>, which has already made the space
 *   none    — spacing owned entirely by the caller
 *
 * `compact` IS A PHONE AND TABLET SETTING ONLY. Its `lg` value is `default`'s `md` value,
 * so from 1024px up the two are pixel-identical and a Services page is spaced exactly like
 * every other page. What it changes is the range below that: `default` gives 96px on a
 * phone and 128px from 768px, which on a narrow screen reads as a hole between sections
 * rather than a break. `compact` holds 64px all the way to 1024px.
 *
 * The breakpoint is `lg` and not `md` deliberately. At `md` the 768-1023 band would jump
 * straight back to 128px, which is the widest gap on the page happening on a tablet, which
 * is the size that needs it least.
 */
const SECTION_SPACING = {
  default: 'pt-24 md:pt-32',
  compact: 'pt-16 lg:pt-32',
  tight: 'pt-4 md:pt-6',
  none: '',
} as const

export function Section({
  children,
  className,
  id,
  spacing = 'default',
}: {
  children: ReactNode
  className?: string
  id?: string
  spacing?: keyof typeof SECTION_SPACING
}) {
  return (
    <section id={id} className={cn(SECTION_SPACING[spacing], className)}>
      {children}
    </section>
  )
}

/** The small monospace label above every section heading, with its brand dot. */
export function Eyebrow({
  children,
  align = 'center',
  className,
}: {
  children: ReactNode
  align?: 'center' | 'left'
  className?: string
}) {
  /* Inline flow, not flex.

     As a flex row the label was a single flex item, so on a narrow screen it wrapped
     to two lines inside itself while the dot stayed a separate item — `items-center`
     then parked the dot halfway down the two-line block, far to the left of centred
     text, reading as a stray mark rather than a bullet. Inline, the dot flows with
     the first word and each line centres on its own.

     Two things change below sm. Tracking tightens — 0.2em over a 41-character eyebrow
     adds ~90px, which is what pushed the home page's label onto a second line at 390px.
     And the size steps up from 11px to 12px: 11px reads as a small-caps label on a
     desktop but is at the edge of comfortable on a phone. Every micro-label on the site
     does the same, so they stay consistent with each other at both sizes. */
  return (
    <p
      className={cn(
        /* text-balance because the long home eyebrow still needs two lines at 390px
           even tightened: unbalanced it left "GROWTH" alone on line two after a
           dangling separator. */
        'font-mono text-[12px] font-medium text-balance tracking-[0.14em] text-mut uppercase sm:text-[11px] sm:tracking-[0.2em]',
        align === 'center' ? 'text-center' : 'text-left',
        className
      )}
    >
      <BrandDot className="mr-2.5 inline-block align-[0.12em]" />
      {children}
    </p>
  )
}

/**
 * The heading class string, so a static <Heading> and an animated <MaskedLines>
 * can never drift apart in size, weight or tracking.
 */
export function headingClass(as: 'h1' | 'h2' = 'h2', className?: string) {
  return cn('text-balance text-head', HEAD_SIZE[as], className)
}

/**
 * Section heading, unanimated.
 *
 * Used for <h1>s, which must paint immediately because they are the LCP element -
 * their entrance comes from <Rise>. For an <h2> below the fold, prefer
 * <MaskedLines> inside a <Group> so the lines wipe up.
 */
export function Heading({
  lines,
  as: Tag = 'h2',
  className,
}: {
  lines: readonly string[] | string
  as?: 'h1' | 'h2'
  className?: string
}) {
  const arr = typeof lines === 'string' ? [lines] : lines
  return (
    <Tag className={headingClass(Tag, className)}>
      {arr.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </Tag>
  )
}

/**
 * Section head, with its own entrance.
 *
 * The three parts arrive in reading order off a single scroll trigger: the
 * eyebrow fades, the heading lines wipe up one after another, then the
 * standfirst catches up. Call sites therefore must NOT wrap this in <Reveal> -
 * that would fade and lift the whole block underneath the line wipe, and the two
 * would fight.
 *
 * Margins sit on the animated wrappers rather than on the text inside them. A
 * margin on the inner <p> collapses out through the wrapper, which is harmless
 * until the wrapper is being transformed and the spacing starts drifting with it.
 */
export function SectionHead({
  eyebrow,
  heading,
  sub,
  className,
}: {
  eyebrow: string
  heading: readonly string[] | string
  sub?: string
  className?: string
}) {
  const lines = typeof heading === 'string' ? [heading] : heading

  return (
    <Group className={cn('mx-auto max-w-[820px] text-center', className)}>
      <FadeItem className="mb-6" y={10}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </FadeItem>
      <MaskedLines lines={lines} className={headingClass()} delay={0.08} />
      {sub ? (
        <FadeItem className="mt-5" delay={0.26}>
          <p className="mx-auto max-w-[56ch] text-pretty text-[17.5px] text-mut">{sub}</p>
        </FadeItem>
      ) : null}
    </Group>
  )
}

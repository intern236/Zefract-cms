import { Container, Section } from '@/components/ui/section'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'
import type { ServicePlans } from '@/content/types'

/**
 * The productised plans on a pillar page: an introduction, then three tiers.
 *
 * The Foundation Sprint had a dark band of its own below the tiers and no longer does. What it
 * costs is still on every card, and why every engagement opens with one is still in the intro
 * paragraph, so the sprint is stated twice over without a third block restating it at length.
 *
 * LEFT-ALIGNED, not the site's centred <SectionHead>. Every other section head on the site is
 * centred because it introduces something the reader scans; this one introduces a price list,
 * where the intro paragraph states the terms the tiers below are read against. Terms are read,
 * not scanned, and a 66-character measure ragged-right off the left edge is what a reader can
 * actually follow. The rest of the type scale is the site's own.
 *
 * The middle tier is pulled forward with a brand border and a flag rather than by being made
 * bigger. Height parity across three cards is what lets a reader compare rows straight across;
 * scaling one breaks that for the sake of an emphasis a coloured edge already carries.
 */
export function ServicePlansSection({ plans }: { plans: ServicePlans }) {
  return (
    <Section id="plans" spacing="compact">
      <Container>
        <Reveal>
          {/* The label, then a rule to the right margin. The rule is what makes the eyebrow
              read as a section marker rather than as a stray line of small caps, which is the
              job the leading "01" used to do before it was dropped for promising a sequence
              this page does not have. */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-mut-2 uppercase">
              {plans.eyebrow}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </div>

          <h2 className="mt-6 max-w-[20ch] text-[clamp(2rem,3.6vw,2.75rem)] leading-[1.06] font-extrabold tracking-[-0.03em] text-balance text-head">
            {plans.heading}
          </h2>

          <p className="mt-5 max-w-[66ch] text-[16px] leading-[1.65] text-mut lg:text-[17.5px]">
            {plans.intro}
          </p>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-1 gap-4.5 md:grid-cols-3" step={0.08}>
          {plans.tiers.map((tier) => (
            <StaggerItem key={tier.name} className="flex">
              {/* The badge overlaps the card's top edge, so the article is relative and the
                  featured card carries extra top padding to make room for it rather than
                  letting it sit on the border and clip the plan label. */}
              <article
                className={cn(
                  'relative flex w-full flex-col rounded-card border bg-surface p-7',
                  tier.featured ? 'border-brand pt-9' : 'border-line'
                )}
              >
                {tier.badge ? (
                  <span className="absolute -top-3 left-6 rounded-[6px] bg-brand px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.14em] text-white uppercase">
                    {tier.badge}
                  </span>
                ) : null}

                <p className="font-mono text-[11px] font-medium tracking-[0.2em] text-mut-2 uppercase">
                  Plan {tier.number}
                </p>
                <h3 className="mt-2.5 text-[26px] font-bold tracking-[-0.03em] text-head">
                  {tier.name}
                </h3>
                <p className="mt-1.5 text-[14.5px] text-mut">{tier.tagline}</p>

                {/* tabular-nums so the three prices sit on the same digit widths and the column
                    of figures lines up across the row. */}
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-[34px] leading-none font-extrabold tracking-[-0.04em] text-head tabular-nums">
                    {tier.price}
                  </span>
                  <span className="text-[15px] font-medium text-mut">{tier.priceUnit}</span>
                </p>
                <p className="mt-2.5 font-mono text-[11px] font-medium tracking-[0.12em] text-brand-strong uppercase">
                  {tier.sprint}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-[14.5px] leading-[1.55] text-mut">
                      {/* A square marker, not a tick: a tick says "included and verified",
                          which is a claim these rows are not making. It is decorative, so the
                          list still reads as a list without it. */}
                      <span
                        aria-hidden="true"
                        className="mt-[7px] size-1.5 shrink-0 rounded-[2px] bg-brand"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-7 rounded-[12px] bg-page p-4 text-[13.5px] leading-[1.55] text-mut">
                  <span className="font-bold text-head">Fits:</span> {tier.fits}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

      </Container>
    </Section>
  )
}

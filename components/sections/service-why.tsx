import { Container, Section, Eyebrow, headingClass } from '@/components/ui/section'
import { PillLink } from '@/components/ui/pill'
import { Group, FadeItem, Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { MaskedLines } from '@/components/motion/masked-lines'
import type { ServiceStory } from '@/content/types'

/**
 * The closing argument of a service document: why the service is worth buying, what it
 * returns, and why here rather than elsewhere.
 *
 * Two bands, deliberately different in weight. "Why it matters" is the case, set on the page
 * surface with the returns as a numbered grid. "Why us" is the answer to a narrower question
 * and sits on ink, which both closes the page and stops the reader arriving at the FAQ
 * accordion straight off the back of a five-item grid.
 *
 * Every part is optional. A service whose document says nothing about returns renders no
 * returns grid rather than an empty heading.
 */
export function ServiceWhy({ story, serviceName }: { story: ServiceStory; serviceName: string }) {
  const { whyItMatters, whyUs, closingCta } = story
  if (!whyItMatters && !whyUs) return null

  return (
    <>
      {whyItMatters ? (
        <Section spacing="compact">
          <Container>
            {/* Centred, matching every other section head on the site — see <SectionHead>.
                The cards below stay left-aligned: centring a five-line paragraph gives every
                line a different start point and the eye has to hunt for each one. Centred
                heads over left-aligned cards is the pattern the home page already uses. */}
            <Group className="mx-auto max-w-[820px] text-center">
              <FadeItem className="mb-6" y={10}>
                <Eyebrow>Why it matters</Eyebrow>
              </FadeItem>
              <MaskedLines lines={whyItMatters.heading} className={headingClass()} delay={0.08} />
              <FadeItem className="mt-7" delay={0.26}>
                <div className="mx-auto max-w-[64ch] space-y-4">
                  {whyItMatters.body.map((para) => (
                    <p
                      key={para.slice(0, 40)}
                      className="text-[16px] leading-[1.65] text-mut lg:text-[17.5px]"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </FadeItem>
            </Group>

            {whyItMatters.kicker ? (
              <Reveal className="mt-14">
                <p className="text-center font-mono text-[12px] tracking-[0.16em] text-brand-strong uppercase sm:text-[11px]">
                  {whyItMatters.kicker}
                </p>
              </Reveal>
            ) : null}

            {whyItMatters.returns.length > 0 ? (
              /* A wrapping flex row, not a grid, so an incomplete last row centres itself.
                 Both documents supply five returns, which in a three-column grid lands as
                 3 + 2 with the pair pushed left and a card-shaped hole on the right. Grid
                 cannot centre a short final row — every item is placed against a column
                 line — whereas `flex-wrap` + `justify-center` distributes whatever is left
                 over. Widths are the same fractions the grid columns were, so a full row is
                 pixel-identical to before; only the remainder moves.
                 gap-4.5 is 1.125rem, hence 1.125 subtracted once for two-up and 2.25 twice
                 for three-up. */
              <Stagger className="mt-8 flex flex-wrap justify-center gap-4.5" step={0.06}>
                {whyItMatters.returns.map((item, i) => (
                  <StaggerItem
                    key={item.title}
                    className="w-full md:w-[calc((100%-1.125rem)/2)] lg:w-[calc((100%-2.25rem)/3)]"
                  >
                    <article className="card-pop flex h-full flex-col rounded-card border border-line bg-surface p-7">
                      <p
                        aria-hidden="true"
                        className="font-mono text-[12px] tracking-[0.16em] text-brand-strong tabular-nums sm:text-[11px]"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <h3 className="mt-3 text-[19px] leading-snug font-bold tracking-[-0.02em] text-head">
                        {item.title}
                      </h3>
                      <p className="mt-3 flex-1 text-[14.5px] leading-[1.6] text-mut lg:text-[15.5px]">
                        {item.body}
                      </p>
                    </article>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : null}

            {whyItMatters.bottomLine ? (
              /* The document sets this off as its own closing line, so it gets weight the
                 grid above does not: larger, head colour, and a brand rule to its left
                 rather than another card. It is the argument's conclusion, not a sixth item. */
              <Reveal className="mt-12">
                {/* Centred with the rest of the section, so the left rule that used to mark
                    this as a pull-quote is gone — a rule down one side of centred text reads
                    as a mistake. A short brand mark above it sets the line apart from the
                    grid symmetrically, where a full-width top border would have read as a
                    divider between two sections rather than an accent on this one. */}
                <div className="mx-auto max-w-[62ch] text-center">
                  <span aria-hidden="true" className="mx-auto block h-0.5 w-12 rounded-full bg-brand" />
                  <p className="mt-6 text-[17.5px] leading-[1.6] font-medium text-balance text-head lg:text-[19px]">
                    {whyItMatters.bottomLine}
                  </p>
                </div>
              </Reveal>
            ) : null}
          </Container>
        </Section>
      ) : null}

      {whyUs ? (
        /* `on-ink` switches the focus ring to white — the brand ring is far too low-contrast
           on this background to satisfy SC 2.4.13. Same reasoning as <CtaBand>. */
        <Section className="pt-0">
          <Container>
            <Reveal>
              <div className="on-ink rounded-card bg-ink px-8 py-14 text-center text-white md:px-14 md:py-16">
                <Eyebrow className="mb-6 text-[#9FB2C7]">
                  Why {serviceName} with Zefract
                </Eyebrow>
                <h2 className="mx-auto max-w-[22ch] text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance">
                  {whyUs.heading}
                </h2>
                <div className="mx-auto mt-6 max-w-[62ch] space-y-4">
                  {whyUs.body.map((para) => (
                    <p key={para.slice(0, 40)} className="text-[17px] leading-[1.65] text-[#C6D4E4]">
                      {para}
                    </p>
                  ))}
                </div>

                {closingCta ? (
                  /* The question leads, the button answers it. The document writes these as
                     one sentence — "Ready to be found? Let's start with your free website
                     audit" — and putting the button first inverted it into an instruction
                     followed by a question, which is the wrong way round to ask for anything. */
                  <div className="mt-10">
                    <p className="text-[17px] font-medium text-white">{closingCta.line}</p>
                    <PillLink href={closingCta.href} variant="brand" className="mt-5">
                      {closingCta.label}
                    </PillLink>
                  </div>
                ) : null}
              </div>
            </Reveal>
          </Container>
        </Section>
      ) : null}
    </>
  )
}

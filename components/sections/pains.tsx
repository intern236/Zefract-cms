import { Container, Section, Eyebrow, headingClass } from '@/components/ui/section'
import { PillLink } from '@/components/ui/pill'
import { Group, FadeItem } from '@/components/motion/reveal'
import { MaskedLines } from '@/components/motion/masked-lines'
import { PAINS } from '@/content/home'

/**
 * One pain card's content.
 *
 * These cards used to carry the pointer-origin navy fill on hover, which needed a second
 * copy of this content recoloured for the dark panel — hence an `onFill` variant with its own
 * contrast workings (#f26a33 rather than #c2410c, which only reached 2.2:1 on the navy). The
 * fill was removed at the client's request, so the recoloured variant went with it; both are
 * in the history if the effect ever comes back.
 */
function PainBody({ card }: { card: (typeof PAINS.cards)[number] }) {
  return (
    <>
      <span className="font-mono text-[12px] font-medium tracking-[0.2em] text-brand-strong sm:text-[11px]">
        {card.number}
      </span>
      <h3 className="mt-3.5 text-2xl font-bold tracking-[-0.025em] text-head">{card.title}</h3>
      <p className="mt-3 max-w-[52ch] text-[15.5px] text-mut">{card.body}</p>
    </>
  )
}

export function Pains() {
  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Same choreography as <SectionHead>, laid out left rather than centred:
              eyebrow, then the heading lines wiping up, then the body and CTA. */}
          <Group className="lg:sticky lg:top-32 lg:self-start">
            <FadeItem className="mb-6" y={10}>
              <Eyebrow align="left">{PAINS.eyebrow}</Eyebrow>
            </FadeItem>
            <MaskedLines lines={PAINS.heading} className={headingClass()} delay={0.08} />
            <FadeItem className="mt-6" delay={0.26}>
              <p className="max-w-[46ch] text-[17px] text-mut">{PAINS.body}</p>
              {/* Centred below lg, left-aligned from lg. The breakpoint is the grid's own:
                  from lg this column is the narrow half of a two-up layout and the button
                  belongs on the same left edge as the heading above it, but in the single
                  column a phone gets, an inline-flex pill sitting hard left under a full
                  width paragraph reads as stranded rather than aligned.

                  A wrapper rather than `mx-auto` on the pill, because the pill is
                  inline-flex: `mx-auto` needs a width to centre against and the pill has
                  none of its own. */}
              <div className="mt-8 flex justify-center lg:justify-start">
                <PillLink href="/contact" variant="ghost">
                  {PAINS.cta}
                </PillLink>
              </div>
            </FadeItem>
          </Group>

          {/* Sticky stacking, matching the approved design exactly:
              .stack { gap: 22px; padding: 26px 0 40px }
              .scard { position: sticky } with tops 120 / 142 / 164.
              I had originally ported this as a plain flex column and missed the
              sticky rules, which is why the cards didn't stack.

              Pure CSS - no scroll listener, no useScroll, no client component.
              Note that tracking a sticky element with useScroll cannot work anyway:
              its progress freezes for as long as it stays pinned. */}
          <div className="flex flex-col gap-[22px] pt-[26px] pb-10">
            {PAINS.cards.map((card, i) => (
              <article
                key={card.number}
                style={{ top: `${120 + i * 22}px` }}
                /* md:sticky — the stack is a desktop effect only.

                   The stagger between pinned cards is 22px while a card is 265-290px
                   tall, so a pinned card is meant to be almost entirely covered by the
                   next one. That reads as a deliberate deck on a wide screen. On a
                   phone the cards grow taller as the text wraps, and card 2 slid over
                   card 1 by up to 322px at 390px wide — cutting the paragraph mid-line
                   and hiding the "03" index. Measured at 375/390/430.

                   Below md the cards fall back into normal flow and each is read whole.
                   `top` stays in the inline style; it is inert while position is static. */
                className="card-pop rounded-card border border-line bg-surface p-9 shadow-[0_24px_50px_-30px_rgba(8,20,34,0.35)] md:sticky"
              >
                <PainBody card={card} />
              </article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}

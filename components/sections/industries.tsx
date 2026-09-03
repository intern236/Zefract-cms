import { Fragment } from 'react'
import { Container, Section, SectionHead } from '@/components/ui/section'
import { Stagger, StaggerItem } from '@/components/motion/reveal'
import { Marquee } from './marquee'
import { INDUSTRIES, INDUSTRIES_INTRO, STACK } from '@/content/home'

/**
 * The chip after which a row ends, below the width where all eight fit on one line.
 * Breaking after the 2nd and the 5th gives 2 / 3 / 3.
 */
const ROW_BREAKS = new Set([1, 4])

export function Industries() {
  return (
    <Section>
      <Container>
        <SectionHead
          eyebrow={INDUSTRIES_INTRO.eyebrow}
          heading={INDUSTRIES_INTRO.heading}
          sub={INDUSTRIES_INTRO.sub}
        />

        {/* Chips, not buttons.
            They respond to hover — lift, warm border, brand text, soft shadow — but
            they are deliberately still <span>s with no pointer cursor, because there
            is nowhere for them to go: industry pages are Phase 3. A chip that
            presses like a button and then does nothing is worse than a chip that
            just highlights. Turn these into <Link>s the day those routes exist.

            `chip-pop` also carries the pointer-position glow — see globals.css.

            ONE WRAPPING ROW AT EVERY WIDTH, packed as tight as the labels allow. At 390px
            that comes out 2-3-3: the first row takes only two because "SaaS & Startups" and
            "Ecommerce & Retail" are the two longest labels and happen to lead the list, and
            adding a third would need 377px against the 342px a phone offers. From 430px the
            same row holds three and it reads 3-3-2.

            A GRID WAS THE OBVIOUS ALTERNATIVE AND IS WORSE HERE. Three equal columns are
            107px at 390px, but those two labels measure 131px and 149px, so both would break
            to two lines and the first row would stand taller than the rest. Nothing can be
            shrunk out of that: "Ecommerce & Retail" needs roughly 8px type to fit a 107px
            cell. Ragged row ends cost less than a chip that reads as two chips.

            THE PHONE TYPE IS 13px / px-3.5 AND THAT SIZE IS STILL LOAD-BEARING, even though
            the grid it was chosen for is gone. Measured with the real font at 600 weight, it
            is what makes the 2-3-3 packing possible: back at the desktop 14.5px / px-5 the
            same eight chips need 154px and 183px for the first two, and the row falls apart
            into the 1-2-2-2-1 this started as.

            2 / 3 / 3 IS PINNED, NOT LEFT TO THE FLOW. Natural wrapping only lands on it by
            coincidence of the label widths, and drifts as the viewport moves: 3-3-2 at 430px,
            5-3 at 768px, and 7-1 at 1024px, which orphans a chip. The zero-height `basis-full`
            spans below force the line to end after the 2nd and 5th chip, so the shape holds
            at every width under 1152px.

            1152px is measured, not a guess: it is where all eight fit one line, so that is
            exactly where the forced breaks switch off and the row becomes a single line
            again. Nothing above it changes.

            Break spans, not a 6-column grid with spans, because a grid cell is a hard cap on
            its chip. At 320px a third of the row is 91px and "Healthcare" is 99px, so a grid
            would wrap the label inside the chip. A flex line just puts the overflowing chip
            on the next line, which is the better failure.

            `gap-y-1` and not `gap-y-2`: each break is its own flex line, so the vertical gap
            is paid twice between chip rows. 4px twice is the 8px the rows should have. */}
        <Stagger
          className="mt-13 flex flex-wrap justify-center gap-x-2 gap-y-1 sm:gap-x-2.5"
          step={0.04}
        >
          {INDUSTRIES.map((industry, i) => (
            <Fragment key={industry.slug}>
              <StaggerItem y={12}>
                <span className="chip-pop inline-block rounded-full border border-line bg-surface px-3.5 py-3 text-[13px] font-semibold text-head sm:px-5 sm:text-[14.5px]">
                  {industry.name}
                </span>
              </StaggerItem>
              {ROW_BREAKS.has(i) ? (
                <span aria-hidden="true" className="h-0 basis-full min-[1152px]:hidden" />
              ) : null}
            </Fragment>
          ))}
        </Stagger>
      </Container>

      <Marquee
        /* THE ALTERNATING MONO/BOLD LIVES HERE NOW, where it always belonged: it is a
           typographic decision about THIS strip's words, and <Marquee> stopped styling
           its own items when it started carrying logos as well. Same rule, same result
           — every other entry set in mono uppercase, the rest in bold — just applied by
           the caller that cares about it.

           STACK MUST STILL BE EVEN-LENGTHED, though the reason has changed with the
           component. The index now runs over the ORIGINAL list rather than the repeated
           one, so every copy styles a given word identically — what an odd count breaks is
           the SEAM: the last item and the first would both land on the same side of
           `i % 2` and sit next to each other with the same treatment, which is visible
           every time the loop comes round. Twelve is fine; eleven is not. The note on
           STACK in content/home.ts is the one to read before removing an entry. */
        items={STACK.map((item, i) => ({
          key: item,
          node: (
            <span
              className={
                i % 2 === 1
                  ? 'font-mono text-sm tracking-[0.2em] text-mut-2 uppercase'
                  : 'text-[19px] font-extrabold tracking-[-0.02em] text-mut-2'
              }
            >
              {item}
            </span>
          ),
        }))}
        /* "Technologies", not "Technologies and certifications" — the two certifications
           that made the second half of that name true were removed (see STACK), so the
           label was left promising a category the strip no longer contains. It is the
           accessible name for the whole list, so it is the one thing a screen reader
           hears about it. */
        label="Technologies we work with"
        duration={44}
        reverse
        className="mt-16"
      />
    </Section>
  )
}

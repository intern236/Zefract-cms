import { Container, Section } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { Rise } from '@/components/motion/rise'
import { PartsIndex } from './parts-index'
import type { ServicePoint } from '@/content/types'

/**
 * A service's parts, as an indexed list rather than a grid of cards.
 *
 * WHY NOT THE CARD GRID IT REPLACED. Ten parts in a two-up grid of equal cards is ten
 * identical shapes: nothing signals where you are, the eye has no order to follow across a
 * grid that reads both down and across, and each card's prose is squeezed to roughly 40
 * characters a line while the page has room for 70. The parts are a sequence — the audit
 * comes first for a reason and the ongoing work comes last for a reason — and a grid is the
 * one layout that cannot say so.
 *
 * A row per part gives the prose its proper measure and the sequence its order; the sticky
 * index gives the page a spine and somewhere to jump from. The index is desktop-only, so on
 * a phone this degrades to exactly the stack of rows it already is.
 *
 * The rows are server-rendered. Only the index crosses into the client bundle, and only for
 * its scroll-spy — see parts-index.tsx.
 */
export function ServiceParts({
  points,
  heading,
  intro,
  platforms,
  aliases,
  indexLabel,
}: {
  points: ServicePoint[]
  /**
   * Optional, and normally absent for a service with a document behind it.
   *
   * The SEO document runs tagline, intro, then "01" with nothing in between, and the parts
   * are its Heading 2s — so on that page the parts ARE the h2s and a wrapper heading would
   * both invent copy and push them down a level. Services with no document still want a
   * "What we do" to open on, so the prop stays and the heading level follows it.
   */
  heading?: string
  /** The document's opening paragraphs, set above the parts they introduce. */
  intro?: string[]
  /** The named surfaces this service works against — see ServiceStory.platforms. */
  platforms?: string[]
  /** Appendix C's everyday phrasing — real copy, not meta keywords. */
  aliases?: string[]
  indexLabel: string
}) {
  const parts = points.map((point, i) => ({
    id: `part-${String(i + 1).padStart(2, '0')}`,
    name: point.name,
  }))

  // Heading levels are derived, never skipped: with a section heading the parts sit under
  // it as h3, without one they are the page's own h2s.
  const PartHeading = heading ? 'h3' : 'h2'

  /* Not `spacing="tight"`, which exists for a section sitting directly under a hero that
     needs almost nothing. This one opens with running prose rather than a heading, so it
     wants air above it to separate the reading from the hero, and air below so the last part
     does not butt straight into "Why it matters".

     The breakpoint is `lg`, matching `spacing="compact"` on the sections below. Desktop is
     unchanged at 80px and 56px; what tightens is the phone and tablet range, where 56px
     under a hero that has already made space was reading as a gap rather than a break. */
  return (
    <Section spacing="none" className="pt-10 pb-8 lg:pt-20 lg:pb-14">
      <Container>
        {heading || intro?.length || aliases?.length ? (
          /* <Rise>, not <Reveal>, and the distinction is load-bearing here.
             <Reveal> is Motion-driven: it holds its content at opacity 0 until the client
             bundle downloads, hydrates and fires an IntersectionObserver. That is fine below
             the fold and wrong above it — and once the hero shrank to clear the header by
             10px, this block moved above the fold. It rendered as a blank gap on load, for
             long enough to be caught in a screenshot. <Rise> is CSS, server-rendered, and
             animates at first paint. See the note at the top of rise.tsx, which calls this
             exact trap. */
          <Rise y={16}>
            {heading ? (
              <h2 className="max-w-[20ch] text-[clamp(2rem,3.6vw,2.75rem)] leading-[1.06] font-extrabold tracking-[-0.03em] text-balance text-head">
                {heading}
              </h2>
            ) : null}

            {intro && intro.length > 0 ? (
              /* 66 characters, which is the widest this runs anywhere on the page. The rows
                 below sit in a narrower column, so the intro is deliberately the one
                 full-width block — the only place the reader is asked to settle in and read
                 rather than scan. */
              <div className={`max-w-[66ch] space-y-4 ${heading ? 'mt-6' : ''}`}>
                {intro.map((para) => (
                  <p
                    key={para.slice(0, 40)}
                    className="text-[16px] leading-[1.65] text-mut lg:text-[17.5px]"
                  >
                    {para}
                  </p>
                ))}
              </div>
            ) : null}

            {/* The platforms this service works against, as a labelled row.
                Chips rather than a sentence: these are proper nouns being scanned for, and
                a reader checking whether their platform is covered finds it faster in a row
                of names than mid-paragraph. No hover lift — nothing here is clickable, and
                .chip-pop would promise a link that is not there. */}
            {platforms && platforms.length > 0 ? (
              <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2.5">
                <span className="font-mono text-[11px] tracking-[0.2em] text-mut-2 uppercase">
                  Platforms
                </span>
                <ul className="flex flex-wrap gap-2">
                  {platforms.map((platform) => (
                    <li
                      key={platform}
                      className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-head"
                    >
                      {platform}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Below the intro rather than above it: this is a line for the buyer who
                searched a different word for the same thing, not the opening the page
                wants to lead with. */}
            {aliases && aliases.length > 0 ? (
              <p className="mt-6 max-w-[62ch] text-[14px] text-mut-2 lg:text-[15px]">
                Also known as {aliases.join(', ')}.
              </p>
            ) : null}
          </Rise>
        ) : null}

        {/* The index column is fixed at 260px rather than a fraction, so the reading column
            keeps the same measure whatever the viewport does. A fractional index would grow
            with the screen and take width from the prose, which is backwards — the list of
            names has a natural size and the prose is what benefits from the room. */}
        {/* A bigger break than the rhythm inside either block, because this is where the
            page stops introducing itself and starts listing. At mt-16 the intro's last
            paragraph and the first part ran together as one column of text. */}
        <div className="mt-20 grid grid-cols-1 gap-x-16 md:mt-28 lg:grid-cols-[260px_minmax(0,1fr)]">
          <PartsIndex parts={parts} label={indexLabel} />

          <ol className="space-y-0">
            {points.map((point, i) => (
              <li
                key={point.name}
                id={parts[i].id}
                /* The rule sits on the top of each row rather than the bottom, so the last
                   part does not end on a line that promises another one. */
                className="border-t border-line pt-10 pb-12 first:border-t-0 first:pt-0 last:pb-0"
              >
                <Reveal y={16}>
                  <div className="flex items-baseline gap-4">
                    <span
                      aria-hidden="true"
                      /* Big, light and outside the text column's rhythm — it is a position
                         marker, not a heading, and numbering the <h3> itself would put "01"
                         into the accessible name of every part. */
                      className="font-mono text-[15px] leading-none font-medium tracking-[0.08em] text-brand-strong tabular-nums"
                    >
                      {parts[i].id.slice(-2)}
                    </span>
                    <PartHeading className="text-[clamp(1.375rem,2.2vw,1.75rem)] leading-snug font-bold tracking-[-0.025em] text-head">
                      {point.name}
                    </PartHeading>
                  </div>

                  {/* The indent aligns the prose with the heading rather than the number,
                      so the numbers form their own column down the left edge. Desktop only:
                      at narrow widths that indent is width the text cannot spare. */}
                  <div className="mt-4 max-w-[62ch] lg:pl-[calc(1rem+2ch)]">
                    <div className="space-y-4">
                      {point.body.map((para) => (
                        <p
                          key={para.slice(0, 40)}
                          className="text-[15.5px] leading-[1.65] text-mut lg:text-[16.5px]"
                        >
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* A sibling of the paragraphs, not one of them: inside that space-y-4
                        it would inherit the 16px paragraph rhythm and read as another
                        sentence rather than as the row's footer. */}
                    <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                      <span className="font-mono text-[11px] tracking-[0.2em] text-mut-2 uppercase">
                        Includes
                      </span>
                      <ul className="flex flex-wrap gap-2">
                        {point.includes.map((item) => (
                          <li
                            key={item}
                            className="chip-pop rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-head"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  )
}

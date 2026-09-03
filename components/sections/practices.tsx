import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { Container, Section, SectionHead } from '@/components/ui/section'
import { Stagger, StaggerItem } from '@/components/motion/reveal'
import { PRACTICES, DEPLOY_LINES } from '@/content/home'
import { cn } from '@/lib/utils'

/**
 * The three stages in the pipeline tile, and what each one actually holds.
 *
 * Local to this file rather than in the content layer: they are parts of an illustration, not
 * copy — nothing outside this drawing refers to them, and a CMS would have no reason to.
 *
 * `items` used to be `bars`, a list of placeholder widths. Three boxes of grey bars is a
 * picture of a pipeline with nothing in it, on a card whose whole claim is that the pipeline
 * carries your analytics. These are the real vocabulary of each stage instead, so the tile
 * says what moves through it.
 */
const PIPE_STAGES = [
  { name: 'Ingest', items: ['Events', 'Webhooks', 'CDC'] },
  { name: 'Transform', items: ['Dedupe', 'Enrich', 'Model'] },
  { name: 'Serve', items: ['API', 'Dashboards', 'Alerts'] },
] as const

/**
 * The three pipeline stages, each listing what it handles, with the stage name on top.
 *
 * Its own component because it renders in two places: inside the standard art tile if this card
 * ever stops being the full-width one, and directly in the right-hand column of the split layout
 * it uses today. Keeping one definition means the two cannot drift.
 *
 * No motion. Two earlier versions moved brand orange around this tile, a packet crossing each
 * connector and then the stages lighting in turn, and both were removed. The shimmer that
 * replaced them has now gone the same way, along with the placeholder bars it was sweeping
 * across: a stage that lists Events, Webhooks and CDC needs no animation to look alive.
 */
function PipeStages() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PIPE_STAGES.map((stage) => (
        <div key={stage.name} className="rounded-[14px] border border-line bg-surface p-3.5">
          <p className="font-mono text-[12px] tracking-[0.16em] text-brand-strong uppercase sm:text-[11px]">
            {stage.name}
          </p>
          <ul className="mt-3 space-y-1.5">
            {stage.items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-[13px] text-mut sm:text-[12.5px]"
              >
                {/* A marker, not a bullet glyph: at this size a disc renders as a smudge and
                    a hyphen reads as a dash in the text. */}
                <span className="size-1 shrink-0 rounded-full bg-line-strong/60" />
                <span className="min-w-0 truncate">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/**
 * The row shape every panel below is built from: a mono label on the left, the thing itself
 * on the right.
 *
 * WHY EVERY PANEL IS A READOUT NOW. Four of these five used to be built from `.skel`, grey
 * rounded bars running a shimmer sweep. That is the loading-skeleton idiom exactly, so the
 * section read as five cards that had failed to load, and the sweep re-asserted it every
 * 1.9 seconds. The deploy log was the only tile that escaped, because it showed a real
 * artifact instead of standing in for one. So the log's language won and the skeletons went:
 * each panel now shows something the practice actually produces.
 *
 * The label column is a fixed character width rather than `auto`, so the values line up down
 * the panel instead of stepping in and out with the length of each label.
 */
function ArtRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[68px] shrink-0 font-mono text-[10.5px] tracking-[0.14em] text-mut-2 uppercase sm:w-[72px]">
        {label}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2">{children}</span>
    </div>
  )
}

/**
 * The site's own palette, shown as swatches on the design card.
 *
 * These are the real token values from globals.css, not sampled colours that merely look
 * like them. The tile is therefore a readout of the page it is sitting on, which is the most
 * honest thing a "design that converts" illustration can be: no invented deliverable, just
 * the system this site is built from.
 */
const PALETTE = [
  { name: 'Ink', value: '#081422' },
  { name: 'Brand', value: '#e6551e' },
  { name: 'Line', value: '#e2e6ec' },
  { name: 'Page', value: '#f1f3f6' },
] as const

/**
 * Channel rows on the growth card.
 *
 * `spark` values are bar heights as percentages, low to high, so each channel has its own
 * shape rather than three copies of one curve. 3.2x is the figure the Veloce case study
 * reports, reused deliberately: a number on the home page that disagrees with the number on
 * the case study is worse than no number at all.
 */
const CHANNELS = [
  { name: 'Organic', spark: [34, 48, 62, 84, 100], value: '+38%' },
  { name: 'Paid', spark: [42, 58, 74, 66, 92], value: '3.2x' },
  { name: 'Email', spark: [28, 40, 36, 58, 72], value: '24%' },
] as const

/** Small artifact panels that sit at the top of each practice card. */
function CardArt({ kind }: { kind: string }) {
  if (kind === 'browser') {
    return (
      /* The design system this site is built from, as its own spec sheet: the two families
         actually loaded by the root layout, the four palette tokens, and the measured
         contrast of body text on the page behind it.

         14.7:1 is computed, not asserted. --color-head (#0f2038) on --color-page (#f1f3f6)
         by the WCAG relative-luminance formula, which is comfortably past the 4.5:1 that AA
         asks of body text. It is the one figure in this whole section that anybody can check
         with a colour picker, which is exactly why it is the one on the design card.

         Decorative: the card's own text says what the practice is, so this is hidden rather
         than read out as a list of hex values. */
      <div
        aria-hidden="true"
        className="rounded-tile border border-line bg-page px-4 py-3.5 sm:px-4.5"
      >
        <div className="space-y-2.5">
          <ArtRow label="Type">
            <span className="min-w-0 truncate text-[12px] font-semibold text-head sm:text-[11.5px]">
              Jakarta
            </span>
            <span className="text-[11px] text-mut-2">/</span>
            <span className="min-w-0 truncate font-mono text-[11px] text-mut sm:text-[10.5px]">
              JetBrains
            </span>
          </ArtRow>

          <ArtRow label="Palette">
            {PALETTE.map((swatch) => (
              <span
                key={swatch.name}
                /* A ring rather than a border, so Page and Line stay visible against a
                   background they are nearly the same colour as. */
                className="size-4 rounded-[5px] ring-1 ring-line ring-inset"
                style={{ backgroundColor: swatch.value }}
              />
            ))}
          </ArtRow>

          <ArtRow label="Contrast">
            <span className="font-mono text-[11px] font-medium text-head sm:text-[10.5px]">
              14.7:1
            </span>
            <span className="rounded-full bg-brand/12 px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.1em] text-brand-strong uppercase">
              AA
            </span>
          </ArtRow>
        </div>
      </div>
    )
  }

  if (kind === 'code') {
    return (
      /* A live deploy log: the lines scroll upward for ever, the next entering from
         below as the one above leaves.

         UNCHANGED, and deliberately so. This tile is why the other four look the way they
         now do: it was the only one that showed an artifact rather than standing in for one,
         so it is the reference the rest were rewritten against, not something to redesign.

         Pure CSS, so this stays a Server Component — see the .log rules in globals.css
         for how the loop closes seamlessly. */
      <div className="log rounded-tile border border-line bg-page p-4 font-mono text-[12px] text-mut sm:text-[11px]">
        <div className="log-window">
          <div className="log-track">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                className="log-copy space-y-2"
                /* The second copy exists only to close the loop — hide it from AT so the
                   log is not read out twice. Same arrangement as the logo marquee. */
                aria-hidden={copy === 1 || undefined}
              >
                {DEPLOY_LINES.map((line) => (
                  <li key={line.text} className="flex items-center gap-2">
                    <span className="text-emerald-600">✓</span>
                    {/* min-w-0 is what makes `truncate` work: a flex item's automatic
                        minimum size is its min-content width, and truncate sets
                        white-space: nowrap — without it the item refuses to shrink below
                        the full string, the tile grows past its grid track, and the page
                        scrolls sideways. */}
                    <span className="min-w-0 truncate">{line.text}</span>
                    {line.accent ? (
                      <span className="shrink-0 text-brand-strong">{line.accent}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (kind === 'agents') {
    return (
      /* An agent working through its steps, one row each, ticking off in order.

         The steps run in sequence and loop: one is active at a time, its tick switching to brand
         and its bar filling, then it hands over. That ordering is the point — an agent doing all
         four at once would be a different, less honest claim. See .agents in globals.css for the
         timing, including why the delay is positive where it would be negative for a wave.

         LAID OUT 2x2, NOT AS FOUR STACKED ROWS. Four rows made this tile 202px against the
         growth tile's ~104px beside it, and cards in a row share a height, so the neighbour
         ended up with about 98px of dead space under its text. Two rows of two reads the same —
         the active step still advances in reading order — and holds the tile at ~101px.

         Decorative: the step names are the illustration's own labels and the card's text says
         what it does, so the tile is hidden from assistive tech like its neighbours. */
      <div aria-hidden="true" className="rounded-tile border border-line bg-page p-3.5">
        <ul
          /* One column below sm, 2x2 above it.

             The 2x2 is there so this tile stays about as tall as the growth tile beside it
             once the cards sit two-up — see the note above, and it still does from sm. But
             below sm the cards are stacked full width, so there is no neighbour to match and
             nothing to buy with the compression: measured at 320px each cell gave the label
             8px of box for 65px of text, i.e. "Summarise" rendered as a bare ellipsis. Full
             width rows there cost nothing and the words come back. */
          className="agents grid grid-cols-1 gap-1.5 sm:grid-cols-2"
          style={{ '--agents-count': PRACTICES.agentChips.length } as CSSProperties}
        >
          {PRACTICES.agentChips.map((chip, i) => (
            <li
              key={chip}
              style={{ '--i': i } as CSSProperties}
              /* Tighter gaps and padding below lg. At 768 the cards are two-up but the
                 viewport is not yet wide enough to pay for it: the label got 51px of box for
                 62px of text, so "Summarise" clipped. Trimming the row's fixed furniture —
                 two gaps and the side padding — returns ~12px, which clears it. lg keeps the
                 original spacing, where there was never a shortage. */
              className="agents-row flex min-w-0 items-center gap-1.5 rounded-[10px] border border-line bg-surface px-1.5 py-1.5 lg:gap-2 lg:px-2"
            >
              {/* No colour class on the tick: .agents-tick owns both its fill and its glyph
                  colour, and a CSS animation outranks a normal declaration, so a class here
                  would be dead weight that only showed up when motion is off. */}
              <span className="agents-tick grid size-4 shrink-0 place-items-center rounded-full text-[8px] leading-none">
                ✓
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-head sm:text-[11.5px]">
                {chip}
              </span>
              <span className="agents-track ml-auto h-1.5 w-5 shrink-0 overflow-hidden rounded-full bg-line lg:w-6">
                <span className="agents-fill block h-full w-full rounded-full bg-brand" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (kind === 'pipe') {
    /* The pipeline stages inside a standard art tile.

       THIS IS THE FALLBACK PATH. Today this card is the full-width one, so it renders the split
       layout further down and never reaches here. The branch stays because the condition that
       makes it full-width is "last card of an odd-numbered list" — add a sixth card and this one
       drops back into a normal grid cell, where it needs a tile like its neighbours. Without this
       it would fall through to the growth art and be silently wrong. Both paths render the same
       <PipeStages />, so they cannot drift. */
    return (
      <div aria-hidden="true" className="rounded-tile border border-line bg-page p-4">
        <PipeStages />
      </div>
    )
  }

  /* The growth card: what is being measured, per channel.

     WHAT THIS REPLACED, because the swap is the whole argument. It was six grey bars of
     arbitrary height with the orange accent walking along them, which showed a chart without
     showing a measurement: no channel, no unit, nothing a reader could audit. On a card whose
     own heading is "Growth you can audit", an unlabelled chart was the wrong illustration.

     Deliberately still. The section already carries two loops, the deploy log and the agent
     queue, and a third moving thing beside them turns a page into a screensaver. The accent
     here is positional instead: the newest bar in each row is brand, so the eye reads left to
     right and lands on now.

     Decorative: the card's text carries the claim, so this is hidden from assistive tech. */
  return (
    <div
      aria-hidden="true"
      className="rounded-tile border border-line bg-page px-4 py-3.5 sm:px-4.5"
    >
      <div className="space-y-2.5">
        {CHANNELS.map((channel) => (
          <ArtRow key={channel.name} label={channel.name}>
            {/* Fixed 22px so the three sparklines share a baseline and the same ceiling.
                Heights are percentages of it, so a row's shape is legible rather than being
                whatever its own tallest bar happened to be. */}
            <span className="flex h-[22px] flex-1 items-end gap-[3px]">
              {channel.spark.map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}%` }}
                  className={cn(
                    'w-full max-w-[9px] rounded-[2px]',
                    i === channel.spark.length - 1 ? 'bg-brand' : 'bg-line-strong/35'
                  )}
                />
              ))}
            </span>
            <span className="shrink-0 font-mono text-[11px] font-medium text-head tabular-nums sm:text-[10.5px]">
              {channel.value}
            </span>
          </ArtRow>
        ))}
      </div>
    </div>
  )
}

export function Practices() {
  return (
    <Section id="services">
      <Container>
        <SectionHead eyebrow={PRACTICES.eyebrow} heading={PRACTICES.heading} sub={PRACTICES.sub} />

        {/* The six-row pillar hub that used to sit here has been removed. The pillar pages
            keep their internal entry point through the header's Services menu, which links
            all five, so nothing is orphaned. `PRACTICES.nodes` is left in the content layer
            so the grid can be restored without retyping it. */}

        <Stagger className="mt-14 grid grid-cols-1 gap-4.5 md:grid-cols-2" step={0.08}>
          {PRACTICES.cards.map((card, i) => {
            /* Two columns and an odd number of cards leaves the last one alone with a hole
               beside it, so it spans both instead. Derived rather than hardcoded to the fifth
               card: add a sixth and the grid returns to a clean 3x2 with nothing to remember.

               The same flag drives the split layout below, and that is deliberate — the reason
               that card reads differently is precisely that it has a full row to work with. Tie
               the two together and they cannot fall out of step. */
            const isWide =
              i === PRACTICES.cards.length - 1 && PRACTICES.cards.length % 2 === 1

            const chips = (
              <div className="flex flex-wrap gap-2">
                {card.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-line bg-page px-3 py-1.5 text-[12.5px] font-semibold text-head"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )

            const title = (
              <h3 className="text-2xl font-bold tracking-[-0.025em] text-head">
                <Link href={card.href} className="hover:text-brand-strong">
                  {card.title}
                </Link>
              </h3>
            )

            return (
              <StaggerItem key={card.title} className={cn(isWide && 'md:col-span-2')}>
                {isWide ? (
                  /* The full-width card reads across rather than down: copy on the left, the
                     stage boxes on the right, chips under a rule that spans the whole card.
                     Stacking a wide card the way a narrow one stacks leaves a very short
                     paragraph under a very wide illustration, which is what made this card look
                     unfinished at 1280px even once the tile itself was right. */
                  <article className="card-pop flex h-full flex-col rounded-card border border-line bg-surface p-7">
                    <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:gap-9">
                      <div>
                        {title}
                        <p className="mt-3 max-w-[42ch] text-[15.5px] text-mut">{card.body}</p>
                      </div>
                      {/* The rule only appears once the two are actually side by side. Below lg
                          they are stacked, where a left border would sit under the copy pointing
                          at nothing. */}
                      <div className="lg:border-l lg:border-line lg:pl-9">
                        <PipeStages />
                      </div>
                    </div>
                    <div className="mt-7 border-t border-line pt-6">{chips}</div>
                  </article>
                ) : (
                  <article className="card-pop flex h-full flex-col rounded-card border border-line bg-surface p-7">
                    <CardArt kind={card.art} />
                    <div className="mt-6">{title}</div>
                    <p className="mt-3 flex-1 text-[15.5px] text-mut">{card.body}</p>
                    <div className="mt-5">{chips}</div>
                  </article>
                )}
              </StaggerItem>
            )
          })}
        </Stagger>
      </Container>
    </Section>
  )
}

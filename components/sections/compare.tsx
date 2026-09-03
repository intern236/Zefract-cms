import { Check, X, Minus, Building2, Code2, Phone, Rocket, ShieldCheck, UserRound } from 'lucide-react'
import { Container, Section, SectionHead } from '@/components/ui/section'
import { ZefractMark } from '@/components/brand/zefract-mark'
import { Reveal, RevealTBody, RevealRow } from '@/components/motion/reveal'
import { COMPARE } from '@/content/home'
import { cn } from '@/lib/utils'

/**
 * Comparison table — the "Why Zefract" section.
 *
 * Built to the client's reference: a card with the Zefract column tinted the full
 * height of the table, an icon tile beside every capability, and the yes/no/maybe
 * marks as filled circles.
 *
 * It stays a real <table> with scope'd headers rather than a div grid. A matrix of
 * ticks is meaningless without the row/column association — a screen reader has to
 * be able to say which capability and which provider a given mark belongs to. That
 * is also why every mark carries a visually-hidden word: a bare glyph announces
 * nothing.
 */
const MARKS = {
  /* White on brand orange measures 3.32:1. That clears the 3:1 that SC 1.4.11 asks
     of a meaningful graphic, and it is not held to the 4.5:1 text threshold because
     the meaning is carried by the sr-only word beside it, not by the glyph. */
  yes: { Icon: Check, label: 'Yes', className: 'bg-brand text-white' },
  no: { Icon: X, label: 'No', className: 'bg-page text-mut-2' },
  mid: { Icon: Minus, label: 'Sometimes', className: 'bg-page text-mut' },
} as const

type MarkKey = keyof typeof MARKS

/** Row icon keys resolved to components — see the note on COMPARE.rows. */
const ROW_ICONS = {
  owner: UserRound,
  craft: Code2,
  speed: Rocket,
  security: ShieldCheck,
  support: Phone,
} as const

/** The Zefract column leads, so it is tinted the whole height of the table. */
const LEAD_TINT = 'bg-brand/6'

/** One mark, as the filled circle plus its word. */
function Mark({ mark, showWord }: { mark: MarkKey; showWord?: boolean }) {
  const { Icon, label, className } = MARKS[mark]
  return (
    <>
      {/* Smaller below md, where this renders inside <CompareStack> and every pixel is
          width the capability label does not get. The table at md and up is unchanged. */}
      <span
        className={cn(
          'inline-flex size-7 shrink-0 items-center justify-center rounded-full md:size-8',
          className
        )}
      >
        <Icon className="size-4 md:size-4.5" aria-hidden="true" />
        {/* On the narrow layout the word is visible beside the circle, so it must not
            also be announced from in here — that would read the answer twice. */}
        {showWord ? null : <span className="sr-only">{label}</span>}
      </span>
      {/* A fixed measure on the word, so "Sometimes" does not push its circle out of
          the column that "No" and "Yes" line up in. */}
      {showWord ? (
        <span className="w-[4.75rem] text-[14px] font-semibold text-head">{label}</span>
      ) : null}
    </>
  )
}

/**
 * The narrow-screen form of the comparison: ONE card, the three providers named once at
 * the top, and a row per capability with its three marks under those headings.
 *
 * WHY NOT A FOUR-COLUMN TABLE. It cannot be made legible at 320px — squeezing it puts
 * "Freelancers" on four lines, and leaving it wide hides two of the three providers off
 * the right edge of a scroller with nothing to say so. Measured at 320px, 490px of the
 * 760px table was out of view, which is the entire point of the section missing.
 *
 * WHY NOT A CARD PER CAPABILITY, which is what this was. Five cards, each repeating
 * "Zefract / Freelancers / Big agency" beside its own mark, meant the three provider
 * names appeared FIFTEEN times down the page and the section ran to twenty rows. It read
 * as clutter, and worse, it stopped being a comparison: with the providers re-listed
 * inside every card there was no column to run your eye down.
 *
 * Naming them once and aligning the marks beneath restores that. One header, five rows,
 * three labels instead of fifteen, and the Zefract column is a continuous tinted band
 * rather than a tint repeated at the top of each card.
 *
 * It is separate markup rather than CSS that re-displays the table's own elements:
 * setting `display: block` on table parts strips the table semantics out of the
 * accessibility tree in Chrome and Firefox, and restoring them takes a full set of
 * explicit ARIA roles. A list is honestly a list, and the one that is hidden is
 * `display: none`, so nothing is announced twice.
 *
 * The cost of naming the providers once is that a screen reader loses the pairing a
 * table's headers would give it — so each mark carries its provider in an `sr-only`
 * span, and announces "Freelancers: No" rather than a bare "No". The cell is `relative`
 * because `sr-only` is absolutely positioned, and without a positioned ancestor it
 * resolves against the page and can widen the document, which is the bug this very
 * section hit once already.
 */
function CompareStack() {
  return (
    <div className="md:hidden">
      {/* The providers as a legend above the cards, with the lead underlined rather than
          tinted. aria-hidden because every mark below carries its own provider name for
          assistive tech — announcing this row too would read the three names again with no
          cells attached to them.

          The active underline sits on -mb-px so it covers the container's own hairline
          instead of stacking a second line under it. */}
      <div aria-hidden="true" className="flex border-b border-line">
        {COMPARE.columns.map((column, i) => (
          <span
            key={column}
            className={cn(
              'flex-1 pb-3 text-center font-mono text-[11px] leading-tight tracking-[0.12em] uppercase',
              i === 0
                ? '-mb-px border-b-2 border-brand font-semibold text-brand-strong'
                : 'text-mut'
            )}
          >
            {column}
          </span>
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {COMPARE.rows.map((row) => {
          const RowIcon = ROW_ICONS[row.icon]
          return (
            <li
              key={row.label}
              className="card-pop flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 shadow-[0_14px_34px_-28px_rgba(8,20,34,0.3)]"
            >
              {/* Brand-tinted tile rather than the bordered white one the table uses: at this
                  size a border plus a shadow on a 36px square reads as clutter next to the
                  card's own border. */}
              <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-brand/10">
                <RowIcon className="size-4.5 text-brand-strong" aria-hidden="true" />
              </span>

              {/* min-w-0 so the label wraps instead of forcing the marks off the card. */}
              <span className="min-w-0 flex-1 text-[13.5px] leading-snug font-semibold text-head">
                {row.label}
              </span>

              {/* Marks in provider order, matching the legend. Icon only, no word: at 320px
                  there is not room for "Sometimes" three times over, and the circle plus glyph
                  is the convention a comparison grid already relies on. Hairlines between them
                  rather than around each, so the three read as one control. */}
              <span className="flex shrink-0 items-center">
                {row.marks.map((mark, i) => (
                  <span
                    key={COMPARE.columns[i]}
                    className={cn(
                      'relative flex w-8 justify-center',
                      /* A short centred rule rather than a full-height `border-l`. The cell is
                         only as tall as its 28px circle, so a border ran the whole height and
                         boxed each mark in; an 18px line reads as a separator between three
                         marks that belong together. Kept at roughly five eighths of the circle
                         so it stays a separator and does not become a box. */
                      i > 0 &&
                        'before:absolute before:top-1/2 before:left-0 before:h-4.5 before:w-px before:-translate-y-1/2 before:bg-line before:content-[""]'
                    )}
                  >
                    <span className="sr-only">{COMPARE.columns[i]}: </span>
                    <Mark mark={mark as MarkKey} />
                  </span>
                ))}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Compare() {
  return (
    <Section>
      <Container>
        <SectionHead eyebrow={COMPARE.eyebrow} heading={COMPARE.heading} />

        <Reveal className="mt-14">
          <CompareStack />
          {/* The table takes over at md, where there is room for four columns.
              overflow-x-auto stays as a floor for a user-enlarged font, but the
              min-width is set so it does not normally engage: 680px fits inside the
              720px container at exactly 768px viewport.

              `relative` is load-bearing, not decoration: every mark carries an sr-only
              span, and sr-only is position:absolute. Without a positioned ancestor here
              their containing block is the html element, so overflow-x:auto cannot clip
              them — those 1px spans sat at x=711 and dragged the whole page 321px wide
              at a 390px viewport. Making this element the containing block clips them
              with the scroller, where they belong. */}
          <div className="card-pop relative hidden overflow-x-auto rounded-card border border-line bg-surface shadow-[0_24px_60px_-40px_rgba(8,20,34,0.3)] md:block">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <caption className="sr-only">
                How Zefract compares with freelancers and large agencies
              </caption>
              <thead>
                <tr className="border-b border-line">
                  {/* An empty corner cell reads as an unlabelled header to a screen
                      reader, so it gets a visually-hidden name. */}
                  <th scope="col" className="w-[44%] px-5 py-6 lg:px-7">
                    <span className="sr-only">Capability</span>
                  </th>
                  {COMPARE.columns.map((col, i) => (
                    <th
                      key={col}
                      scope="col"
                      className={cn(
                        'px-3 pt-6 pb-5 text-center align-bottom lg:px-5',
                        i === 0 && LEAD_TINT
                      )}
                    >
                      <span className="flex flex-col items-center gap-2.5">
                        {/* Decorative: the column name is right underneath. */}
                        {i === 0 ? (
                          /* title={null} is how this component marks itself
                             decorative — the wordmark below already names it. */
                          <ZefractMark className="size-6 text-brand" title={null} />
                        ) : i === 1 ? (
                          <UserRound className="size-6 text-mut-2" aria-hidden="true" />
                        ) : (
                          <Building2 className="size-6 text-mut-2" aria-hidden="true" />
                        )}
                        <span
                          className={cn(
                            'font-mono text-[11px] font-medium tracking-[0.16em] uppercase',
                            i === 0 ? 'text-brand-strong' : 'text-mut'
                          )}
                        >
                          {col}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              {/* Rows fade in sequence, so the shell arrives first and then fills.
                  See <RevealTBody> for why this is a tbody swap and not a wrapper. */}
              <RevealTBody>
                {COMPARE.rows.map((row) => {
                  const RowIcon = ROW_ICONS[row.icon]
                  return (
                    <RevealRow key={row.label} className="border-b border-line last:border-0">
                      <th scope="row" className="px-5 py-6 lg:px-7">
                        <span className="flex items-center gap-3.5 lg:gap-4">
                          <span className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-line bg-surface shadow-[0_6px_16px_-10px_rgba(8,20,34,0.4)] lg:size-11 lg:rounded-[13px]">
                            <RowIcon className="size-5 text-brand-strong" aria-hidden="true" />
                          </span>
                          <span className="text-[15px] font-semibold text-head lg:text-[15.5px]">
                            {row.label}
                          </span>
                        </span>
                      </th>
                      {row.marks.map((mark, i) => (
                        <td
                          key={COMPARE.columns[i]}
                          className={cn('px-3 py-6 text-center lg:px-5', i === 0 && LEAD_TINT)}
                        >
                          <Mark mark={mark as MarkKey} />
                        </td>
                      ))}
                    </RevealRow>
                  )
                })}
              </RevealTBody>
            </table>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}

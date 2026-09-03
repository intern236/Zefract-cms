import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'
import { PillLink } from '@/components/ui/pill'
import type { CaseStudy } from '@/content/types'

/**
 * The written case study: the client's document, rendered in its own order.
 *
 * IT BRINGS NO LAYOUT OF ITS OWN ANY MORE, and that is the fix for a real bug
 * rather than a tidy-up. This used to open its own <Section><Container> and
 * centre itself in it with `mx-auto max-w-[68ch]`. Everything else on the page —
 * the facts row, the figures, "The problem", "What we did" — is flush to the
 * container's left edge, so a 605px column centred in 1,132px started roughly
 * 260px further right than the bullet list directly above it. The page had two
 * different left margins and the seam between them was visible.
 *
 * Now it renders its blocks and nothing else, and app/work/[slug]/page.tsx puts
 * it in the same column as the summary above it. The measure has not changed —
 * that column is still capped at 68ch, the same width the blog's posts use — it
 * is just no longer centred independently of the page it sits on.
 *
 * A SWITCH OVER BLOCK KINDS, not a fixed sequence of named sections. The type is
 * an ordered union precisely so a future study can put its email work before its
 * technical work, or carry two callouts, without this component or the content
 * schema changing — see the note on CaseStudyBlock.
 *
 * RENDERS NOTHING WHEN THERE IS NO DOCUMENT. A study written as a summary keeps
 * exactly the page it had before, rather than gaining an empty heading.
 */
export function CaseNarrative({ study }: { study: CaseStudy }) {
  const hasNarrative = study.narrative && study.narrative.length > 0
  if (!hasNarrative && !study.intro?.length && !study.closing) return null

  return (
    <>
      {study.intro?.length ? (
        <Reveal>
          {study.intro.map((paragraph) => (
            /* The lead-in, a step larger than the body that follows it — the
               document opens with it before any heading, and setting it at
               body size would lose that it is the standfirst. */
            <p
              key={paragraph}
              className="mt-5 text-[18px] leading-relaxed text-mut first:mt-0"
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      ) : null}

      {study.narrative?.map((block) =>
        block.kind === 'callout' ? (
          <Reveal key={block.label} className="mt-12">
            {/* The conclusion the document sets apart from its own prose. A
                brand-tinted panel with a rule down its left edge, which is the
                quietest way to say "this sentence is the point" without
                borrowing the blockquote treatment the client's testimonial
                already owns further down the page. */}
            <div className="rounded-card border border-brand/25 border-l-[3px] border-l-brand bg-brand/6 p-7">
              <p className="font-mono text-[11px] tracking-[0.2em] text-brand-strong uppercase">
                {block.label}
              </p>
              <p className="mt-3 text-[19px] leading-relaxed font-medium text-balance text-head">
                {block.body}
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal key={block.heading} className="mt-14">
            <h2 className="text-[26px] leading-snug font-extrabold tracking-[-0.025em] text-balance text-head">
              {block.heading}
            </h2>
            {block.body.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-[16.5px] leading-relaxed text-mut">
                {paragraph}
              </p>
            ))}

            {block.points?.length ? (
              <div className="mt-9 space-y-8">
                {block.points.map((point, index) => (
                  <div key={point.heading}>
                    {/* Numbered, because the document says "three things came
                        out of it" and then lists them — a reader should be able
                        to see which one they are on. The number is decorative
                        to a screen reader, which gets the ordinal from the
                        heading order anyway. */}
                    <h3 className="flex gap-3 text-[19px] leading-snug font-bold text-head">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[13px] font-medium text-brand-strong tabular-nums"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{point.heading}</span>
                    </h3>
                    {point.body.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="mt-3 pl-8 text-[16.5px] leading-relaxed text-mut"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}

            {block.table ? (
              /* A REAL <table>, not a grid of divs. These are rows of related
                 values with a header describing each column, which is what a
                 table is for — and it is what lets a screen reader announce
                 "Phase: Schema markup" instead of reading two unrelated
                 fragments.

                 `overflow-x-auto` on the wrapper rather than shrinking the
                 type: the second column is a full sentence, and there is no
                 size at which two prose columns fit a 320px screen. Scrolling
                 one element beats a page that scrolls sideways. */
              <div className="mt-8 -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[34rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line">
                      {block.table.columns.map((column) => (
                        <th
                          key={column}
                          scope="col"
                          className="pb-3 font-mono text-[11px] font-medium tracking-[0.16em] text-mut-2 uppercase"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.table.rows.map(([phase, covered]) => (
                      <tr key={phase} className="border-b border-line align-top last:border-0">
                        <th
                          scope="row"
                          className="w-[12rem] py-5 pr-6 text-[15.5px] font-bold text-head"
                        >
                          {phase}
                        </th>
                        <td className="py-5 text-[15.5px] leading-relaxed text-mut">
                          {covered}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {block.outro ? (
              <p className="mt-6 text-[16.5px] leading-relaxed text-mut">{block.outro}</p>
            ) : null}
          </Reveal>
        )
      )}

      {study.closing ? (
        <Reveal className="mt-16">
          {/* The document's own ask, which is more specific than the site-wide
              CTA band below it — "book a two-week diagnostic" rather than
              "start a project". Both stay: this one converts the reader of
              THIS story, the band catches everyone else. Same arrangement as
              ServiceStory.closingCta. */}
          <div className="rounded-card border border-line bg-surface p-8">
            <h2 className="text-[24px] leading-snug font-extrabold tracking-[-0.025em] text-head">
              {study.closing.heading}
            </h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-mut">{study.closing.body}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <PillLink href={study.closing.ctaHref} variant="ink" size="sm">
                {study.closing.ctaLabel}
              </PillLink>
              {study.closing.note ? (
                <p className="text-[13.5px] text-mut-2">{study.closing.note}</p>
              ) : null}
            </div>
          </div>
        </Reveal>
      ) : null}

      <Reveal className="mt-12">
        <p className="border-t border-line pt-6 text-[13px] text-mut-2">
          Published with the client&apos;s review and permission.{' '}
          <Link href="/work" className="font-semibold text-head underline-offset-4">
            More work
          </Link>
        </p>
      </Reveal>
    </>
  )
}

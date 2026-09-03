import Link from 'next/link'
import { Fragment } from 'react'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { isTodo, todoLabel } from '@/lib/todo'
import type { LegalBlock, LegalDocument } from '@/content/types'

/**
 * The shell both legal pages render through.
 *
 * ONE COMPONENT, TWO DOCUMENTS, AND IT USED TO BE NEITHER. What stood here was a
 * dashed "awaiting final copy" panel wrapping four invented headings, because the
 * brief assigned the wording to the client and inventing legal text is worse than
 * publishing none. The client has now supplied both documents in full, so this is
 * the renderer for them: it takes a LegalDocument (content/privacy.ts,
 * content/terms.ts) and knows nothing about which one it is holding.
 *
 * WHY A SIDEBAR OF CONTENTS RATHER THAN A LONG SCROLL. The terms run to
 * twenty-eight numbered clauses and cross-reference each other constantly —
 * "subject to Clause 19", "the cap in Clause 20", "handover under Clause 7". A
 * reader following one of those references needs to get there and get back. The
 * contents list is sticky from lg up so it never scrolls away, collapses to a
 * <details> below that, and every cross-reference in the prose is turned into a
 * real link by `withRefs` below.
 *
 * UNRESOLVED VALUES ARE NEVER FAKED, and the two block kinds that carry them
 * handle it differently on purpose — see `LegalValue` and the `defs` branch.
 */

/** A value that is still a TODO() and therefore must not be printed as fact. */
function pending(value: string): boolean {
  return isTodo(value)
}

/**
 * A value the client has not supplied.
 *
 * In development it is a visible stub, matching <StubValue>. In production it is
 * an em dash, which reads as "not stated" — the honest rendering, and the only one
 * that keeps a table row intact. Dropping the row instead would be worse here: on
 * the sub-processor table, six of eight rows are unfilled, and hiding them would
 * publish a list claiming Zefract uses three services when it uses eleven.
 */
function LegalValue({ value }: { value: string }) {
  if (!isTodo(value)) return <>{value}</>
  if (process.env.NODE_ENV === 'production') {
    /* The dash is decorative; "Not stated" is the content. A bare aria-hidden dash
       leaves a screen reader announcing an empty cell, which reads as a rendering
       fault rather than as a value the document does not give. */
    return (
      <>
        <span aria-hidden="true" className="text-mut-2">
          &mdash;
        </span>
        <span className="sr-only">Not stated</span>
      </>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded border border-dashed border-brand/50 bg-brand/8 px-2 py-0.5 font-mono text-[11px] tracking-wide text-brand-strong"
      title="Placeholder, awaiting content from the client"
    >
      needs {todoLabel(value)}
    </span>
  )
}

/**
 * Turns every "§12" and "Clause 19" in a run of prose into a link to that clause.
 *
 * THE DOCUMENTS ALREADY CROSS-REFERENCE THEMSELVES; this only makes the references
 * work. Both were written as Word files, where a reference is something you scroll
 * to find — which on a twenty-eight-clause page means losing your place. The
 * clause anchors are `#c-07`, zero-padded to match LegalClause.n, so "Clause 7"
 * and "§7" both resolve.
 *
 * Deliberately does not match "Clauses 10, 11, 14" — the plural form introduces a
 * LIST, and linking only its first number would silently suggest the others are
 * not clauses. A capturing split leaves the delimiters in place, so anything the
 * pattern misses is returned unchanged rather than dropped.
 */
const REF = /(§\s?\d{1,2}|Clause \d{1,2})(?![\d,])/g

function withRefs(text: string) {
  return text.split(REF).map((part, i) => {
    const match = /^(?:§\s?|Clause )(\d{1,2})$/.exec(part)
    if (!match) return <Fragment key={i}>{part}</Fragment>
    return (
      <a
        key={i}
        href={`#c-${match[1].padStart(2, '0')}`}
        className="font-medium text-head underline decoration-brand/45 underline-offset-2 hover:decoration-brand"
      >
        {part}
      </a>
    )
  })
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case 'p':
      return (
        <p className="mt-4 text-[16.5px] leading-relaxed text-mut">
          {block.lead ? <strong className="font-bold text-head">{block.lead} </strong> : null}
          {withRefs(block.text)}
        </p>
      )

    case 'sub':
      return (
        <h3 className="mt-9 text-[18px] leading-snug font-bold tracking-[-0.01em] text-head">
          {block.heading}
        </h3>
      )

    case 'list':
      return (
        <ul className="mt-5 space-y-3">
          {block.items.map((item) => {
            const key = typeof item === 'string' ? item : item.lead
            return (
              <li
                key={key}
                className="relative pl-6 text-[16.5px] leading-relaxed text-mut before:absolute before:top-[0.62em] before:left-0 before:size-1.5 before:rounded-full before:bg-brand/70"
              >
                {typeof item === 'string' ? (
                  withRefs(item)
                ) : (
                  <>
                    <strong className="font-bold text-head">{item.lead} </strong>
                    {withRefs(item.text)}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )

    case 'steps':
      return (
        /* An <ol> with its own numbers rather than list-decimal, so the ordinal can
           be monospaced and tinted like every other number on the site. The marker
           is aria-hidden because a screen reader already announces list position —
           reading "one, one, Service providers" is the bug this avoids. */
        <ol className="mt-5 space-y-3">
          {block.items.map((item, i) => (
            <li key={item} className="flex gap-3 text-[16.5px] leading-relaxed text-mut">
              <span
                aria-hidden="true"
                className="mt-[0.15em] shrink-0 font-mono text-[13px] font-medium text-brand-strong tabular-nums"
              >
                {i + 1}.
              </span>
              <span>{withRefs(item)}</span>
            </li>
          ))}
        </ol>
      )

    case 'defs':
      return (
        /* A row whose value is unresolved is dropped ENTIRELY in production, which
           is the opposite of the table's behaviour and deliberate. These are
           label/value pairs of company facts: "Grievance Officer —" states that
           there is no grievance officer, which is both wrong and, under the DPDP
           Act, an admission. One fewer row says nothing. */
        <dl className="mt-6 divide-y divide-line rounded-card border border-line bg-surface">
          {block.items
            .filter((item) => !(pending(item.value) && process.env.NODE_ENV === 'production'))
            .map((item) => (
              <div
                key={item.label}
                className="grid gap-1 px-5 py-3.5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-4"
              >
                <dt className="font-mono text-[11px] tracking-[0.14em] text-mut-2 uppercase sm:pt-1">
                  {item.label}
                </dt>
                <dd className="text-[15.5px] leading-relaxed break-words text-head">
                  {item.href && !pending(item.value) ? (
                    <a
                      href={item.href}
                      className="underline decoration-brand/45 underline-offset-2 hover:decoration-brand"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <LegalValue value={item.value} />
                  )}
                </dd>
              </div>
            ))}
        </dl>
      )

    case 'table':
      return (
        /* Breaks the measure and scrolls inside itself. Four columns of prose have
           no size at which they fit a phone, and the alternative — shrinking the
           type until they do — makes the page unreadable to fix a table. */
        <div className="mt-7 -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                {block.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="pb-3 font-mono text-[11px] font-medium tracking-[0.14em] text-mut-2 uppercase"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-line align-top last:border-0">
                  {/* KEYED BY COLUMN INDEX, NOT CELL CONTENT, and that is a fix rather
                      than laziness. Keying on the cell put the raw value into the
                      React key, and a TODO() value is the string "TODO::hosting
                      provider" — which React then serialised into the flight payload
                      embedded in the page. Nothing was visible, but the placeholder
                      markers were shipping inside the HTML of a published legal
                      document. Columns never reorder, so the index is stable. */}
                  {row.map((cell, i) =>
                    i === 0 ? (
                      /* The first cell is the row's subject, so it is a <th
                         scope="row"> — that is what lets a screen reader announce
                         "Analytics: consent needed, yes" instead of reading a
                         detached "yes". */
                      <th
                        key={i}
                        scope="row"
                        className="py-4 pr-6 text-[15px] leading-relaxed font-bold text-head"
                      >
                        <LegalValue value={cell} />
                      </th>
                    ) : (
                      <td
                        key={i}
                        className="py-4 pr-6 text-[15px] leading-relaxed text-mut last:pr-0"
                      >
                        <LegalValue value={cell} />
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'callout':
      return (
        <div className="mt-8 rounded-card border border-brand/25 border-l-[3px] border-l-brand bg-brand/6 p-6">
          <p className="font-mono text-[11px] tracking-[0.2em] text-brand-strong uppercase">
            {block.label}
          </p>
          <p className="mt-3 text-[17px] leading-relaxed font-medium text-head">
            {withRefs(block.text)}
          </p>
        </div>
      )
  }
}

function Contents({ doc }: { doc: LegalDocument }) {
  return (
    <ol className="space-y-2">
      {doc.clauses.map((clause) => (
        <li key={clause.n}>
          <a
            href={`#c-${clause.n}`}
            className="flex gap-2.5 text-[13.5px] leading-snug text-mut hover:text-head"
          >
            <span className="shrink-0 font-mono text-[12px] text-mut-2 tabular-nums">
              {clause.n}
            </span>
            <span>{clause.heading}</span>
          </a>
        </li>
      ))}
    </ol>
  )
}

export function LegalPage({
  doc,
  trail,
}: {
  doc: LegalDocument
  trail: { name: string; href: string }[]
}) {
  const meta = doc.meta.filter(
    (row) => !(pending(row.value) && process.env.NODE_ENV === 'production')
  )

  return (
    <>
      <PageHero eyebrow={doc.eyebrow} heading={doc.title} sub={doc.standfirst} trail={trail} />

      <Section spacing="tight" className="pb-24">
        <Container>
          {/* The masthead: which version of the document this is and who published
              it. First thing after the title because it is the first thing anyone
              checking a policy wants — a policy with no date is not verifiable. */}
          {meta.length > 0 ? (
            <dl className="grid gap-x-8 gap-y-5 rounded-card border border-line bg-surface p-6 sm:grid-cols-2 lg:grid-cols-3">
              {meta.map((row) => (
                <div key={row.label}>
                  <dt className="font-mono text-[10.5px] tracking-[0.16em] text-mut-2 uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-1.5 text-[14.5px] leading-snug text-head">
                    <LegalValue value={row.value} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-14">
            {/* Sticky from lg, where there is room beside the measure for it. top-28
                clears the fixed header pill, which ends at 82px. */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="font-mono text-[10.5px] tracking-[0.18em] text-mut-2 uppercase">
                  Contents
                </p>
                <nav aria-label="Contents" className="mt-4">
                  <Contents doc={doc} />
                </nav>
              </div>
            </aside>

            <div className="min-w-0">
              {/* Below lg the same list is a disclosure. Twenty-eight clause titles
                  ahead of the first paragraph would be a screen and a half of
                  navigation before any of the document — but leaving a long
                  document with no contents at all on the size most people read it
                  on is worse. */}
              <details className="group rounded-card border border-line bg-surface lg:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-mono text-[11px] tracking-[0.16em] text-head uppercase">
                  Contents
                  <span
                    aria-hidden="true"
                    className="text-[16px] text-mut-2 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <nav aria-label="Contents" className="border-t border-line px-5 py-4">
                  <Contents doc={doc} />
                </nav>
              </details>

              <div className="mt-8 max-w-[70ch] lg:mt-0">
                {doc.lede.map((paragraph) => (
                  <p key={paragraph} className="mt-5 text-[17.5px] leading-relaxed text-mut first:mt-0">
                    {paragraph}
                  </p>
                ))}

                {doc.summary ? (
                  <>
                    <div className="mt-10 rounded-card border border-brand/25 border-l-[3px] border-l-brand bg-brand/6 p-6">
                      <p className="font-mono text-[11px] tracking-[0.2em] text-brand-strong uppercase">
                        {doc.summary.label}
                      </p>
                      <p className="mt-3 text-[17px] leading-relaxed font-medium text-head">
                        {doc.summary.text}
                      </p>
                    </div>
                    <p className="mt-5 text-[16.5px] leading-relaxed text-mut">
                      {doc.summary.note}
                    </p>
                  </>
                ) : null}

                {doc.clauses.map((clause) => (
                  /* scroll-mt-28 for the same 82px header the sidebar clears —
                     without it, following a cross-reference lands with the clause
                     heading hidden behind the nav. */
                  <section
                    key={clause.n}
                    id={`c-${clause.n}`}
                    className="mt-16 scroll-mt-28 border-t border-line pt-10"
                  >
                    <p className="font-mono text-[11px] tracking-[0.18em] text-brand-strong uppercase">
                      {doc.unit} {clause.n}
                    </p>
                    <h2 className="mt-3 text-[26px] leading-snug font-extrabold tracking-[-0.025em] text-balance text-head">
                      {clause.heading}
                    </h2>

                    {/* The client's own "in plain English" gloss, set apart so it
                        reads as the summary it is and cannot be mistaken for the
                        operative wording underneath it. */}
                    {clause.plain ? (
                      <div className="mt-5 rounded-card border border-line bg-surface p-5">
                        <p className="font-mono text-[10.5px] tracking-[0.18em] text-mut-2 uppercase">
                          In plain English
                        </p>
                        <p className="mt-2 text-[15.5px] leading-relaxed text-head">
                          {clause.plain}
                        </p>
                      </div>
                    ) : null}

                    {clause.blocks.map((block, i) => (
                      <Block key={i} block={block} />
                    ))}
                  </section>
                ))}

                <div className="mt-16 border-t border-line pt-6">
                  <p className="text-[13px] text-mut-2">
                    Related:{' '}
                    {doc.related.map((link, i) => (
                      <Fragment key={link.href}>
                        {i > 0 ? <span aria-hidden="true"> · </span> : null}
                        {link.href.startsWith('/') ? (
                          <Link
                            href={link.href}
                            className="font-semibold text-head underline-offset-4 hover:underline"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            className="font-semibold text-head underline-offset-4 hover:underline"
                          >
                            {link.label}
                          </a>
                        )}
                      </Fragment>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}

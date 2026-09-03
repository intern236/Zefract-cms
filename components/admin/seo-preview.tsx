'use client'

import { useId, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { siteHost } from '@/lib/url'
import { cn } from '@/lib/utils'

/**
 * How this post will look in a search result, drawn from the same three fields
 * the page actually publishes: title, slug, description.
 *
 * WHY IT EARNS ITS PLACE. Those three fields are written in the rail as bare
 * boxes, where "155 characters" is an abstraction. Here it is the thing itself:
 * an over-long title visibly ends in an ellipsis, and the person writing it can
 * see the cut rather than being told about it afterwards by Search Console.
 * lib/seo.ts already clamps generated copy for the rest of the site for exactly
 * this reason — this is that reasoning made visible for copy a human types.
 *
 * The numbers are the same ones lib/seo.ts uses: ~60 characters of title and
 * ~155 of description are what a result actually shows. They are approximate by
 * nature — Google measures pixels, not characters — so the counters warn rather
 * than block, and nothing here prevents a save.
 *
 * COLLAPSED BY DEFAULT: it is a check you run before publishing, not something
 * to write against, and open by default it would push the editor down the page.
 */

const TITLE_LIMIT = 60
const DESCRIPTION_LIMIT = 155

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text
  const cut = text.slice(0, limit)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

export function SeoPreview({
  title,
  slug,
  description,
}: {
  title: string
  slug: string
  description: string
}) {
  const [open, setOpen] = useState(false)
  const bodyId = useId()

  const host = siteHost()
  /* Placeholders, not empty space: an empty preview teaches nothing, and these
     read unmistakably as stand-ins rather than as content. */
  const shownTitle = title.trim() || 'Your post title'
  const shownDescription =
    description.trim() || 'Your description appears here, under the title and the link.'

  return (
    <section className="rounded-card border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-brand/10 text-brand-strong">
          <Search className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold tracking-[-0.01em] text-head">
            SEO Preview
          </span>
          <span className="block truncate text-[13px] text-mut">
            See how your post will appear in search results
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-mut-2 transition-transform duration-200 motion-reduce:transition-none',
            open && 'rotate-180'
          )}
        />
      </button>

      {open ? (
        <div id={bodyId} className="border-t border-line px-5 py-5">
          {/* The result itself. Navy for the title link is the site's own
              --color-navy rather than a borrowed search-engine blue: it reads
              as a result without importing a colour the palette does not own. */}
          <div className="rounded-tile border border-line bg-page px-4 py-3.5">
            <p className="truncate font-mono text-[12px] text-mut">
              {host} <span aria-hidden="true">›</span> blog{' '}
              <span aria-hidden="true">›</span> {slug || '…'}
            </p>
            <p className="mt-1.5 text-[17px] leading-snug font-medium text-navy">
              {truncate(shownTitle, TITLE_LIMIT)}
            </p>
            <p className="mt-1 text-[13.5px] leading-[1.5] text-mut">
              {truncate(shownDescription, DESCRIPTION_LIMIT)}
            </p>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <Counter label="Title" length={title.trim().length} limit={TITLE_LIMIT} />
            <Counter
              label="Description"
              length={description.trim().length}
              limit={DESCRIPTION_LIMIT}
            />
          </dl>
        </div>
      ) : null}
    </section>
  )
}

/** One length readout. Over the limit is brand-strong, not red: the copy still
 *  publishes perfectly well, it is only the tail that a result will not show. */
function Counter({ label, length, limit }: { label: string; length: number; limit: number }) {
  const over = length > limit
  return (
    <div className="rounded-[10px] border border-line px-3 py-2">
      <dt className="font-mono text-[10.5px] tracking-[0.14em] text-mut-2 uppercase">{label}</dt>
      <dd
        className={cn(
          'mt-1 font-mono text-[12.5px] tabular-nums',
          over ? 'text-brand-strong' : 'text-head'
        )}
      >
        {length}/{limit}
        {over ? <span className="ml-1.5 font-sans text-[11.5px]">will be cut</span> : null}
      </dd>
    </div>
  )
}

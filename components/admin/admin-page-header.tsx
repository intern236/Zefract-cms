import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { StatusPill } from './status-pill'

/**
 * The header block shared by the new-post and edit-post pages: the way back to
 * the list, the page's name at the site's heading scale, the post's status
 * beside it, a line saying what the page is for, and — for a published post —
 * the shortest route to the live page. One component so the two pages cannot
 * end up aligned differently.
 */
export function AdminPageHeader({
  heading,
  subtitle,
  status,
  viewHref,
}: {
  heading: string
  /** One line under the heading, saying what this page does. */
  subtitle?: string
  status?: 'draft' | 'published'
  /** The live /blog URL, shown only when there is a live page to view. */
  viewHref?: string
}) {
  return (
    <div>
      <Link
        href="/admin/blog"
        className="inline-flex min-h-6 items-center gap-1.5 text-[13.5px] font-semibold text-mut transition-colors hover:text-head"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All posts
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[clamp(1.75rem,2.8vw,2.125rem)] font-extrabold tracking-[-0.03em] text-head">
              {heading}
            </h1>
            {status ? <StatusPill status={status} /> : null}
          </div>
          {subtitle ? <p className="mt-1.5 text-[14.5px] text-mut">{subtitle}</p> : null}
        </div>

        {viewHref ? (
          <Link
            href={viewHref}
            className="inline-flex min-h-6 items-center gap-1.5 text-[13.5px] font-semibold text-head transition-colors hover:text-brand-strong"
          >
            View live page
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </div>
  )
}

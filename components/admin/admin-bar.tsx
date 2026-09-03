import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { ADMIN_BAR_TOP } from '@/components/admin/admin-shell'
import { cn } from '@/lib/utils'

/**
 * The admin's own bar: where you are on the left, what you can do on the right.
 *
 * STICKS DIRECTLY BENEATH THE SITE HEADER rather than replacing it — the site's
 * navigation stays where it always is, and this sits under it carrying the
 * things only the admin needs: the post's state, whether it is saved, and how
 * to publish. The offset comes from ADMIN_BAR_TOP so it cannot drift from the
 * padding that positions it; see the stacking note in admin-shell.tsx.
 *
 * z-[72] puts it over the mobile header scrim (70) and under the header pill
 * itself (80), so nothing paints across it and it never covers the site nav.
 *
 * 56px tall, deliberately shallow: it is the second fixed thing on the page, so
 * every pixel it does not take is a pixel of writing surface.
 *
 * `back` renders the ← link; without it the bar just states where you are.
 * `actions` is a slot rather than a fixed set, because the list and the editor
 * genuinely need different controls in the same place.
 */
export function AdminBar({
  title,
  back,
  badge,
  actions,
  className,
}: {
  title: string
  /** Optional up-link: `{ href, label }`, rendered as "← label". */
  back?: { href: string; label: string }
  /** Sits beside the title — the post's status, on the editor. */
  badge?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        'sticky z-[72] rounded-card border border-line bg-surface/95 backdrop-blur-sm',
        ADMIN_BAR_TOP,
        className
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4 md:px-5">
        {back ? (
          <>
            <Link
              href={back.href}
              className="inline-flex shrink-0 items-center gap-1.5 text-[13.5px] font-semibold text-mut transition-colors hover:text-head"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {back.label}
            </Link>
            <span aria-hidden="true" className="hidden h-5 w-px shrink-0 bg-line sm:block" />
          </>
        ) : null}

        <h1 className="min-w-0 truncate text-[18px] font-extrabold tracking-[-0.02em] text-head">
          {title}
        </h1>
        {badge}

        {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}

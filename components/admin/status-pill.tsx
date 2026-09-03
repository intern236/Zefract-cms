import { cn } from '@/lib/utils'

/**
 * The draft/published marker, defined once so the post list, the editor header
 * and anywhere else that states a post's status cannot drift apart.
 *
 * A FILLED TINT RATHER THAN AN OUTLINE, because these sit beside headings and
 * inside busy rows where one more hairline reads as clutter. Draft takes the
 * brand tint (it is the working state, and orange is this site's "attention"
 * colour); published takes emerald, the same green the deploy-log tile already
 * uses for a completed step. Neither is decoration: they are the two states a
 * post can be in, and they should not be mistakable for each other at a glance.
 */
export function StatusPill({
  status,
  className,
}: {
  status: 'draft' | 'published'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase',
        status === 'published'
          ? 'bg-emerald-600/10 text-emerald-700'
          : 'bg-brand/10 text-brand-strong',
        className
      )}
    >
      {status}
    </span>
  )
}

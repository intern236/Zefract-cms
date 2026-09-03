'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The values already used on other posts, offered as one-click chips.
 *
 * WHY IT EXISTS. Categories and tags are only worth anything when they are
 * spelled the same way twice. Typed from memory they will not be: "AI" and
 * "Ai", "web dev" and "Web Development" split one shelf into two, and nobody
 * notices until the archive is a mess. Showing what already exists makes
 * reusing it the path of least resistance, which is the only reliable way to
 * keep a taxonomy consistent.
 *
 * DERIVED FROM THE POSTS, not from a list somebody maintains — see
 * getUsedCategories and getUsedTags in lib/blog.ts. So a value appears here the
 * moment it is saved anywhere, and disappears when the last post using it stops
 * using it. There is nothing to prune.
 *
 * Values already chosen are dropped rather than shown disabled: a row of dead
 * chips is noise, and the selected ones are visible directly above anyway.
 */
export function SuggestionChips({
  label,
  values,
  selected,
  onPick,
  className,
}: {
  label: string
  values: string[]
  /** Already chosen, and therefore not offered. Compared case-insensitively. */
  selected: string[]
  onPick: (value: string) => void
  className?: string
}) {
  const taken = new Set(selected.map((value) => value.toLowerCase()))
  const available = values.filter((value) => !taken.has(value.toLowerCase()))
  if (available.length === 0) return null

  return (
    <div className={cn('mt-3', className)}>
      <p className="text-[12.5px] font-semibold text-mut">{label}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {available.map((value) => (
          <li key={value}>
            <button
              type="button"
              onClick={() => onPick(value)}
              className="inline-flex items-center gap-1 rounded-[9px] border border-dashed border-line bg-surface py-1.5 pr-3 pl-2 text-[13px] font-medium text-mut transition-colors hover:border-brand/50 hover:text-brand-strong"
            >
              <Plus className="size-3 shrink-0" aria-hidden="true" />
              {value}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

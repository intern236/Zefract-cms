'use client'

import { useMemo, useState } from 'react'
import { Check, Plus, Search, X } from 'lucide-react'
import { FIELD_BASE } from '@/components/forms/field'
import { cn } from '@/lib/utils'

/**
 * The post's category: pick one already in use, or create a new one.
 *
 * A LIST, NOT A TEXT BOX. A free field means the second post about the same
 * subject gets a subtly different spelling and quietly starts a second
 * category — "AI", "Ai" and "A.I." within a month, and nobody notices until the
 * archive is a mess. Choosing from what exists makes reuse the default and
 * typing the exception, which is the only arrangement that keeps a taxonomy
 * consistent.
 *
 * CREATING ONE IS STILL ONE CLICK, because a fixed list would mean the first
 * post on a new subject cannot be filed at all. "Create new category" opens a
 * field; the new value is selected immediately and joins the list for every
 * post after this one, because the list is derived from what posts actually
 * use — see getUsedCategories in lib/blog.ts.
 *
 * RADIO, NOT CHECKBOX, and the difference is the point: a post has one
 * category. Something that can hold several is a tag.
 *
 * The search box appears only once the list is long enough to need it —
 * a filter over four items is furniture.
 */

const SEARCH_FROM = 6

export function CategoryField({
  value,
  used,
  error,
  onChange,
}: {
  value: string
  /** Categories already on other posts — see getUsedCategories in lib/blog.ts. */
  used: string[]
  error?: string
  onChange: (value: string) => void
}) {
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState('')

  /* The current value belongs in the list even when no other post uses it yet —
     a category invented on this post must still show as chosen. */
  const options = useMemo(() => {
    const all = [...used]
    if (value && !all.some((item) => item.toLowerCase() === value.toLowerCase())) all.push(value)
    return all.sort((a, b) => a.localeCompare(b))
  }, [used, value])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((item) => item.toLowerCase().includes(q)) : options
  }, [options, query])

  const create = () => {
    const next = draft.trim()
    if (!next) return
    onChange(next)
    setDraft('')
    setCreating(false)
    setQuery('')
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-head">Category</p>
        <span className="font-mono text-[12px] tracking-[0.12em] text-mut-2 uppercase sm:text-[10px]">
          Optional
        </span>
      </div>

      {options.length >= SEARCH_FROM ? (
        <div className="relative mt-2">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-mut-2"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search categories…"
            aria-label="Search categories"
            className={cn(FIELD_BASE, 'h-10 pr-3 pl-9 text-[13.5px]')}
          />
        </div>
      ) : null}

      {options.length > 0 ? (
        <ul
          role="radiogroup"
          aria-label="Category"
          className="mt-2 max-h-56 overflow-y-auto rounded-tile border border-line bg-page p-1.5"
        >
          {visible.length === 0 ? (
            <li className="px-2.5 py-3 text-[13px] text-mut-2">
              Nothing matches “{query.trim()}”.
            </li>
          ) : (
            visible.map((option) => {
              const selected = option.toLowerCase() === value.toLowerCase()
              return (
                <li key={option}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    /* Clicking the chosen one again clears it — the field is
                       optional, and a radio group with no escape traps a value
                       the writer may have picked by accident. */
                    onClick={() => onChange(selected ? '' : option)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13.5px] transition-colors',
                      selected
                        ? 'bg-brand/8 font-semibold text-brand-strong'
                        : 'text-head hover:bg-surface'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid size-4 shrink-0 place-items-center rounded-[5px] border transition-colors',
                        selected
                          ? 'border-brand bg-brand text-white'
                          : 'border-line-strong/60 bg-surface'
                      )}
                    >
                      {selected ? <Check className="size-2.5" /> : null}
                    </span>
                    <span className="min-w-0 truncate">{option}</span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      ) : null}

      {creating ? (
        <div className="mt-2 flex gap-2">
          <input
            value={draft}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                create()
              }
              if (event.key === 'Escape') {
                setCreating(false)
                setDraft('')
              }
            }}
            placeholder="New category name"
            aria-label="New category name"
            className={cn(FIELD_BASE, 'h-10 flex-1 px-3 text-[13.5px]')}
          />
          <button
            type="button"
            onClick={create}
            disabled={draft.trim() === ''}
            className="h-10 shrink-0 rounded-[12px] border border-line bg-surface px-4 text-[13px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong disabled:opacity-45"
          >
            Add
          </button>
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => {
              setCreating(false)
              setDraft('')
            }}
            className="grid size-10 shrink-0 place-items-center rounded-[12px] text-mut-2 transition-colors hover:bg-page hover:text-head"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-strong transition-colors hover:text-brand"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Create new category
        </button>
      )}

      <p className="mt-2.5 text-[12.5px] text-mut-2">
        {value ? (
          <>
            Filed under <span className="font-semibold text-head">{value}</span>. One per post
            — a post that needs three needs tags instead.
          </>
        ) : (
          'One per post — the shelf it sits on. A post that needs three categories needs tags instead.'
        )}
      </p>
      {error ? <p className="mt-1.5 text-[13px] text-red-600">{error}</p> : null}
    </div>
  )
}

'use client'

import { useId, useState } from 'react'
import { X } from 'lucide-react'
import { FIELD_BASE } from '@/components/forms/field'
import { SuggestionChips } from '@/components/admin/suggestion-chips'
import { cn } from '@/lib/utils'

/**
 * Tags as chips: type one, press Enter or hit Add, and it joins the list below.
 *
 * THE ADD BUTTON IS NOT DECORATION. Enter is the fast path and the one most
 * people use, but it is invisible — nothing on screen says a keystroke is what
 * commits the entry. A button says it, and it is also the only route for anyone
 * driving this by pointer alone.
 *
 * ENTER OR COMMA COMMITS, and a comma-containing paste is split on the way in,
 * so pasting "seo, growth, ai" produces three chips rather than one bad one.
 * Backspace on an empty box removes the last chip — the convention every chip
 * input has taught people, and the reason the box needs no delete key of its
 * own.
 *
 * Duplicates are dropped case-insensitively: "SEO" and "seo" are one tag, and
 * whichever spelling arrived first is the one kept.
 */
export function TagInput({
  tags,
  onChange,
  max,
  error,
  used = [],
}: {
  tags: string[]
  onChange: (next: string[]) => void
  max: number
  error?: string
  /** Tags already on other posts — see getUsedTags in lib/blog.ts. */
  used?: string[]
}) {
  const [draft, setDraft] = useState('')
  const listId = useId()
  const full = tags.length >= max

  const commit = (raw: string) => {
    const incoming = raw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    if (incoming.length === 0) return

    const merged = [...tags]
    for (const tag of incoming) {
      if (merged.length >= max) break
      if (!merged.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
        merged.push(tag)
      }
    }
    onChange(merged)
    setDraft('')
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      /* Enter would otherwise submit whatever form encloses this, and a comma
         would land in the box as a character rather than a separator. */
      event.preventDefault()
      commit(draft)
      return
    }
    if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          id="tags"
          name="tags"
          value={draft}
          disabled={full}
          list={listId}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          /* Commits whatever is half-typed when focus leaves, so a tag is never
             silently lost by clicking Publish instead of pressing Enter. */
          onBlur={() => commit(draft)}
          placeholder={full ? `${max} tags is the limit` : 'Add tags…'}
          aria-label="Add a tag"
          aria-invalid={error ? true : undefined}
          aria-describedby="tags-hint"
          className={cn(
            FIELD_BASE,
            'h-11 flex-1 px-4 text-[14px] disabled:cursor-not-allowed disabled:opacity-60'
          )}
        />
        <button
          type="button"
          onClick={() => commit(draft)}
          disabled={full || draft.trim() === ''}
          className="h-11 shrink-0 rounded-[12px] border border-line bg-surface px-5 text-[13.5px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-line disabled:hover:text-head"
        >
          Add
        </button>
        {/* The browser's own autocomplete over tags already in use, for anyone
            who would rather type than reach for the chips below. */}
        <datalist id={listId}>
          {used.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
      </div>

      <p id="tags-hint" className="mt-1.5 text-[12.5px] text-mut-2">
        {full ? 'Remove one to add another.' : 'Press Enter, or use Add, for multiple tags.'}
      </p>
      {error ? <p className="mt-1.5 text-[13px] text-red-600">{error}</p> : null}

      {tags.length > 0 ? (
        <div className="mt-4">
          <p className="text-[13px] font-semibold text-head">Selected Tags</p>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag}>
                {/* A rounded rectangle rather than a pill: these sit in rows of
                    four or five and a rectangle packs a row without the gaps a
                    pill's round ends leave between neighbours. */}
                <span className="inline-flex items-center gap-1.5 rounded-[9px] border border-line bg-page py-1.5 pr-1.5 pl-3 text-[13px] font-medium text-head">
                  {tag}
                  <button
                    type="button"
                    onClick={() => onChange(tags.filter((value) => value !== tag))}
                    aria-label={`Remove tag ${tag}`}
                    className="grid size-4.5 place-items-center rounded-[5px] text-mut-2 transition-colors hover:bg-ink/8 hover:text-head"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!full ? (
        <SuggestionChips
          label="Suggested Tags"
          values={used}
          selected={tags}
          onPick={(tag) => commit(tag)}
        />
      ) : null}

      {/* The budget, stated where the reference states it: bottom right, under
          everything it counts. It is the one number that decides whether the
          suggestions above are still worth reading. */}
      <p
        className={cn(
          'mt-3 text-right font-mono text-[11.5px] tabular-nums',
          full ? 'text-brand-strong' : 'text-mut-2'
        )}
      >
        {tags.length} / {max} tags used
      </p>
    </div>
  )
}

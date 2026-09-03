'use client'

import { useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The editor's section nav: one panel of the post at a time.
 *
 * TABS, NOT LINKS. Everything here edits the same unsaved document, so
 * navigating between sections must not touch the URL or remount anything —
 * switching to Tags and back has to leave the body exactly as it was, caret
 * included. So these are ARIA tabs over panels that stay mounted, and the
 * roving tabindex below is what that contract requires: one stop in the page's
 * tab order for the whole list, arrow keys to move within it.
 *
 * A column on a laptop, a scrolling row on a phone — the same set either way,
 * because there is nothing here a small screen can afford to lose.
 */

export type EditorSection = {
  id: string
  label: string
  icon: LucideIcon
  /** Shown as a dot on the tab — used to flag a section holding an error. */
  flagged?: boolean
}

export function EditorNav({
  sections,
  active,
  onSelect,
  panelId,
}: {
  sections: EditorSection[]
  active: string
  onSelect: (id: string) => void
  /** Maps a tab to the panel it controls, for aria-controls. */
  panelId: (id: string) => string
}) {
  const listRef = useRef<HTMLDivElement>(null)

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']
    if (!keys.includes(event.key)) return
    event.preventDefault()

    const index = sections.findIndex((section) => section.id === active)
    const last = sections.length - 1
    let next = index
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = index >= last ? 0 : index + 1
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = index <= 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last

    onSelect(sections[next].id)
    /* Focus follows selection, which is what a tablist with automatic
       activation is supposed to do — otherwise the arrow keys move a highlight
       the keyboard cannot then act on. */
    listRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${sections[next].id}"]`)?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation="vertical"
      aria-label="Post sections"
      onKeyDown={onKeyDown}
      className={cn(
        'flex gap-1 overflow-x-auto px-3 py-2',
        'md:flex-col md:overflow-visible md:px-2 md:py-3'
      )}
    >
      <p className="hidden px-3 pt-1 pb-2 font-mono text-[10.5px] font-medium tracking-[0.16em] text-mut-2 uppercase md:block">
        Post
      </p>

      {sections.map((section) => {
        const Icon = section.icon
        const selected = section.id === active
        return (
          <button
            key={section.id}
            type="button"
            role="tab"
            data-tab={section.id}
            aria-selected={selected}
            aria-controls={panelId(section.id)}
            /* Roving tabindex: only the selected tab is a tab stop. */
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(section.id)}
            className={cn(
              'group relative flex shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[13.5px] font-semibold whitespace-nowrap transition-colors',
              selected
                ? 'bg-brand/8 text-brand-strong'
                : 'text-mut hover:bg-page hover:text-head'
            )}
          >
            {/* The active marker: a brand rule down the left edge on desktop,
                where the nav is a column and an edge exists to mark. */}
            <span
              aria-hidden="true"
              className={cn(
                'absolute top-1.5 bottom-1.5 -left-2 hidden w-0.5 rounded-full md:block',
                selected ? 'bg-brand' : 'bg-transparent'
              )}
            />
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {section.label}
            {section.flagged ? (
              <span
                aria-label="needs attention"
                className="ml-auto size-1.5 shrink-0 rounded-full bg-red-500"
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

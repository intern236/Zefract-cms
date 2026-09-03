'use client'

import { useId, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * One card in the editor's settings rail: a titled header over a bordered body.
 *
 * Defined once because the rail holds three of them and the whole point of the
 * rail is that it reads as one column of equal things — three hand-built cards
 * drift in padding and label size within a week.
 *
 * COLLAPSIBLE IS OPT-IN. Publish and Post Details fold away, because on a long
 * writing session the rail is mostly in the way once the settings are set.
 * Cover Image does not: it is a drop target, and a collapsed drop target is a
 * drop target nobody can hit.
 *
 * The header is a <button> only when it toggles something. A non-collapsible
 * card renders a plain <div>, so assistive tech is never offered a control that
 * does nothing — the same rule the industry chips on the home page follow.
 */
export function RailCard({
  title,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  collapsible = false,
  defaultOpen = true,
  children,
  className,
}: {
  title: string
  /** Sits before the title, naming the card at a glance. */
  leadingIcon?: LucideIcon
  /** Sits where the chevron would be, for a card that does not collapse. */
  trailingIcon?: LucideIcon
  collapsible?: boolean
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = useId()

  const header = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        {LeadingIcon ? <LeadingIcon className="size-4 shrink-0 text-mut-2" aria-hidden="true" /> : null}
        <span className="truncate text-[15px] font-bold tracking-[-0.01em] text-head">{title}</span>
      </span>
      {collapsible ? (
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-mut-2 transition-transform duration-200 motion-reduce:transition-none',
            open && 'rotate-180'
          )}
        />
      ) : TrailingIcon ? (
        <TrailingIcon className="size-4 shrink-0 text-mut-2" aria-hidden="true" />
      ) : null}
    </>
  )

  return (
    <section className={cn('rounded-card border border-line bg-surface', className)}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:text-brand-strong"
        >
          {header}
        </button>
      ) : (
        <div className="flex items-center justify-between gap-3 px-5 py-4">{header}</div>
      )}

      {open ? (
        <div id={bodyId} className="border-t border-line px-5 py-5">
          {children}
        </div>
      ) : null}
    </section>
  )
}

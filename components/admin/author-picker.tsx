'use client'

import Link from 'next/link'
import { Check, Plus, UserRound } from 'lucide-react'
import { AuthorAvatar } from '@/components/ui/author-avatar'
import type { AuthorOption } from '@/lib/author-display'
import { cn } from '@/lib/utils'

/**
 * Who gets the byline: a list of faces, one of them chosen.
 *
 * A RADIO GROUP, NOT A <select>. A dropdown of names would be smaller, and it
 * would also be the wrong control: the thing that identifies an author at a
 * glance is their photograph, and a native select cannot show one. Since there
 * are a handful of authors rather than a hundred, showing them all costs one
 * screenful and removes the click that a dropdown puts in front of the answer.
 *
 * NATIVE RADIO INPUTS UNDER THE CARDS, not divs with click handlers. That is
 * what gets arrow-key navigation, the roving tab stop, the announced group name
 * and the checked state for free — all of which a hand-rolled listbox has to
 * rebuild, usually incompletely. The inputs are `sr-only` rather than hidden, so
 * they keep their focus behaviour; the visible ring comes from
 * `has-[:focus-visible]` on the card, so focus follows the real focus rather
 * than a state variable guessing at it.
 *
 * "NO AUTHOR" IS AN OPTION, NOT AN EMPTY STATE. A post published under the
 * company rather than a person is a legitimate, permanent choice — see
 * BlogPost.authorId — so it is the first card and it is selected by default,
 * which is also what every post written before authors existed already has.
 */
export function AuthorPicker({
  authors,
  value,
  onChange,
}: {
  authors: AuthorOption[]
  /** The chosen author's id, or '' for the company byline. */
  value: string
  onChange: (value: string) => void
}) {
  if (authors.length === 0) {
    return (
      <div className="rounded-tile border border-dashed border-line bg-page p-8 text-center">
        <p className="font-mono text-[11px] tracking-[0.2em] text-mut uppercase">No authors yet</p>
        <p className="mx-auto mt-3 max-w-[46ch] text-[14px] text-mut">
          This post keeps the company byline. Create an author and they can be credited here.
        </p>
        {/* Opens in a new tab on purpose: creating an author is a detour, and
            navigating away would abandon whatever is unsaved in this editor. */}
        <Link
          href="/admin/authors/new"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-hover"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          New author
        </Link>
      </div>
    )
  }

  return (
    <fieldset>
      {/* The group's accessible name. A <legend> rather than an aria-label so it
          is announced once when focus enters the group, which is what a radio
          group's name is for. */}
      <legend className="text-[13.5px] font-semibold text-head">Byline</legend>
      <p className="mt-1 text-[12.5px] text-mut-2">
        Shown on the post and linked to their profile. Leave it as Zefract to publish under the
        company.
      </p>

      <div className="mt-4 space-y-2">
        <Option
          id="author-none"
          checked={value === ''}
          onSelect={() => onChange('')}
          avatar={
            <span
              aria-hidden="true"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink/6 text-mut"
            >
              <UserRound className="size-4" />
            </span>
          }
          title="Zefract"
          subtitle="No named author — the company byline"
        />

        {authors.map((author) => (
          <Option
            key={author.id}
            id={`author-${author.id}`}
            checked={value === author.id}
            onSelect={() => onChange(author.id)}
            avatar={<AuthorAvatar author={author} size={40} />}
            title={author.name}
            subtitle={author.role ?? `/authors/${author.slug}`}
          />
        ))}
      </div>

      <Link
        href="/admin/authors"
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-mut transition-colors hover:text-brand-strong"
      >
        <Plus className="size-3.5" aria-hidden="true" />
        Manage authors
      </Link>
    </fieldset>
  )
}

function Option({
  id,
  checked,
  onSelect,
  avatar,
  title,
  subtitle,
}: {
  id: string
  checked: boolean
  onSelect: () => void
  avatar: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-tile border p-3 transition-colors',
        'has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/35',
        checked
          ? 'border-brand bg-brand/6'
          : 'border-line bg-surface hover:border-brand/40'
      )}
    >
      <input
        type="radio"
        id={id}
        name="post-author"
        className="sr-only"
        checked={checked}
        onChange={onSelect}
      />
      {avatar}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-bold text-head">{title}</span>
        <span className="block truncate text-[12.5px] text-mut-2">{subtitle}</span>
      </span>
      {/* The tick is the only thing that changes size between states, so the row
          never reflows when the selection moves. */}
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex size-5 shrink-0 items-center justify-center rounded-full',
          checked ? 'bg-brand text-ink' : 'border border-line'
        )}
      >
        {checked ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
    </label>
  )
}

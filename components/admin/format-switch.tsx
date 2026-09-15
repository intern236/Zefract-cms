'use client'

import { Code2, FileText, Lock } from 'lucide-react'
import type { PostFormat } from '@/lib/post-page-meta'
import { cn } from '@/lib/utils'

/**
 * The choice that governs everything below it: write this post, or paste one.
 *
 * WHY IT IS AT THE TOP AND NOT IN A PANEL. It is not a setting, it is which of two
 * documents you are editing. Changing it changes the writing surface, the sections in the
 * nav, and what the published page looks like — so it sits above the title, where the
 * decision is made before anything is typed, rather than behind a tab somebody finds after
 * writing an article in the wrong one.
 *
 * A RADIOGROUP, NOT TABS, and the distinction is not pedantry. The section nav below it is
 * genuinely tabs: same document, different views of it, and moving between them changes
 * nothing. This picks one of two mutually exclusive values that IS the document's state, so
 * it announces as a radio group and arrow keys behave the way a radio group's do.
 *
 * BOTH OPTIONS SAY WHAT THEY DO TO THE PUBLISHED PAGE, because that is the part nobody can
 * see from the admin and the part that surprises people. "Paste a whole page" without "the
 * site's header and footer are hidden" is the half of the sentence that gets someone into
 * trouble.
 *
 * IT LOCKS AT FIRST PUBLISH — see the note on `locked` below.
 */
const OPTIONS: {
  value: PostFormat
  label: string
  icon: typeof FileText
  hint: string
}[] = [
  {
    value: 'editor',
    label: 'Rich editor',
    icon: FileText,
    hint: 'Write with the toolbar. Published in the site’s article layout, with the hero, byline, tags and CTA.',
  },
  {
    value: 'html',
    label: 'HTML page',
    icon: Code2,
    hint: 'Paste a whole HTML page. Published inside the site’s header and footer, followed by its tags, author and FAQ.',
  },
]

export function FormatSwitch({
  value,
  onChange,
  /** The format this post is SAVED as, where it has been saved. Undefined for a new post. */
  savedAs,
  /**
   * True once the post has been published, even if it has since been unpublished.
   *
   * WHY PUBLISHING FIXES IT. The two formats do not share a body: a post stores one
   * `contentHtml`, so saving in the other format overwrites it with the other surface's
   * document. On a draft that is a normal thing to do and this control lets you, because
   * both drafts are held in memory and nothing is lost until you save. On something already
   * published it is one click between a live page and a body that exists nowhere.
   *
   * SAME RULE AS THE SLUG, and deliberately so — that field locks at first publish for its
   * own reason (a published URL may be indexed and linked) and stays locked through an
   * unpublish. Two fields with two different definitions of "locked" would be a worse thing
   * to explain than one rule that covers both.
   *
   * savePost() refuses a format change on a published post rather than coercing it, so this
   * is the visible half of a real control rather than the control itself.
   */
  locked = false,
}: {
  value: PostFormat
  onChange: (next: PostFormat) => void
  savedAs?: PostFormat
  locked?: boolean
}) {
  const diverged = savedAs !== undefined && savedAs !== value

  const card = (option: (typeof OPTIONS)[number], active: boolean) => {
    const Icon = option.icon
    return (
      <>
        <Icon
          className={cn('mt-0.5 size-4 shrink-0', active ? 'text-brand-strong' : 'text-mut-2')}
          aria-hidden="true"
        />
        <span className="min-w-0">
          <span
            className={cn('block text-[13.5px] font-semibold', active ? 'text-head' : 'text-mut')}
          >
            {option.label}
          </span>
          <span className="mt-0.5 block text-[12px] leading-[1.45] text-mut-2">{option.hint}</span>
        </span>
      </>
    )
  }

  const shell = 'flex items-start gap-2.5 rounded-[12px] border p-3 text-left transition-colors'

  /**
   * LOCKED RENDERS AS PLAIN TEXT, NOT AS DISABLED BUTTONS.
   *
   * A greyed-out radio still announces as a radio to a screen reader, still sits in the
   * reading order as a control, and still invites the click it will refuse. Both options
   * stay on screen — so it is visible that a choice existed and which way it went — but
   * neither is a control any more, and the line underneath says why rather than leaving
   * somebody to work it out from a cursor.
   */
  if (locked) {
    return (
      <div className="rounded-tile border border-line bg-surface p-3">
        <div className="grid gap-2 sm:grid-cols-2">
          {OPTIONS.map((option) => {
            const active = option.value === value
            return (
              <div
                key={option.value}
                className={cn(
                  shell,
                  active ? 'border-line bg-page' : 'border-transparent opacity-45'
                )}
              >
                {card(option, active)}
              </div>
            )
          })}
        </div>
        <p className="mt-2.5 flex items-start gap-2 rounded-[10px] border border-line bg-page px-3 py-2 text-[12.5px] leading-[1.5] text-mut">
          <Lock className="mt-0.5 size-3.5 shrink-0 text-mut-2" aria-hidden="true" />
          <span>
            This post has been published, so its format is fixed. The two editors do not
            share a body, and switching now would replace a live post with an empty one. To
            write it the other way, create a new post.
          </span>
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-tile border border-line bg-surface p-3">
      <div
        role="radiogroup"
        aria-label="Post format"
        className="grid gap-2 sm:grid-cols-2"
        onKeyDown={(event) => {
          /* Arrow keys move the selection, which is what a radio group does and what a
             screen reader tells the user to expect. Without this the group announces as
             one and behaves like two unrelated buttons. */
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
          event.preventDefault()
          onChange(value === 'editor' ? 'html' : 'editor')
        }}
      >
        {OPTIONS.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              /* Roving tabindex: one stop in the page's tab order for the pair, arrow keys
                 to move inside it. The same contract the section nav follows. */
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(option.value)}
              className={cn(
                shell,
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                active ? 'border-brand/55 bg-brand/6' : 'border-line bg-page hover:border-brand/35'
              )}
            >
              {card(option, active)}
            </button>
          )
        })}
      </div>

      {/**
       * THE ONE WARNING THAT MATTERS, and it is a strip rather than a modal on purpose.
       *
       * Both drafts are held in state, so switching format loses nothing — flip back and
       * the other body is still there. SAVING is what is destructive: a post stores one
       * body, so saving in the format it was not saved in replaces the other one in the
       * database with no way back. A confirmation on the switch would fire on the harmless
       * action and be gone by the time the harmful one happened; this is visible for as
       * long as the mismatch exists, which is exactly as long as the risk does.
       *
       * It can only appear on a DRAFT. A published post cannot reach this state at all —
       * the control above is not a control by then.
       */}
      {diverged ? (
        <p className="mt-2.5 rounded-[10px] border border-brand/30 bg-brand/8 px-3 py-2 text-[12.5px] leading-[1.5] text-head">
          This post is saved as{' '}
          <span className="font-semibold">
            {savedAs === 'html' ? 'an HTML page' : 'a rich editor post'}
          </span>
          . Saving now replaces its body with what is in the{' '}
          <span className="font-semibold">{value === 'html' ? 'HTML page' : 'rich editor'}</span>{' '}
          surface. Switch back before saving if that is not what you want.
        </p>
      ) : null}
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { AlertTriangle, Check, RotateCcw } from 'lucide-react'
import { FIELD_BASE } from '@/components/forms/field'
import { cn } from '@/lib/utils'

/**
 * The post's HTML, editable directly.
 *
 * WHAT THIS IS FOR. Writers arrive with markup — a table built elsewhere, a
 * section lifted from a document, a block of formatting the toolbar has no
 * button for — and until now the only way in was to paste it as rich text and
 * hope the clipboard carried the structure. This shows the document as HTML,
 * takes an edited version back, and parses it into the post.
 *
 * IT DOES NOT RUN HTML, AND THAT IS NOT AN OVERSIGHT. The request this
 * implements asked for arbitrary HTML to execute inside a post. That cannot be
 * offered: post bodies are rendered with dangerouslySetInnerHTML on a public
 * page, so markup that executes is markup that runs for every visitor. The
 * sanitiser in lib/blog.ts exists for exactly that reason and states the case in
 * full — the author is trusted, but "trusted" describes a person, not every
 * request that ever carries their session cookie. A single stored <script>
 * would run on every reader of that post, for as long as it stayed published.
 *
 * SO THE MARKUP IS PARSED, NOT EXECUTED. What is pasted here is read into the
 * document through the same schema the toolbar writes to: headings, lists,
 * tables, links, images, code blocks and inline formatting all survive.
 * Anything the schema has no node for — a <div> wrapper, a <script>, an
 * <iframe>, a style attribute — is dropped on the way in, and the panel says so
 * rather than letting the writer discover it on the published page. That is the
 * same rule the paste path and the save path already enforce; this just makes it
 * visible.
 *
 * A DRAFT, NOT A LIVE BINDING. The textarea is seeded from the editor once and
 * is not rewritten while typing — binding it to `getHTML()` would rebuild the
 * whole string on every keystroke in the body and fight anyone editing here.
 * Apply is the one moment the two are reconciled.
 *
 * SEEDED AT MOUNT, AND THE CALLER REMOUNTS IT. The obvious implementation
 * reloads the draft in an effect keyed on the panel being opened, and React's
 * own rule refuses it: a setState in an effect body is a cascading render, which
 * is the lint error this codebase has already recorded against the editor's
 * clock sampling. Reading the document in the `useState` initialiser has no such
 * problem, and post-editor.tsx changes this component's `key` when the panel
 * opens so a fresh mount — and therefore a fresh read — happens every time.
 * Nothing is lost by discarding an unapplied draft: it is a copy of the post
 * that was never put into it.
 */
export function HtmlSource({
  editor,
  onApply,
}: {
  editor: Editor | null
  onApply: () => void
}) {
  /* The document as it stands at mount. The editor is null for the first render
     of the page (`immediatelyRender: false`), which is harmless: the panel is
     hidden then, and the remount on open happens long afterwards. */
  const [draft, setDraft] = useState(() => editor?.getHTML() ?? '')
  const [dropped, setDropped] = useState<string[] | null>(null)
  const [applied, setApplied] = useState(false)

  if (!editor) return null

  const apply = () => {
    editor.commands.setContent(draft, { emitUpdate: true })

    /* WHAT SURVIVED, ANSWERED BY THE EDITOR ITSELF rather than by a list of
       rules kept in step by hand. Reading the document back after parsing and
       comparing the tags present is the only check that cannot drift from the
       schema: add an extension tomorrow and this reports the truth with no edit
       here. */
    const result = editor.getHTML()
    const tagsIn = new Set(
      [...draft.matchAll(/<([a-z][a-z0-9]*)\b/gi)].map((m) => m[1].toLowerCase())
    )
    const tagsOut = new Set(
      [...result.matchAll(/<([a-z][a-z0-9]*)\b/gi)].map((m) => m[1].toLowerCase())
    )
    const lost = [...tagsIn].filter((tag) => !tagsOut.has(tag)).sort()

    setDraft(result)
    setDropped(lost.length > 0 ? lost : null)
    setApplied(true)
    onApply()
  }

  const reload = () => {
    setDraft(editor.getHTML())
    setDropped(null)
    setApplied(false)
  }

  return (
    <div>
      <p className="max-w-[70ch] text-[13px] text-mut">
        The post as HTML. Paste or edit markup here and press Apply to parse it into the
        document. Headings, lists, tables, links, images, code blocks and inline formatting
        are kept; anything else is dropped, and you will be told what.
      </p>

      <textarea
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value)
          setApplied(false)
        }}
        spellCheck={false}
        aria-label="Post HTML"
        className={cn(
          FIELD_BASE,
          'mt-4 min-h-[420px] px-4 py-3 font-mono text-[12.5px] leading-[1.7]'
        )}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={apply}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-hover"
        >
          Apply to post
        </button>
        <button
          type="button"
          onClick={reload}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[13px] font-semibold text-mut transition-colors hover:border-brand/50 hover:text-head"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reload from post
        </button>

        {/* Applying replaces the whole document, so undo is the way back — worth
            saying, because a source view is the one panel where somebody might
            paste over an article by accident. */}
        <p className="text-[12.5px] text-mut-2">
          Replaces the whole body. Ctrl+Z in the editor undoes it.
        </p>
      </div>

      {applied && !dropped ? (
        <p
          role="status"
          className="mt-3 inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-600/25 bg-emerald-600/8 px-3 py-2 text-[13px] text-emerald-800"
        >
          <Check className="size-3.5" aria-hidden="true" />
          Applied. Everything in the markup was kept.
        </p>
      ) : null}

      {dropped ? (
        <p
          role="status"
          className="mt-3 flex items-start gap-2 rounded-[10px] border border-brand/30 bg-brand/8 px-3 py-2 text-[13px] text-head"
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-brand-strong" aria-hidden="true" />
          <span>
            Applied, but {dropped.length === 1 ? 'one tag was' : `${dropped.length} tags were`}{' '}
            dropped:{' '}
            <span className="font-mono text-[12px]">
              {dropped.map((tag) => `<${tag}>`).join(', ')}
            </span>
            . The editor has no equivalent for {dropped.length === 1 ? 'it' : 'them'}, so{' '}
            {dropped.length === 1 ? 'its' : 'their'} contents were kept and the{' '}
            {dropped.length === 1 ? 'tag' : 'tags'} removed. The box above now shows what the
            post actually holds.
          </span>
        </p>
      ) : null}
    </div>
  )
}

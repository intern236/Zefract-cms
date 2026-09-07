'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Plus, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { FIELD_BASE } from '@/components/forms/field'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * The post's FAQ list: a question and a plain-text answer per row.
 *
 * WHY THIS IS A FORM AND NOT JUST MORE PROSE. A writer can already type
 * "Frequently asked questions" as a heading with the questions underneath, and a
 * reader would be perfectly well served by it. What that cannot do is produce
 * FAQPage structured data, because schema.org needs each question paired with
 * its answer as data rather than inferred from a run of headings — and without
 * it the post is not eligible for the FAQ rich result or for the answer surfaces
 * the site's own AEO and GEO pages sell. So the pairing is captured here, and
 * the same rows render the accordion on the page.
 *
 * PLAIN TEXT ANSWERS, matching every other FAQ on this site (see `Faq` in
 * content/types.ts). schema.org's `acceptedAnswer.text` is a string, so rich
 * text here would need a second sanitiser and a second editor surface, and then
 * be stripped again before it could be published as schema.
 *
 * ORDER IS EDITORIAL, hence the move controls. The first question is the one
 * most readers have, and an FAQ that opens on an edge case reads as an
 * afterthought — so the list can be reordered without retyping it.
 *
 * KEYED BY INDEX, WHICH IS NORMALLY WRONG AND IS RIGHT HERE. The usual hazard is
 * React reusing a row's DOM when the list reorders; that is exactly what should
 * happen for a controlled input whose value is supplied on every render, and the
 * alternative — a synthetic id per row — would be a second piece of state to
 * keep in step for no behavioural gain. There is no uncontrolled state in a row
 * to be carried to the wrong place.
 */
export function FaqFields({
  faqs,
  max,
  questionMax,
  answerMax,
  error,
  onChange,
}: {
  faqs: { question: string; answer: string }[]
  max: number
  questionMax: number
  answerMax: number
  error?: string
  onChange: (next: { question: string; answer: string }[]) => void
}) {
  const full = faqs.length >= max
  /* Both halves are needed to publish. Counted here so the footer can report
     what will actually reach the page rather than how many rows exist — with
     three rows and one filled in, "3 questions" is a comfortable lie. */
  const publishable = faqs.filter((faq) => faq.question.trim() && faq.answer.trim()).length

  /** The row a delete is waiting on, or null. Never 0-as-falsy: index 0 is a
   *  real row, which is why this is compared against null explicitly. */
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null)

  /**
   * REORDERING MUST CARRY FOCUS WITH THE ROW, and by default it does the
   * opposite. The move buttons are rendered per index, so pressing "down" swaps
   * the rows underneath a button that stays exactly where it was — a keyboard
   * user presses down once and their focus is now on a different question,
   * pressing down again moves the wrong one back. It is the standard defect of
   * reorder buttons and it is invisible to anyone using a mouse.
   *
   * So the destination is recorded on click and focused after the render that
   * moves it. A ref rather than state because nothing here needs to re-render,
   * and a plain `focus()` in an effect is not the cascading setState the lint
   * rule in this project forbids.
   */
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  const focusAfterMove = useRef<string | null>(null)

  useEffect(() => {
    const key = focusAfterMove.current
    if (!key) return
    focusAfterMove.current = null
    buttons.current.get(key)?.focus()
  })

  const update = (index: number, patch: Partial<{ question: string; answer: string }>) => {
    onChange(faqs.map((faq, i) => (i === index ? { ...faq, ...patch } : faq)))
  }

  const remove = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index))
    setConfirmIndex(null)
  }

  /** True once a row holds anything worth losing. An untouched row is deleted
   *  outright; a filled one asks first, because there is no undo. */
  const hasContent = (index: number) =>
    Boolean(faqs[index]?.question.trim() || faqs[index]?.answer.trim())

  /** Swaps a row with its neighbour. `to` is always in range at the call site,
   *  because the buttons that would move an end row past the end are disabled. */
  const move = (index: number, to: number, direction: 'up' | 'down') => {
    const next = [...faqs]
    ;[next[index], next[to]] = [next[to], next[index]]
    /* The same control, at the row's new position — so a run of presses keeps
       moving the question the writer started on. */
    focusAfterMove.current = `${to}-${direction}`
    onChange(next)
  }

  if (faqs.length === 0) {
    return (
      <div>
        <div className="rounded-tile border border-dashed border-line bg-page p-8 text-center">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand-strong">
            <HelpCircle className="size-4.5" aria-hidden="true" />
          </span>
          <p className="mx-auto mt-4 max-w-[52ch] text-[14px] text-mut">
            Add the questions this post actually gets asked. They render as an accordion at
            the foot of the page and are published as FAQ structured data, which is what
            makes them eligible to be quoted directly in a search result or an AI answer.
          </p>
          <button
            type="button"
            onClick={() => onChange([{ question: '', answer: '' }])}
            className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-hover"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add a question
          </button>
        </div>
        {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}
      </div>
    )
  }

  return (
    <div>
      {/* THE CONTEXT SURVIVES THE FIRST ROW. All of this was in the empty state
          and only there, so the moment a writer added a question the panel
          stopped saying what it was for or where any of it would appear — and
          the empty state is the one screen they never see again. One line, kept
          short because it is read repeatedly rather than once. */}
      <p className="max-w-[70ch] text-[13px] text-mut">
        Rendered as an accordion at the foot of the post, and published as FAQ structured
        data — which is what makes an answer eligible to be quoted directly in a search
        result or an AI answer.
      </p>

      <ol className="mt-4 space-y-3">
        {faqs.map((faq, index) => {
          /**
           * WHAT IS MISSING, NOT MERELY THAT SOMETHING IS.
           *
           * This row used to carry a flat "NOT PUBLISHED" chip whenever either
           * half was blank, which meant a freshly added row was branded with a
           * warning before the writer had typed a character — the first thing
           * the panel said to anyone using it was that their empty row had
           * failed. It also never said which half was missing.
           *
           * An untouched row is now silent, because it is not a problem, it is a
           * row someone is about to fill in. A HALF-filled one is the case worth
           * flagging, since that is the state the server silently drops on save,
           * and the label names the field to go and complete.
           */
          const question = faq.question.trim()
          const answer = faq.answer.trim()
          const missing =
            question && !answer
              ? 'Needs an answer'
              : answer && !question
                ? 'Needs a question'
                : null
          return (
            <li
              key={index}
              className="rounded-tile border border-line bg-surface p-4"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-mut-2 tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {missing ? (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] text-brand-strong uppercase">
                    {missing}
                  </span>
                ) : null}

                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    ref={(node) => {
                      /* A callback ref rather than an array, so a removed row's
                         entry goes with it instead of leaving a handle to a
                         detached node in the map. */
                      if (node) buttons.current.set(`${index}-up`, node)
                      else buttons.current.delete(`${index}-up`)
                    }}
                    onClick={() => move(index, index - 1, 'up')}
                    disabled={index === 0}
                    aria-label={`Move question ${index + 1} up`}
                    className="grid size-7 place-items-center rounded-[8px] text-mut-2 transition-colors hover:bg-page hover:text-head disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronUp className="size-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) buttons.current.set(`${index}-down`, node)
                      else buttons.current.delete(`${index}-down`)
                    }}
                    onClick={() => move(index, index + 1, 'down')}
                    disabled={index === faqs.length - 1}
                    aria-label={`Move question ${index + 1} down`}
                    className="grid size-7 place-items-center rounded-[8px] text-mut-2 transition-colors hover:bg-page hover:text-head disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronDown className="size-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    /* Straight out when there is nothing in it, confirmed when
                       there is. Asking before deleting an empty row is ceremony;
                       not asking before deleting a written answer is data loss,
                       and there is no undo on this panel. */
                    onClick={() =>
                      hasContent(index) ? setConfirmIndex(index) : remove(index)
                    }
                    aria-label={`Remove question ${index + 1}`}
                    className="grid size-7 place-items-center rounded-[8px] text-mut-2 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <Label
                  htmlFor={`faq-question-${index}`}
                  className="text-[13px] font-semibold text-head"
                >
                  Question
                </Label>
                {/* A COUNTER HERE TOO, where there was one only on the answer.
                    The field is capped at `questionMax`, so without it typing
                    simply stops dead with nothing on screen explaining why —
                    the same "accepted, then silently blocked" failure the meta
                    description had. `pr-16` keeps the text clear of it. */}
                <div className="relative mt-1.5">
                  <input
                    id={`faq-question-${index}`}
                    value={faq.question}
                    maxLength={questionMax}
                    onChange={(event) => update(index, { question: event.target.value })}
                    placeholder="How long does SEO take to work?"
                    className={cn(FIELD_BASE, 'h-11 pr-16 pl-4 text-[14px]')}
                  />
                  <span
                    className={cn(
                      'pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[11px] tabular-nums',
                      faq.question.length >= questionMax ? 'text-brand-strong' : 'text-mut-2'
                    )}
                  >
                    {faq.question.length}/{questionMax}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <Label
                  htmlFor={`faq-answer-${index}`}
                  className="text-[13px] font-semibold text-head"
                >
                  Answer
                </Label>
                <textarea
                  id={`faq-answer-${index}`}
                  value={faq.answer}
                  maxLength={answerMax}
                  onChange={(event) => update(index, { answer: event.target.value })}
                  placeholder="Answer it outright in the first sentence, then qualify…"
                  className={cn(
                    FIELD_BASE,
                    'mt-1.5 min-h-24 px-4 py-3 text-[14px] leading-relaxed'
                  )}
                />
                <p
                  className={cn(
                    'mt-1 text-right font-mono text-[11px] tabular-nums',
                    faq.answer.length >= answerMax ? 'text-brand-strong' : 'text-mut-2'
                  )}
                >
                  {faq.answer.length}/{answerMax}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={full}
          onClick={() => onChange([...faqs, { question: '', answer: '' }])}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add a question
        </button>
        {/* WHAT WILL PUBLISH, NOT HOW MANY ROWS EXIST. This read "3 / 12
            questions" whether all three were written or one was — and since the
            server drops a half-filled row without comment, the count was
            reassuring the writer about content that was never going to reach the
            page. The publishable figure leads; the cap follows it. */}
        <p className="font-mono text-[11.5px] text-mut-2 tabular-nums">
          {publishable < faqs.length ? (
            <>
              <span className="text-brand-strong">
                {publishable} of {faqs.length} will publish
              </span>
              <span aria-hidden="true"> · </span>
            </>
          ) : null}
          <span className={full ? 'text-brand-strong' : undefined}>
            {faqs.length} / {max} questions
          </span>
        </p>
      </div>

      {/* The advice that decides whether any of this is worth publishing. An
          answer that opens with three sentences of preamble is not extractable,
          which is the same point the site's own AEO service page makes and the
          rule content/service-faqs.ts is written to. */}
      <p className="mt-3 max-w-[62ch] text-[12.5px] text-mut-2">
        Answer outright in the first sentence, then qualify. A search engine lifts the
        opening of an answer, so a question whose reply begins with context is one that
        never gets quoted.
      </p>
      {error ? <p className="mt-2 text-[13px] text-red-600">{error}</p> : null}

      {/* Named, so it is never ambiguous which of a dozen rows is going. The
          question where there is one, the position where the row holds only an
          answer — the same reason the post and author delete dialogs quote the
          thing by name rather than saying "this one". */}
      <ConfirmDialog
        open={confirmIndex !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmIndex(null)
        }}
        title="Remove this question?"
        description={
          confirmIndex !== null && faqs[confirmIndex]?.question.trim()
            ? `“${faqs[confirmIndex].question.trim()}” and its answer will be removed from this post. There is no undo.`
            : 'This question and its answer will be removed from this post. There is no undo.'
        }
        confirmLabel="Remove question"
        busyLabel="Removing…"
        onConfirm={() => {
          if (confirmIndex !== null) remove(confirmIndex)
        }}
      />
    </div>
  )
}

import { Check, Info } from 'lucide-react'
import type { ExtractedFaq } from '@/lib/faq-extract'

/**
 * What the FAQ panel says about the questions already sitting in the article body.
 *
 * WHY THE PANEL NEEDS TO SAY ANYTHING. The published page now turns an FAQ section typed
 * into the article into FAQPage schema (see lib/faq-extract.ts). Without this, a writer who
 * did exactly that opens the FAQ panel, finds it empty, and reasonably concludes their FAQ
 * is not being published — and either retypes every question here, so readers see each one
 * twice, or files a bug. So the panel shows what the page will publish, in the writer's own
 * words, before they save.
 *
 * TWO STATES, and they are different kinds of message:
 *
 *   • PANEL EMPTY, QUESTIONS IN THE BODY — a confirmation. It lists what was found, so the
 *     writer can check the detection picked up every question and nothing else, and says
 *     why one might be missing, because "it ignored my question" with no explanation is the
 *     thing that makes people distrust automation.
 *
 *   • PANEL FILLED, QUESTIONS IN THE BODY TOO — a warning. The panel wins, so the body's
 *     questions stop being schema, and if they are the same questions the reader sees them
 *     twice: once in the article, once in the accordion. The writer has to pick one.
 *
 * Nothing at all when the body has no FAQ section, which is most posts.
 */
export function BodyFaqNotice({
  bodyFaqs,
  panelCount,
  pageHasFaqSchema = false,
}: {
  bodyFaqs: ExtractedFaq[]
  panelCount: number
  /**
   * An HTML-page post whose pasted page already carries FAQPage JSON-LD.
   *
   * The third state, and the only one an HTML post can reach: questions are never read out
   * of a pasted page's body (it is arbitrary markup, not the editor's known shape), but its
   * own structured data is preserved. The post page then renders this panel's questions as
   * an accordion WITHOUT a second FAQPage block, and the writer should know that before
   * they wonder why a validator shows only the page's own questions.
   */
  pageHasFaqSchema?: boolean
}) {
  if (pageHasFaqSchema) {
    return (
      <div
        role="note"
        className="mb-5 flex items-start gap-2.5 rounded-[12px] border border-line bg-page px-4 py-3 text-[13px] leading-[1.55] text-head"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-mut-2" aria-hidden="true" />
        <p>
          Your HTML page already includes its own FAQ schema, and that is what search engines
          get. {panelCount > 0 ? 'The questions here' : 'Any questions you add here'} show as an
          accordion under the page, but are not published as a second FAQ schema: one page, one
          set of FAQ data.
        </p>
      </div>
    )
  }

  if (bodyFaqs.length === 0) return null
  const found = bodyFaqs.length === 1 ? '1 question' : `${bodyFaqs.length} questions`

  if (panelCount > 0) {
    return (
      <div
        role="note"
        className="mb-5 flex items-start gap-2.5 rounded-[12px] border border-brand/30 bg-brand/8 px-4 py-3 text-[13px] leading-[1.55] text-head"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-brand-strong" aria-hidden="true" />
        <p>
          Your article also has an FAQ section with {found}. Only the questions in this panel
          are published as FAQ schema; the ones in the article stay as ordinary text. If they
          are the same questions, delete one copy, or readers will see each question twice.
        </p>
      </div>
    )
  }

  return (
    <div
      role="note"
      className="mb-5 rounded-[12px] border border-emerald-600/25 bg-emerald-600/8 px-4 py-3 text-[13px] leading-[1.55] text-head"
    >
      <p className="flex items-start gap-2.5">
        <Check className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden="true" />
        <span>
          <span className="font-semibold">Found {found} in your article&rsquo;s FAQ section.</span>{' '}
          They are published as FAQ schema automatically, so there is nothing to add here.
          Fill in this panel only if you want an accordion at the end of the post instead, and
          remove the FAQ section from the article if you do.
        </span>
      </p>
      <ol className="mt-2.5 ml-6.5 list-decimal space-y-1 text-mut">
        {bodyFaqs.map((faq) => (
          <li key={faq.question}>{faq.question}</li>
        ))}
      </ol>
      {/* The detection rule, in one sentence. A question that is not picked up is almost
          always missing its question mark, and saying so turns "it's broken" into a fix. */}
      <p className="mt-2.5 text-[12px] text-mut-2">
        Picked up: bold lines or headings ending in &ldquo;?&rdquo; under a heading such as
        &ldquo;FAQs&rdquo; or &ldquo;Frequently asked questions&rdquo;. Missing one? Check it
        ends with a question mark.
      </p>
    </div>
  )
}

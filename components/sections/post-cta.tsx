import { PillLink } from '@/components/ui/pill'
import { POST_CTA } from '@/content/home'
import { cn } from '@/lib/utils'

/**
 * The call to action inside an article, placed about halfway down.
 *
 * WHY MID-ARTICLE AT ALL. The band at the foot of the page only ever reaches
 * readers who finish, and on a long piece most do not — they get what they came
 * for and leave, at the point the article has just described their own problem
 * back to them. That is the moment intent is highest and the page was asking for
 * nothing. This is that ask.
 *
 * IT IS DELIBERATELY SMALLER THAN THE FOOTER BAND. <CtaBand> is a full-bleed
 * section on ink with an eyebrow, a masked heading, a standfirst, four buttons
 * and a note — correct for closing a page, and completely wrong for
 * interrupting one. Dropping that between two paragraphs would read as an advert
 * the article had been wrapped around. So this is one line, one button, inside
 * the reading column, on the page's own surface.
 *
 * INSIDE THE MEASURE, NOT BREAKING OUT OF IT. It takes the same 68ch as the
 * prose either side, so the reader's eye does not have to reset its line length
 * twice to get past it. That is what keeps it feeling like part of the article
 * rather than something injected into it.
 *
 * `role="complementary"` AND A LABEL, because it is not part of the argument the
 * article is making. A screen-reader user arriving at it should be able to tell
 * immediately that the prose has paused, and skip it in one gesture rather than
 * discovering three sentences later that they are reading an advert.
 *
 * A Server Component: two pieces of text and a link, so it ships no JavaScript.
 */
export function PostCta({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Work with Zefract"
      className={cn(
        'mx-auto max-w-[68ch] rounded-card border border-brand/25 border-l-[3px] border-l-brand bg-brand/6 p-7',
        className
      )}
    >
      <p className="text-[19px] leading-snug font-bold tracking-[-0.02em] text-balance text-head">
        {POST_CTA.heading}
      </p>
      <p className="mt-2.5 max-w-[52ch] text-[15.5px] leading-relaxed text-mut">
        {POST_CTA.body}
      </p>
      {/* `sm`, not the default pill size: this sits between two paragraphs, and
          the full 52px button reads as the page changing subject rather than
          pausing. */}
      <PillLink href={POST_CTA.href} variant="ink" size="sm" className="mt-5">
        {POST_CTA.label}
      </PillLink>
    </aside>
  )
}

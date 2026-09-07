import Link from 'next/link'
import { tagSlug } from '@/lib/blog'
import { cn } from '@/lib/utils'

/**
 * A tag, as a link to its archive.
 *
 * ONE DEFINITION, EVERY SURFACE, for the reason contact-channels.tsx gives about
 * the email/call/WhatsApp rows: a tag renders on a post, on the tag archive
 * itself and anywhere a future related-content block puts one, and three
 * hand-built chips are three chances for the URL, the chip's shape or its
 * accessible name to drift in the place nobody looked at. The slug in particular
 * has to be derived the same way everywhere, or a chip links to an archive that
 * does not exist.
 *
 * A SERVER COMPONENT. It is an anchor and a label with no behaviour, so it costs
 * no JavaScript on any route it appears on.
 *
 * THE ACCESSIBLE NAME SAYS WHAT THE LINK DOES. Visually these sit under a
 * "Tagged" label that supplies the context, but a screen-reader user pulling the
 * links out of the page gets a list of bare nouns with no indication that they
 * navigate. "Paid advertising" becomes "Paid advertising, view all articles",
 * which keeps the visible text as the start of the name — WCAG 2.2 SC 2.5.3
 * (Label in Name), the same rule the WhatsApp button documents.
 *
 * `.chip-pop` OWNS THE WHOLE TRANSITION, so nothing here may carry a
 * `transition-*` utility: the utility would win and strand the lift. That is the
 * trap globals.css records against this class.
 */
export function TagLink({
  tag,
  className,
}: {
  tag: string
  className?: string
}) {
  return (
    <Link
      href={`/blog/tag/${tagSlug(tag)}`}
      aria-label={`${tag}, view all articles`}
      className={cn(
        'chip-pop inline-flex items-center rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-head',
        className
      )}
    >
      {tag}
    </Link>
  )
}

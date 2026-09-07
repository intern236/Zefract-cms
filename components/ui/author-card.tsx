import Link from 'next/link'
import { Globe } from 'lucide-react'
import { AuthorAvatar } from '@/components/ui/author-avatar'
import { LinkedInGlyph, XGlyph } from '@/components/ui/social-icons'
import { authorLinks, type Author } from '@/lib/author-display'
import { cn } from '@/lib/utils'

/**
 * The author, at the foot of a post: photograph, name, designation, bio and
 * wherever else they can be found.
 *
 * WHAT THIS REPLACES. The post page carried one byline and nothing else — a
 * lone name and a small photograph in a bordered strip ABOVE the cover image,
 * inside a `justify-between` row that had a single child and therefore nothing
 * to justify. It read as a fragment left between the headline and the banner
 * rather than as a considered part of the page, which is the complaint.
 *
 * THE BYLINE AND THIS CARD DO DIFFERENT JOBS, which is why the page now has
 * both rather than moving the one. A byline is read before the article, in half
 * a second, to answer "whose opinion is this" — it belongs immediately above the
 * text and has to be small. This is read after it, by someone who has just
 * decided they liked the piece, and answers "who was that, and what else have
 * they written". Every professional publication carries the pair for that
 * reason.
 *
 * ONLY FOR A NAMED AUTHOR. A post published under the company falls back to the
 * organisation byline at the top (see <AuthorByline>), and there is nothing to
 * put in a card here: no photograph, no biography, no profile to link to. An
 * "About the author" panel reading "Zefract" with an empty space where a person
 * should be is worse than not printing one — so the page renders nothing, and
 * this component returns null rather than making every call site check.
 *
 * A SERVER COMPONENT: an avatar, some text and three anchors, so it costs no
 * JavaScript on the post page.
 */
export function AuthorCard({
  author,
  /** How many published pieces they have, printed as the reason to follow the
   *  link. Omitted where the caller has not counted them. */
  postCount,
  className,
}: {
  author: Author | null
  postCount?: number
  className?: string
}) {
  if (!author) return null

  const links = authorLinks(author)

  return (
    <aside
      className={cn(
        'rounded-card border border-line bg-surface p-7 md:p-8',
        className
      )}
    >
      <p className="font-mono text-[11px] tracking-[0.2em] text-mut-2 uppercase">
        Written by
      </p>

      {/* Stacked on a phone, side by side from sm. The photograph leads at every
          width — it is the fastest thing to recognise, and the reason a card
          works better here than another line of text. */}
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <AuthorAvatar
          author={author}
          size={72}
          className="ring-4 ring-page shadow-[0_10px_24px_-14px_rgba(8,20,34,0.4)]"
        />

        <div className="min-w-0 flex-1">
          <p className="text-[19px] leading-snug font-bold tracking-[-0.02em] text-head">
            <Link
              href={`/authors/${author.slug}`}
              className="transition-colors hover:text-brand-strong"
            >
              {author.name}
            </Link>
          </p>
          {author.role ? (
            <p className="mt-1 text-[13.5px] font-semibold text-brand-strong">
              {author.role}
            </p>
          ) : null}

          {author.bio ? (
            /* Plain text printed as text — see the note on Author.bio for why a
               bio is not HTML. `whitespace-pre-line` is what keeps a
               two-paragraph biography in two paragraphs without needing markup
               to express it, matching the profile page. */
            <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed whitespace-pre-line text-mut">
              {author.bio}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={`/authors/${author.slug}`}
              className="text-[13.5px] font-semibold text-head underline underline-offset-4 transition-colors hover:text-brand-strong"
            >
              {typeof postCount === 'number' && postCount > 0
                ? `All ${postCount} ${postCount === 1 ? 'article' : 'articles'}`
                : 'View profile'}
            </Link>

            {links.length > 0 ? (
              <ul className="flex flex-wrap items-center gap-2">
                {links.map((link) => (
                  <li key={link.kind}>
                    <a
                      href={link.url}
                      target="_blank"
                      /* `nofollow` as well as noopener, matching the profile
                         page: these are addresses the author typed about
                         themselves, and a byline should not pass the site's
                         authority to whatever they linked. */
                      rel="noopener noreferrer nofollow"
                      aria-label={`${author.name} on ${link.label}`}
                      className="inline-flex size-8 items-center justify-center rounded-full border border-line bg-page text-brand-strong transition-colors hover:border-brand/50 hover:bg-brand/8"
                    >
                      {link.kind === 'linkedin' ? (
                        <LinkedInGlyph className="size-3.5" />
                      ) : link.kind === 'x' ? (
                        <XGlyph className="size-3.5" />
                      ) : (
                        <Globe className="size-3.5" aria-hidden="true" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  )
}

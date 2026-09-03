import Link from 'next/link'
import { AuthorAvatar } from '@/components/ui/author-avatar'
import type { Author } from '@/lib/author-display'
import { SITE } from '@/content/site'
import { cn } from '@/lib/utils'

/**
 * "By <person>", with their face — or the company, when a post has no author.
 *
 * IT RENDERS SOMETHING EITHER WAY, which is the reason it takes `author | null`
 * rather than being conditionally mounted. A post with no author is a normal,
 * permanent state (see BlogPost.authorId), and the alternative — the byline
 * simply vanishing — leaves a post looking like it lost something. The company
 * name is a real answer to "who wrote this", and it is the one the JSON-LD has
 * always given.
 *
 * ONLY A NAMED AUTHOR IS A LINK. The company byline has nowhere to go: there is
 * no /authors/zefract, and linking it to the home page would be a link that
 * looks like it means something and does not.
 *
 * `size="lg"` is the post page, where the byline sits under the title and is
 * part of the article's identity. The default is the compact one for cards and
 * lists, where it is a label rather than a feature.
 */
export function AuthorByline({
  author,
  /** Rendered after the name — the date, the reading time, whatever the surface
   *  already prints. Kept as a slot so this component never has to know. */
  meta,
  size = 'sm',
  className,
}: {
  author: Author | null
  meta?: React.ReactNode
  size?: 'sm' | 'lg'
  className?: string
}) {
  const large = size === 'lg'
  const avatarSize = large ? 44 : 28

  const name = author ? author.name : SITE.name
  const nameClass = cn(
    'font-bold text-head',
    large ? 'text-[15.5px]' : 'text-[13px]'
  )

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {author ? (
        <AuthorAvatar author={author} size={avatarSize} />
      ) : (
        /* The company has no portrait, and inventing one — a logo squeezed into
           a circle — would read as a person. Initials keep the shape of a byline
           without pretending. */
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-ink/6 font-bold text-mut"
          style={{ width: avatarSize, height: avatarSize, fontSize: Math.round(avatarSize * 0.36) }}
        >
          {SITE.name.slice(0, 1)}
        </span>
      )}

      <div className="min-w-0">
        <p className={cn('truncate', nameClass)}>
          {author ? (
            <Link
              href={`/authors/${author.slug}`}
              className="transition-colors hover:text-brand-strong"
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </p>
        {/* The role and the metadata share one line: both are secondary to the
            name, and stacking them would make a two-line byline into three. */}
        {(author?.role || meta) && (
          <p
            className={cn(
              'truncate text-mut-2',
              large ? 'text-[13px]' : 'text-[12px]'
            )}
          >
            {author?.role ? (
              <>
                {author.role}
                {meta ? <span aria-hidden="true"> · </span> : null}
              </>
            ) : null}
            {meta}
          </p>
        )}
      </div>
    </div>
  )
}

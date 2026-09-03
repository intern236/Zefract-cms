import {
  authorAvatarSrcSet,
  authorAvatarUrl,
  authorInitials,
  type Author,
  type AuthorOption,
} from '@/lib/author-display'
import { cn } from '@/lib/utils'

/**
 * An author's portrait, or their initials when there is none.
 *
 * ONE COMPONENT FOR EVERY SURFACE — the byline on a post, the row in the admin
 * list, the card on /authors, the big one on a profile — because the fallback is
 * the part that goes wrong when it is written more than once. Four call sites
 * each deciding what to do about a missing photograph is four chances for one of
 * them to render a broken image, and the one that gets it wrong is always the
 * one nobody looked at.
 *
 * NO next/image, DELIBERATELY. These are Cloudinary URLs, and next.config.ts
 * declares no `remotePatterns` — adding one to optimise an image Cloudinary has
 * already optimised would put a second resizer in front of the first. The blog's
 * own cover renders as a plain <img> for exactly this reason.
 *
 * `size` IS THE CSS SIZE, and the file requested is doubled for a 2x screen —
 * see AVATAR_SIZES in lib/cloudinary/url.ts. `sizes` is declared in px rather
 * than vw because this box never varies with the viewport: a byline avatar is
 * 40px on a phone and 40px on a desktop.
 *
 * PLAIN, NOT CLIENT. No hooks, no state — so it renders in a Server Component
 * (the profile page) and inside the client editor's picker without either
 * needing to know.
 */
export function AuthorAvatar({
  author,
  size = 40,
  className,
}: {
  author: Pick<Author | AuthorOption, 'name' | 'avatar' | 'avatarAlt'>
  /** The rendered box, in CSS pixels. */
  size?: number
  className?: string
}) {
  const src = authorAvatarUrl(author, size * 2)
  const shared = cn('shrink-0 rounded-full object-cover', className)

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          shared,
          'inline-flex items-center justify-center bg-brand/10 font-bold tracking-[-0.01em] text-brand-strong'
        )}
        /* Scaled with the box rather than fixed: initials set at one size look
           lost in a 96px disc and overflow a 32px one. 38% is the ratio the
           featured-case monogram uses and reads correctly across this range. */
        style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      >
        {authorInitials(author.name)}
      </span>
    )
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      srcSet={authorAvatarSrcSet(author)}
      sizes={`${size}px`}
      /* The author's own alt text where they wrote one, their name otherwise.
         Never empty: a byline portrait is not decorative — it is one of the two
         things identifying who wrote the piece. */
      alt={author.avatarAlt || author.name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={cn(shared, 'bg-page')}
      style={{ width: size, height: size }}
    />
  )
}

import type { BlogPost } from '@/lib/blog'
import { cn } from '@/lib/utils'

/**
 * The line under a post's title: the byline description the admin writes for it.
 *
 * WHY THIS IS A COMPONENT AT ALL, when it is one paragraph. Every place a post appears —
 * the blog index cards, the tag archive, an author's page, the top of the post itself —
 * used to print `post.description` here, which is the SEO meta description: copy written
 * for a search result, front-loaded with keywords and cut near 160 characters. The client
 * flagged it on the card, and the fix is a rule rather than a string: this slot shows the
 * byline description or nothing. Putting the rule in one component, taking the POST rather
 * than a string, means a future card cannot quietly reach for `description` again.
 *
 * NO FALLBACK, deliberately. An empty field renders nothing, not the meta description.
 * Falling back was the old behaviour and it is exactly what was reported: a post nobody
 * wrote a byline for showed its search snippet where readers expected a sentence written
 * for them. A card with a title and no description reads as intended; a card repeating
 * its search snippet does not.
 *
 * Styling is the caller's, because the same sentence sits at four sizes on four surfaces.
 * Only the colour is fixed here, so it cannot drift between them.
 */
export function BylineDescription({
  post,
  className,
}: {
  post: Pick<BlogPost, 'excerpt'>
  className?: string
}) {
  const text = post.excerpt?.trim()
  if (!text) return null
  return <p className={cn('text-mut', className)}>{text}</p>
}

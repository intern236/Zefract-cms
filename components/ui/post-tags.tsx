import { TagLink } from '@/components/ui/tag-link'
import { cn } from '@/lib/utils'

/**
 * The "Tagged" row at the end of a post: the post's tags, each a link to its archive.
 *
 * A COMPONENT BECAUSE THERE ARE NOW TWO KINDS OF POST PAGE that end with it. The rich
 * editor's article prints it under the body; an HTML-page post prints it under the pasted
 * page. They have to look and behave the same — a reader should not be able to tell from
 * the tags which editor a post came from — and two copies of the markup would drift the
 * first time one was restyled.
 *
 * SAFE TO LINK, unlike a tag on a blog card. This row sits in ordinary page flow, so each
 * chip is just an anchor; the cards needed the stretched-link arrangement documented in
 * app/blog/page.tsx because a card is itself a link.
 *
 * Renders nothing for a post with no tags, so callers never have to guard it.
 */
export function PostTags({ tags, className }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null
  return (
    <div
      className={cn(
        'mx-auto flex max-w-[68ch] flex-wrap items-baseline gap-x-3 gap-y-2',
        className
      )}
    >
      <span className="font-mono text-[11px] tracking-[0.2em] text-mut-2 uppercase">Tagged</span>
      <ul className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag}>
            <TagLink tag={tag} />
          </li>
        ))}
      </ul>
    </div>
  )
}

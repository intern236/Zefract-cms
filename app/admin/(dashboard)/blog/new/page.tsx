import { PostEditor } from '@/components/admin/post-editor'
import { getAllAuthors } from '@/lib/authors'
import { toAuthorOption } from '@/lib/author-display'
import { getUsedCategories, getUsedTags } from '@/lib/blog'

/**
 * A blank editor. The post exists only once the first save lands, at which
 * point the editor replaces this URL with the post's own edit page.
 *
 * No wrapper: the editor brings the whole shell — top bar, section nav, panels.
 * What this page does fetch is the categories and tags already in use, so the
 * second post about a subject reuses the first one's spelling instead of
 * starting a near-duplicate.
 */
export default async function NewPostPage() {
  const [usedCategories, usedTags, authors] = await Promise.all([
    getUsedCategories(),
    getUsedTags(),
    getAllAuthors(),
  ])
  return (
    <PostEditor
      usedCategories={usedCategories}
      usedTags={usedTags}
      authors={authors.map(toAuthorOption)}
    />
  )
}

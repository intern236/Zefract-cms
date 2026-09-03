import { AuthorEditor } from '@/components/admin/author-editor'

/**
 * A blank author form. The record exists only once the first save lands, at
 * which point the editor replaces this URL with the author's own edit page —
 * the same arrangement as a new post, and for the same reason: a reload or a
 * second save must not be able to create a duplicate.
 *
 * Nothing to fetch. Unlike a new post, which loads the categories and tags
 * already in use, an author shares nothing with the authors before them.
 */
export default function NewAuthorPage() {
  return <AuthorEditor />
}

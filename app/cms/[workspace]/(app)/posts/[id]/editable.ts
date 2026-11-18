import 'server-only'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { requireWorkspace } from '@cms-logic/lib/auth/access'
import { canEditPost } from '@cms-logic/lib/content/post-access'
import { getPost } from '@cms-logic/lib/content/posts'
import { isId, readWorkspace } from '@cms-logic/lib/db'

/**
 * The post this person may edit, or a 404. Its own small read, so the page can
 * run it side by side with the editor's lists.
 */
export const editablePost = cache(async (slug: string, id: string) => {
  const access = await requireWorkspace(slug, 'posts.create')
  if (!isId(id)) notFound()
  const post = await readWorkspace(access.workspace.id, (tx) => getPost(tx, access.workspace.id, id))
  if (!post || !canEditPost(access, post)) notFound()
  return { access, post }
})

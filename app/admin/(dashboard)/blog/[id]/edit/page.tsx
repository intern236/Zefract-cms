import { notFound } from 'next/navigation'
import { PostEditor, type EditorPost } from '@/components/admin/post-editor'
import { getAllAuthors } from '@/lib/authors'
import { toAuthorOption } from '@/lib/author-display'
import { coverImageUrl, getPostById, getUsedCategories, getUsedTags } from '@/lib/blog'

/**
 * Loads the post server-side and hands the editor a SERIALISABLE copy: Dates
 * cannot cross into a client component's props, and the editor never needed
 * them — everPublished, the one thing derived from a date, travels as the
 * boolean it really is (it drives the slug lock).
 */
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, usedCategories, usedTags, authors] = await Promise.all([
    getPostById(id),
    getUsedCategories(),
    getUsedTags(),
    getAllAuthors(),
  ])
  if (!post) notFound()

  const editorPost: EditorPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    excerpt: post.excerpt,
    category: post.category,
    tags: post.tags,
    faqs: post.faqs,
    contentHtml: post.contentHtml,
    coverImage: post.coverImage,
    /* Only for a post whose cover predates Cloudinary — the editor shows it and
       offers to replace it, but cannot edit it in place. */
    legacyCoverUrl: post.coverImage ? null : coverImageUrl(post),
    coverAlt: post.coverAlt,
    coverCaption: post.coverCaption,
    seoTitle: post.seoTitle,
    focusKeyword: post.focusKeyword,
    authorId: post.authorId,
    status: post.status,
    everPublished: post.publishedAt !== null,
  }

  /* Keyed by id so navigating between posts remounts the editor with the right
     content instead of reusing the previous post's state. */
  return (
    <PostEditor
      key={post.id}
      post={editorPost}
      usedCategories={usedCategories}
      usedTags={usedTags}
      authors={authors.map(toAuthorOption)}
    />
  )
}

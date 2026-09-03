import { notFound } from 'next/navigation'
import { AuthorEditor } from '@/components/admin/author-editor'
import { countPostsByAuthor, getAuthorById } from '@/lib/authors'
import { getPublishedPostsByAuthor } from '@/lib/blog'

/**
 * Loads the author server-side and hands the form a SERIALISABLE copy: Dates
 * cannot cross into a client component's props, and the form never needed them.
 *
 * THE TWO DERIVED FACTS TRAVEL AS WHAT THEY REALLY ARE. `slugLocked` is a
 * boolean, not the published-post list it comes from, and `postCount` is a
 * number, not the posts. Both are decided here because both are questions about
 * the database, and the form should not be able to answer them differently from
 * the server that enforces them.
 */
export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const author = await getAuthorById(id)
  if (!author) notFound()

  const [published, postCount] = await Promise.all([
    getPublishedPostsByAuthor(author.id),
    countPostsByAuthor(author.id),
  ])

  /* Keyed by id so navigating between authors remounts the form with the right
     values instead of reusing the previous one's state. */
  return (
    <AuthorEditor
      key={author.id}
      author={{
        id: author.id,
        slug: author.slug,
        name: author.name,
        role: author.role,
        bio: author.bio,
        avatar: author.avatar,
        avatarAlt: author.avatarAlt,
        linkedinUrl: author.linkedinUrl,
        xUrl: author.xUrl,
        websiteUrl: author.websiteUrl,
      }}
      /* The same rule saveAuthor enforces: a profile with a published post has a
         URL that may already be indexed, linked and shared. */
      slugLocked={published.length > 0}
      postCount={postCount}
    />
  )
}

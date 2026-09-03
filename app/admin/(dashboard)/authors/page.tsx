import Link from 'next/link'
import { ExternalLink, Pencil, Plus } from 'lucide-react'
import { AdminBar } from '@/components/admin/admin-bar'
import { AdminShell } from '@/components/admin/admin-shell'
import { DeleteAuthorButton } from '@/components/admin/delete-author-button'
import { AuthorAvatar } from '@/components/ui/author-avatar'
import { logout } from '@/app/admin/login/actions'
import { getAllAuthors } from '@/lib/authors'
import { getAllPostsForAdmin } from '@/lib/blog'

/**
 * Every author, with what each of them has written.
 *
 * THE POST COUNT IS THE POINT OF THIS PAGE, not decoration. An author with no
 * posts has no public profile (see getPublicAuthors), so without the count a
 * list of names gives no way to tell who is actually visible on the site and who
 * is a record nobody has used yet. It is also what the delete dialog needs to
 * state, so it is fetched here and passed down rather than queried per row.
 *
 * ONE QUERY FOR ALL THE COUNTS. Asking per author is the N+1 that turns ten rows
 * into eleven round trips; the posts are already a single fetch, so the counts
 * are tallied in memory from that.
 *
 * Same row anatomy as the post list: the name is the link, the actions sit in
 * their own column, because a button inside an anchor is invalid HTML and reads
 * as one control to assistive tech.
 */

const ROW_ACTION =
  'inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12.5px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong'

export default async function AdminAuthorsPage() {
  const [authors, posts] = await Promise.all([getAllAuthors(), getAllPostsForAdmin()])

  const counts = new Map<string, { total: number; published: number }>()
  for (const post of posts) {
    if (!post.authorId) continue
    const entry = counts.get(post.authorId) ?? { total: 0, published: 0 }
    entry.total += 1
    if (post.status === 'published') entry.published += 1
    counts.set(post.authorId, entry)
  }
  const unassigned = posts.filter((post) => !post.authorId).length

  return (
    <AdminShell>
      <AdminBar
        title="Authors"
        actions={
          <>
            <Link
              href="/admin/blog"
              className="hidden h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[13px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong sm:inline-flex"
            >
              Posts
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-full px-3 text-[13px] font-semibold text-mut transition-colors hover:text-head"
              >
                Log out
              </button>
            </form>
            <Link
              href="/admin/authors/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              New author
            </Link>
          </>
        }
      />

      <main className="mt-4">
        {authors.length > 0 ? (
          <p className="mb-3 text-[13px] text-mut">
            {authors.length} {authors.length === 1 ? 'author' : 'authors'}
            {unassigned > 0 ? (
              <>
                {' · '}
                {unassigned} {unassigned === 1 ? 'post has' : 'posts have'} no author
              </>
            ) : null}
          </p>
        ) : null}

        {authors.length === 0 ? (
          <div className="rounded-tile border border-dashed border-line bg-surface p-12 text-center">
            <p className="font-mono text-[11px] tracking-[0.2em] text-mut uppercase">
              No authors yet
            </p>
            <p className="mx-auto mt-3 max-w-[52ch] text-[15px] text-mut">
              Add one, then pick them in a post&apos;s Author panel. Posts without an author keep
              the company byline, so nothing breaks while this is empty.
            </p>
            <Link
              href="/admin/authors/new"
              className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              New author
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {authors.map((author) => {
              const count = counts.get(author.id) ?? { total: 0, published: 0 }
              return (
                <li
                  key={author.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-tile border border-line bg-surface px-4 py-3 transition-colors hover:border-brand/40"
                >
                  <AuthorAvatar author={author} size={40} />

                  <div className="min-w-0 flex-1 basis-52">
                    <Link
                      href={`/admin/authors/${author.id}/edit`}
                      className="block truncate text-[15px] font-bold text-head transition-colors hover:text-brand-strong"
                    >
                      {author.name}
                    </Link>
                    <p className="mt-0.5 truncate text-[12.5px] text-mut-2">
                      {author.role ? (
                        <>
                          {author.role}
                          <span aria-hidden="true"> · </span>
                        </>
                      ) : null}
                      <span className="font-mono">/authors/{author.slug}</span>
                      <span aria-hidden="true"> · </span>
                      {count.total === 0
                        ? 'no posts'
                        : `${count.published} published${
                            count.total > count.published
                              ? `, ${count.total - count.published} draft`
                              : ''
                          }`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`/admin/authors/${author.id}/edit`} className={ROW_ACTION}>
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    {/* Only where there is a page to view. A profile with no
                        published post 404s by design, so offering the link
                        would be offering a broken one. */}
                    {count.published > 0 ? (
                      <Link href={`/authors/${author.slug}`} className={ROW_ACTION}>
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        View
                      </Link>
                    ) : null}
                    <DeleteAuthorButton
                      id={author.id}
                      name={author.name}
                      postCount={count.total}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </AdminShell>
  )
}

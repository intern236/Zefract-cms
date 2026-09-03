import Link from 'next/link'
import { ExternalLink, Pencil, Plus } from 'lucide-react'
import { AdminBar } from '@/components/admin/admin-bar'
import { AdminShell } from '@/components/admin/admin-shell'
import { StatusPill } from '@/components/admin/status-pill'
import { DeletePostButton } from '@/components/admin/delete-post-button'
import { logout } from '@/app/admin/login/actions'
import { getAllPostsForAdmin, formatPostDate } from '@/lib/blog'

/**
 * The admin's front page: every post, drafts and published together, newest
 * change first.
 *
 * EACH ROW CARRIES ITS OWN ACTIONS — Edit, View (published only) and Delete —
 * rather than being one big link. A row that is entirely an anchor cannot hold
 * a delete button, because a button inside an anchor is invalid HTML and reads
 * as one control to assistive tech. So the title is the link and the actions
 * sit in their own column, which is also what makes Delete reachable without a
 * trip into the editor.
 *
 * Dynamic by nature (the layout above reads the session cookie), so this list
 * is always live — no ISR to think about on the admin side.
 */

const ROW_ACTION =
  'inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12.5px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong'

export default async function AdminBlogListPage() {
  const posts = await getAllPostsForAdmin()
  const published = posts.filter((post) => post.status === 'published').length

  return (
    <AdminShell>
      <AdminBar
        title="Posts"
        actions={
          <>
            <Link
              href="/blog"
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[13px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong sm:inline-flex"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              View blog
            </Link>
            {/* A form, not a link: logout mutates (clears the cookie), and a
                GET that mutates is the thing prefetchers and crawlers trip. */}
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-full px-3 text-[13px] font-semibold text-mut transition-colors hover:text-head"
              >
                Log out
              </button>
            </form>
            <Link
              href="/admin/blog/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              New post
            </Link>
          </>
        }
      />

      <main className="mt-4">
        <div>
          {posts.length > 0 ? (
            <p className="mb-3 text-[13px] text-mut">
              {published} published · {posts.length - published} draft
            </p>
          ) : null}

          {posts.length === 0 ? (
            <div className="rounded-tile border border-dashed border-line bg-surface p-12 text-center">
              <p className="font-mono text-[11px] tracking-[0.2em] text-mut uppercase">
                No posts yet
              </p>
              <p className="mx-auto mt-3 max-w-[46ch] text-[15px] text-mut">
                The first one starts as a draft — nothing is public until you press Publish.
              </p>
              <Link
                href="/admin/blog/new"
                className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-hover"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                New post
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-tile border border-line bg-surface px-4 py-3 transition-colors hover:border-brand/40"
                >
                  <StatusPill status={post.status} className="shrink-0" />

                  <div className="min-w-0 flex-1 basis-52">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="block truncate text-[15px] font-bold text-head transition-colors hover:text-brand-strong"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-0.5 truncate font-mono text-[11.5px] text-mut-2">
                      /blog/{post.slug}
                      <span aria-hidden="true"> · </span>
                      {post.status === 'published' && post.publishedAt
                        ? `published ${formatPostDate(post.publishedAt)}`
                        : `edited ${formatPostDate(post.updatedAt)}`}
                      <span aria-hidden="true"> · </span>
                      {post.readingMinutes} min read
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`/admin/blog/${post.id}/edit`} className={ROW_ACTION}>
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    {post.status === 'published' ? (
                      <Link href={`/blog/${post.slug}`} className={ROW_ACTION}>
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        View
                      </Link>
                    ) : null}
                    <DeletePostButton id={post.id} title={post.title} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </AdminShell>
  )
}

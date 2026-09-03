import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Container, Section } from '@/components/ui/section'
import { PageHero } from '@/components/ui/page-hero'
import { getPostById, formatPostDate, coverImageUrl, coverImageSrcSet } from '@/lib/blog'
import { cn } from '@/lib/utils'

/**
 * A draft as its page would look, for the admin only.
 *
 * WHY IT EXISTS. Preview is a prominent control in the editor, and for a draft
 * there is nothing to point it at: /blog/[slug] deliberately 404s anything not
 * published. Rather than grey the button out for the state it is most useful
 * in — checking a post BEFORE it goes live — this renders the same components
 * the public page uses, behind the admin's auth boundary.
 *
 * It is inside the (dashboard) group, so requireAdmin() has already run in the
 * layout, robots.ts disallows /admin, and the layout's metadata marks it
 * noindex. The content is read with the admin accessor, which is the only one
 * that can see a draft at all.
 *
 * NOT A SECOND RENDERER. It composes PageHero and .blog-prose exactly as
 * app/blog/[slug]/page.tsx does. What it deliberately drops is everything that
 * would be wrong here: the CtaBand, the "more from the blog" list, the JSON-LD
 * and the metadata — a preview is for reading the post, not for being a page.
 */
export default async function PreviewPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPostById(id)
  if (!post) notFound()

  const cover = coverImageUrl(post)
  const stamp = post.publishedAt ?? post.updatedAt

  return (
    <>
      {/* The banner is the whole difference between this and the live page, so
          it is unmissable and states which of the two you are looking at. */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-brand/30 bg-brand/10 px-4 py-2.5 md:px-6">
        <Link
          href={`/admin/blog/${post.id}/edit`}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-strong transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to the editor
        </Link>
        <p className="text-[13px] text-head">
          <span className="font-bold">Preview</span>
          {post.status === 'published'
            ? ' — this post is live; the public page is the real thing.'
            : ' — this is a draft. Nobody else can see this page.'}
        </p>
      </div>

      <PageHero
        eyebrow={`${formatPostDate(stamp)} · ${post.readingMinutes} min read${
          post.category ? ` · ${post.category}` : ''
        }`}
        heading={post.title}
        sub={post.description}
      />

      <Section spacing="tight" className="pb-24">
        <Container>
          {/* No caption here either, and that is not the admin side changing:
              this page exists to show the post exactly as a visitor will see
              it. Leaving the caption in would make the preview claim something
              the published page does not do. */}
          {cover ? (
            <div className="relative aspect-21/9 overflow-hidden rounded-card bg-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover}
                  srcSet={coverImageSrcSet(post)}
                  sizes="(max-width: 1180px) 100vw, 1080px"
                  alt={post.coverAlt || post.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
          ) : null}

          {/* The stored HTML was sanitised on save — the allowlist in
              lib/blog.ts is why this dangerouslySetInnerHTML is not dangerous —
              and .blog-prose is the same class the published page renders it
              with, so this preview cannot look different from the real thing. */}
          <div
            className={cn('blog-prose mx-auto max-w-[68ch]', cover && 'mt-14')}
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {post.tags.length > 0 ? (
            <div className="mx-auto mt-12 flex max-w-[68ch] flex-wrap items-baseline gap-x-3 gap-y-2">
              <span className="font-mono text-[11px] tracking-[0.2em] text-mut-2 uppercase">
                Tagged
              </span>
              <ul className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-head"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { HtmlPost } from '@/components/blog/html-post'
import { Container, Section } from '@/components/ui/section'
import { PageHero } from '@/components/ui/page-hero'
import { FaqSection } from '@/components/sections/faq'
import { PostCta } from '@/components/sections/post-cta'
import { AuthorByline } from '@/components/ui/author-byline'
import { AuthorCard } from '@/components/ui/author-card'
import { TagLink } from '@/components/ui/tag-link'
import { getAuthorById } from '@/lib/authors'
import { extractBodyFaqs } from '@/lib/faq-extract'
import { FaqSchema } from '@/lib/schema'
import {
  getPostById,
  formatPostDate,
  coverImageUrl,
  coverImageSrcSet,
  renderablePostHtml,
  splitForMidCta,
} from '@/lib/blog'
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
/**
 * The banner, lifted out of the markup because there are now two renders that need it.
 *
 * It is the whole difference between this route and the live page, so it is unmissable and
 * states which of the two you are looking at. On an HTML post it is the ONLY thing on
 * screen that says "admin" — that format hides the site's own header — which is why it is
 * shared rather than duplicated with a comment asking someone to keep the two in step.
 */
function PreviewBanner({ post }: { post: { id: string; status: string } }) {
  return (
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
  )
}

export default async function PreviewPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPostById(id)
  if (!post) notFound()

  /**
   * AN HTML POST PREVIEWS AS THE PAGE.
   *
   * Everything below the banner is skipped for the same reasons app/blog/[slug]/page.tsx
   * skips it — see the note there. The banner itself stays: it is the one thing on screen
   * saying which of the two you are looking at, and it is the only chrome here the live
   * page will not have, which is exactly what a preview banner is for.
   *
   * NO SCHEMA, unlike the live page. A preview is not indexed — robots.txt disallows
   * /admin and the layout marks it noindex — so the conditional BlogPostingSchema there
   * has nothing to be right about here.
   */
  if (post.format === 'html') {
    return (
      <>
        <PreviewBanner post={post} />
        <HtmlPost html={post.contentHtml} />
      </>
    )
  }

  const cover = coverImageUrl(post)
  const stamp = post.publishedAt ?? post.updatedAt
  /* The same three derivations the published page makes, so the preview cannot
     differ from it on the parts a writer is here to check. */
  const author = post.authorId ? await getAuthorById(post.authorId) : null
  const midCta = splitForMidCta(renderablePostHtml(post.contentHtml))
  /* The same rule the published page applies: questions typed into the article become
     FAQ schema only when the FAQ panel is empty. See the note in app/blog/[slug]/page.tsx. */
  const bodyFaqs = post.faqs.length === 0 ? extractBodyFaqs(post.contentHtml) : []

  return (
    <>
      <PreviewBanner post={post} />

      <PageHero
        eyebrow={`${formatPostDate(stamp)} · ${post.readingMinutes} min read${
          post.category ? ` · ${post.category}` : ''
        }`}
        heading={post.title}
        /* The introduction where there is one, exactly as the published page
           resolves it — this page exists to show the post as a visitor will see
           it, so the two have to fall back the same way. */
        sub={post.excerpt || post.description}
      />

      <Section spacing="tight" className="pb-24">
        <Container>
          {/* No caption here either, and that is not the admin side changing:
              this page exists to show the post exactly as a visitor will see
              it. Leaving the caption in would make the preview claim something
              the published page does not do. */}
          {/* THE COVER IS 16:9, matching app/blog/[slug]/page.tsx exactly — see
              the note there for why that ratio and not the 21:9 both pages used
              to carry. This page exists to show the post as a visitor will see
              it, so a different cover ratio here would make the preview lie
              about the one thing it is for. */}
          {cover ? (
            <div className="relative aspect-16/9 overflow-hidden rounded-card bg-ink">
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

          {/* The byline sits below the banner, matching the published page —
              see the note there for why it moved out of the strip above it. */}
          <div className={cn('mx-auto max-w-[68ch] border-b border-line pb-6', cover && 'mt-12')}>
            <AuthorByline author={author} size="lg" />
          </div>

          {/* The stored HTML was sanitised on save — the allowlist in
              lib/blog.ts is why this dangerouslySetInnerHTML is not dangerous —
              and .blog-prose is the same class the published page renders it
              with, so this preview cannot look different from the real thing. */}
          {/* Split for the mid-article CTA exactly as the published page does,
              so the preview shows where the interruption actually lands — that
              placement is derived from the post's own length, so it is the one
              thing a writer cannot predict without seeing it. */}
          {midCta ? (
            <div className={cn(cover && 'mt-14')}>
              <div
                className="blog-prose mx-auto max-w-[68ch]"
                dangerouslySetInnerHTML={{ __html: midCta.before }}
              />
              <PostCta className="my-12" />
              <div
                className="blog-prose mx-auto max-w-[68ch]"
                dangerouslySetInnerHTML={{ __html: midCta.after }}
              />
            </div>
          ) : (
            <div
              className={cn('blog-prose mx-auto max-w-[68ch]', cover && 'mt-14')}
              dangerouslySetInnerHTML={{ __html: renderablePostHtml(post.contentHtml) }}
            />
          )}

          {post.tags.length > 0 ? (
            <div className="mx-auto mt-12 flex max-w-[68ch] flex-wrap items-baseline gap-x-3 gap-y-2">
              <span className="font-mono text-[11px] tracking-[0.2em] text-mut-2 uppercase">
                Tagged
              </span>
              <ul className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <TagLink tag={tag} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* The "written by" card, as the published page renders it. Nothing for
              a post under the company byline. */}
          <div className="mx-auto mt-12 max-w-[68ch]">
            <AuthorCard author={author} />
          </div>
        </Container>
      </Section>

      {/* The FAQ accordion, exactly as the published page renders it — including
          the FAQPage schema, which is worth having here precisely so it can be
          checked in a validator against the preview URL before the post is live. */}
      <FaqSection
        faqs={post.faqs}
        eyebrow="FAQ"
        heading="Frequently asked questions"
        spacing="compact"
      />
      <FaqSchema faqs={bodyFaqs} />
    </>
  )
}

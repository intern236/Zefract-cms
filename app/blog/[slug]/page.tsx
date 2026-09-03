import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import { AuthorByline } from '@/components/ui/author-byline'
import { BlogPostingSchema } from '@/lib/schema'
import { getAuthorById } from '@/lib/authors'
import {
  getPublishedPost,
  getPublishedPosts,
  formatPostDate,
  coverImageUrl,
  coverImageSrcSet,
} from '@/lib/blog'
import { ogUrl } from '@/lib/cloudinary/url'
import { clampDescription, pageOpenGraph } from '@/lib/seo'

/**
 * One blog post.
 *
 * ISR five minutes, the same arrangement as the index: the interval is the
 * backstop, revalidatePath from the admin's save action is what makes an edit
 * visible immediately. There is deliberately no generateStaticParams — posts
 * are born at runtime, so a slug is rendered on its first visit and cached,
 * which is also why an unpublish takes effect: the revalidated render finds
 * a draft, and drafts are 404s out here.
 */
export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post) return {}

  const description = clampDescription(post.description)
  const cover = coverImageUrl(post)
  /* The SEO title where the author set one, the headline otherwise. This is the
     only place the two differ: the <h1> on the page is always post.title. */
  const metaTitle = post.seoTitle || post.title

  return {
    title: metaTitle,
    description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    /* pageOpenGraph restates the full OG object — see lib/seo.ts for why a
       partial one silently drops og:image and friends. The cover, where one
       exists, then REPLACES the site-wide image: a share card should show the
       post, not the logo, and `images` is one more field the helper's object
       spread lets us override without losing the rest. */
    openGraph: {
      ...pageOpenGraph({ title: metaTitle, description, path: `/blog/${post.slug}` }),
      /* A Cloudinary cover gets the fixed 1200x630 share crop; a legacy blob is
         served as-is, which is what it did before. */
      ...(cover
        ? {
            images: [
              {
                url: post.coverImage ? ogUrl(post.coverImage.publicId) : cover,
                ...(post.coverImage ? { width: 1200, height: 630 } : {}),
                alt: post.coverAlt || post.title,
              },
            ],
          }
        : {}),
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post || !post.publishedAt) notFound()

  const cover = coverImageUrl(post)
  /* Two or three other recent posts, excluding this one. Recency stands in for
     relatedness until there are enough posts for tags to mean anything. */
  const more = (await getPublishedPosts()).filter((p) => p.slug !== post.slug).slice(0, 3)
  /* Null for a post with no author, and null for one whose author has since been
     deleted — both fall back to the company byline, which is what the page
     showed before authors existed. */
  const author = post.authorId ? await getAuthorById(post.authorId) : null

  return (
    <>
      <BlogPostingSchema
        title={post.title}
        description={post.description}
        slug={post.slug}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        imageUrl={cover}
        author={author}
      />
      <PageHero
        /* Category leads when there is one — it is the coarsest thing about the
           post and the fastest way for a reader to place it. */
        eyebrow={`${post.category ? `${post.category} · ` : ''}${formatPostDate(post.publishedAt)} · ${post.readingMinutes} min read`}
        heading={post.title}
        sub={post.description}
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Insights', href: '/blog' },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      <Section spacing="tight" className="pb-4">
        <Container>
          {/* UNDER THE HERO RATHER THAN INSIDE IT. <PageHero> takes an eyebrow,
              a heading and a standfirst, and the byline is none of the three —
              threading a photograph through it would have meant a fourth slot
              every other page then ignores. Here it reads the way a byline
              reads in print: after the headline and the standfirst, immediately
              before the piece itself.

              The date and reading time stay in the hero's eyebrow and are NOT
              repeated here — the byline answers who, the eyebrow answers when. */}
          <Reveal>
            <div className="mx-auto flex max-w-[68ch] items-center justify-between gap-4 border-b border-line pb-6">
              <AuthorByline author={author} size="lg" />
            </div>
          </Reveal>

          {cover ? (
            <Reveal>
              {/* NO CAPTION UNDER THE COVER, by request: on the page it read as
                  a stray line of grey text between the hero and the article
                  rather than as part of the image. The field stays in the
                  editor and the value is still stored — it is display that was
                  dropped, not the data — so putting it back is this element
                  and nothing else.

                  No <figure> either, therefore: a figure with no caption is a
                  wrapper that adds a semantic promise the markup no longer
                  keeps. */}
              <div className="relative aspect-21/9 overflow-hidden rounded-card bg-ink">
                  {/* The author's alt where they wrote one, the title as a
                      fallback: a poor description beats none at all. Plain img
                      over the DB-serving route; the wrapper owns the aspect
                      ratio, so no CLS. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    srcSet={coverImageSrcSet(post)}
                    sizes="(max-width: 1180px) 100vw, 1080px"
                    /* This is the page's largest image and sits above the fold,
                       so it is the LCP element — eager and high priority, the
                       opposite of the lazy cards on the index. */
                    fetchPriority="high"
                    alt={post.coverAlt || post.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
              </div>
            </Reveal>
          ) : null}

          <Reveal className={cover ? 'mt-14' : undefined}>
            {/* The stored HTML has already been through sanitizePostHtml on
                every save — the allowlist in lib/blog.ts is the reason this
                dangerouslySetInnerHTML is not dangerous. Styling comes from
                .blog-prose in globals.css, the same class the admin editor
                types into, so the page IS the preview. */}
            <div
              className="blog-prose mx-auto max-w-[68ch]"
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
          </Reveal>
        </Container>
      </Section>

      {more.length > 0 ? (
        <Section spacing="compact">
          <Container>
            <Reveal>
              <h2 className="text-[30px] font-extrabold tracking-[-0.03em] text-head">
                More from the blog
              </h2>
              <div className="mt-7 grid gap-4.5 md:grid-cols-3">
                {more.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="card-pop flex h-full flex-col rounded-card border border-line bg-surface p-7"
                  >
                    <p className="font-mono text-[12px] tracking-[0.16em] text-brand-strong uppercase sm:text-[11px]">
                      {p.publishedAt ? formatPostDate(p.publishedAt) : null} · {p.readingMinutes} min
                    </p>
                    <p className="mt-3 text-[17px] leading-snug font-bold text-head">{p.title}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </Container>
        </Section>
      ) : null}

      <CtaBand />
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HtmlPost } from '@/components/blog/html-post'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import { FaqSection } from '@/components/sections/faq'
import { PostCta } from '@/components/sections/post-cta'
import { AuthorByline } from '@/components/ui/author-byline'
import { AuthorCard } from '@/components/ui/author-card'
import { PostTags } from '@/components/ui/post-tags'
import { BlogPostingSchema, FaqSchema } from '@/lib/schema'
import { extractBodyFaqs } from '@/lib/faq-extract'
import { pageHasFaqSchema } from '@/lib/post-page-meta'
import { getAuthorById } from '@/lib/authors'
import {
  getPublishedPost,
  getPublishedPosts,
  getPublishedPostsByAuthor,
  formatPostDate,
  coverImageUrl,
  coverImageSrcSet,
  htmlPostDocument,
  renderablePostHtml,
  splitForMidCta,
} from '@/lib/blog'
import { ogUrl } from '@/lib/cloudinary/url'
import { pageOpenGraph } from '@/lib/seo'

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

  const doc = post.format === 'html' ? htmlPostDocument(post.contentHtml) : null

  const description = doc?.description || post.description
  const cover = coverImageUrl(post)
  const metaTitle = doc?.title || post.seoTitle || post.title

  return {
    title: metaTitle,
    description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      ...pageOpenGraph({ title: metaTitle, description, path: `/blog/${post.slug}` }),
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

  if (post.format === 'html') {
    const doc = htmlPostDocument(post.contentHtml)
    const htmlAuthor = post.authorId ? await getAuthorById(post.authorId) : null
    const htmlAuthorPostCount = htmlAuthor
      ? (await getPublishedPostsByAuthor(htmlAuthor.id)).length
      : 0
    return (
      <>
        {doc.hasStructuredData ? null : (
          <BlogPostingSchema
            title={doc.title || post.title}
            description={doc.description || post.description}
            slug={post.slug}
            publishedAt={post.publishedAt}
            updatedAt={post.updatedAt}
            imageUrl={coverImageUrl(post)}
            author={htmlAuthor}
          />
        )}
        <HtmlPost html={post.contentHtml} />

        {post.tags.length > 0 || htmlAuthor ? (
          <Section spacing="none" className="pb-4">
            <Container>
              <Reveal>
                <PostTags tags={post.tags} />
              </Reveal>
              {htmlAuthor ? (
                <Reveal className={post.tags.length > 0 ? 'mt-12' : undefined}>
                  <div className="mx-auto max-w-[68ch]">
                    <AuthorCard author={htmlAuthor} postCount={htmlAuthorPostCount} />
                  </div>
                </Reveal>
              ) : null}
            </Container>
          </Section>
        ) : null}

        <FaqSection
          faqs={post.faqs}
          eyebrow="FAQ"
          heading="Frequently asked questions"
          spacing="compact"
          schema={!pageHasFaqSchema(doc.head)}
        />
      </>
    )
  }

  const cover = coverImageUrl(post)
  const more = (await getPublishedPosts()).filter((p) => p.slug !== post.slug).slice(0, 3)
  const midCta = splitForMidCta(renderablePostHtml(post.contentHtml))
  /* Null for a post with no author, and null for one whose author has since been
     deleted — both fall back to the company byline. */
  const author = post.authorId ? await getAuthorById(post.authorId) : null
  const authorPostCount = author ? (await getPublishedPostsByAuthor(author.id)).length : 0
  const bodyFaqs = post.faqs.length === 0 ? extractBodyFaqs(post.contentHtml) : []

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
        eyebrow={`${post.category ? `${post.category} · ` : ''}${formatPostDate(post.publishedAt)} · ${post.readingMinutes} min read`}
        heading={post.title}
        sub={post.excerpt?.trim() || undefined}
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Insights', href: '/blog' },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      <Section spacing="tight" className="pb-4">
        <Container>
          {cover ? (
            <Reveal>
              <div className="relative mx-auto aspect-16/9 max-w-[68ch] overflow-hidden rounded-card bg-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover}
                  srcSet={coverImageSrcSet(post)}
                  sizes="(max-width: 652px) 100vw, 605px"
                  fetchPriority="high"
                  alt={post.coverAlt || post.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </Reveal>
          ) : null}

          {/* Author byline strip — sits below the cover, above the article body. */}
          <Reveal className={cover ? 'mt-12' : undefined}>
            <div className="mx-auto max-w-[68ch] border-b border-line pb-6">
              <AuthorByline author={author} size="lg" />
            </div>
          </Reveal>

          <Reveal className="mt-10">
            {midCta ? (
              <>
                <div
                  className="blog-prose mx-auto max-w-[68ch]"
                  dangerouslySetInnerHTML={{ __html: midCta.before }}
                />
                <PostCta className="my-12" />
                <div
                  className="blog-prose mx-auto max-w-[68ch]"
                  dangerouslySetInnerHTML={{ __html: midCta.after }}
                />
              </>
            ) : (
              <div
                className="blog-prose mx-auto max-w-[68ch]"
                dangerouslySetInnerHTML={{ __html: renderablePostHtml(post.contentHtml) }}
              />
            )}

            <PostTags tags={post.tags} className="mt-12" />
          </Reveal>

          {/* "Written by" card — after the article, before related posts. */}
          <Reveal className="mt-12">
            <div className="mx-auto max-w-[68ch]">
              <AuthorCard author={author} postCount={authorPostCount} />
            </div>
          </Reveal>
        </Container>
      </Section>

      <FaqSection
        faqs={post.faqs}
        eyebrow="FAQ"
        heading="Frequently asked questions"
        spacing="compact"
      />
      <FaqSchema faqs={bodyFaqs} />

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

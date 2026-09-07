import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import { TagLink } from '@/components/ui/tag-link'
import {
  coverImageSrcSet,
  coverImageUrl,
  formatPostDate,
  getPublishedPostsByTag,
  getPublishedTags,
} from '@/lib/blog'
import { pageOpenGraph } from '@/lib/seo'

/**
 * Everything published under one tag.
 *
 * WHY IT EXISTS. Tags were printed on every post and on every card and went
 * nowhere, which is the worst version of a tag: it looks like a control, reads
 * like a promise of more on the subject, and does nothing when pressed. This is
 * the page that promise was pointing at.
 *
 * ISR five minutes, the same arrangement as /blog and a post: the interval is
 * the backstop and revalidatePath from the admin's save action is what makes a
 * retagged post appear here immediately. There is deliberately no
 * generateStaticParams — tags are invented at runtime by whoever is writing, so
 * an archive renders on its first visit and is cached from then on.
 *
 * A TAG WITH NO PUBLISHED POSTS IS A 404, not an empty page. Any string can be
 * put in this URL, so without that check the site would serve an infinite
 * number of blank, indexable archives to anyone who tried — the classic way a
 * tag system turns into thin-content crawl waste.
 */
export const revalidate = 300

/**
 * The tag as it is written, recovered from the posts that carry it.
 *
 * The URL only holds the slug, and a slug cannot be turned back into its
 * display form — `ai-ml` gives no way to know whether it was "AI/ML" or "AI ML".
 * So the spelling is read from the posts, which is also what keeps the heading
 * on this page identical to the chip the reader clicked to reach it.
 */
async function resolveTag(slug: string) {
  const tags = await getPublishedTags()
  return tags.find((entry) => entry.slug === slug) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag: slug } = await params
  const entry = await resolveTag(slug)
  if (!entry) return {}

  const title = `${entry.tag} articles`
  const description =
    `Every Zefract article tagged ${entry.tag} — ` +
    `${entry.count} ${entry.count === 1 ? 'piece' : 'pieces'} on the subject, newest first.`

  return {
    title,
    description,
    alternates: { canonical: `/blog/tag/${entry.slug}` },
    openGraph: pageOpenGraph({ title, description, path: `/blog/tag/${entry.slug}` }),
    /**
     * INDEXED, BUT NOT OFFERED AS A DESTINATION. `follow` is what matters here:
     * the links out to the posts are the point, and this page exists to pass a
     * reader and a crawler along them.
     *
     * `index` stays true because these archives are genuinely useful — a page
     * collecting everything on one subject is what someone searching that
     * subject wants. It is worth revisiting if the blog ever grows a long tail
     * of one-post tags, which is where archives start competing with the posts
     * they list rather than helping them.
     */
    robots: { index: true, follow: true },
  }
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag: slug } = await params
  const entry = await resolveTag(slug)
  if (!entry) notFound()

  const posts = await getPublishedPostsByTag(entry.slug)
  /* Cannot be empty — getPublishedTags is derived from published posts, so a tag
     that resolves has at least one. Checked anyway, because the alternative if
     that ever stops being true is a heading over nothing. */
  if (posts.length === 0) notFound()

  /* The other tags, for a reader who wants a neighbouring subject rather than
     this one. Excludes the current tag: a chip linking to the page you are on is
     a dead control, which is the fault this whole feature exists to fix. */
  const others = (await getPublishedTags()).filter((other) => other.slug !== entry.slug)

  return (
    <>
      <PageHero
        eyebrow="Tagged"
        heading={entry.tag}
        sub={`${posts.length} ${posts.length === 1 ? 'article' : 'articles'} on this subject, newest first.`}
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Insights', href: '/blog' },
          { name: entry.tag, href: `/blog/tag/${entry.slug}` },
        ]}
      />

      <Section spacing="tight" className="pb-24">
        <Container>
          <ul className="grid gap-4.5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const cover = coverImageUrl(post, 640)
              return (
                <li key={post.id}>
                  <Reveal>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="card-pop group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface"
                    >
                      {cover ? (
                        <div className="relative aspect-16/9 overflow-hidden bg-ink">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cover}
                            srcSet={coverImageSrcSet(post)}
                            sizes="(max-width: 768px) 100vw, (max-width: 1180px) 50vw, 380px"
                            /* Empty, not the title: the card's own heading sits
                               directly beside it, and naming the image the same
                               thing would announce every post twice. */
                            alt={post.coverAlt ?? ''}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-1 flex-col p-7">
                        <p className="font-mono text-[12px] tracking-[0.16em] text-brand-strong uppercase sm:text-[11px]">
                          {post.category ? `${post.category} · ` : null}
                          {post.publishedAt ? formatPostDate(post.publishedAt) : null} ·{' '}
                          {post.readingMinutes} min read
                        </p>
                        <h2 className="mt-3 text-[19px] leading-snug font-bold tracking-[-0.02em] text-head">
                          {post.title}
                        </h2>
                        <p className="mt-2.5 flex-1 text-[14.5px] text-mut">
                          {post.description}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              )
            })}
          </ul>

          {others.length > 0 ? (
            <div className="mt-16 border-t border-line pt-8">
              <p className="font-mono text-[11px] tracking-[0.2em] text-mut uppercase">
                Other tags
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {others.map((other) => (
                  <li key={other.slug}>
                    <TagLink tag={other.tag} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </Section>

      <CtaBand />
    </>
  )
}

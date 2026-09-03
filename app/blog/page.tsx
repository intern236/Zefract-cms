import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import {
  getPublishedPosts,
  formatPostDate,
  coverImageUrl,
  coverImageSrcSet,
  type BlogPost,
} from '@/lib/blog'
import { authoredMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  ...authoredMetadata('/blog'),
  keywords: ['software engineering blog', 'shipping software', 'Zefract insights'],
}

/**
 * ISR, five minutes. The number is a backstop, not the mechanism: publishing
 * from the admin calls revalidatePath on this page, so a new post appears
 * immediately — the interval only exists so an edit made outside the admin
 * (straight in the database) still surfaces without a deploy.
 */
export const revalidate = 300

/** The date · reading-time line every card carries, in the site's mono-label voice. */
function PostMeta({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <p className={className ?? 'font-mono text-[12px] tracking-[0.16em] text-brand-strong uppercase sm:text-[11px]'}>
      {post.category ? `${post.category} · ` : null}
      {post.publishedAt ? formatPostDate(post.publishedAt) : null} · {post.readingMinutes} min read
    </p>
  )
}

function CoverImage({ post }: { post: BlogPost }) {
  const url = coverImageUrl(post)
  if (!url) return null
  return (
    /* Plain img, not next/image: the bytes come from our own MongoDB-backed
       route, already sized by the admin and cached immutable — the optimizer
       would only add a proxy hop in front of a URL it cannot improve. The
       wrapper fixes the aspect ratio, so a slow image cannot shift layout.
       alt is empty because the card's own title sits beside it — naming the
       image the same thing would announce every post twice. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      /* srcSet is undefined for a legacy MongoDB-stored cover — one blob has no
         other sizes to offer. Cloudinary covers get the full set, so a phone
         fetches 640px instead of 1920. */
      srcSet={coverImageSrcSet(post)}
      sizes="(max-width: 768px) 100vw, (max-width: 1180px) 50vw, 380px"
      /* The author's alt where they wrote one. Empty otherwise, not the title:
         the card's own heading sits right beside it, and naming the image the
         same thing would announce every post twice. */
      alt={post.coverAlt ?? ''}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  )
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()
  const [featured, ...rest] = posts
  const featuredCover = featured ? coverImageUrl(featured) : null

  return (
    <>
      <PageHero
        eyebrow="Insights"
        heading="Zefract Blogs: Insights from the Industry"
        sub="Writing about the parts of shipping software that only show up after launch."
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Insights', href: '/blog' },
        ]}
      />

      <Section spacing="tight" className="pb-24">
        <Container>
          {posts.length === 0 ? (
            /* The pre-first-post state — the same card the shell page carried,
               so the page never breaks while the blog is empty. */
            <Reveal>
              <div className="rounded-card border border-dashed border-line bg-surface p-12 text-center">
                <p className="font-mono text-[12px] tracking-[0.2em] text-mut uppercase sm:text-[11px]">
                  Coming soon
                </p>
                <p className="mx-auto mt-4 max-w-[46ch] text-[16.5px] text-mut">
                  The first articles are being written. In the meantime, the case studies in{' '}
                  <Link href="/work" className="font-semibold text-head underline-offset-4">
                    our work
                  </Link>{' '}
                  cover the same ground with real numbers attached.
                </p>
              </div>
            </Reveal>
          ) : (
            <>
              {/* The newest post, full width — the same lead-item treatment the
                  home page gives its featured case study.

                  THE TWO-COLUMN SPLIT EXISTS ONLY WHEN THERE IS A COVER. A post
                  published without one gets the whole card for its words —
                  never an empty half, and never a tinted block standing in for
                  a photo nobody chose. An owner who skips images should get a
                  page that looks designed that way, not one with a hole in it. */}
              <Reveal>
                <Link
                  href={`/blog/${featured.slug}`}
                  className={cn(
                    'card-pop group grid grid-cols-1 overflow-hidden rounded-card border border-line bg-surface',
                    featuredCover && 'lg:grid-cols-[1.05fr_0.95fr]'
                  )}
                >
                  {featuredCover ? (
                    <div className="relative aspect-16/9 overflow-hidden bg-ink lg:aspect-auto lg:min-h-[340px]">
                      <CoverImage post={featured} />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(185deg,rgba(0,51,102,0.18)_10%,rgba(8,20,34,0.35)_88%)]"
                      />
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      'flex flex-col justify-center p-8 md:p-10',
                      /* Text-only lead card: a little more air, since the type
                         is the whole composition now. */
                      !featuredCover && 'md:p-12'
                    )}
                  >
                    <PostMeta post={featured} />
                    <h2 className="mt-4 text-[clamp(1.5rem,2.6vw,2rem)] leading-tight font-extrabold tracking-[-0.03em] text-balance text-head">
                      {featured.title}
                    </h2>
                    <p className="mt-4 max-w-[52ch] text-[16px] text-mut">{featured.description}</p>
                    {featured.tags.length > 0 ? (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {featured.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-line bg-page px-3 py-1.5 text-[12.5px] font-semibold text-head"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Link>
              </Reveal>

              {rest.length > 0 ? (
                <Stagger className="mt-8 grid gap-4.5 md:grid-cols-2 lg:grid-cols-3" step={0.06}>
                  {rest.map((post) => (
                    <StaggerItem key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="card-pop group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface"
                      >
                        {coverImageUrl(post) ? (
                          <div className="relative aspect-16/9 overflow-hidden bg-ink">
                            <CoverImage post={post} />
                          </div>
                        ) : null}
                        <div className="flex flex-1 flex-col p-7">
                          <PostMeta post={post} />
                          <h2 className="mt-3 text-[19px] leading-snug font-bold tracking-[-0.02em] text-head">
                            {post.title}
                          </h2>
                          <p className="mt-2.5 flex-1 text-[14.5px] text-mut">{post.description}</p>
                          {post.tags.length > 0 ? (
                            <div className="mt-5 flex flex-wrap gap-2">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-line bg-page px-3 py-1 text-[12px] font-semibold text-head"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : null}
            </>
          )}
        </Container>
      </Section>

      <CtaBand />
    </>
  )
}

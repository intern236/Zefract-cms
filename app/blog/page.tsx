import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import { BylineDescription } from '@/components/ui/byline-description'
import { TagLink } from '@/components/ui/tag-link'
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

/**
 * A card's tags, as real links to their archives.
 *
 * WHY THIS COULD NOT EXIST BEFORE, AND WHAT CHANGED. Each card used to be one <Link>
 * wrapping its whole surface, so the chips inside it were plain spans: an anchor nested in
 * an anchor is invalid HTML, and browsers repair it unpredictably. Clicking a tag clicked
 * the card, and the reader landed on the post rather than the tag page, which is exactly
 * what the client reported. The cards are now STRETCHED-LINK cards (see the note on the
 * grid below): the title is the one real link and its ::after covers the card, which
 * leaves these free to be links of their own.
 *
 * `data-card-above` LIFTS THEM OVER THE STRETCHED LINK. Without it the title's ::after
 * sits on top of the chips and swallows every click, which would put back the bug this
 * exists to fix while looking right. The rule is in globals.css beside the card rules.
 *
 * <TagLink>, not a chip built here, so the URL, the slug and the accessible name come from
 * the one definition every other tag on the site uses. `className` only restates the
 * card's quieter chip: the page-coloured fill that reads against a white card, and, on the
 * grid, the slightly smaller size those cards have always used.
 */
function CardTags({ tags, className }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null
  return (
    <ul data-card-above className="mt-5 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <TagLink tag={tag} className={cn('bg-page', className)} />
        </li>
      ))}
    </ul>
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
                {/* An <article>, not a <Link>: see the note on the grid cards below for the
                    stretched-link pattern both cards now share. */}
                <article
                  data-card
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
                      <Link href={`/blog/${featured.slug}`} data-card-link>
                        {featured.title}
                      </Link>
                    </h2>
                    {/* The byline description, not the meta description, and nothing when it
                        is empty. See components/ui/byline-description.tsx. */}
                    <BylineDescription
                      post={featured}
                      className="mt-4 line-clamp-4 max-w-[52ch] text-[16px]"
                    />
                    <CardTags tags={featured.tags} />
                  </div>
                </article>
              </Reveal>

              {rest.length > 0 ? (
                <Stagger className="mt-8 grid gap-4.5 md:grid-cols-2 lg:grid-cols-3" step={0.06}>
                  {rest.map((post) => (
                    <StaggerItem key={post.slug}>
                      {/**
                       * A STRETCHED-LINK CARD, which is what lets a tag on it be a link.
                       *
                       * The card used to be one <Link> around everything. That made the
                       * whole surface a single target, which is right for a card, and made
                       * the tags inside it dead text, which the client reported: clicking
                       * "Paid advertising" opened the post instead of the tag page, and the
                       * tag page existed with nothing on the listing pointing at it.
                       *
                       * NOW THE TITLE IS THE ONLY LINK, and its ::after is stretched over the
                       * whole card (the [data-card-link] rule in globals.css), so a click
                       * anywhere on the card still opens the post — the image, the date,
                       * the description, the padding. The tags sit one layer above that
                       * overlay and are links of their own. Two separate targets, no anchor
                       * inside another, valid HTML.
                       *
                       * THE LINK'S NAME GOT BETTER AS A SIDE EFFECT. As a wrapper, the link
                       * was announced as the title, the date, the whole description and
                       * every tag run together. Now it is announced as the title, which is
                       * what a link to an article should be called.
                       *
                       * HOVER, FOCUS AND THE WASH are unchanged to look at, but they are now
                       * driven from [data-card] rather than from the card being an anchor —
                       * see globals.css for the three rules that moved.
                       */}
                      <article
                        data-card
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
                            <Link href={`/blog/${post.slug}`} data-card-link>
                              {post.title}
                            </Link>
                          </h2>
                          {/* The wrapper keeps `flex-1` whether or not there is a description, so
                              the tags stay pinned to the bottom of every card in the row and a
                              post without a byline does not leave its chips floating halfway up.
                              line-clamp-3 keeps a long byline from making one card taller than
                              its neighbours. */}
                          <div className="flex-1">
                            <BylineDescription
                              post={post}
                              className="mt-2.5 line-clamp-3 text-[14.5px]"
                            />
                          </div>
                          {/* Three at most, as before: a grid card is a teaser, and the post
                              page carries the full set. There is no separate "Browse by tag"
                              row on this page any more — the client asked for tags on the
                              cards only — so a fourth tag is reached from the post itself. */}
                          <CardTags tags={post.tags.slice(0, 3)} className="py-1 text-[12px]" />
                        </div>
                      </article>
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

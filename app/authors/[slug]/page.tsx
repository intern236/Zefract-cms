import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Globe } from 'lucide-react'
import { Container, Section } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import { AuthorAvatar } from '@/components/ui/author-avatar'
import { BylineDescription } from '@/components/ui/byline-description'
import { LinkedInGlyph, XGlyph } from '@/components/ui/social-icons'
import { PersonSchema } from '@/lib/schema'
import { authorLinks, getAuthorBySlug, getPublicAuthors } from '@/lib/authors'
import { coverImageUrl, formatPostDate, getPublishedPostsByAuthor } from '@/lib/blog'
import { avatarUrl } from '@/lib/cloudinary/url'
import { clampDescription, pageOpenGraph } from '@/lib/seo'

/**
 * One author, and everything they have published.
 *
 * ISR five minutes, the same arrangement as a post: the interval is the
 * backstop, and revalidatePath from the admin's save action is what makes an
 * edit visible immediately. There is deliberately no generateStaticParams —
 * authors are created at runtime, so a profile renders on its first visit and is
 * cached from then on.
 *
 * A PROFILE WITH NOTHING PUBLISHED IS A 404, not an empty page. An author record
 * can exist for someone whose first post is still a draft; giving them a public
 * URL then would hand a crawler a page with a photograph and no content, and
 * leak that unpublished work exists. The page appears the moment their first
 * post goes live — which is also the moment the slug locks.
 */
export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) return {}

  const posts = await getPublishedPostsByAuthor(author.id)
  if (posts.length === 0) return {}

  /* The bio where they wrote one; a stated fact otherwise. Never the site
     description — a profile inheriting the home page's copy is the duplicate a
     crawl report flags, and it would say nothing about this person. */
  const description = clampDescription(
    author.bio ||
      `${author.name}${author.role ? `, ${author.role}` : ''} at Zefract. ` +
        `${posts.length} ${posts.length === 1 ? 'article' : 'articles'} on engineering, design, AI, cloud and growth.`
  )
  const title = `${author.name}${author.role ? ` — ${author.role}` : ''}`

  return {
    title,
    description,
    alternates: { canonical: `/authors/${author.slug}` },
    openGraph: {
      ...pageOpenGraph({ title, description, path: `/authors/${author.slug}` }),
      type: 'profile',
      /* The portrait as the share card where there is one. Square rather than
         1200x630 — a face cropped to a letterbox loses the top of the head, and
         every platform re-crops anyway. */
      ...(author.avatar ? { images: [{ url: avatarUrl(author.avatar.publicId, 640) }] } : {}),
    },
  }
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) notFound()

  const posts = await getPublishedPostsByAuthor(author.id)
  if (posts.length === 0) notFound()

  const links = authorLinks(author)
  const others = (await getPublicAuthors()).filter((other) => other.id !== author.id)

  return (
    <>
      <PersonSchema author={author} postCount={posts.length} />

      {/* Not <PageHero>: that centres a heading over a standfirst, and a profile
          leads with a face beside a name. The grid and glow are the same, so it
          still reads as one of this site's page tops. */}
      <section className="hero-grid relative isolate overflow-clip pt-36 pb-14 md:pt-44">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-8 text-[13.5px] text-mut">
            <ol className="flex flex-wrap items-center gap-x-2">
              <li>
                <Link href="/" className="transition-colors hover:text-head">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-head">
                  Blog
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-head">{author.name}</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-9">
            <AuthorAvatar
              author={author}
              size={132}
              className="ring-4 ring-surface shadow-[0_18px_40px_-20px_rgba(8,20,34,0.4)]"
            />

            <div className="min-w-0 flex-1">
              <p className="font-mono text-[12px] tracking-[0.14em] text-mut uppercase sm:text-[11px] sm:tracking-[0.2em]">
                Author
              </p>
              <h1 className="mt-3 text-[clamp(2.25rem,5.5vw,3.5rem)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance text-head">
                {author.name}
              </h1>
              {author.role ? (
                <p className="mt-2.5 text-[17.5px] font-semibold text-brand-strong">{author.role}</p>
              ) : null}
              {author.bio ? (
                /* Plain text, printed as text — see the note on Author.bio.
                   `whitespace-pre-line` is what keeps a two-paragraph bio in two
                   paragraphs without needing HTML to express it. */
                <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed whitespace-pre-line text-mut">
                  {author.bio}
                </p>
              ) : null}

              {links.length > 0 ? (
                <ul className="mt-6 flex flex-wrap items-center gap-2.5">
                  {links.map((link) => (
                    <li key={link.kind}>
                      <a
                        href={link.url}
                        target="_blank"
                        /* `nofollow` as well as noopener: these are addresses the
                           author typed about themselves, and passing site
                           authority to whatever they linked is not something a
                           byline should do. */
                        rel="noopener noreferrer nofollow"
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong"
                      >
                        {link.kind === 'linkedin' ? (
                          <LinkedInGlyph className="size-3.5" />
                        ) : link.kind === 'x' ? (
                          <XGlyph className="size-3.5" />
                        ) : (
                          <Globe className="size-3.5" aria-hidden="true" />
                        )}
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <Section spacing="tight" className="pb-24">
        <Container>
          <h2 className="text-[26px] font-extrabold tracking-[-0.025em] text-head">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          </h2>

          <ul className="mt-8 grid gap-4.5 md:grid-cols-2">
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
                            alt={post.coverAlt || post.title}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-1 flex-col p-6">
                        <p className="font-mono text-[11px] tracking-[0.16em] text-mut-2 uppercase">
                          {post.publishedAt ? formatPostDate(post.publishedAt) : null}
                          <span aria-hidden="true"> · </span>
                          {post.readingMinutes} min read
                        </p>
                        <p className="mt-3 text-[19px] leading-snug font-bold text-balance text-head">
                          {post.title}
                        </p>
                        {/* The byline description, as on every other post card. */}
                        <BylineDescription post={post} className="mt-2.5 line-clamp-3 text-[15px]" />
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
                Other authors
              </p>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {others.map((other) => (
                  <li key={other.id}>
                    <Link
                      href={`/authors/${other.slug}`}
                      className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pr-4 pl-1.5 text-[13.5px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong"
                    >
                      <AuthorAvatar author={other} size={28} />
                      {other.name}
                    </Link>
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

import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import { AuthorAvatar } from '@/components/ui/author-avatar'
import { getPublicAuthors } from '@/lib/authors'
import { getPublishedPosts } from '@/lib/blog'
import { authoredMetadata } from '@/lib/seo'

/**
 * Everyone who writes here.
 *
 * ISR five minutes, the same as /blog and for the same reason: the interval is
 * the backstop and revalidatePath from the admin's save action is what makes a
 * new author appear immediately.
 *
 * ONLY AUTHORS WITH SOMETHING PUBLISHED, which getPublicAuthors enforces — see
 * the note there. That also means this page can be empty, and an empty state is
 * a real state rather than a bug: before the first author is credited on a
 * published post there is genuinely nobody to list.
 *
 * THE POST COUNT IS TALLIED FROM ONE FETCH, not queried per author. Asking each
 * author for their count is the N+1 that turns six cards into seven round trips;
 * the published posts are already one query, so the counts come out of it.
 */
export const revalidate = 300

export const metadata: Metadata = authoredMetadata('/authors')

export default async function AuthorsPage() {
  const [authors, posts] = await Promise.all([getPublicAuthors(), getPublishedPosts()])

  const counts = new Map<string, number>()
  for (const post of posts) {
    if (post.authorId) counts.set(post.authorId, (counts.get(post.authorId) ?? 0) + 1)
  }

  return (
    <>
      <PageHero
        eyebrow="Authors"
        heading="The people writing it."
        sub="Every article here is written by someone who works on this for a living. These are them."
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Blog', href: '/blog' },
          { name: 'Authors', href: '/authors' },
        ]}
      />

      <Section spacing="tight" className="pb-24">
        <Container>
          {authors.length === 0 ? (
            <Reveal>
              <div className="rounded-card border border-dashed border-line bg-surface p-12 text-center">
                <p className="font-mono text-[12px] tracking-[0.2em] text-mut uppercase sm:text-[11px]">
                  Coming soon
                </p>
                <p className="mx-auto mt-4 max-w-[46ch] text-[16.5px] text-mut">
                  Bylines arrive with the next few articles. In the meantime,{' '}
                  <Link href="/blog" className="font-semibold text-head underline-offset-4">
                    the blog
                  </Link>{' '}
                  is where the writing is.
                </p>
              </div>
            </Reveal>
          ) : (
            <Stagger className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3" step={0.06}>
              {authors.map((author) => {
                const count = counts.get(author.id) ?? 0
                return (
                  <StaggerItem key={author.id}>
                    <Link
                      href={`/authors/${author.slug}`}
                      className="card-pop flex h-full flex-col items-start rounded-card border border-line bg-surface p-7"
                    >
                      <AuthorAvatar author={author} size={72} />
                      <p className="mt-5 text-[19px] leading-snug font-bold text-head">
                        {author.name}
                      </p>
                      {author.role ? (
                        <p className="mt-1 text-[13.5px] font-semibold text-brand-strong">
                          {author.role}
                        </p>
                      ) : null}
                      {author.bio ? (
                        <p className="mt-3 line-clamp-3 text-[14.5px] text-mut">{author.bio}</p>
                      ) : null}
                      <p className="mt-auto pt-5 font-mono text-[11px] tracking-[0.16em] text-mut-2 uppercase">
                        {count} {count === 1 ? 'article' : 'articles'}
                      </p>
                    </Link>
                  </StaggerItem>
                )
              })}
            </Stagger>
          )}
        </Container>
      </Section>

      <CtaBand />
    </>
  )
}

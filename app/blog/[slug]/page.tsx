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

  /**
   * THE AUTHOR'S OWN WORDS, PUBLISHED WHOLE. This used to be
   * `clampDescription(post.description)`, which cut every post's meta
   * description at 155 characters on a word boundary — so a description written
   * deliberately in the editor, inside the limit the editor showed, arrived in
   * the page source with its last clause missing and nothing anywhere saying so.
   *
   * THE CLAMP WAS NEVER MEANT FOR THIS FIELD. lib/seo.ts says so in its own
   * opening: the helpers exist because the other descriptions on this site are
   * "built from body copy, so their length is whatever the sentence happened to
   * be rather than anything anyone chose". That is true of a pillar blurb and a
   * case study's problem statement, which is why those call sites keep it. A
   * blog post's description is typed into a field by a person, against a
   * character counter, for exactly this purpose. Trimming it is overruling them.
   *
   * WHAT REPLACES THE CLAMP IS ADVICE, NOT SILENCE. The SEO panel still measures
   * the description against what a result actually displays, shows the cut in
   * its preview, and flags it in the checks — so the writer sees the trade
   * before publishing and decides. A long description is indexed perfectly well;
   * only its tail is dropped from the snippet, and Google frequently rewrites
   * the snippet regardless.
   *
   * ─────────────────────────────────────────────────────────────────────────
   * A PASTED PAGE'S OWN HEAD WINS, where it has one.
   *
   * An HTML post arrives as a whole document, and "SEO included" was most of the point of
   * asking for the format: its `<title>` and `<meta name="description">` were written for
   * this page by whoever built it. Those tags cannot be emitted from the body — the root
   * layout owns the real head — so they are lifted out here and handed to Next's metadata,
   * which puts them where they belong.
   *
   * THE POST'S OWN FIELDS STILL STAND BEHIND THEM. A page pasted as a fragment has no head
   * at all, and the editor's Title and SEO panels are filled in either way because the blog
   * index, the sitemap and the share card all read them. So this is an override, not a
   * replacement: whichever exists, with the document's version first.
   */
  const doc = post.format === 'html' ? htmlPostDocument(post.contentHtml) : null

  const description = doc?.description || post.description
  const cover = coverImageUrl(post)
  /* The SEO title where the author set one, the headline otherwise. This is the
     only place the two differ: the <h1> on the page is always post.title. */
  const metaTitle = doc?.title || post.seoTitle || post.title

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

  /**
   * AN HTML POST IS THE BODY, INSIDE THE SITE.
   *
   * It renders with the real header and footer, in the same section and gutter every
   * other page gets. The first version hid the chrome so the pasted document owned the
   * viewport, and on screen that read as a raw file served by accident rather than as a
   * post on a website.
   *
   * WHAT IT KEEPS FROM THE ARTICLE LAYOUT: the tags row, the author card and the FAQ
   * accordion, all rendered under the pasted page. The editor gives an HTML post the same
   * Tags, Author and FAQ fields as a written one, so each has to show up here.
   *
   * WHAT IT STILL SKIPS, each for its own reason rather than as a job lot:
   *
   *   • <PageHero>, and with it the byline description and the category eyebrow. The
   *     pasted page opens with its own headline and introduction; ours would print them a
   *     second time immediately above. Both fields still show — on the post's cards.
   *   • The cover and the author byline row. The page lays out its own top.
   *   • The mid-article CTA and the prose column. Both assume a body of prose that the
   *     site is laying out. Here the page lays itself out.
   *   • "More from the blog" and the CTA band, which an HTML post never had.
   *
   * THE SCHEMA IS CONDITIONAL, NOT ABSENT. The boundary preserves
   * `<script type="application/ld+json">` precisely so a page can bring its own, and two
   * differently-shaped descriptions of one URL is how a page ends up telling a search
   * engine two things about itself. So ours is emitted only where the page brought none.
   */
  if (post.format === 'html') {
    const doc = htmlPostDocument(post.contentHtml)
    /* The same author lookups the article layout makes below: the person for the card and
       the schema, and their published count for the link out of the card. */
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

        {/**
         * THE POST'S OWN END MATTER, UNDER THE PASTED PAGE.
         *
         * An HTML post now takes the same tags, author and FAQ fields in the editor as a
         * written one, and each has to do something on the page rather than sit in the
         * database. So the page ends the way an article does: the tags, then the "written
         * by" card, then the FAQ accordion — the same components, in the same order, at the
         * same measure. A reader should not be able to tell from the end of the page which
         * editor a post came from.
         *
         * BELOW THE PAGE, NEVER INSIDE OR ABOVE IT. The pasted document owns its own layout
         * from its first element to its last; anything the site adds goes after that, where
         * it cannot land in the middle of someone else's design.
         *
         * WHAT THE OTHER TWO FIELDS DO, since they have no slot here: the byline description
         * and the category are shown on the post's CARDS — the blog index, tag pages and
         * author pages — through the same card components every post uses. They are not
         * printed on this page because the pasted page opens with its own headline and
         * introduction, and ours would repeat them above it.
         */}
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

        {/* Schema only when the pasted page did not bring its own FAQPage — see the note
            on the `schema` prop in components/sections/faq.tsx. The questions in the panel
            still render as the accordion either way. */}
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
  /* Two or three other recent posts, excluding this one. Recency stands in for
     relatedness until there are enough posts for tags to mean anything. */
  const more = (await getPublishedPosts()).filter((p) => p.slug !== post.slug).slice(0, 3)
  /* Split once, here, so both halves come from the same transformed string —
     doing it per-branch in the markup would run renderablePostHtml twice and
     leave the two able to disagree. Null on a short post, which is the signal to
     render the article in one piece. */
  const midCta = splitForMidCta(renderablePostHtml(post.contentHtml))
  /* Null for a post with no author, and null for one whose author has since been
     deleted — both fall back to the company byline, which is what the page
     showed before authors existed. */
  const author = post.authorId ? await getAuthorById(post.authorId) : null
  /* Only for a named author, and only to put a number on the link out of the
     card — a post published under the company has no profile to count. */
  const authorPostCount = author ? (await getPublishedPostsByAuthor(author.id)).length : 0
  /**
   * FAQ SCHEMA FOR QUESTIONS TYPED INTO THE ARTICLE, when the FAQ panel is empty.
   *
   * The client's review found a live post with an "FAQs" heading and four bold questions
   * in its body, every one visible to readers, and no FAQPage schema — because schema only
   * ever came from the editor's FAQ panel, and nobody uses a panel when they can just type.
   * extractBodyFaqs() recognises that shape; see lib/faq-extract.ts for exactly what it will
   * and will not accept, which is deliberately little.
   *
   * THE PANEL WINS, ALWAYS. Where a writer has filled it in, those are the questions they
   * chose to publish as data, and <FaqSection> below renders them as the accordion and the
   * schema together. The body is only read when the panel is empty, so a page can never
   * carry two FAQPage blocks, and a deliberate entry is never overruled by a guess.
   *
   * SCHEMA ONLY, NO ACCORDION. These questions are already on the page, in the article,
   * where the writer put them. Rendering them a second time as an accordion would print
   * every question twice.
   */
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
        /* Category leads when there is one — it is the coarsest thing about the
           post and the fastest way for a reader to place it. */
        eyebrow={`${post.category ? `${post.category} · ` : ''}${formatPostDate(post.publishedAt)} · ${post.readingMinutes} min read`}
        heading={post.title}
        /**
         * THE BYLINE DESCRIPTION, AND NOTHING WHEN THERE IS NONE.
         *
         * NO FALLBACK TO THE META DESCRIPTION ANY MORE. This used to print
         * `excerpt || description`, so a post without a byline showed its search snippet
         * here — and on every card listing it. The client flagged exactly that, and asked
         * for the byline to be a field the admin writes, shown when it is written. An empty
         * one now leaves the hero with a title and no line under it, which reads as
         * intended; a search snippet in a reader's position does not.
         *
         * The history below is why the field was separate from the description in the
         * first place.
         *
         * This slot used to print `post.description`, which is written for a
         * search result: front-loaded with the terms someone would type, capped
         * near what a snippet shows, and addressed to a stranger deciding
         * whether to click. Under the headline it is being read by someone who
         * has already decided — and a line written to win a click reads, in that
         * position, like the page repeating its own listing back at you.
         *
         * `excerpt` is the byline description a writer composes for exactly this
         * spot, in the Content panel of the editor. See the note on BlogPost.excerpt.
         */
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
              {/* NO CAPTION UNDER THE COVER, by request: on the page it read as
                  a stray line of grey text between the hero and the article
                  rather than as part of the image. The field stays in the
                  editor and the value is still stored — it is display that was
                  dropped, not the data — so putting it back is this element
                  and nothing else.

                  No <figure> either, therefore: a figure with no caption is a
                  wrapper that adds a semantic promise the markup no longer
                  keeps. */}
              {/* 16:9, WHERE THIS WAS 21:9 AND EVERYTHING ELSE WAS NOT.
                  Cloudinary crops every cover to `ar_16:9` (see COVER_CROP), and
                  the blog index, the author profile and the work cards all render
                  that ratio. This one box asked for 21:9, so `object-cover` threw
                  away roughly a quarter of the height of an image that had already
                  been cropped once — a cover looked right on the card it was
                  chosen from and lost its top and bottom on the page it led to.
                  Matching the ratio means the crop happens once, at Cloudinary,
                  with content-aware gravity, and the page shows the whole of it. */}
              {/**
                * THE BANNER IS THE WIDTH OF THE ARTICLE, not the width of the page.
                *
                * It used to fill the whole container while everything under it — the byline,
                * the prose, the tags, the author card — sat at the 68ch measure. At 1180px
                * that made a 16:9 cover 664px tall: a banner taller than the first screen of
                * writing, which the client reported as "too large on the detail page".
                *
                * `mx-auto max-w-[68ch]` is the same measure every other block on this page
                * uses, so the banner now lines up with the text on both edges and comes to
                * 605x340 on a desktop. Nothing is cropped by the change: the box is still
                * 16:9 and the image is still 16:9, so it simply renders smaller.
                */}
              <div className="relative mx-auto aspect-16/9 max-w-[68ch] overflow-hidden rounded-card bg-ink">
                  {/* The author's alt where they wrote one, the title as a
                      fallback: a poor description beats none at all. Plain img
                      over the DB-serving route; the wrapper owns the aspect
                      ratio, so no CLS. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    srcSet={coverImageSrcSet(post)}
                    /* 605px is the measured article width; 652 is the viewport at which
                       the container stops being narrower than it (605 + the 24px gutters).
                       Left at 1080px, a phone would fetch an image nearly twice the size it
                       can show. */
                    sizes="(max-width: 652px) 100vw, 605px"
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

          {/* THE BYLINE SITS BELOW THE BANNER NOW, where it used to sit above it
              in a bordered strip of its own — a `justify-between` row with one
              child, floating between the headline and the cover, which read as a
              fragment nobody had finished placing. Directly over the first
              paragraph is where a byline goes in print and where a reader looks
              for one, and it now introduces the text rather than interrupting
              the run-up to it.

              The date and reading time stay in the hero's eyebrow and are still
              NOT repeated here — the byline answers who, the eyebrow answers
              when. The fuller "written by" card is at the foot of the article. */}
          <Reveal className={cover ? 'mt-12' : undefined}>
            <div className="mx-auto max-w-[68ch] border-b border-line pb-6">
              <AuthorByline author={author} size="lg" />
            </div>
          </Reveal>

          <Reveal className="mt-10">
            {/* The stored HTML has already been through sanitizePostHtml on
                every save — the allowlist in lib/blog.ts is the reason this
                dangerouslySetInnerHTML is not dangerous. Styling comes from
                .blog-prose in globals.css, the same class the admin editor
                types into, so the page IS the preview.

                renderablePostHtml wraps each table in its own scroll container,
                which is the one thing the stored markup cannot carry itself —
                see the note on that function for why the wrapper is added here
                rather than saved into the post.

                SPLIT IN TWO WHERE THE POST IS LONG ENOUGH, so a call to action
                can sit at the halfway point. `splitForMidCta` returns null for a
                short post, or one with no balanced boundary near the middle, and
                the article then renders exactly as it did before — one block,
                no interruption. Each half is a complete run of top-level
                elements, which is what makes it safe to hand either to
                dangerouslySetInnerHTML. */}
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

            {/* The shared "Tagged" row — the same component an HTML-page post ends with,
                so the two kinds of post cannot drift apart. See components/ui/post-tags.tsx. */}
            <PostTags tags={post.tags} className="mt-12" />
          </Reveal>

          {/* AFTER THE TAGS, BEFORE ANYTHING THAT LEADS AWAY. The reader has just
              finished the piece, which is the one moment they care who wrote it —
              so the card goes here rather than at the very bottom under the
              related posts, where it would be competing with three links out.

              Renders nothing for a post published under the company byline; see
              the note on <AuthorCard>. */}
          <Reveal className="mt-12">
            <div className="mx-auto max-w-[68ch]">
              <AuthorCard author={author} postCount={authorPostCount} />
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* THE POST'S OWN FAQs, AS AN ACCORDION AND AS FAQPage JSON-LD.
          <FaqSection> already emits that schema for the home page and every
          service page, and returns null on an empty list — so reusing it here
          gives a blog post the same structured answers without a second
          renderer, a second set of markup or a second copy of the schema to keep
          in step. That reuse is the whole implementation.

          ABOVE "More from the blog", deliberately: an unanswered question is
          what stops a reader acting, and it should be settled before the page
          starts offering them somewhere else to go. Same ordering, and the same
          reasoning, as the service pages. */}
      <FaqSection
        faqs={post.faqs}
        eyebrow="FAQ"
        heading="Frequently asked questions"
        spacing="compact"
      />
      {/* Empty whenever the panel above has questions — see the note on bodyFaqs. */}
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

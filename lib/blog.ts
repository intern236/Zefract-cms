import { ObjectId, type WithId, type Document } from 'mongodb'
import sanitizeHtml from 'sanitize-html'
import { getDb, BLOG_COLLECTION } from '@/lib/mongodb'
import type { CloudinaryImage } from '@/lib/cloudinary/types'
import { coverSrcSet, coverUrl, isStoredImageSrc } from '@/lib/cloudinary/url'
import { slugify } from '@/lib/slug'
/**
 * The OTHER sanitiser, for posts that are a whole pasted page rather than editor
 * output — see BlogPost.format. It lives in its own module because it has no database
 * import and therefore no server-only constraint, which is what lets the admin editor
 * and the published page share one definition of the format instead of mirroring it.
 */
import {
  asPostFormat,
  pageBodyText,
  sanitizePagePostHtml,
  type PostFormat,
} from '@/lib/post-page-html'

export { slugify }
export {
  asPostFormat,
  htmlPostDocument,
  sanitizePagePostHtml,
  HTML_POST_SCOPE_CLASS,
  type HtmlPostDocument,
  type PostFormat,
} from '@/lib/post-page-html'

/**
 * The blog's data layer: accessors, validation and sanitisation, in one place.
 *
 * SAME SEAM AS lib/content.ts — components never touch the collection, they call
 * these accessors. The difference is the source: the rest of the site's content
 * is typed files, the blog is MongoDB, because posts are written from the admin
 * at runtime rather than committed. This is exactly the swap the async accessor
 * pattern was built to allow.
 *
 * SERVER-ONLY, like lib/mongodb.ts, and reached from Server Components, server
 * actions and route handlers only. Importing it into a client component is a
 * build error, which is the outcome we want.
 */

export type BlogPostStatus = 'draft' | 'published'

export interface BlogPost {
  /** The Mongo _id as a string — what the admin edit routes key on. */
  id: string
  slug: string
  title: string
  /** The SERP description and the card excerpt. One field, so they cannot disagree. */
  description: string
  /**
   * The standfirst printed under the headline, in the post's own voice.
   *
   * A SECOND FIELD, BECAUSE THE FIRST WAS DOING TWO JOBS. `description` is
   * written for a search result: about 160 characters, front-loaded with the
   * terms someone would type, and read out of context by a stranger. A
   * standfirst is read immediately under the title by someone who has already
   * arrived, and its job is to make them keep going. Those are different pieces
   * of writing, and the page used to print the SERP one in the reader's
   * position — so every post opened with a line optimised for a machine.
   *
   * NULL FALLS BACK TO `description`, which is exactly what the page did before,
   * so every post published so far keeps the standfirst it already had and
   * nothing needs migrating. It stops being a fallback the moment somebody
   * writes an introduction.
   */
  excerpt: string | null
  /**
   * Which of the two editors wrote this post, and therefore which boundary its HTML
   * came through and how the page renders it.
   *
   * 'editor' IS THE RICH EDITOR and everything this field did not exist for. The body
   * is TipTap's output, sanitised against the narrow allowlist below, and the post page
   * draws it inside the site: hero, byline, cover, prose column, tags, author card, FAQ,
   * CTA band.
   *
   * 'html' IS A WHOLE PAGE, pasted in and published as itself. The body went through the
   * much wider boundary in lib/post-page-html.ts instead, and the post page renders it
   * alone — no hero, no prose column, and the site's own header and footer suppressed.
   * That is the point of it: somebody arrives with a finished page and wants the finished
   * page, not this site's frame around a fragment of it.
   *
   * ABSENT ON EVERY POST WRITTEN SO FAR, which is why asPostFormat defaults to 'editor'
   * rather than requiring the field. Nothing needs migrating, and a document written
   * straight into the database with no format gets the narrower of the two.
   */
  format: PostFormat
  /**
   * The post's HTML. Sanitised on SAVE, never on render — through sanitizePostHtml for
   * an editor post and sanitizePagePostHtml for an HTML one, chosen by `format` above.
   */
  contentHtml: string
  /**
   * The cover, on Cloudinary. Null for a post without one, and null for the
   * legacy posts whose image predates the migration — see coverImageId.
   */
  coverImage: CloudinaryImage | null
  /**
   * LEGACY. The old MongoDB-backed cover: an id into the `blog_images`
   * collection, served by /api/blog-images/[id].
   *
   * Kept so posts published before Cloudinary keep their images without a data
   * migration against live content. Nothing writes this any more — new uploads
   * populate `coverImage` — so it drains naturally as old posts are edited, and
   * this field plus that route can be deleted once no post has one.
   */
  coverImageId: string | null
  /**
   * The cover's alt text, DERIVED: from the Cloudinary asset where there is
   * one, from the legacy field otherwise. One field for the whole site to read,
   * whichever storage the image happens to live in.
   *
   * Falls back to the title at render time — an image with no alt at all is the
   * one thing a screen reader cannot work around.
   */
  coverAlt: string | null
  /** An optional line printed under the cover on the post page. Derived the
   *  same way as coverAlt. */
  coverCaption: string | null
  /**
   * One optional category — the post's shelf, where tags are its index terms.
   * Single-valued on purpose: a post that belongs to three categories belongs
   * to none of them, and that distinction is the only thing separating this
   * from `tags`.
   */
  category: string | null
  tags: string[]
  /**
   * Questions and answers attached to the post, rendered as an accordion and
   * published as FAQPage JSON-LD.
   *
   * STRUCTURED, NOT PROSE, AND THAT IS THE ENTIRE POINT. A writer can already
   * type "Frequently asked questions" as an h2 and a list of questions
   * underneath it, and readers can read that perfectly well — but a search
   * engine sees an ordinary run of headings and paragraphs, so the post is not
   * eligible for the FAQ rich result or for the answer surfaces the site's own
   * AEO and GEO pages sell. Schema.org needs each question paired with its
   * answer as data, which is what this field is.
   *
   * PLAIN TEXT ANSWERS, deliberately, matching the site's other FAQs (see
   * content/types.ts, `Faq`). schema.org's `acceptedAnswer.text` is a string,
   * and giving an answer its own rich text would mean a second sanitiser, a
   * second editor surface and markup that the schema would then have to strip
   * again before publishing it. Two or three sentences is what an answer worth
   * marking up looks like.
   *
   * An empty array is the normal state. Most posts are not FAQs, and a post with
   * none renders no section and emits no schema — an empty FAQPage would be a
   * claim about a page that has no questions on it.
   */
  faqs: { question: string; answer: string }[]
  /**
   * Who wrote it — an id into the `authors` collection, resolved by lib/authors.ts.
   *
   * AN ID, NOT AN EMBEDDED COPY of the name and photograph. Embedding would make
   * a post self-contained and make every author edit a migration: changing a
   * portrait or correcting a job title would have to rewrite every post that
   * person ever wrote, and any post missed would keep showing the old one.
   *
   * Null is a normal, permanent state, not a gap waiting to be filled. A post
   * written before authors existed has none, and one deliberately published
   * under the company rather than a person has none either — both fall back to
   * the Organization byline the JSON-LD has always used.
   */
  authorId: string | null
  /**
   * The <title> a search result shows, when it should differ from the headline
   * on the page. Falls back to `title`, which is the usual case — this exists
   * for the post whose good headline is too long or too clever for a SERP.
   */
  seoTitle: string | null
  /**
   * The phrase this post is trying to rank for. Never published: it is the
   * yardstick the SEO checks in the editor measure against, which is the only
   * thing a focus keyword has ever legitimately been.
   */
  focusKeyword: string | null
  status: BlogPostStatus
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  readingMinutes: number
}

/**
 * Character caps, mirroring the contact route's LIMITS: their job is to stop a
 * hand-crafted request filling the collection, not to police the editor — the
 * admin UI keeps well inside them. contentHtml's cap is generous because a long
 * post with inline formatting is legitimately big; 400KB of HTML is not.
 */
export const POST_LIMITS = {
  title: 160,
  slug: 96,
  /**
   * The meta description and the card excerpt, one field.
   *
   * 320, UP FROM 300, AND IT IS A STORAGE CAP RATHER THAN EDITORIAL ADVICE —
   * the distinction this whole block's opening note draws. What a search result
   * displays is nearer 160 characters, and the SEO panel measures against that
   * and shows the cut in its preview; this number only exists so a hand-crafted
   * request cannot put an essay in the field.
   *
   * The two are now genuinely independent, where before they were not: the
   * published description used to be clamped to 155 at render, so anything typed
   * past that was stored and then silently dropped. That clamp is gone (see
   * app/blog/[slug]/page.tsx), which is what makes the extra room usable rather
   * than a longer runway to the same truncation.
   *
   * 320 is deliberately about double the display width. It leaves space for a
   * description written for a wide result, or one carrying a clause the writer
   * accepts will be cut, without being so generous that the field stops reading
   * as a summary.
   */
  description: 320,
  /** The standfirst. Longer than the description because it is read on the page
   *  rather than inside a result, so nothing is truncating it at 160. */
  excerpt: 400,
  category: 60,
  tag: 40,
  tagCount: 12,
  /* One FAQ entry, and how many a post may carry. The caps are generous next to
     what a good FAQ actually contains: a question that needs 200 characters is
     usually two questions, and a page with more than twelve of them is a help
     centre rather than an article. As with every other number here, the job is
     to stop a hand-crafted request filling the collection, not to police the
     editor — which keeps well inside them. */
  faqQuestion: 200,
  faqAnswer: 900,
  faqCount: 12,
  seoTitle: 80,
  focusKeyword: 60,
  coverAlt: 125,
  coverCaption: 125,
  contentHtml: 400_000,
} as const

// ---------------------------------------------------------------------------
// Sanitisation — the stored-XSS boundary
// ---------------------------------------------------------------------------

/**
 * Every save passes the editor's HTML through this before it touches the
 * database, so nothing executable can ever be STORED, let alone rendered. The
 * author is the trusted admin, but "trusted" is a statement about a person, not
 * about every request that ever presents their cookie — a hijacked session must
 * not be able to plant a script that then runs on every visitor.
 *
 * The allowlist is exactly what the TipTap configuration in the admin editor
 * can emit, nothing more. Links keep only href (no target/rel/onclick — a link
 * that opens in the same tab is the safe default); images keep src and alt,
 * with src restricted to our own /api/blog-images/ route or a full https URL.
 * Protocol-relative URLs (//evil.example) are refused outright.
 */
/**
 * The two places a post's images may legitimately come from — our own
 * Cloudinary cloud and the legacy blob route — are defined once, in
 * lib/cloudinary/url.ts, because the editor has to apply the SAME rule when it
 * decides which pasted images need adopting. See isStoredImageSrc there.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    /* h2 THROUGH h6, matching the TipTap configuration in the admin editor
       exactly — a tag the editor can emit but the sanitiser strips is content
       that vanishes on save, which is the failure the countImageTags guard
       further down exists to catch for images. h1 stays out: the post's title
       is the page's h1, and a second one would give the document two titles. */
    'p', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 's', 'u', 'code',
    'a', 'ul', 'ol', 'li',
    'blockquote', 'pre', 'img', 'hr', 'br',
    /* A REAL TABLE, NOT A PICTURE OF ONE. Comparison content was being pasted in
       as a screenshot, which is unreadable on a phone, invisible to search, and
       impossible to select or translate. These are the tags TipTap's TableKit
       emits and nothing more.

       `colgroup` and `col` are deliberately absent, though the editor produces
       them: they carry the pixel column widths from the editing surface, which
       are a property of a 900px admin panel and have no business deciding how a
       table lays out on a phone. Dropping them lets the published table size
       itself from its own content. */
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    /**
     * `data-button` is the ONE attribute a link may carry beyond its href.
     *
     * The editor's Button control sets it, and `.blog-prose a[data-button]` in
     * globals.css turns the link into the site's pill button. Class was the
     * obvious alternative and is the wrong one — it would let anything pasted
     * from the marketing pages drag arbitrary utility classes into stored post
     * HTML, and the styling of a post would then depend on classes nobody wrote
     * for it. One attribute the sanitiser understands keeps the decision here,
     * where it can be reasoned about.
     *
     * Its value is normalised to one of exactly two by the transform below, so
     * there is no free text in it for anyone to inject through.
     */
    a: ['href', 'data-button'],
    img: ['src', 'alt'],
    /* Merged cells survive, because a comparison table that has been through a
       merge and comes out with its cells unmerged is worse than no table.
       `scope` is what makes a header cell announce which row or column it heads
       — the difference between a screen reader saying "Zefract: yes" and saying
       a detached "yes". sanitize-html discards any value it is not given, so
       these cannot carry anything but the numbers and keywords they are for. */
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['https', 'http', 'mailto'],
  allowProtocolRelative: false,
  transformTags: {
    /**
     * An img src that is not one of ours loses the attribute here, and the
     * exclusiveFilter below then drops the now-sourceless tag entirely.
     *
     * NARROWED FROM "any https URL" TO OUR OWN TWO SOURCES. Allowing any
     * https image meant a stored post could hotlink anywhere — a tracking
     * pixel pointing at a third party, or an image that silently changes
     * under us because someone else controls the server. The editor only ever
     * produces a Cloudinary URL from our own cloud or the legacy blob route,
     * so nothing legitimate is lost by saying exactly that.
     */
    img: (tagName, attribs) => {
      const src = attribs.src ?? ''
      const kept: Record<string, string> = {}
      if (isStoredImageSrc(src)) kept.src = src
      if (attribs.alt) kept.alt = attribs.alt
      return { tagName, attribs: kept }
    },
    /**
     * A link's button flag is normalised to a CLOSED SET: the empty string for
     * the solid pill, `outline` for the bordered one. Anything else — a value
     * pasted from elsewhere, or a hand-crafted request — collapses to solid.
     *
     * That is what keeps this attribute safe to allow at all. The CSS matches
     * on the exact value, so there are only ever two shapes to style, and there
     * is no free text stored inside an attribute for anyone to inject through.
     */
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...(attribs.href ? { href: attribs.href } : {}),
        ...('data-button' in attribs
          ? { 'data-button': attribs['data-button'] === 'outline' ? 'outline' : '' }
          : {}),
      },
    }),
  },
  exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
}

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS)
}

/**
 * The save path's one entry point to sanitisation, so a caller cannot pick the wrong
 * boundary for the post it is saving.
 *
 * WHY THE CHOICE IS MADE HERE AND NOWHERE ELSE. There are now two allowlists with very
 * different reach, and the failure mode of confusing them is silent and one-directional:
 * running an editor post through the page boundary stores markup the prose styles were
 * never written for, and it is the *other* way round that matters — a pasted page put
 * through the editor's allowlist loses its styles and its layout and arrives as a column
 * of bare paragraphs, with no error anywhere saying why. One function keyed on the post's
 * own format is the only arrangement where that cannot be got wrong by adding a caller.
 */
export function sanitizeForFormat(html: string, format: PostFormat): string {
  return format === 'html' ? sanitizePagePostHtml(html) : sanitizePostHtml(html)
}

/** How many `<img>` tags a chunk of HTML contains. Used either side of
 *  sanitisation to notice when images were about to be dropped in silence —
 *  see the guard in the save action. */
export function countImageTags(html: string): number {
  return (html.match(/<img\b/gi) ?? []).length
}

/**
 * The stored HTML, made ready to render: every table wrapped in a scroll
 * container.
 *
 * WHY A WRAPPER AND NOT CSS. The obvious fix for a table too wide for a phone is
 * `display: block; overflow-x: auto` on the table itself, and it is the wrong
 * one — changing a table's `display` strips its rows and cells out of the
 * accessibility tree in Chrome and Firefox, so a screen reader stops being able
 * to say which column a figure is in. This project has already made that call
 * once, in the note on <CompareStack> in components/sections/compare.tsx, and
 * every other table on the site (the legal pages, the case narrative) uses the
 * same arrangement this produces: a scrolling element AROUND an untouched table.
 *
 * AT RENDER RATHER THAN ON SAVE, so `contentHtml` in the database stays exactly
 * what the sanitiser produced. The same string is loaded back into TipTap when
 * the post is edited, and a `<div>` injected into it would be stripped by the
 * allowlist on the next save — the stored copy has to stay editable.
 *
 * A STRING REPLACE IS SAFE HERE SPECIFICALLY BECAUSE THE INPUT IS SANITISED.
 * `table` allows no attributes, so the sanitiser can only ever emit the bare
 * `<table>` this matches, and tables cannot nest inside one another in the
 * markup TipTap produces. On anything else this would be the wrong tool.
 */
export function renderablePostHtml(html: string): string {
  return html
    .replaceAll('<table>', '<div class="blog-table-scroll"><table>')
    .replaceAll('</table>', '</table></div>')
}

/** Elements with no closing tag, which must not move the depth counter below. */
const VOID_TAGS = new Set(['img', 'hr', 'br'])

/**
 * How much of a post has to exist before it is worth interrupting.
 *
 * A CTA halfway through a three-paragraph post lands about forty words in,
 * which is not a reader who has invested anything yet — it is an advert above
 * the fold with the article wrapped around it. Below this the post renders in
 * one piece and the band at the foot is the only ask.
 *
 * Measured in characters of markup rather than words because that is what is to
 * hand, and the number only has to separate "a short note" from "a long read".
 */
const MID_CTA_MIN_LENGTH = 2200

/**
 * Splits a post in two at a top-level block boundary near its middle, for a
 * mid-article call to action.
 *
 * WHY IT IS SPLIT AT ALL, rather than the CTA being a thing writers place. A
 * block they have to remember is a block that appears in the first two posts
 * and never again, and its position then varies with whoever was paying
 * attention. Deriving the position means every article carries one, in the same
 * relative place, without anybody maintaining it.
 *
 * THE DEPTH COUNTER IS THE WHOLE FUNCTION. The obvious implementation splits on
 * `</p>`, and it is wrong in two ways that both produce broken markup: a
 * paragraph inside a blockquote, and — since tables arrived — a paragraph inside
 * a table cell. Cutting there would close a `<blockquote>` or a `<table>` that
 * was never opened in the second half, and browsers recover from that by
 * silently discarding content. So tags are counted in and out, and a cut is only
 * ever offered at a point where nothing is open.
 *
 * IT ONLY EVER CUTS BETWEEN TOP-LEVEL BLOCKS, which is also why the two halves
 * can be handed straight to `dangerouslySetInnerHTML` — each is a complete run
 * of balanced elements, not a fragment of one.
 *
 * Returns `null` when the post is too short to interrupt, or when no boundary
 * sits anywhere near the middle — a single enormous table has no midpoint, and
 * the honest answer there is to leave the article alone.
 */
export function splitForMidCta(html: string): { before: string; after: string } | null {
  if (html.length < MID_CTA_MIN_LENGTH) return null

  /* Every offset at which the markup is back at depth zero, i.e. the end of a
     top-level block and a legal place to cut. */
  const boundaries: number[] = []
  let depth = 0
  const tag = /<(\/?)([a-z0-9]+)[^>]*?(\/?)>/gi
  let match: RegExpExecArray | null

  while ((match = tag.exec(html)) !== null) {
    const [full, closing, name, selfClosing] = match
    if (VOID_TAGS.has(name.toLowerCase()) || selfClosing === '/') continue
    depth += closing ? -1 : 1
    if (depth === 0 && closing) boundaries.push(match.index + full.length)
  }

  if (boundaries.length < 2) return null

  /* The boundary closest to halfway. Not the first one past halfway: on a post
     whose second half is one long table, that would be the very end. */
  const middle = html.length / 2
  const cut = boundaries.reduce((best, offset) =>
    Math.abs(offset - middle) < Math.abs(best - middle) ? offset : best
  )

  /* A cut in the first or last fifth is not a mid-article position, whatever the
     arithmetic says — it would put the CTA under the opening paragraph or just
     above the footer band, where one of the two is redundant. */
  if (cut < html.length * 0.2 || cut > html.length * 0.8) return null

  return { before: html.slice(0, cut), after: html.slice(cut) }
}

// ---------------------------------------------------------------------------
// Derivation helpers
// ---------------------------------------------------------------------------

/**
 * Reading time from the sanitised HTML, at ~200 words a minute. Derived once on
 * save and stored, so the list page never re-parses every post's HTML to show
 * a number beside its title.
 */
export function readingMinutes(html: string, format: PostFormat = 'editor'): number {
  /**
   * A PASTED PAGE NEEDS THE OTHER TEXT EXTRACTOR, and the difference is not small.
   *
   * The editor branch strips tags and keeps everything between them, which on TipTap
   * output is exactly the prose. On a page carrying its own head and stylesheet it
   * would be the prose PLUS the <title>, the meta description and every selector in
   * the CSS — a 6KB stylesheet reads as roughly 600 words, so a one-minute page would
   * claim four. pageBodyText() removes all three, and is the same function the admin
   * editor uses for its live count, so the number a writer sees and the number that
   * gets stored cannot disagree.
   *
   * The parameter defaults, so every existing call site is unchanged.
   */
  const text =
    format === 'html'
      ? pageBodyText(html)
      : sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** "21 Aug 2026" — one formatter, so the index and the post page cannot disagree. */
export function formatPostDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * The cover's `src`, whichever storage it lives in.
 *
 * Cloudinary first, because that is where every new upload goes and its URL
 * carries the f_auto/q_auto/16:9 treatment. The legacy MongoDB route answers
 * for posts published before the migration; those get no transformation, which
 * is exactly what they got before and is the price of not rewriting live data.
 *
 * Call `coverSrcSet` alongside this for the responsive set — it returns null
 * for a legacy image, since one stored blob has no other sizes to offer.
 */
export function coverImageUrl(
  post: Pick<BlogPost, 'coverImage' | 'coverImageId'>,
  width?: number
): string | null {
  if (post.coverImage) return coverUrl(post.coverImage.publicId, width)
  return post.coverImageId ? `/api/blog-images/${post.coverImageId}` : null
}

/** The responsive set for a Cloudinary cover, or null for a legacy one. */
export function coverImageSrcSet(post: Pick<BlogPost, 'coverImage'>): string | undefined {
  return post.coverImage ? coverSrcSet(post.coverImage.publicId) : undefined
}

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

/** A stored Cloudinary record, coerced. Anything without a publicId is not one
 *  — the id is the only field that makes the asset addressable later. */
function toCloudinaryImage(value: unknown): CloudinaryImage | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (typeof raw.publicId !== 'string' || raw.publicId === '') return null
  return {
    url: String(raw.url ?? ''),
    secureUrl: String(raw.secureUrl ?? ''),
    publicId: raw.publicId,
    width: Number(raw.width ?? 0),
    height: Number(raw.height ?? 0),
    format: String(raw.format ?? ''),
    bytes: Number(raw.bytes ?? 0),
    ...(typeof raw.altText === 'string' ? { altText: raw.altText } : {}),
    ...(typeof raw.caption === 'string' ? { caption: raw.caption } : {}),
  }
}

/** Alt text and caption, from the Cloudinary record if there is one and the
 *  legacy top-level field otherwise. */
function readCoverText(
  doc: Document,
  onImage: 'altText' | 'caption',
  legacy: 'coverAlt' | 'coverCaption'
): string | null {
  const image = doc.coverImage as Record<string, unknown> | null | undefined
  const fromImage = image && typeof image[onImage] === 'string' ? (image[onImage] as string) : ''
  if (fromImage) return fromImage
  return doc[legacy] ? String(doc[legacy]) : null
}

/**
 * The stored FAQ list, coerced.
 *
 * SAME DISCIPLINE AS toCloudinaryImage ABOVE: a document read back may predate
 * the field, may have been written straight into the database, and may hold
 * anything. An entry missing either half is dropped rather than rendered — a
 * question with no answer is not an FAQ, and publishing one as FAQPage schema
 * would be asserting an answer exists where none does.
 */
function toFaqs(value: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []
    const raw = entry as Record<string, unknown>
    const question = typeof raw.question === 'string' ? raw.question.trim() : ''
    const answer = typeof raw.answer === 'string' ? raw.answer.trim() : ''
    return question && answer ? [{ question, answer }] : []
  })
}

function toPost(doc: WithId<Document>): BlogPost {
  return {
    id: String(doc._id),
    /* Defaults to 'editor' for every post written before the field existed. See the
       note on BlogPost.format for why that default is the safe direction. */
    format: asPostFormat(doc.format),
    slug: String(doc.slug),
    title: String(doc.title),
    description: String(doc.description),
    /* Null rather than an empty string for an absent standfirst, so the render
       path's `excerpt || description` fallback fires on a post written before
       the field existed as well as on one whose field was cleared. */
    excerpt: doc.excerpt ? String(doc.excerpt) : null,
    contentHtml: String(doc.contentHtml),
    coverImage: toCloudinaryImage(doc.coverImage),
    coverImageId: doc.coverImageId ? String(doc.coverImageId) : null,
    /* Cloudinary's copy wins where it exists, because that is where the editor
       now writes; the legacy top-level fields answer for older posts. Derived
       rather than duplicated, so the two can never disagree. */
    coverAlt: readCoverText(doc, 'altText', 'coverAlt'),
    coverCaption: readCoverText(doc, 'caption', 'coverCaption'),
    category: doc.category ? String(doc.category) : null,
    tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
    faqs: toFaqs(doc.faqs),
    authorId: doc.authorId ? String(doc.authorId) : null,
    seoTitle: doc.seoTitle ? String(doc.seoTitle) : null,
    focusKeyword: doc.focusKeyword ? String(doc.focusKeyword) : null,
    status: doc.status === 'published' ? 'published' : 'draft',
    publishedAt: doc.publishedAt instanceof Date ? doc.publishedAt : null,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(0),
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt : new Date(0),
    readingMinutes: typeof doc.readingMinutes === 'number' ? doc.readingMinutes : 1,
  }
}

async function posts() {
  const db = await getDb()
  return db.collection(BLOG_COLLECTION)
}

/**
 * The public accessors tolerate an UNCONFIGURED database and only that.
 *
 * Without MONGODB_URI the blog renders empty rather than failing the build —
 * so a fresh clone still builds, exactly as it does today, since nothing else
 * in the build needs Mongo. A database that is configured but unreachable
 * still throws: at runtime that means ISR keeps serving the last good page
 * instead of caching an empty blog over a real one.
 */
function dbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI)
}

/** Published posts, newest first — the public /blog index. Drafts never leave this file. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!dbConfigured()) {
    console.warn('[blog] MONGODB_URI is not set; rendering the blog empty')
    return []
  }
  const col = await posts()
  const docs = await col.find({ status: 'published' }).sort({ publishedAt: -1 }).toArray()
  return docs.map(toPost)
}

/** One published post by slug, or null — which the page turns into a 404. A
 *  draft's slug returns null too: drafts do not exist to the public site. */
export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  if (!dbConfigured()) return null
  const col = await posts()
  const doc = await col.findOne({ slug: String(slug), status: 'published' })
  return doc ? toPost(doc) : null
}

/**
 * One author's published posts, newest first — the list on their profile page.
 *
 * Published only, for the same reason getPublishedPosts is: a profile is a
 * public page, and showing a draft there would leak unpublished work to anyone
 * who found the author's URL.
 */
export async function getPublishedPostsByAuthor(authorId: string): Promise<BlogPost[]> {
  if (!dbConfigured()) return []
  const col = await posts()
  const docs = await col
    .find({ status: 'published', authorId: String(authorId) })
    .sort({ publishedAt: -1 })
    .toArray()
  return docs.map(toPost)
}

/**
 * A tag as it appears in a URL: `/blog/tag/paid-advertising`.
 *
 * DERIVED, NOT STORED. A tag is saved as the writer typed it ("Paid
 * advertising") because that is what has to be printed; the slug is a view of
 * it. Storing both would mean a second field to keep in step, and renaming a
 * tag would have to rewrite every post that used it.
 *
 * TWO TAGS CAN COLLIDE HERE and that is the better outcome. "AI/ML" and "AI ML"
 * both reduce to `ai-ml`, so one archive shows the posts under both — which is
 * what a reader following either of them wanted. The alternative is two pages
 * that each hide half the answer.
 */
export function tagSlug(tag: string): string {
  return slugify(tag)
}

/**
 * Published posts carrying a tag, newest first — the tag archive.
 *
 * MATCHED ON THE SLUG, IN MEMORY, rather than with a Mongo query on the raw
 * tag. The URL carries `paid-advertising` and the database holds "Paid
 * advertising", so a query would have to either store the slug alongside every
 * tag or reconstruct the original casing and punctuation from the slug, and the
 * second is not possible — `ai-ml` cannot be turned back into "AI/ML".
 *
 * The cost is reading the published posts to filter them, which is the same
 * single query the blog index already makes. At the scale a studio blog reaches
 * that is cheaper than the index it would take to avoid it; if this ever holds
 * thousands of posts, the fix is a stored `tagSlugs` array written on save, and
 * this function is the only thing that changes.
 */
export async function getPublishedPostsByTag(slug: string): Promise<BlogPost[]> {
  const wanted = slugify(slug)
  if (!wanted) return []
  const posts = await getPublishedPosts()
  return posts.filter((post) => post.tags.some((tag) => tagSlug(tag) === wanted))
}

/**
 * Every tag in use on a published post, with the display form and how many
 * posts carry it.
 *
 * THE DISPLAY FORM IS THE FIRST SPELLING SEEN, in the newest-first order the
 * index already uses, so a tag recently written as "SEO" wins over an older
 * "seo". The editor's suggestion chips make divergent spellings rare; this makes
 * the archive readable when they happen anyway.
 *
 * Published only, like every other public accessor here: a tag whose only post
 * is a draft has no archive to link to.
 */
export async function getPublishedTags(): Promise<
  { tag: string; slug: string; count: number }[]
> {
  const posts = await getPublishedPosts()
  const bySlug = new Map<string, { tag: string; slug: string; count: number }>()
  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = tagSlug(tag)
      if (!slug) continue
      const existing = bySlug.get(slug)
      if (existing) existing.count += 1
      else bySlug.set(slug, { tag, slug, count: 1 })
    }
  }
  return [...bySlug.values()].sort((a, b) => a.tag.localeCompare(b.tag))
}

// ---- Admin-side accessors — no unconfigured fallback: the admin NEEDS the DB.

export async function getAllPostsForAdmin(): Promise<BlogPost[]> {
  const col = await posts()
  const docs = await col.find({}).sort({ updatedAt: -1 }).toArray()
  return docs.map(toPost)
}

/**
 * Every category already in use, for the editor's picker.
 *
 * DERIVED, NOT A SEPARATE LIST. A categories collection would need creating,
 * editing, deleting and reconciling against the posts that reference it; this
 * asks the posts what they already say and cannot drift from them. Renaming a
 * category means editing the posts that use it, which is the honest amount of
 * work for what renaming a category actually is.
 *
 * Drafts count: a category invented for a post still being written should be
 * offered for the next one rather than reappearing only after publication.
 */
export async function getUsedCategories(): Promise<string[]> {
  if (!dbConfigured()) return []
  const col = await posts()
  const values = await col.distinct('category', { category: { $nin: [null, ''] } })
  return values
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .sort((a, b) => a.localeCompare(b))
}

/**
 * Every tag already in use, for the editor's picker. Same reasoning as
 * getUsedCategories: derived from the posts rather than kept as a second list
 * that can disagree with them.
 *
 * `distinct` flattens the array field for us, so this returns the individual
 * tags rather than the sets they were saved in.
 */
export async function getUsedTags(): Promise<string[]> {
  if (!dbConfigured()) return []
  const col = await posts()
  const values = await col.distinct('tags')
  return values
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .sort((a, b) => a.localeCompare(b))
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    return null
  }
  const col = await posts()
  const doc = await col.findOne({ _id: objectId })
  return doc ? toPost(doc) : null
}

/** True when another post already owns this slug — the uniqueness check on save. */
export async function slugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const col = await posts()
  const query: Document = { slug: String(slug) }
  if (excludeId) {
    try {
      query._id = { $ne: new ObjectId(excludeId) }
    } catch {
      /* An unparseable exclude id excludes nothing. */
    }
  }
  return (await col.countDocuments(query, { limit: 1 })) > 0
}

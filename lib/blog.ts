import { ObjectId, type WithId, type Document } from 'mongodb'
import sanitizeHtml from 'sanitize-html'
import { getDb, BLOG_COLLECTION } from '@/lib/mongodb'
import type { CloudinaryImage } from '@/lib/cloudinary/types'
import { coverSrcSet, coverUrl, isStoredImageSrc } from '@/lib/cloudinary/url'
import { slugify } from '@/lib/slug'

export { slugify }

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
  /** Sanitised HTML from the editor. The ONLY thing ever rendered — see sanitizePostHtml. */
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
  description: 300,
  category: 60,
  tag: 40,
  tagCount: 12,
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
    'p', 'h2', 'h3',
    'strong', 'em', 's', 'u', 'code',
    'a', 'ul', 'ol', 'li',
    'blockquote', 'pre', 'img', 'hr', 'br',
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

/** How many `<img>` tags a chunk of HTML contains. Used either side of
 *  sanitisation to notice when images were about to be dropped in silence —
 *  see the guard in the save action. */
export function countImageTags(html: string): number {
  return (html.match(/<img\b/gi) ?? []).length
}

// ---------------------------------------------------------------------------
// Derivation helpers
// ---------------------------------------------------------------------------

/**
 * Reading time from the sanitised HTML, at ~200 words a minute. Derived once on
 * save and stored, so the list page never re-parses every post's HTML to show
 * a number beside its title.
 */
export function readingMinutes(html: string): number {
  const words = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .split(/\s+/)
    .filter(Boolean).length
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

function toPost(doc: WithId<Document>): BlogPost {
  return {
    id: String(doc._id),
    slug: String(doc.slug),
    title: String(doc.title),
    description: String(doc.description),
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

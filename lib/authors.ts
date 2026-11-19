import { ObjectId, type WithId, type Document } from 'mongodb'
import type { CloudinaryImage } from '@/lib/cloudinary/types'
import { AUTHORS_COLLECTION, BLOG_COLLECTION, getDb } from '@/lib/mongodb'
import { slugify } from '@/lib/slug'
import type { Author } from '@/lib/author-display'

/**
 * Authors: the data layer, mirroring lib/blog.ts exactly.
 *
 * SAME SEAM, SAME RULES. Components never touch the collection — they call these
 * accessors, which is what let the blog swap typed files for MongoDB without a
 * component knowing. Server-only, like lib/blog.ts and lib/mongodb.ts: importing
 * this into a client component is a build error, which is the outcome we want.
 *
 * WHY AN AUTHOR IS A RECORD AND NOT A STRING ON THE POST. A byline typed into
 * each post cannot carry a photograph, a bio or a page of its own, and it drifts
 * the first time the same person is typed two ways — leaving the site with two
 * authors who are one person and nothing able to notice. A post stores an
 * `authorId`; everything a reader sees about that person is resolved from here,
 * so a new photo or a corrected title reaches every post they ever wrote.
 *
 * NO DRAFT/PUBLISHED STATE, deliberately, and this is the one place authors
 * diverge from posts. A post is a thing you work on privately and then release.
 * An author is a fact about a person: they either work here or they do not.
 * Adding a status would invent a state nobody needs and then force every read
 * path to ask about it. What DOES control visibility is having posts — see
 * getPublicAuthors.
 */

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

/** Same coercion as lib/blog.ts's: anything without a publicId is not a stored
 *  asset, because the id is the only field that makes it addressable later. */
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
  }
}

function toAuthor(doc: WithId<Document>): Author {
  const avatar = toCloudinaryImage(doc.avatar)
  return {
    id: String(doc._id),
    slug: String(doc.slug),
    name: String(doc.name),
    role: doc.role ? String(doc.role) : null,
    bio: doc.bio ? String(doc.bio) : null,
    avatar,
    /* Read off the asset record, the same way a post's coverAlt is — the text
       describes this image, so it travels with it rather than sitting in a
       parallel field that can outlive the picture it referred to. */
    avatarAlt: avatar?.altText ? avatar.altText : null,
    linkedinUrl: doc.linkedinUrl ? String(doc.linkedinUrl) : null,
    xUrl: doc.xUrl ? String(doc.xUrl) : null,
    websiteUrl: doc.websiteUrl ? String(doc.websiteUrl) : null,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(0),
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt : new Date(0),
    workspaceId: doc.workspaceId ? String(doc.workspaceId) : null,
  }
}

async function authors() {
  const db = await getDb()
  return db.collection(AUTHORS_COLLECTION)
}

/** Same tolerance as the blog's public accessors: an UNCONFIGURED database
 *  renders empty so a fresh clone still builds; a configured-but-unreachable one
 *  still throws, so ISR keeps serving the last good page. */
function dbConfigured(): boolean {
  return Boolean(
    (process.env.MONGODB_DB && /^mongodb(\+srv)?:\/\//.test(process.env.MONGODB_DB)) ||
      process.env.MONGODB_URI ||
      process.env.DATABASE_URL
  )
}

/** Every author, by name. The admin list, and the editor's author picker.
 *  Strictly scoped to Zefract's own authors (excludes client workspace authors). */
export async function getAllAuthors(): Promise<Author[]> {
  if (!dbConfigured()) return []
  const col = await authors()
  const docs = await col
    .find({
      $or: [
        { workspaceId: 'zefract' },
        { workspaceId: null },
        { workspaceId: { $exists: false } },
      ],
    })
    .sort({ name: 1 })
    .toArray()
  return docs.map(toAuthor)
}

/**
 * Authors with at least one PUBLISHED post — the public /authors index.
 *
 * AN AUTHOR WITH NOTHING PUBLISHED HAS NO PUBLIC PAGE, which is what replaces
 * the draft/published flag this type deliberately does not have. Listing someone
 * whose only post is a draft would leak the existence of unpublished work and
 * hand a crawler a profile page with nothing on it. Their record still exists
 * and their profile appears the moment their first post goes live.
 */
export async function getPublicAuthors(): Promise<Author[]> {
  if (!dbConfigured()) return []
  const db = await getDb()
  const ids = await db
    .collection(BLOG_COLLECTION)
    .distinct('authorId', { status: 'published', authorId: { $nin: [null, ''] } })
  const objectIds = ids
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
    .flatMap((id) => {
      try {
        return [new ObjectId(id)]
      } catch {
        return []
      }
    })
  if (objectIds.length === 0) return []
  const docs = await db
    .collection(AUTHORS_COLLECTION)
    .find({ _id: { $in: objectIds } })
    .sort({ name: 1 })
    .toArray()
  return docs.map(toAuthor)
}

export async function getAuthorById(id: string): Promise<Author | null> {
  if (!dbConfigured()) return null
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    return null
  }
  const col = await authors()
  const doc = await col.findOne({ _id: objectId })
  return doc ? toAuthor(doc) : null
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  if (!dbConfigured()) return null
  const col = await authors()
  const doc = await col.findOne({ slug: String(slug) })
  return doc ? toAuthor(doc) : null
}

/**
 * Several authors at once, keyed by id.
 *
 * ONE QUERY, NOT ONE PER POST. The blog index renders a byline on every card;
 * resolving those one at a time is the N+1 that turns a ten-post index into
 * eleven round trips. A Map because every caller wants a lookup, not a list.
 */
export async function getAuthorsByIds(ids: string[]): Promise<Map<string, Author>> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!dbConfigured() || unique.length === 0) return new Map()
  const objectIds = unique.flatMap((id) => {
    try {
      return [new ObjectId(id)]
    } catch {
      return []
    }
  })
  if (objectIds.length === 0) return new Map()
  const col = await authors()
  const docs = await col.find({ _id: { $in: objectIds } }).toArray()
  return new Map(docs.map((doc) => [String(doc._id), toAuthor(doc)]))
}

/** True when another author already owns this slug — the uniqueness check on
 *  save, exactly as slugTaken does for posts. */
export async function authorSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const col = await authors()
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

/** How many posts name this author, published or not. The delete confirmation
 *  states it, because "delete this author" means something different when three
 *  posts are about to lose their byline. */
export async function countPostsByAuthor(authorId: string): Promise<number> {
  const db = await getDb()
  return db.collection(BLOG_COLLECTION).countDocuments({ authorId })
}

/* One import for consumers: the shape and the display helpers come from the
   client-safe module, the accessors from here. Re-exported rather than asking
   every call site to know which half a given name lives in. */
export type { Author, AuthorOption } from '@/lib/author-display'
export {
  AUTHOR_LIMITS,
  authorAvatarSrcSet,
  authorAvatarUrl,
  authorInitials,
  authorLinks,
} from '@/lib/author-display'
export { slugify }

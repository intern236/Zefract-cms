import type { CloudinaryImage } from '@/lib/cloudinary/types'
import { avatarSrcSet, avatarUrl } from '@/lib/cloudinary/url'

/**
 * The author shape and everything that derives a display value from it —
 * and nothing that touches a database.
 *
 * SPLIT OUT OF lib/authors.ts FOR THE SAME REASON lib/admin-session.ts WAS SPLIT
 * OUT OF lib/admin-auth.ts. That file imports the MongoDB driver, so anything
 * importing it is server-only; but the editor's author picker, the byline and
 * the avatar all run in the browser and need the type, the initials and the
 * image URL. Keeping those here means one definition serves both sides instead
 * of a client-side copy that can drift from the server's.
 *
 * Everything below is a pure function of its argument. lib/cloudinary/url.ts is
 * safe to import for the same reason — it needs the cloud name and nothing else.
 */

export interface Author {
  /** The Mongo _id as a string — what the admin edit routes key on. */
  id: string
  /** The profile URL: /authors/<slug>. Locked once they have a published post. */
  slug: string
  name: string
  /** Job title or role, printed under the name. Optional — a guest writer may
   *  not have one, and inventing "Contributor" for them is noise. */
  role: string | null
  /**
   * A short biography, PLAIN TEXT.
   *
   * Not HTML, and that is a deliberate difference from a post's body. A bio is
   * two or three sentences under a photograph; giving it headings, images and
   * links would make it a second post body needing a second sanitiser, a second
   * editor and a second set of render rules. Text renders as text, so the whole
   * stored-XSS surface a post's HTML defends against does not exist here.
   */
  bio: string | null
  /** The portrait, on Cloudinary. Null for an author without one — every
   *  surface falls back to initials rather than a placeholder face. */
  avatar: CloudinaryImage | null
  /** The portrait's alt text. Falls back to the name at render time. */
  avatarAlt: string | null
  /** Optional profiles elsewhere. Three fixed fields rather than a free list:
   *  each renders as its own recognisable icon, and a fixed set can be
   *  validated as URLs without inventing a schema for arbitrary rows. */
  linkedinUrl: string | null
  xUrl: string | null
  websiteUrl: string | null
  createdAt: Date
  updatedAt: Date
  workspaceId?: string | null
}

/**
 * The author as a client component receives it: Dates dropped, because a prop
 * has to cross the serialisation boundary. Same arrangement as EditorPost.
 */
export type AuthorOption = Omit<Author, 'createdAt' | 'updatedAt'>

/**
 * An Author as a client component can receive it.
 *
 * A NAMED FUNCTION RATHER THAN A REST-SPREAD AT EACH CALL SITE. The obvious
 * inline form is `({ createdAt, updatedAt, ...rest }) => rest`, which works and
 * then trips the unused-variable rule on both names it exists to discard — so
 * every call site ends up with two throwaway bindings or a lint suppression.
 * Naming the operation once says what it is for, and there is exactly one place
 * to change if the shape ever gains another non-serialisable field.
 */
export function toAuthorOption(author: Author): AuthorOption {
  return {
    id: author.id,
    slug: author.slug,
    name: author.name,
    role: author.role,
    bio: author.bio,
    avatar: author.avatar,
    avatarAlt: author.avatarAlt,
    linkedinUrl: author.linkedinUrl,
    xUrl: author.xUrl,
    websiteUrl: author.websiteUrl,
  }
}

/**
 * Character caps, mirroring POST_LIMITS and there for the same reason: to stop a
 * hand-crafted request filling the collection, not to police the form. The admin
 * UI keeps well inside them, and the form reads these so the counter and the
 * server can never disagree about the number.
 */
export const AUTHOR_LIMITS = {
  name: 80,
  slug: 96,
  role: 80,
  bio: 600,
  avatarAlt: 125,
  url: 300,
} as const

/**
 * An author's initials, for every surface that shows a portrait when there is
 * none.
 *
 * INITIALS RATHER THAN A SILHOUETTE. A generic avatar is a picture of nobody
 * standing in for somebody, which reads as a broken image; two letters read as
 * a deliberate placeholder and stay legible at the 32px a byline uses. Same
 * decision, and the same reasoning, as the monogram in featured-case.tsx.
 */
export function authorInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?'
  )
}

/** The portrait's `src` at a given size, or null when the author has none. */
export function authorAvatarUrl(
  author: Pick<Author, 'avatar'>,
  size?: number
): string | null {
  return author.avatar ? avatarUrl(author.avatar.publicId, size) : null
}

/** The responsive set for a portrait, or undefined when there is none. */
export function authorAvatarSrcSet(author: Pick<Author, 'avatar'>): string | undefined {
  return author.avatar ? avatarSrcSet(author.avatar.publicId) : undefined
}

export type AuthorLinkKind = 'linkedin' | 'x' | 'website'

/** The profiles this author actually filled in, in a fixed order so two authors
 *  never present their links in a different sequence. */
export function authorLinks(
  author: Pick<Author, 'linkedinUrl' | 'xUrl' | 'websiteUrl'>
): { kind: AuthorLinkKind; url: string; label: string }[] {
  const out: { kind: AuthorLinkKind; url: string; label: string }[] = []
  if (author.linkedinUrl) out.push({ kind: 'linkedin', url: author.linkedinUrl, label: 'LinkedIn' })
  if (author.xUrl) out.push({ kind: 'x', url: author.xUrl, label: 'X' })
  if (author.websiteUrl) out.push({ kind: 'website', url: author.websiteUrl, label: 'Website' })
  return out
}

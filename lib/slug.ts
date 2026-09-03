/**
 * Title -> URL slug: lowercase, alphanumerics kept, everything else a hyphen.
 *
 * Its own module because both sides of the editor need it: the admin's client
 * component derives a live slug as the title is typed, and lib/blog.ts re-runs
 * the SAME function server-side before anything is stored — the client's copy
 * is a preview, the server's is the truth. It cannot live in lib/blog.ts, which
 * imports the Mongo driver and so can never enter a client bundle.
 */

/** Matches POST_LIMITS.slug in lib/blog.ts. */
export const SLUG_MAX = 96

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
}

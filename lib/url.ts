import { SITE } from '@/content/site'

/**
 * The one place a route path becomes an absolute URL.
 *
 * WHY THIS EXISTS. Canonical tags, the sitemap, robots.txt, every JSON-LD block,
 * llms.txt and the OG objects all publish absolute URLs, and before this they all
 * built them by hand as `${SITE.url}${path}`. Nine call sites concatenating two
 * strings is nine chances to disagree about the host, the trailing slash, or what
 * to do when the "path" is already a full URL — and a search engine treats two
 * spellings of one address as two pages. So the concatenation happens once, here,
 * and `SITE.url` has exactly one consumer: this file.
 *
 * THE FORM IS FIXED, and it is not an arbitrary choice — it is the form Next
 * itself emits for a canonical. `resolveAbsoluteUrlWithPathname` in
 * next/dist/lib/metadata/resolvers/resolve-url.js does:
 *
 *     resolvedUrl = result.pathname === '/' && result.searchParams.size === 0
 *       ? result.origin
 *       : result.href
 *
 * so `alternates: { canonical: '/' }` renders the bare origin with NO trailing
 * slash, while every other path keeps exactly the one leading slash it was given.
 * `trailingSlash` is unset in next.config.ts, so nothing appends one afterwards.
 * Everything below matches that byte for byte, which is what stops Search Console
 * reporting "Duplicate without user-selected canonical" between a sitemap entry
 * and the canonical on the page it points at.
 *
 * CLIENT-SAFE. It imports nothing but plain data, so the admin's SEO panel can
 * show the writer the same URL the published page will carry.
 */

/**
 * The origin, normalised once.
 *
 * A trailing slash typed into content/site.ts would otherwise double up on every
 * path (`https://zefract.com//about`), and that is the kind of edit nobody
 * notices until a crawl report does. Stripped here rather than trusted there.
 */
const ORIGIN = SITE.url.replace(/\/+$/, '')

/**
 * Already a complete URL — an explicit scheme and authority, `https://…`.
 *
 * A PROTOCOL-RELATIVE `//host/path` IS DELIBERATELY NOT ABSOLUTE HERE, and that is a
 * decision this project has already taken once: the sanitiser in lib/blog.ts sets
 * `allowProtocolRelative: false` for the same reason. Nothing in this codebase produces
 * one — every Cloudinary URL from lib/cloudinary/url.ts is fully qualified — so the only
 * realistic way `//x` reaches this function is a path built from an empty variable
 * (`/${slug}/x` with no slug). Treating that as absolute would publish a canonical
 * pointing at a host called `x`; treating it as the doubled slash it almost certainly is
 * collapses it back to `/x`. Wrong-but-ours beats wrong-and-somebody-else's.
 */
function isAbsolute(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value)
}

/**
 * A route path as the absolute URL this site publishes for it.
 *
 *     absoluteUrl('/')            -> https://zefract.com
 *     absoluteUrl('/about')       -> https://zefract.com/about
 *     absoluteUrl('/about/')      -> https://zefract.com/about
 *     absoluteUrl('https://res.cloudinary.com/…') -> unchanged
 *
 * THE PASS-THROUGH IS LOAD-BEARING, not defensive tidiness. `BlogPostingSchema`
 * is handed `coverImageUrl(post)`, which returns a full Cloudinary URL for any
 * cover uploaded since the migration and a relative `/api/blog-images/<id>` for
 * the legacy ones. Concatenating the first case onto the origin produced
 * `https://zefract.comhttps://res.cloudinary.com/…` in the structured data of
 * every post with a modern cover — malformed, and invisible unless you read the
 * JSON-LD. One function that knows the difference is what makes both callers
 * correct without either having to check.
 */
export function absoluteUrl(path: string): string {
  if (!path) return ORIGIN
  if (isAbsolute(path)) return path

  /* One leading slash, whatever arrived, and no trailing one. The root collapses
     to the bare origin, matching Next's own canonical — see the note above. */
  const normalised = `/${path.replace(/^\/+/, '').replace(/\/+$/, '')}`
  return normalised === '/' ? ORIGIN : `${ORIGIN}${normalised}`
}

/**
 * The host on its own, for display.
 *
 * Three components were each doing `SITE.url.replace(/^https?:\/\//, '')` by
 * hand — the OG card, the admin's SEO panel and its collapsed preview — which is
 * the same duplication `absoluteUrl` exists to remove, just pointed at the other
 * half of the string. A `www.` the day someone puts one back in `SITE.url` would
 * have had to be remembered in three places; now it is derived in one.
 */
export function siteHost(): string {
  return ORIGIN.replace(/^https?:\/\//, '')
}

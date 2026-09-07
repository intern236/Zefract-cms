import { siteHost } from '@/lib/url'

/**
 * Is this request being served on a host that must NOT be indexed?
 *
 * WHY A HOST CHECK RATHER THAN A BUILD-TIME ONE. Netlify's `CONTEXT` variable
 * ("production" | "deploy-preview" | "branch-deploy" | "dev") is decided at build
 * time, and it cannot see the case that matters most: `zefract-website.netlify.app`
 * and `zefract.com` are the SAME production build, served from the same functions,
 * with `CONTEXT === 'production'` on both. Only the `Host` header separates them, so
 * only a request-time check can. A separate staging SITE has the same problem for the
 * same reason: its own production deploys are also `CONTEXT === 'production'`.
 *
 * DENY BY DEFAULT, and that is the whole point of the inversion. The obvious spelling
 * of this rule is a staging allowlist:
 *
 *     host.endsWith('.netlify.app') || host.startsWith('staging.')
 *
 * which is indexable-by-default: every host nobody thought of is treated as
 * production. A new branch subdomain, a review app, an IP address, a preview host on
 * a domain we do not control, a `Host` header a crawler simply made up, all of them
 * get the live robots.txt and no noindex. Listing the ONE host that may be indexed
 * inverts the failure: something unanticipated is quietly de-indexed rather than
 * quietly published. De-indexing the wrong host is a bad afternoon; indexing staging
 * is a duplicate-content problem that outlives the deploy that caused it.
 *
 * It also means NO NETLIFY HOSTNAME IS WRITTEN DOWN ANYWHERE. Renaming the site,
 * adding a branch deploy or standing up a second staging site changes nothing here.
 *
 * LOCALHOST IS STAGING, deliberately. `next dev` serves `Disallow: /` and sends the
 * noindex header, which is both harmless (nothing crawls localhost) and useful: the
 * staging path is the one you see by default, so it cannot rot unnoticed. To read the
 * production robots.txt locally, request it with the canonical Host header:
 *
 *     curl -H 'Host: zefract.com' http://localhost:3000/robots.txt
 */

/**
 * The hosts allowed to serve indexable responses.
 *
 * Derived from `SITE.url` through `siteHost()`, so it follows the site if the domain
 * ever changes, in keeping with lib/url.ts being the one place a host is spelled out.
 *
 * WWW IS ON THIS LIST EVEN THOUGH IT NEVER SERVES A PAGE. It 301s to the apex, at the
 * Netlify edge (primary domain) and again in next.config.ts as the versioned backstop.
 * Classifying it as staging would therefore not de-index a page, it would bolt
 * `X-Robots-Tag: noindex` onto a 301. That is a well-known way to poison a redirect:
 * the directive is attached to the URL doing the consolidating, and the signal it
 * sends contradicts the one the 301 exists to send. Leaving www out of the staging set
 * lets the redirect do its job cleanly.
 */
const INDEXABLE_HOSTS = new Set([siteHost(), `www.${siteHost()}`].map((h) => h.toLowerCase()))

/**
 * `host` is the raw `Host` header, port and all, or null when there isn't one.
 *
 * A MISSING HOST COUNTS AS STAGING. It should not happen over HTTP/1.1 or HTTP/2, so
 * if it does, something is proxying us in a way nobody designed for. That is not the
 * moment to hand out the indexable response.
 */
export function isStagingHost(host: string | null | undefined): boolean {
  if (!host) return true

  /* Port stripped with an anchored `:\d+`, not `split(':')[0]`, so an IPv6 literal
     (`[::1]:3000`) survives as `[::1]` instead of collapsing to `[`. It ends up
     classified as staging either way; the difference is that one of those is a
     deliberate answer and the other is an accident that happens to be right. */
  const bare = host.trim().toLowerCase().replace(/:\d+$/, '')
  return !INDEXABLE_HOSTS.has(bare)
}

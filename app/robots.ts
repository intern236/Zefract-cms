import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'

import { isStagingHost } from '@/lib/staging'
import { absoluteUrl } from '@/lib/url'

/**
 * Paths no crawler should fetch, written ONCE and shared by every group below.
 *
 * IT HAS TO BE SHARED, and that is the whole reason it is a constant rather than
 * two literals. robots.txt groups do not inherit: a crawler picks the ONE group
 * whose User-agent matches it most specifically and ignores every other group,
 * `*` included. So the moment GPTBot gets a block of its own, the `*` block stops
 * applying to it — and a named group carrying only `Allow: /` is an invitation to
 * crawl /admin, not a welcome to the site.
 *
 * Repeating the list by hand would work today and drift the first time a path is
 * added to one group and forgotten in the other. This makes that impossible.
 */
const DISALLOW = [
  // The static form declaration Netlify parses at build time — not a page.
  '/__forms.html',
  // The blog admin. Its pages are noindex too; this keeps crawlers from
  // even fetching the login form.
  '/admin',
  // Route handlers: the contact endpoint and the legacy blog-image
  // bytes. Neither is a page, and the images are reachable for indexing
  // through the <img> tags on the posts that use them.
  '/api/',
]

/**
 * AI crawlers and training-opt-out tokens, explicitly welcomed.
 *
 * The site sells AI search visibility (AEO/GEO is a service — see
 * /services/ai-search-geo), so being absent from the assistants that answer those
 * queries would contradict the offer. Silence is not neutrality here: several of
 * these tokens are checked FOR permission, so not naming them is what a publisher
 * does when they want out.
 *
 * TWO KINDS OF TOKEN ARE IN THIS LIST and they behave differently. GPTBot,
 * ChatGPT-User, OAI-SearchBot, PerplexityBot and ClaudeBot are real crawlers that
 * fetch URLs. Google-Extended and Applebot-Extended fetch NOTHING — they are
 * permission switches that say whether content already crawled by Googlebot or
 * Applebot may train Gemini or Apple Intelligence. Allowing them changes no
 * crawling and does not affect Search ranking; it opts the content in.
 *
 * Listed as one group with several User-agent lines rather than seven near-identical
 * blocks. Byte-for-byte a different file from the brief's version, semantically the
 * same file: consecutive User-agent lines form ONE group in the standard.
 */
const AI_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'PerplexityBot',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
]

/**
 * READ AT REQUEST TIME, NOT BUILD TIME, and that is the whole reason this route is
 * dynamic. `robots.ts` is normally prerendered once and served as a static file, which
 * cannot work here: `zefract-website.netlify.app` and `zefract.com` are the same
 * build, so the two hosts would be handed the same bytes. `headers()` is a request-time
 * API and opts the route into dynamic rendering on its own; `dynamic` is stated anyway
 * so the intent survives a refactor rather than resting on a side effect.
 *
 * The cost is one function invocation per /robots.txt request instead of a CDN hit, on a
 * file crawlers fetch on the order of once a day.
 */
export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (isStagingHost((await headers()).get('host'))) {
    /**
     * Every crawler, every path, on any host that is not the canonical one.
     *
     * NO `sitemap` LINE, deliberately. A file that closes the whole site and then
     * advertises an index of it is contradictory, and the sitemap it would name is built
     * by absoluteUrl from SITE.url, so on a staging host it lists apex URLs: worse than
     * pointing a crawler at staging is pointing it at production FROM staging and
     * inviting the comparison.
     *
     * DISALLOW IS NOT PRIVACY. It asks politely, only well-behaved crawlers listen, and
     * because it blocks the FETCH it also stops those crawlers from ever seeing the
     * `X-Robots-Tag: noindex` that proxy.ts sets, so a staging URL that picks up an
     * external link can still surface as a bare URL. It is sufficient here only because
     * these hosts have never been crawled. Making staging genuinely invisible means
     * Netlify's visitor-access password, at which point this becomes belt and braces.
     */
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: AI_AGENTS,
        allow: '/',
        /* Present deliberately, and the one place this departs from the supplied
           file in substance rather than formatting. See the note on DISALLOW: without
           it these seven would be the only agents on the internet permitted to crawl
           the admin login. "Welcome" was the intent; "welcome everywhere" was not. */
        disallow: DISALLOW,
      },
    ],
    /* Absolute, on the canonical host, and built by the same helper the sitemap's own
       entries use — a robots.txt pointing at the www copy would hand a crawler the
       hostname the whole site redirects away from.

       THE SUPPLIED FILE ENDED `Sitemap: https://www.zefract.com/sitemap.xml` AND THAT
       LINE WAS NOT COPIED. www is not the canonical host: it 301s to the apex
       (next.config.ts), every canonical tag, OG url and JSON-LD URL on the site says
       `https://zefract.com`, and the sitemap lists apex URLs. Publishing the www form
       here would point crawlers at a redirect on the one file whose job is to tell them
       where the real URLs are. It stays derived from content/site.ts so it cannot drift
       from the rest of the site again. */
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}

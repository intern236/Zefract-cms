import type { Metadata } from 'next'

import { SITE } from '@/content/site'
import { PAGE_META, type AuthoredPath } from '@/content/meta'
import { absoluteUrl } from '@/lib/url'

/**
 * Helpers for keeping generated metadata inside what a SERP will actually show.
 *
 * Neither of these is an indexing rule and Search Console does not report on them: a long
 * title or description is indexed perfectly well, it is just cut off in the result. They
 * exist because both fields here are built from body copy, so their length is whatever the
 * sentence happened to be rather than anything anyone chose.
 */

/**
 * The first sentence of a headline, for titles built from a full-sentence claim.
 *
 * Case study titles run to two sentences ("4.1M banking users moved to a new core. Zero
 * minutes down."), which lands at 80 characters once the client name and the `| Zefract`
 * template are added. The first sentence carries the claim; the second is a flourish that
 * only survives in the SERP as an ellipsis.
 *
 * Returns the text unchanged when there is no sentence break to cut on, deliberately: a
 * clean 70-character title beats one truncated mid-clause on a comma.
 */
export function firstSentence(text: string): string {
  const match = text.match(/^(.+?[.!?])\s+\S/)
  return match ? match[1] : text
}

/**
 * A description trimmed to `max` on a word boundary.
 *
 * No ellipsis: Google appends its own when it truncates, and a description that ends in a
 * whole word reads as written rather than as cut. Returns the text unchanged when it already
 * fits, which is the common case.
 *
 * A cut can strand a function word at the end — "…moved in the first quarter, on a" — which
 * reads as an amputation where a content word reads as a phrase. So after the word-boundary
 * cut, trailing articles, prepositions and conjunctions are stripped along with any
 * punctuation they expose, repeating until the tail is a content word. Only the truncated
 * path pays this; text that fits is returned verbatim, however it ends.
 */
const DANGLING_TAIL =
  /(?:\s+(?:a|an|the|and|or|but|on|in|of|to|for|with|at|by|from|as|is|are|was|it|its|that|this|their|your|our)|[,;:.])+$/i

export function clampDescription(text: string, max = 155): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(DANGLING_TAIL, '')
}

/**
 * A complete Open Graph object for a page that wants its own title.
 *
 * THIS EXISTS BECAUSE `openGraph` DOES NOT MERGE. Next replaces the parent's object outright
 * rather than filling in the gaps, so a route that set `openGraph: { title, description }` to
 * get a per-page title silently dropped `og:image`, `og:type`, `og:site_name`, `og:url` and
 * `og:locale` along with it. The service pages shipped that way: 34 routes with two OG tags
 * each and no image.
 *
 * Restating those fields by hand at every call site is the same bug waiting to happen, so it
 * is built here once instead. A page that does not need its own title should pass nothing and
 * inherit the root, which is already complete.
 *
 * `images` points at the route `app/opengraph-image.tsx` generates. The hashless path is
 * deliberate and verified to serve the PNG: the hash Next appends is a cache-buster, not part
 * of the address.
 *
 * `title` is the bare page title. The site name is appended here rather than at each call
 * site, so the share title matches the `%s | Zefract` template the document title already
 * uses, and no page has to import SITE just to restate it. A page whose title is already
 * complete goes through `authoredMetadata` instead.
 */
export function pageOpenGraph({
  title,
  description,
  path,
}: {
  /** The page title without the site name, e.g. `About us`. */
  title: string
  description: string
  /** Route path with a leading slash, e.g. `/services/seo`. */
  path: string
}) {
  return openGraphFor({ title: `${title} | ${SITE.name}`, description, path })
}

/**
 * The same object, for a title that is already complete.
 *
 * Split out for the authored titles in content/meta.ts, which carry their own `| Zefract`
 * exactly where the author wanted it and would otherwise be handed a second one. Everything
 * else about the object is identical, and identical for a reason: this is the only place
 * the full set of OG fields is written down, which is what stops a caller reintroducing the
 * partial-object bug described above.
 */
function openGraphFor({
  title,
  description,
  path,
}: {
  /** The finished og:title, site name included if it belongs there. */
  title: string
  description: string
  path: string
}) {
  return {
    type: 'website' as const,
    siteName: SITE.name,
    locale: 'en_US',
    /* Through absoluteUrl, so og:url is the same spelling as the canonical on the same
       page — including at the root, where a bare `${SITE.url}${path}` would have said
       `https://zefract.com/` while the canonical said `https://zefract.com`. Nothing
       calls this with '/' today (the home page inlines its own OG object in the root
       layout), which is exactly why it was worth closing rather than leaving as a trap
       for whoever routes '/' through here next. */
    url: absoluteUrl(path),
    /* `absolute`, NOT a bare string. Next runs `title.template` over `openGraph.title` too,
       so a string here came back through the `%s | Zefract` template and every page on the
       site shipped `og:title` with the site name twice: "Services | Zefract | Zefract". The
       document <title> was always right, which is why it went unnoticed; only the share
       card and the platforms that read OG in place of the title tag saw it. */
    title: { absolute: title },
    description,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${SITE.name}: ${SITE.tagline}`,
      },
    ],
  }
}

/**
 * The title, description, canonical and share card for a page the client wrote copy for.
 *
 * Spread into a route's `metadata`, which then adds whatever is its own (`keywords`, a
 * `robots` rule on the legal pages):
 *
 *     export const metadata: Metadata = {
 *       ...authoredMetadata('/about'),
 *       keywords: [...],
 *     }
 *
 * `title.absolute` rather than `title`, because the authored titles already carry their own
 * site name. See content/meta.ts.
 *
 * The parameter is typed to the table's own keys, so a path that is not in the table, or is
 * merely misspelt, is a compile error rather than a page that quietly keeps the generated
 * title nobody noticed had been replaced.
 */
export function authoredMetadata(path: AuthoredPath): Metadata {
  const { title, description } = PAGE_META[path]

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: openGraphFor({ title, description, path }),
  }
}

/**
 * The same, for a path only known at build time.
 *
 * The dynamic routes (`/services/[slug]`, `/work/[slug]`) cannot name their path in the
 * source, so they ask at generateMetadata time and get `null` for the three routes the
 * table does not cover, which then fall back to the derived title and description they
 * have always used.
 */
export function authoredMetadataFor(path: string): Metadata | null {
  return path in PAGE_META ? authoredMetadata(path as AuthoredPath) : null
}

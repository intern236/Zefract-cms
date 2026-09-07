import type { MetadataRoute } from 'next'
import { getPillars, getServices, getCaseStudies } from '@/lib/content'
import { getPublicAuthors } from '@/lib/authors'
import { getPublishedPosts, getPublishedTags } from '@/lib/blog'
import { absoluteUrl } from '@/lib/url'

/**
 * Priorities express the crawl order the client asked for: home first, then the services
 * cluster, then proof. Pillars sit a step above individual services because each pillar
 * page links every service under it, so crawling a pillar discovers its whole family.
 *
 * EVERY URL HERE COMES FROM `absoluteUrl`, which is the same builder the canonical tags,
 * the JSON-LD and llms.txt use. A sitemap that spells an address differently from the
 * canonical on the page it points at is the classic way to earn "Duplicate without
 * user-selected canonical" in Search Console, and the two spellings that matter are the
 * host (apex, never www) and the trailing slash. The home entry therefore renders as the
 * bare origin with no trailing slash, because that is exactly what Next emits for
 * `alternates: { canonical: '/' }` — see the derivation in lib/url.ts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const pillars = await getPillars()
  const services = await getServices()
  const cases = await getCaseStudies()
  const posts = await getPublishedPosts()
  /* Only authors with something published — the others have no page, so listing
     them would advertise a 404. getPublicAuthors is the same filter the profile
     route enforces. */
  const authors = await getPublicAuthors()
  /* Derived from published posts, so a tag whose only post is a draft has no
     entry — the archive route 404s that case, and a sitemap must never advertise
     a URL that does not resolve. */
  const tags = await getPublishedTags()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/services'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/work'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: absoluteUrl('/about'), lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    /* 0.4 was the shell's weight, and the comment on it promised "normal weight
       when /blog/[slug] lands". It has landed: with posts published the index is
       a real hub, so it steps up beside /work. Empty again means back to 0.4. */
    {
      url: absoluteUrl('/blog'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: posts.length > 0 ? 0.7 : 0.4,
    },
    /* The authors hub. Same conditional weight as /blog and for the same reason:
       with nobody credited yet it is a page with an empty state on it, which is
       not worth crawling at full priority. */
    {
      url: absoluteUrl('/authors'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: authors.length > 0 ? 0.5 : 0.3,
    },
  ]

  /* /privacy and /terms are LISTED NOW, where they used to be omitted.
     The old exclusion was correct for what those routes held — placeholder
     scaffolding behind `robots: { index: false }`, and a sitemap must never
     advertise a noindex page. Both now carry the client's full documents and are
     indexable, so leaving them out would hide the two pages a procurement check
     goes looking for. Low priority and yearly: they are reference, not
     acquisition, and they change when the law does. */
  return [
    ...staticRoutes,
    {
      url: absoluteUrl('/privacy'),
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: absoluteUrl('/terms'),
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    ...pillars.map((p) => ({
      url: absoluteUrl(`/services/${p.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    ...services.map((s) => ({
      url: absoluteUrl(`/services/${s.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    ...cases.map((c) => ({
      url: absoluteUrl(`/work/${c.slug}`),
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
    /* Real lastModified, unlike the routes above: posts are the one content type
       that records when it changed, and the sitemap is revalidated on every
       publish (see the admin save action), so the date is actually true. */
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    /* Below posts: a profile is a hub for work that lives elsewhere, so it is
       worth crawling but never ahead of the articles themselves. Real
       lastModified for the same reason posts have one — an author record records
       when it changed, and the sitemap is revalidated whenever one is saved. */
    ...authors.map((a) => ({
      url: absoluteUrl(`/authors/${a.slug}`),
      lastModified: a.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
    /* Tag archives, last and lowest. They are navigation rather than content —
       every word on one is a link to a post already listed above — so they are
       worth crawling for discovery and should never outrank the posts they point
       at. No real lastModified: a tag has no timestamp of its own, and the date
       that would matter is the newest post carrying it, which changes the moment
       any of them is edited. `weekly` says the same thing without asserting a
       date this file cannot stand behind. */
    ...tags.map((t) => ({
      url: absoluteUrl(`/blog/tag/${t.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    })),
  ]
}

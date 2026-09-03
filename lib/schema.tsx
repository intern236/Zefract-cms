/**
 * JSON-LD structured data.
 *
 * The brief asks for Organization, Service, Article/BlogPosting, BreadcrumbList
 * and FAQPage (§11, L276-278), plus LocalBusiness "if we list an address".
 * The address is still a placeholder, so LocalBusiness is deliberately not
 * emitted — publishing a business address we do not have would be worse than
 * omitting the schema.
 */
import { SITE, CONTACT, SOCIAL } from '@/content/site'
import { resolved } from '@/lib/todo'
import { telE164 } from '@/lib/phone'
import { absoluteUrl } from '@/lib/url'
import { avatarUrl } from '@/lib/cloudinary/url'
import type { Author } from '@/lib/author-display'
import type { CaseStudy, Faq, Service } from '@/content/types'

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // `<` is escaped so a stray "</script>" in any content value cannot close
        // the tag early. The content is ours today, but it comes from editable
        // files and is destined for a CMS, so this should not depend on trust.
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

export function OrganizationSchema() {
  const email = resolved(CONTACT.email)
  const phone = resolved(CONTACT.phone)

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE.name,
        legalName: SITE.legalName,
        url: absoluteUrl('/'),
        description: SITE.description,
        /* The profiles that are the same entity as this site. Mapped from the shared list so
           it is edited in one place; a reader of the schema treats it as unordered. Only the
           URL crosses into the schema — `platform` and `label` exist for the footer's icon
           row, and sameAs takes bare addresses. */
        sameAs: SOCIAL.map((profile) => profile.url),
        ...(email || phone
          ? {
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'sales',
                ...(email ? { email } : {}),
                /* E.164 rather than the display string: this field is read by machines, and an
                   unambiguous international number leaves nothing to infer. */
                ...(phone ? { telephone: telE164(phone) } : {}),
              },
            }
          : {}),
      }}
    />
  )
}

export function ServiceSchema({ service }: { service: Service }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.outcome ?? SITE.description,
        provider: { '@type': 'Organization', name: SITE.name, url: absoluteUrl('/') },
        url: absoluteUrl(`/services/${service.slug}`),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${service.name} deliverables`,
          itemListElement: service.groups.map((g) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: g.name, description: g.benefit },
          })),
        },
      }}
    />
  )
}

export function FaqSchema({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }}
    />
  )
}

/**
 * A pillar page is a directory of its services, and this is that fact as data: a
 * CollectionPage whose mainEntity is the ordered list of service URLs. It is what lets a
 * crawler treat /services/engineering as the hub of its four service pages rather than as
 * one more leaf.
 */
export function CollectionPageSchema({
  name,
  description,
  path,
  items,
}: {
  name: string
  description?: string
  path: string
  items: { name: string; href: string }[]
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        ...(description ? { description } : {}),
        url: absoluteUrl(path),
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            url: absoluteUrl(item.href),
          })),
        },
      }}
    />
  )
}

export function BreadcrumbSchema({
  trail,
}: {
  trail: { name: string; href: string }[]
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.name,
          item: absoluteUrl(t.href),
        })),
      }}
    />
  )
}

/**
 * A blog post as BlogPosting — the type the brief names for articles (§11).
 * Dates go out as ISO strings: schema.org consumers parse ISO 8601, and a
 * Date serialised any other way is locale roulette.
 */
export function BlogPostingSchema({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  imageUrl,
  author,
}: {
  title: string
  description: string
  slug: string
  publishedAt: Date
  updatedAt: Date
  imageUrl?: string | null
  /** The named author, where the post has one. */
  author?: Author | null
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        url: absoluteUrl(`/blog/${slug}`),
        datePublished: publishedAt.toISOString(),
        dateModified: updatedAt.toISOString(),
        /* A PERSON WHERE THE POST HAS ONE, the Organization otherwise. The
           `@id` is the author's profile URL and is the same identifier
           PersonSchema emits there — which is what lets a search engine tell
           that the byline on this post and the profile page describe one person
           rather than two things with a matching name. */
        author: author
          ? {
              '@type': 'Person',
              '@id': absoluteUrl(`/authors/${author.slug}`),
              name: author.name,
              url: absoluteUrl(`/authors/${author.slug}`),
            }
          : { '@type': 'Organization', name: SITE.name, url: absoluteUrl('/') },
        publisher: { '@type': 'Organization', name: SITE.name, url: absoluteUrl('/') },
        /* absoluteUrl, NOT concatenation, and this is the call site that forced the
           helper to exist. `imageUrl` is whatever coverImageUrl() returned: a full
           Cloudinary URL for any cover uploaded since the migration, and a relative
           /api/blog-images/<id> for the legacy ones. Joining the first case onto the
           origin published `https://zefract.comhttps://res.cloudinary.com/...` in the
           structured data of every post with a modern cover. */
        ...(imageUrl ? { image: absoluteUrl(imageUrl) } : {}),
      }}
    />
  )
}

/**
 * An author, as a Person.
 *
 * WHY IT IS WORTH EMITTING AT ALL. `author` on a BlogPosting is the field a
 * search engine uses to attribute an article to somebody, and a bare name string
 * attributes it to nobody in particular — there is no way to tell that the "Ajit
 * Kumar" on one post is the same one on another, or the same one as anywhere
 * else on the web. A Person with a stable `@id` at their profile URL says all
 * three, and `sameAs` is what connects that identity to the profiles they
 * already have.
 *
 * `@id` IS THE PROFILE URL, and it is the same string BlogPostingSchema
 * references. That shared identifier is the entire mechanism: it is what turns
 * "a person called X wrote this" into "this specific person wrote this and these
 * four other things".
 */
export function PersonSchema({
  author,
  postCount,
}: {
  author: Author
  postCount: number
}) {
  const url = absoluteUrl(`/authors/${author.slug}`)
  const sameAs = [author.linkedinUrl, author.xUrl, author.websiteUrl].filter(
    (link): link is string => Boolean(link)
  )
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        /* The page is the ProfilePage; the person is its mainEntity. Typing the
           page itself as a Person is the common mistake — it conflates the
           document with its subject, and search engines read the two
           differently. */
        mainEntity: {
          '@type': 'Person',
          '@id': url,
          name: author.name,
          url,
          ...(author.role ? { jobTitle: author.role } : {}),
          ...(author.bio ? { description: author.bio } : {}),
          ...(author.avatar ? { image: avatarUrl(author.avatar.publicId, 640) } : {}),
          worksFor: { '@type': 'Organization', name: SITE.name, url: absoluteUrl('/') },
          ...(sameAs.length > 0 ? { sameAs } : {}),
        },
        url,
        /* States what the profile actually holds, which is the one thing a
           crawler cannot count for itself from a paginated list. */
        ...(postCount > 0
          ? { mainEntityOfPage: { '@type': 'WebPage', '@id': url } }
          : {}),
      }}
    />
  )
}

export function CaseStudySchema({ study }: { study: CaseStudy }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: study.title,
        description: study.problem,
        author: { '@type': 'Organization', name: SITE.name },
        publisher: { '@type': 'Organization', name: SITE.name, url: absoluteUrl('/') },
        ...(study.image ? { image: absoluteUrl(study.image) } : {}),
      }}
    />
  )
}

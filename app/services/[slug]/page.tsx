import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import { FaqSection } from '@/components/sections/faq'
import { ServiceParts } from '@/components/sections/service-parts'
import { ServiceWhy } from '@/components/sections/service-why'
import { ServiceRoadmapSection } from '@/components/sections/service-roadmap'
import { ServicePlansSection } from '@/components/sections/service-plans'
import { PillLink } from '@/components/ui/pill'
import { CollectionPageSchema, ServiceSchema } from '@/lib/schema'
import {
  getServiceRoute,
  getServiceRouteSlugs,
  getCaseStudiesForService,
  getFaqs,
} from '@/lib/content'
import { SITE } from '@/content/site'
import { SERVICE_ROADMAPS } from '@/content/service-roadmaps'
import { PILLAR_PLANS } from '@/content/service-plans'
import { authoredMetadataFor, clampDescription, pageOpenGraph } from '@/lib/seo'

/**
 * One route serves both kinds of page.
 *
 * Appendix B's sitemap gives every service a flat /services/<service> URL but no
 * pillar routes, while the brief elsewhere promises "5 pillar pages". Both live
 * here and the accessor discriminates — the flat service URLs stay exactly as the
 * brief specified them, which matters if they are already committed for SEO.
 */
export async function generateStaticParams() {
  const slugs = await getServiceRouteSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/services/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const entry = await getServiceRoute(slug)
  if (!entry) return {}

  /* A service's keywords are its Appendix C aliases: the everyday phrasing buyers actually
     search ("UI/UX design" for experience-design). A pillar's are the names of the services
     under it, which is what that page is a directory of. Computed before the authored
     branch below because both paths want them. */
  const keywords =
    entry.kind === 'pillar'
      ? [entry.pillar.name, ...entry.services.map((s) => s.name)]
      : [entry.service.name, ...(entry.service.aliases ?? [])]

  /* Where the client wrote a title and description for this route, they win outright. That
     covers 29 of the 31 service routes; /services/local-reputation and
     /services/managed-services are not in the table and fall through to the derived copy
     below, which is what every route used before. */
  const authored = authoredMetadataFor(`/services/${slug}`)
  if (authored) return { ...authored, keywords }

  /* The tagline leads the description, but almost never fills it. Taglines are punchy by
     design — "The manual process, gone." is 25 characters — and a SERP snippet that short
     both looks thin and cedes the rest of the ~155-character slot Google would otherwise
     fill with the page's actual pitch. So a short tagline is extended with the document's
     own opening paragraph and the pair clamped to snippet length; a tagline already long
     enough to stand alone (70+) is left exactly as written. Pillar blurbs have the
     opposite problem — Engineering's runs 176 characters — so they are clamped down. */
  const title = entry.kind === 'pillar' ? entry.pillar.name : entry.service.name
  let description: string
  if (entry.kind === 'pillar') {
    description = clampDescription(entry.pillar.blurb)
  } else {
    const tagline = entry.service.story?.tagline ?? entry.service.outcome ?? SITE.description
    description =
      tagline.length >= 70
        ? clampDescription(tagline)
        : clampDescription(`${tagline} ${entry.service.story?.intro?.[0] ?? ''}`.trim())
  }

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/services/${slug}` },
    /* pageOpenGraph, NOT a two-field literal. Next replaces the parent openGraph object
       outright rather than merging, so the literal this used to be silently dropped
       og:image, og:type, og:url, og:site_name and og:locale on all 31 of these routes —
       the exact failure lib/seo.ts documents. */
    openGraph: pageOpenGraph({ title, description, path: `/services/${slug}` }),
  }
}

export default async function ServiceRoutePage({ params }: PageProps<'/services/[slug]'>) {
  const { slug } = await params
  const entry = await getServiceRoute(slug)
  if (!entry) notFound()

  const trail = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
  ]

  // ---- Pillar page -------------------------------------------------------
  if (entry.kind === 'pillar') {
    const { pillar, services } = entry
    /* Asked by pillar rather than hardcoded to marketing: a practice with plans renders them
       and one without renders nothing, so a second priced pillar is an entry in
       content/service-plans.ts and this file does not change. */
    const plans = PILLAR_PLANS[pillar.slug]
    return (
      <>
        {/* The pillar as a directory of its services, in data. Service pages carry their
            own Service schema; without this the pillar was schema-less beyond breadcrumbs
            and read as a leaf rather than the hub of its family. */}
        <CollectionPageSchema
          name={pillar.name}
          description={pillar.blurb}
          path={`/services/${pillar.slug}`}
          items={services.map((s) => ({ name: s.name, href: `/services/${s.slug}` }))}
        />
        <PageHero
          eyebrow="Practice"
          /* The SEO heading where the client wrote one, the name otherwise. Note the trail
             below still uses `pillar.name` — a breadcrumb is a label, and "Engineering
             Services: Web, APIs, Mobile & QA" in a crumb would be absurd. That split is the
             whole reason `h1` is its own field; see the note on Service.h1. */
          heading={pillar.h1 ?? pillar.name}
          sub={pillar.blurb}
          trail={[...trail, { name: pillar.name, href: `/services/${pillar.slug}` }]}
        />

        <Section spacing="tight">
          <Container>
            <Reveal>
              <p className="max-w-[46ch] text-[26px] leading-tight font-bold tracking-[-0.02em] text-balance text-head">
                {pillar.outcome}
              </p>
            </Reveal>

            <Stagger className="mt-12 grid gap-4.5 md:grid-cols-2" step={0.06}>
              {services.map((service) => (
                <StaggerItem key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="card-pop flex h-full flex-col rounded-card border border-line bg-surface p-7"
                  >
                    <h2 className="text-[22px] font-bold tracking-[-0.02em] text-head">
                      {service.name}
                    </h2>
                    {service.outcome ? (
                      <p className="mt-2 text-[15.5px] text-mut">{service.outcome}</p>
                    ) : null}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {service.groups.slice(0, 4).map((g) => (
                        <span
                          key={g.name}
                          className="rounded-full border border-line bg-page px-3 py-1.5 text-[12.5px] font-semibold text-head"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>

        {/* Below the cards, because the plans price what the cards describe. A visitor who has
            just read what the practice does is the one asking what it costs. */}
        {plans ? <ServicePlansSection plans={plans} /> : null}

        <CtaBand />
      </>
    )
  }

  // ---- Service page ------------------------------------------------------
  const service = entry.service
  const proof = await getCaseStudiesForService(service.slug)
  const faqs = await getFaqs(service.slug)
  /* Six of the thirty-one service routes have a roadmap; the rest render nothing here. Looked
     up by slug so a seventh is an entry in content/service-roadmaps.ts and this file does not
     change. */
  const roadmap = SERVICE_ROADMAPS[service.slug]

  return (
    <>
      <ServiceSchema service={service} />
      <PageHero
        eyebrow="Service"
        /* The client's SEO heading where there is one, the service name otherwise — the two
           services absent from their sheet (managed-services, local-reputation) take the
           fallback and are unchanged. The trail keeps `service.name` deliberately: see the
           matching note on the pillar hero above. */
        heading={service.h1 ?? service.name}
        /* The document's own tagline where there is one, falling back to `outcome`, which is
           written to fit a mega-menu row. Same styling either way — only the words change. */
        sub={service.story?.tagline ?? service.outcome}
        trail={[...trail, { name: service.name, href: `/services/${service.slug}` }]}
      />

      {/* Where the client's own document defines the service part by part, those points
          render INSTEAD OF the generated groups. Not alongside: the two describe the same
          work at different depths, so showing both listed "Local SEO" twice.

          The parts are an indexed list rather than a grid — see the note in
          service-parts.tsx for why a grid was the wrong shape for a numbered sequence. */}
      {service.points && service.points.length > 0 ? (
        <ServiceParts
          points={service.points}
          /* No heading where the document supplies its own opening: it runs tagline, intro,
             then "01" with nothing between, and its numbered parts are its Heading 2s. A
             service with no document still opens on "What we do". */
          heading={service.story?.intro ? undefined : 'What we do'}
          intro={service.story?.intro}
          platforms={service.story?.platforms}
          /* Dropped on a document-driven page for the same reason as Proof: "Also known as
             search engine optimization" is ours, not the client's, and the page is meant to
             be the document. It still earns its keep on the pages that have no document
             copy of their own, which is where it stays. Worth knowing it was doing real work
             — it is Appendix C's everyday phrasing, the words buyers actually search. */
          aliases={service.story ? undefined : service.aliases}
          indexLabel={`${service.name}, contents`}
        />
      ) : (
        <Section spacing="tight">
          <Container>
            <Reveal>
              <h2 className="text-[30px] font-extrabold tracking-[-0.03em] text-head">
                What we do
              </h2>
              {/* Appendix C's everyday phrasing, surfaced as real copy rather than
                  meta keywords — this is what buyers actually search for. */}
              {service.aliases && service.aliases.length > 0 ? (
                <p className="mt-3 max-w-[62ch] text-[15.5px] text-mut">
                  Also known as {service.aliases.join(', ')}.
                </p>
              ) : null}
            </Reveal>

            <Stagger className="mt-10 grid gap-4.5 md:grid-cols-2" step={0.06}>
              {service.groups.map((group) => (
                <StaggerItem key={group.name}>
                  {/* .card-pop — the same class the Proof cards further down use. It
                      covers both because :focus-visible cannot match an <article>: link
                      cards get the keyboard mirror, these silently do not. */}
                  <article className="card-pop h-full rounded-card border border-line bg-surface p-7">
                    <h3 className="text-[19px] font-bold tracking-[-0.02em] text-head">
                      {group.name}
                    </h3>
                    <p className="mt-1.5 text-[15px] text-mut">{group.benefit}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {group.chips.map((chip) => (
                        <li
                          key={chip.label}
                          /* Same treatment as the industry tags on the home page. The
                             lift is small enough that a chip inside an already-lifted
                             card does not read as floating away from it. */
                          className="chip-pop rounded-full border border-line bg-page px-3 py-1.5 text-[12.5px] font-semibold text-head"
                        >
                          {chip.short ?? chip.label}
                          {/* Where the label was shortened to meet the brief's 1-3 word
                              rule, the full Appendix D wording stays available to screen
                              readers. A title attribute would not — it is inconsistently
                              announced and invisible on touch. */}
                          {chip.short ? <span className="sr-only">, {chip.label}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      )}

      {/* After what the work is, before why to buy it here. The parts above say what the
          service consists of, this says how it would actually run and over what weeks, and the
          argument that follows says why us. What, then how, then why. */}
      {roadmap ? <ServiceRoadmapSection roadmap={roadmap} /> : null}

      {/* Proof is a site addition, not something a service document asks for — so a page
          driven by one does not carry it. The client's note was that the SEO page should be
          the document and not the document plus whatever else the template had lying around.
          Services with no document keep it: there, the case studies are the only evidence on
          the page at all. */}
      {proof.length > 0 && !service.story ? (
        <Section>
          <Container>
            <Reveal>
              <h2 className="text-[30px] font-extrabold tracking-[-0.03em] text-head">Proof</h2>
              <div className="mt-7 grid gap-4.5 md:grid-cols-2">
                {proof.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/work/${c.slug}`}
                    className="card-pop rounded-card border border-line bg-surface p-7"
                  >
                    <p className="font-mono text-[12px] tracking-[0.16em] text-brand-strong uppercase sm:text-[11px]">
                      {c.client} · {c.sector}
                    </p>
                    <p className="mt-3 text-[19px] leading-snug font-bold text-head">{c.title}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </Container>
        </Section>
      ) : null}

      {/* The document's closing argument: what the service returns, and why buy it here.
          Renders nothing for a service without a document behind it. */}
      {service.story ? (
        <ServiceWhy story={service.story} serviceName={service.name} />
      ) : null}

      {/* The service in prose, for the buyer who wants to understand the thing rather
          than scan a list of deliverables. Only for services whose opening copy has not
          been promoted to an intro above the parts — see the note in services.overrides.ts.

          Measure capped at 68 characters: this is the longest running text on the page
          and the grid above it is far wider than is comfortable to read. */}
      {service.description && service.description.length > 0 ? (
        <Section>
          <Container>
            <Reveal>
              <h2 className="text-[30px] font-extrabold tracking-[-0.03em] text-head">
                About {service.name}
              </h2>
              <div className="mt-5 max-w-[68ch] space-y-4">
                {service.description.map((para) => (
                  <p key={para.slice(0, 40)} className="text-[16.5px] text-mut">
                    {para}
                  </p>
                ))}
              </div>
            </Reveal>
          </Container>
        </Section>
      ) : null}

      {/* The generic ask, for a service with no closing CTA of its own. Where the document
          supplies one it has already been made on ink in <ServiceWhy>, and a second pill
          three sections later would be the same request asked twice. */}
      {!service.story?.closingCta ? (
        <Section>
          <Container>
            <Reveal>
              <PillLink href="/contact" variant="ink">
                Get a quote for {service.name}
              </PillLink>
            </Reveal>
          </Container>
        </Section>
      ) : null}

      {/* Above the CTA band on purpose: the band is this page's "Next step", and an
          unanswered question is the thing that stops someone taking it. <FaqSection> brings
          its own FAQPage JSON-LD, so these are eligible for the answer surfaces the AI Search
          pages sell. It returns null when a service has no FAQs, so a service still awaiting
          content keeps exactly the page it had. */}
      {/* "SEO, asked and answered." read as a slogan rather than a label — and for a service
          whose name is an acronym it parsed as a sentence fragment. A plain, conventional
          heading is what a reader scanning for their question is looking for, and it is also
          the phrasing answer engines match against. */}
      <FaqSection faqs={faqs} eyebrow="FAQ" heading="Frequently asked questions" />

      <CtaBand />
    </>
  )
}

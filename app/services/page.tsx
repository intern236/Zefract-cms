import Link from 'next/link'
import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import { getPillars, getPillarServices, getCrossCuttingServices } from '@/lib/content'
import { pageOpenGraph } from '@/lib/seo'

const SERVICES_DESCRIPTION =
  'Five practices, staffed from one bench: engineering, experience and design, AI and automation, cloud, data and security, and marketing and growth.'

export const metadata: Metadata = {
  title: 'Services',
  description: SERVICES_DESCRIPTION,
  keywords: [
    'software development services',
    'engineering',
    'experience and design',
    'AI and automation',
    'cloud, data and security',
    'marketing and growth',
  ],
  alternates: { canonical: '/services' },
  openGraph: pageOpenGraph({
    title: 'Services',
    description: SERVICES_DESCRIPTION,
    path: '/services',
  }),
}

export default async function ServicesPage() {
  const pillars = await getPillars()
  const grouped = await Promise.all(
    pillars.map(async (pillar) => ({ pillar, services: await getPillarServices(pillar.slug) }))
  )
  const crossCutting = await getCrossCuttingServices()

  return (
    <>
      <PageHero
        eyebrow="What we run"
        heading="Five practices. One invoice."
        sub="Strategy through support, staffed from the same bench. Nothing falls between vendors because there are no other vendors."
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Services', href: '/services' },
        ]}
      />

      <Section spacing="tight">
        <Container>
          <div className="space-y-16">
            {grouped.map(({ pillar, services }) => (
              <Reveal key={pillar.slug}>
                <div className="border-t border-line pt-10">
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <h2 className="text-[30px] font-extrabold tracking-[-0.03em] text-head">
                      <Link href={`/services/${pillar.slug}`} className="hover:text-brand-strong">
                        {pillar.name}
                      </Link>
                    </h2>
                    <p className="font-mono text-[12px] tracking-[0.16em] text-mut uppercase sm:text-[11px]">
                      {services.length} services
                    </p>
                  </div>
                  <p className="mt-3 max-w-[70ch] text-[15.5px] text-mut lg:text-[16.5px]">
                    {pillar.blurb}
                  </p>

                  <Stagger className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" step={0.04}>
                    {services.map((service) => (
                      <StaggerItem key={service.slug} y={12}>
                        <Link
                          href={`/services/${service.slug}`}
                          className="card-pop flex h-full flex-col rounded-tile border border-line bg-surface px-5 py-4"
                        >
                          <span className="text-[15px] font-bold text-head">{service.name}</span>
                          {service.outcome ? (
                            <span className="mt-1 text-[13.5px] text-mut">{service.outcome}</span>
                          ) : null}
                        </Link>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              </Reveal>
            ))}

            {crossCutting.length > 0 ? (
              <Reveal>
                <div className="border-t border-line pt-10">
                  <h2 className="text-[30px] font-extrabold tracking-[-0.03em] text-head">
                    Cross-cutting
                  </h2>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {crossCutting.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="card-pop flex flex-col rounded-tile border border-line bg-surface px-5 py-4"
                      >
                        <span className="text-[15px] font-bold text-head">{service.name}</span>
                        {service.outcome ? (
                          <span className="mt-1 text-[13.5px] text-mut">{service.outcome}</span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            ) : null}
          </div>
        </Container>
      </Section>

      <CtaBand spacing="compact" layout="pairs" />
    </>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'
import { CaseCover } from '@/components/ui/case-cover'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Stagger, StaggerItem } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import { getCaseStudies } from '@/lib/content'
import { authoredMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...authoredMetadata('/work'),
  keywords: ['case studies', 'software project outcomes', 'client work', 'Zefract work'],
}

export default async function WorkPage() {
  const cases = await getCaseStudies()

  return (
    <>
      <PageHero
        eyebrow="Recent work"
        heading="Real Client Results: Case Studies & Outcomes"
        sub="Every engagement below is described by what changed, not by what we shipped."
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Work', href: '/work' },
        ]}
      />

      <Section spacing="tight">
        <Container>
          <Stagger className="grid gap-4.5 md:grid-cols-2" step={0.07}>
            {cases.map((c) => (
              <StaggerItem key={c.slug}>
                <Link
                  href={`/work/${c.slug}`}
                  className="card-pop group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface"
                >
                  {/* ALWAYS RENDERED NOW. This was gated on `c.image`, so a study with no
                      artwork produced a card that began abruptly at its eyebrow while the
                      one beside it had a picture — two different card shapes in one grid.
                      <CaseCover> draws a panel when there is no photograph, so every card
                      has the same anatomy. The alt is named rather than decorative on the
                      photograph path; image search indexes it. */}
                  <CaseCover
                    study={c}
                    className="aspect-16/9 w-full"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    imageClassName="grayscale-[0.9] brightness-[0.8] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <div className="flex flex-1 flex-col p-7">
                    <p className="font-mono text-[12px] tracking-[0.16em] text-brand-strong uppercase sm:text-[11px]">
                      {c.client} · {c.sector}
                    </p>
                    <h2 className="mt-3 text-[22px] leading-snug font-bold tracking-[-0.02em] text-head">
                      {c.title}
                    </h2>
                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                      {c.outcomes.map((o) => (
                        <p key={o.label} className="text-[13.5px] text-mut">
                          <b className="text-[17px] font-extrabold text-head">{o.value}</b>{' '}
                          {o.label}
                        </p>
                      ))}
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <CtaBand />
    </>
  )
}

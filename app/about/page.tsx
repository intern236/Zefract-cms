import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import { Process } from '@/components/sections/process'
import { SITE } from '@/content/site'
import { authoredMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  /* Title, description, canonical and share card all come from the authored table in
     content/meta.ts. Keywords stay here: the table covers what a SERP shows, not the
     page's own subject terms. */
  ...authoredMetadata('/about'),
  keywords: [SITE.name, SITE.legalName, 'about', 'software development team'],
}

/** PLACEHOLDER — the brief assigns story, team bios and certifications to the client (§8). */
const VALUES = [
  {
    title: 'One owner, end to end',
    body: 'Every engagement has a single accountable lead. No handoffs between vendors, because there are no other vendors.',
  },
  {
    title: 'Numbers before opinions',
    body: 'We report against revenue and performance, and we tell you when something we built is not earning.',
  },
  {
    title: 'Straight answers',
    body: 'Fixed quotes in writing, a staging link you can open any day, and the occasional "this is not us".',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        heading="Zefract: One Team, Five Practices"
        sub={SITE.description}
        trail={[
          { name: 'Home', href: '/' },
          { name: 'About', href: '/about' },
        ]}
      />

      <Section spacing="tight">
        <Container>
          <Reveal>
            <div className="max-w-[62ch] space-y-5 text-[17px] text-mut">
              <p>
                {SITE.legalName} exists because the usual arrangement does not work. A design
                studio, a dev shop and an agency, each with its own brief, each losing a week at
                every handoff, and nobody who can answer for the whole thing.
              </p>
              <p>
                We staff engineering, design, AI, cloud and growth from one bench. That means the
                person who designs the screen sits near the person who ships it and the person who
                has to make it rank.
              </p>
            </div>
          </Reveal>

          <Stagger className="mt-16 grid gap-4.5 md:grid-cols-3" step={0.07}>
            {VALUES.map((value) => (
              <StaggerItem key={value.title}>
                {/* .card-pop is the one card hover in the app. These are <article>s,
                    so its :focus-visible half simply never fires — an element that
                    cannot be focused cannot match it. See globals.css. */}
                <article className="card-pop h-full rounded-card border border-line bg-surface p-7">
                  <h2 className="text-[20px] font-bold tracking-[-0.02em] text-head">
                    {value.title}
                  </h2>
                  <p className="mt-3 text-[15.5px] text-mut">{value.body}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Process />
      <CtaBand />
    </>
  )
}

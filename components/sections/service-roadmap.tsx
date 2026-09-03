import { Container, Section, SectionHead } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { ROADMAP_NOTE } from '@/content/service-roadmaps'
import type { ServiceRoadmap } from '@/content/types'

/**
 * One service's six-phase execution roadmap.
 *
 * NO ACCORDION, and that is the whole difference from the version this replaces. The roadmaps
 * first rendered as a stack of six on the Marketing & Growth pillar page, where they had to be
 * collapsible or thirty-six phases would have buried the page they were meant to support. One
 * per page removes that pressure entirely, and a collapsible control with a single item is a
 * control that does nothing: it asks for a click to reveal the only thing it holds.
 *
 * It also drops a dependency the old version needed. Collapsed panels only reach a crawler
 * because the accordion is forceMounted, which is a fix that has to keep being true. Content
 * that is simply on the page needs nobody to remember anything.
 *
 * WHERE IT SITS. After the service's parts and before the argument for buying it here. The
 * parts say what the work is, this says how it would actually run, and the section after says
 * why us. What, then how, then why.
 */
export function ServiceRoadmapSection({ roadmap }: { roadmap: ServiceRoadmap }) {
  return (
    <Section id="roadmap" spacing="compact">
      <Container>
        <SectionHead eyebrow="Execution roadmap" heading={roadmap.heading} sub={roadmap.sub} />

        <Reveal className="mx-auto mt-12 max-w-[820px]">
          <p className="max-w-[66ch] text-[16px] leading-[1.65] text-mut lg:text-[17.5px]">
            {roadmap.intro}
          </p>

          <ol className="mt-10 space-y-0">
            {roadmap.phases.map((phase, i) => {
              /* The document tints its last row, which is always the phase with no end date.
                 That is the argument the whole table is making, so the emphasis is kept: the
                 ongoing phase gets the brand treatment on its marker and its timeline, every
                 other phase stays neutral. */
              const ongoing = i === roadmap.phases.length - 1

              return (
                <li
                  key={phase.name}
                  /* Rule on the top of each row, so the last phase does not end on a line that
                     promises another one. */
                  className="border-t border-line pt-7 pb-8 first:border-t-0 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span
                      aria-hidden="true"
                      className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-medium tabular-nums ${
                        ongoing ? 'bg-brand text-ink' : 'bg-ink text-white'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <h3 className="text-[18px] font-bold tracking-[-0.02em] text-head">
                      {phase.name}
                    </h3>
                    <span
                      className={`rounded-full border px-3 py-1 font-mono text-[11px] font-medium tracking-[0.14em] uppercase ${
                        ongoing ? 'border-brand text-brand-strong' : 'border-line text-mut-2'
                      }`}
                    >
                      {phase.timeline}
                    </span>
                  </div>

                  {/* Indented to the heading rather than the marker, so the markers form their
                      own column down the left edge. Desktop only: at narrow widths that indent
                      is width the text cannot spare. */}
                  <div className="mt-3.5 max-w-[64ch] sm:pl-10">
                    <p className="text-[15.5px] leading-[1.65] text-mut lg:text-[16.5px]">
                      {phase.lead}
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-2">
                      {phase.items.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-head"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* The document's closing note. Its second sentence is the one that earns its place
              here: three of these roadmaps give two consecutive phases the same week range, and
              without this it reads as a copy-paste error. */}
          <div className="mt-12 border-t border-line pt-8">
            <h3 className="font-mono text-[11px] font-medium tracking-[0.2em] text-mut-2 uppercase">
              {ROADMAP_NOTE.heading}
            </h3>
            <p className="mt-3 max-w-[70ch] text-[15px] leading-[1.65] text-mut">
              {ROADMAP_NOTE.body}
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}

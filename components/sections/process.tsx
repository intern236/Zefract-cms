import { Container, Section, SectionHead } from '@/components/ui/section'
import { Stagger, StaggerItem, DrawLine } from '@/components/motion/reveal'
import { PROCESS, PROCESS_INTRO } from '@/content/home'

export function Process() {
  return (
    <Section id="process">
      <Container>
        <SectionHead eyebrow={PROCESS_INTRO.eyebrow} heading={PROCESS_INTRO.heading} />

        <Stagger className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5" step={0.07}>
          {PROCESS.map((step, i) => (
            <StaggerItem key={step.number}>
              <div className="relative">
                {/* Connector rule between steps on wide screens, drawing itself
                    left to right as its step arrives. It inherits the variant from
                    the <StaggerItem> above it, so the line and the step it leads
                    from are on the same clock; the small delay lets the step land
                    before the thread runs on to the next one.

                    The last step's line is dropped - it would point at nothing. */}
                {i < PROCESS.length - 1 ? (
                  <DrawLine
                    delay={0.18}
                    className="absolute top-3 -right-3 hidden h-px w-6 bg-line lg:block"
                  />
                ) : null}
                <span className="font-mono text-[12px] font-medium tracking-[0.2em] text-brand-strong sm:text-[11px]">
                  {step.number}
                </span>
                <h3 className="mt-3 text-[19px] font-bold tracking-[-0.02em] text-head">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14.5px] text-mut">{step.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  )
}

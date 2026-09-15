import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Container, Section, SectionHead } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { FaqSchema } from '@/lib/schema'
import type { Faq } from '@/content/types'

/**
 * FAQ accordion.
 *
 * Emits FAQPage JSON-LD alongside the markup — the brief asks for structured FAQ
 * blocks specifically so pages can surface in AI overviews (§11, L280-282).
 */
export function FaqSection({
  faqs,
  eyebrow = 'Questions',
  heading = 'Asked before the first call.',
  spacing = 'default',
  schema = true,
}: {
  faqs: Faq[]
  eyebrow?: string
  heading?: string
  /** Defaults to the site rhythm. The Services pages pass `compact` — see <Section>. */
  spacing?: 'default' | 'compact'
  /**
   * Whether to emit FAQPage JSON-LD alongside the accordion. True everywhere but one place.
   *
   * THE EXCEPTION IS AN HTML-PAGE POST WHOSE PASTED PAGE ALREADY CARRIES ITS OWN FAQPage.
   * That structured data is preserved verbatim, so rendering this with schema on top would
   * put two FAQPage blocks on one URL — two answers to "what does this page answer", which is
   * how a page ends up telling a search engine two different things about itself. The
   * accordion is still wanted; only the second copy of the data is not.
   */
  schema?: boolean
}) {
  if (faqs.length === 0) return null

  return (
    <Section id="faq" spacing={spacing}>
      <Container>
        {schema ? <FaqSchema faqs={faqs} /> : null}
        <SectionHead eyebrow={eyebrow} heading={heading} />

        {/* The accordion reveals as one block rather than row by row. Radix tracks
            its items through a collection to wire up arrow-key navigation, and
            interleaving a wrapper element per item is not worth risking that for a
            stagger nobody asked for. The open/close animation is already there via
            tw-animate-css. */}

        <Reveal className="mx-auto mt-12 max-w-[820px]">
          <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                value={`faq-${i}`}
                className="border-b border-line"
              >
                <AccordionTrigger className="py-6 text-left text-[18px] font-bold tracking-[-0.015em] text-head hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-[15.5px] leading-relaxed text-mut">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </Section>
  )
}

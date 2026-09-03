import { Intro } from '@/components/motion/intro'
import { Hero } from '@/components/sections/hero'
import { ClientLogos } from '@/components/sections/client-logos'
import { ProofBento } from '@/components/sections/proof-bento'
import { Pains } from '@/components/sections/pains'
import { Practices } from '@/components/sections/practices'
import { FeaturedCase } from '@/components/sections/featured-case'
import { Industries } from '@/components/sections/industries'
import { Compare } from '@/components/sections/compare'
import { Process } from '@/components/sections/process'
import { Testimonials } from '@/components/sections/testimonials'
import { FaqSection } from '@/components/sections/faq'
import { CtaBand } from '@/components/sections/cta-band'
import { getFaqs } from '@/lib/content'

export default async function HomePage() {
  const faqs = await getFaqs()

  return (
    <>
      {/* Home only, and only on a real load — see the note in intro.tsx. Mounted here
          rather than in the layout so no other route can ever show it. */}
      <Intro />
      <Hero />
      {/* The client logo strip. Its `mt-10` clears the hero's warm glow, which bled
          straight into the logos when this sat flush at 0px; it has no bottom margin,
          because <ProofBento> brings its own top padding and stacking the two was what
          made this band read as a hole in the page.

          IT NOW CARRIES REAL CLIENTS, each linked to its own site, where it carried
          eight invented wordmarks from the design comp. The markup moved into
          <ClientLogos> along with them — a row of images with links is more than a page
          file should be assembling inline. See CLIENT_LOGOS in content/site.ts for where
          the logos came from, what was done to two of them to make them visible, and the
          consent that is still owed on all six. */}
      <ClientLogos />
      <ProofBento />
      <Pains />
      <Practices />
      <FeaturedCase />
      <Industries />
      <Compare />
      <Process />
      <Testimonials />
      <FaqSection faqs={faqs} />
      <CtaBand layout="pairs" />
    </>
  )
}

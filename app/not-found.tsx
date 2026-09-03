import type { Metadata } from 'next'
import Link from 'next/link'
import { Container, Eyebrow, Heading } from '@/components/ui/section'
import { PillLink } from '@/components/ui/pill'

/* The 404 status alone keeps this out of the index; the explicit noindex is belt and
   braces. What this export mainly fixes is the canonical: without it the page inherits
   the root's `canonical: '/'`, and a 404 declaring itself the canonical form of the
   home page is exactly the kind of signal that muddies indexing. */
export const metadata: Metadata = {
  title: 'Page not found',
  /* Its own words, not the inherited site description: the 404 sharing the home page's
     description is exactly the kind of duplicate a crawl report flags. */
  description:
    'That page does not exist or has moved. Head back to the home page, browse the services index, or tell us what you were looking for.',
  /* An explicitly empty object, not an omission: metadata keys inherit unless the child
     defines them, so leaving `alternates` out would keep the root's canonical. Defining
     it empty replaces the parent's whole alternates block with nothing. */
  alternates: {},
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    /* `hero-grid` is what makes this branded rather than a bare error: it carries the
       same 64px lattice and warm glow rising from the fold that the home hero does, so a
       dead link still lands somewhere that looks like the site.

       DELIBERATELY WITHOUT <HeroAmbient />. That component is the drifting orbs and the
       four nine-dot trails — 38 elements animating continuously. It earns that on the
       page people arrive on; on a page whose only job is to move someone along, it is
       battery and compositor cost for a backdrop nobody stays to watch. The grid and the
       glow are the static half, and they are the half that reads as brand. */
    <section className="hero-grid relative isolate overflow-clip py-40 text-center">
      <Container>
        <Eyebrow className="mb-6">Error 404</Eyebrow>
        <Heading as="h1" lines={['That page has', 'slipped off the grid.']} />
        <p className="mx-auto mt-6 max-w-[46ch] text-[17.5px] text-mut">
          The link is broken or the page has moved. The services index is the fastest way back
          to whatever you were after.
        </p>

        {/* THE PAIR IS `size="pair"`, NOT THE DEFAULT, and that is a measurement rather
            than a preference — the same one hero.tsx records for its own two pills.

            Measured with the real font at every phone width: at the default
            12px/0.14em/28px these two labels come to 367.8px side by side, against the
            342px a 390px screen leaves inside the container's px-6. So the row WAS
            wrapping into a 1+1 stack on every phone, which reads as a layout fault on the
            one page a visitor is already unsure about. `pair` brings the pair to 275.9px
            and holds one line from 360px up.

            AT 320px IT STILL WRAPS — 275.9px against 272px of inner width, short by under
            4px — and that is left alone rather than chased. Shrinking the type again to
            buy those pixels would put a tap target below the size the rest of the site
            holds, and 320px is the floor of the range, not the middle of it. A clean 1+1
            stack there is the right failure.

            Both size and gap return to their defaults at sm, so nothing above 640px
            moves. */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">
          <PillLink href="/" variant="ink" size="pair">
            Back to home
          </PillLink>
          <PillLink href="/services" variant="ghost" size="pair">
            Browse services
          </PillLink>
        </div>

        {/* Contact as a quieter line under the pills, which is the hero's own arrangement
            (two pills, then a note) rather than a new idea.

            A THIRD PILL WAS THE OBVIOUS MOVE AND IS WORSE HERE, and this was measured
            before it was ruled out. Adding a "Contact us" pill takes the row to 390.9px,
            which does not fit ANY phone — not 390px (342px inner) and not even 430px
            (382px inner). It breaks 2+1 at every one of them, leaving a single pill
            centred under two, which looks like a mistake rather than a choice. Stacking
            all three full-width instead makes a 404 as heavy as a pricing page.

            It also separates the two KINDS of action honestly: home and services are places
            to go, contact is what you do when neither of them has the thing. Giving the
            third equal visual weight would flatten that distinction, not respect it.

            Underlined rather than left to colour alone: this is prose, and a link inside a
            sentence that is only signalled by weight fails for anyone who cannot separate
            it from the emphasis around it. */}
        <p className="mx-auto mt-7 max-w-[46ch] text-[13.5px] text-mut-2">
          {/* Curly apostrophes, not straight ones. Correct typography, and it also keeps
              this clear of react/no-unescaped-entities without littering the copy with
              &apos; entities. */}
          Still can’t find it?{' '}
          <Link
            href="/contact"
            className="font-semibold text-head underline underline-offset-4 transition-colors hover:text-brand-strong"
          >
            Tell us what you were looking for
          </Link>{' '}
          and we’ll point you at it.
        </p>
      </Container>
    </section>
  )
}

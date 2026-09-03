import Image from 'next/image'
import { Container, Section, SectionHead } from '@/components/ui/section'
import { Carousel } from '@/components/ui/carousel'
import { Rating } from '@/components/ui/rating'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { StubValue } from '@/components/ui/stub-value'
import { getTestimonials } from '@/lib/content'
import { isTodo, resolved } from '@/lib/todo'
import { cn } from '@/lib/utils'

/**
 * Testimonials, as an auto-looping carousel of whole cards.
 *
 * Stripped back at the client's request to just three things: an accent bar across
 * the top, a header of avatar / name / role / stars, and the quote.
 *
 * Gone from the earlier version, which followed the BootstrapMade "Clarity"
 * reference more literally: the round quote-mark badge, and the footer that held a
 * divider and a company chip. The company moved up onto the role line rather than
 * leaving with the footer.
 *
 * What is kept from that reference is the top bar in brand orange, and
 * brand-strong for the stars so the small orange marks still clear AA.
 *
 * Three across on desktop, two on tablet, one on a phone - always complete cards,
 * never a slice of one at the edge.
 *
 * The track fades in as one block rather than per card: slides live in a
 * horizontal scroll container, so a per-card `whileInView` would hold the
 * off-screen ones at opacity 0 and animate them mid-slide.
 *
 * A GRID UNTIL THERE ARE MORE THAN THREE, AND THE CAROUSEL AFTER THAT.
 *
 * The carousel is built for a list longer than the view: it repeats the slides three
 * times and keeps the scroll position in the middle copy, which is what makes the loop
 * seamless. That arrangement needs more unique cards than fit on screen. At the desktop
 * three-up it breaks down twice over as the list shrinks — at three the controls have
 * nothing to slide, and at TWO the three visible positions are filled from a repeating
 * pair, so the same person appears on screen twice at once. That is not a subtle flaw; it
 * reads as a rendering bug on the one section whose whole job is to be believed.
 *
 * So the count decides the layout. With the six placeholder testimonials deleted there are
 * two real ones, and two cards side by side is the honest presentation of two — no dots
 * that go nowhere, no autoplay, no duplicates. Add a fourth and the carousel returns with
 * no edit here, which is why this is a threshold rather than a hardcoded grid.
 */

/** What the carousel shows across at its widest — see `--per` on .carousel-viewport. Past
 *  this many testimonials there is something to slide; at or below it, there is not. */
const CAROUSEL_FROM = 4

export async function Testimonials() {
  /**
   * A TESTIMONIAL WITHOUT A NAMED PERSON NEVER REACHES A PUBLIC PAGE.
   *
   * Several supplied quotes are still awaiting the reviewer's name — they arrived as
   * fill-in-the-blank drafts, see the note in content/cases.ts. A quote is a statement
   * somebody is said to have made, so an anonymous one is not a weaker testimonial, it is a
   * different and worthless thing: praise with nobody behind it. Filtering on the author
   * rather than on a separate "published" flag means the gate cannot be forgotten — the
   * card is impossible to publish until the field that identifies the speaker is filled in.
   *
   * IN DEVELOPMENT THEY ALL RENDER, with the name showing as a visible stub, because the
   * client reviewing this site needs to see the four cards that are one field away from
   * going live. Same production/development split as <StubValue> and the legal pages, and
   * the same reason: scaffolding belongs where the work happens, never on the live site.
   */
  const testimonials = (await getTestimonials()).filter(
    (t) => process.env.NODE_ENV !== 'production' || !isTodo(t.author)
  )
  if (testimonials.length === 0) return null

  const cards = testimonials.map((t) => ({
    key: t.author,
    node: (
      /* The top bar is the card's own border-top, widened and recoloured. Two
         longhands (border-top-width / -color) over the all-sides shorthand, so no
         extra element is needed and the bar follows the corner radius. */
      <figure className="flex h-full flex-col rounded-card border border-line border-t-[3px] border-t-brand bg-surface p-7 shadow-[0_20px_44px_-32px_rgba(8,20,34,0.3)]">
        <figcaption className="flex items-start gap-4">
          {/* A CIRCLE, at the client's request, where this was a 14px rounded square. The
              square came from the layout reference and echoed the module shape of the
              Zefract mark, which reads well for a flat graphic and less well for a face —
              a circle crops to the head and puts nothing in the corners. It also matches
              the portrait beside the featured case study's quote, which has always been
              round, so the same person is the same shape on both surfaces.

              NOTHING AT ALL WHERE THERE IS NO PHOTOGRAPH, at the client's request, having
              briefly rendered an initials monogram there. The monogram was added because
              a card with no avatar starts its name flush against the card's edge while a
              card with one is indented by the picture, so the row carries two different
              left margins — that is still true and is now the accepted look. The client
              has seen both and prefers the empty state, which is a reasonable call: an
              initials disc is still a placeholder, and this project has spent its time
              removing those rather than inventing new ones.

              <FeaturedCase> keeps ITS monogram, and that is not an inconsistency. There
              the circle is the only thing beside the quote, so an empty one would leave a
              hole in a two-column layout; here the card simply closes up. */}
          {t.avatar ? (
            <Image
              src={t.avatar}
              alt=""
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <span className="min-w-0">
            {/* Through <StubValue>, which prints the name when there is one and the
                dashed "needs …" chip when there is not. This only ever fires in
                development — the filter above removes an unnamed testimonial from the
                list entirely before production renders it — so the chip is a note to
                whoever is chasing the name, never something a visitor can reach. */}
            <b className="block text-[17px] font-bold tracking-[-0.01em] text-head">
              <StubValue value={t.author} />
            </b>
            {/* Role and company on one line. They were split - role here, company
                in a chip in the card's footer - and the footer has gone, so the
                company comes back up here rather than disappearing with it.

                THE COMMA BELONGS TO THE ROLE, NOT TO THE LINE, which is why this is
                not simply `{role}, {company}`. A name can arrive before a job title
                does — one supplied quote offers two titles with a slash between them,
                which is nobody's actual role — and that card is publishable the moment
                the person is named. Left as a fixed separator it rendered ", Tracks 2
                Curtains" in production, where the unresolved role collapses to nothing
                and the punctuation it was joined with does not. So the role and its
                comma appear together or neither does, and the company always shows. */}
            <span className="block text-[13.5px] text-mut">
              {/* AN ORANGE DASH IN DEVELOPMENT, NOT THE "needs …" CHIP.
                  <StubValue> is the site-wide marker for an unsupplied value and it is
                  the wrong shape here: it is an inline-flex box carrying a sentence, and
                  a sentence under a person's name wraps to two lines and pushes the
                  company onto a third — the placeholder ends up the largest thing on the
                  card, louder than the quote.

                  A dash is the convention this project already uses for exactly this
                  case: <LegalValue> in components/ui/legal-page.tsx prints an em dash
                  where a document states no value, for the same reason — the line has to
                  keep its shape. Brand orange rather than the muted grey around it, so it
                  still reads as something outstanding at a glance.

                  It is decorative to a screen reader, which gets the words instead: a
                  bare dash announces as nothing, or worse, as punctuation mid-sentence.

                  NOTHING AT ALL IN PRODUCTION, which is where this differs from the legal
                  pages. A table row with an empty cell looks broken, so there the dash
                  ships; a byline simply reads "Ranjeev Chandra / Tracks 2 Curtains", which
                  looks like a deliberate choice rather than a missing field. */}
              {resolved(t.role) ? (
                `${t.role}, `
              ) : process.env.NODE_ENV === 'production' ? null : (
                <>
                  <span aria-hidden="true" className="text-brand-strong">
                    &mdash;
                  </span>
                  <span className="sr-only">Job title not stated</span>
                  {', '}
                </>
              )}
              {t.company}
            </span>
            {t.rating ? <Rating value={t.rating} className="mt-1.5 text-[14px]" /> : null}
          </span>
        </figcaption>

        <blockquote className="mt-6 flex-1 text-[17px] leading-[1.62] text-head">
          “{t.quote}”
        </blockquote>
      </figure>
    ),
  }))

  return (
    <Section>
      <Container>
        <SectionHead eyebrow="Clients" heading="In their words." />

        {cards.length >= CAROUSEL_FROM ? (
          <Reveal className="mt-14">
            <Carousel label="Client testimonials" slides={cards} />
          </Reveal>
        ) : (
          /* Columns from the count, so two cards are two equal halves and three are
             thirds — never a card left stranded at full width beside a gap, which is what
             a fixed three-column grid would do with two.

             Per-card stagger here, where the carousel fades as one block. The reason that
             one cannot is the horizontal scroll container: a per-card `whileInView` would
             hold the off-screen slides at opacity 0 and animate them mid-slide. A grid has
             no off-screen cards, so it gets the same entrance every other grid on the site
             uses.

             The cards come out equal height without asking: a grid item stretches to its
             row by default, and the figure inside carries `h-full`. That matters here more
             than usual — Rohit's quote runs to roughly twice Ajit's. */
          <Stagger
            className={cn(
              'mt-14 grid gap-4.5',
              cards.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
            )}
            step={0.08}
          >
            {cards.map((card) => (
              <StaggerItem key={card.key}>{card.node}</StaggerItem>
            ))}
          </Stagger>
        )}
      </Container>
    </Section>
  )
}

import { Container, Eyebrow, headingClass } from '@/components/ui/section'
import { PillLink } from '@/components/ui/pill'
import { Rise } from '@/components/motion/rise'
import { HeroAmbient } from '@/components/motion/hero-ambient'
import { HERO } from '@/content/home'
import { HERO_PROOF } from '@/content/site'

/**
 * The hero uses <Rise> (CSS) rather than <Reveal> (Motion) throughout.
 *
 * The <h1> is the page's LCP element. Gating it behind client-side JS meant it
 * stayed invisible until Motion hydrated, which measured as a 3.5s LCP against a
 * 1.0s first paint. CSS entrance animation keeps the designed effect and paints
 * immediately.
 */
export function Hero() {
  /* pt-32 below md, not pt-44. The same reasoning <PageHero> already applies to every
     interior page: the fixed header pill ends at 82px, so 176px of top padding left 94px
     of dead space above the eyebrow on a phone and pushed the h1 down to 250px. 128px
     still clears the pill by 46px — more generous than the interior pages' 30px, which
     is right for the landing hero — and lifts the whole stack 48px, which on a 390x844
     screen is the difference between the CTAs being at the fold and being under it.
     md:pt-48 is untouched, so desktop is byte-identical.

     A block comment above the return, not a {/* … *​/} inside it: a JSX comment is an
     expression, and an expression cannot sit beside the element being returned. */
  return (
    <section className="hero-grid relative isolate overflow-clip px-0 pt-32 pb-28 text-center md:pt-48">
      <HeroAmbient />
      <Container>
        <Rise y={12}>
          {/* mb-9 below sm. The margin is measured between boxes, but the eye measures
              between ink — and with a line-height under 1 the h1's capitals sit ~7px
              above its box top, so a 28px margin reads as 21px. The extra 8px puts the
              apparent gap back where the desktop one looks. */}
          <Eyebrow className="mb-9 sm:mb-7">{HERO.eyebrow}</Eyebrow>
        </Rise>

        {/* liftOnly: the h1 and the sub below are the two LCP candidates on this
            page, and the default fade hides them from the metric entirely. See the
            note on the prop. */}
        <Rise delay={0.06} y={16} liftOnly>
          {/* TWO LINES AT EVERY WIDTH, with the break moving rather than the copy.
              Set here rather than through <Heading> because that component takes whole
              lines and stacks them in block spans, which can only ever break in one place.
              The type still comes from headingClass('h1'), so this cannot drift from an
              <h2> or a <MaskedLines> heading.

              EACH <br> ONLY EVER HIDES ITSELF — `sm:hidden` and `max-sm:hidden`, never a
              `display` value being put back. Restoring a <br> with `sm:inline` was the
              obvious way to write the second one and is the fragile way: it hard-codes an
              assumption about the UA's own display for <br>, where hiding does not.

              The space before each segment is deliberate. On the side where the <br>
              beside it is live, that space lands at the start of a line and CSS drops it;
              on the other side it is what joins "big" to "idea". So one set of segments
              reads correctly in both arrangements.

              THE SIZE OVERRIDE, and why it is here and not in HEAD_SIZE. "Turn your next
              big" measures 313.5px at the 40px clamp floor, against 312px of container at
              a 360px viewport — it misses by 1.5px, and at 320px it misses by 41px. The
              floor is flat below a 500px viewport, so no break can rescue it there; the
              size has to come down with the screen.

              7.84em is that string's measured width, so (100vw - 48px) / 7.84 is the size
              at which it exactly fills the container. That is 12.76vw - 6.12px; the
              figures below take 8px off the container first, which leaves ~7px of slack at
              every width and covers the difference between a measured advance and what the
              rasteriser does with it.

              Wrapped in min() against the 2.5rem floor so it only ever LOWERS it: 40px is
              already correct from a 378px viewport up, 8vw takes over at 500px, and the
              cap is untouched — so nothing at or above 378px moves, desktop included.
              Scoped to this h1 rather than folded into HEAD_SIZE because the coefficient
              is derived from THIS string, and a global floor derived from one page's copy
              would be a trap for the next person. Re-measure if the words change.

              `leading-[1.05]` IS RESTATED HERE, and it is not redundant — leaving it out
              is a real bug that shipped for one screenshot. tailwind-merge treats
              `font-size` as conflicting with `leading`, because Tailwind's own
              `text-{size}` shorthand can set both, so the override above DELETES the
              `leading-[1.05]` that HEAD_SIZE sets. The h1 then inherits body's
              `line-height: 1.6`, which at 38.9px is 62px per line against the 41px
              intended — a visibly gappy heading, and only on a phone, because
              `sm:leading-[0.98]` carries a modifier and survives the merge untouched.
              It has to sit AFTER the `text-[...]` in this string: the merge keeps the
              later of two conflicting classes, so before it would be dropped again.
              Third instance of this family in this file's neighbourhood — see also
              <SheetContent> below and the mega menu's radius. */}
          <h1
            className={headingClass(
              'h1',
              'text-[clamp(min(2.5rem,12.75vw_-_7px),8vw,6rem)] leading-[1.05]'
            )}
          >
            {HERO.heading[0]}
            <br className="sm:hidden" /> {HERO.heading[1]}
            <br className="max-sm:hidden" /> {HERO.heading[2]}
          </h1>
        </Rise>

        <Rise delay={0.12} liftOnly>
          <p className="mx-auto mt-7 max-w-[46ch] text-pretty text-[19px] text-mut">{HERO.sub}</p>
        </Rise>

        <Rise delay={0.18}>
          <div className="mt-11 flex flex-col items-center gap-4">
            {/* One line on a phone, which the default pill size cannot do: the pair needs
                403px side by side and even a 430px screen only offers 382px, so it stacked.
                The `pair` size brings it to 307px and holds one line from 360px up; below
                that it still wraps, which is the right fallback. Both size and gap return to
                their defaults at sm, so nothing above 640px moves. */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <PillLink href="/contact" variant="ink" size="pair">
                Start a project
              </PillLink>
              <PillLink href="/services" variant="ghost" size="pair">
                Explore services
              </PillLink>
            </div>
            <p className="text-[13.5px] text-mut-2">{HERO.note}</p>
          </div>
        </Rise>

        <Rise delay={0.24} y={12}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[13.5px] text-mut">
            {HERO_PROOF.map((item, i) => (
              <div key={item.label} className="flex items-center gap-7">
                {i > 0 ? (
                  <span aria-hidden="true" className="hidden h-4 w-px bg-line sm:block" />
                ) : null}
                <p>
                  {/* aria-hidden, and that is the accessible choice rather than a
                      shortcut. The glyphs are a picture of the number immediately after
                      them — a screen reader announcing "black star, black star… 5.0 from
                      40+ clients" reads the same fact twice, the second time as noise.
                      The text carries the whole claim on its own.

                      Driven by an explicit `stars` flag on the entry, not by testing the
                      label for the word "clients" as this once did. That rule matched the
                      rating by coincidence, and would have put a five-star score beside
                      any future line that happened to mention clients. */}
                  {item.stars ? (
                    <span aria-hidden="true" className="mr-1.5 tracking-[2px] text-brand-strong">
                      ★★★★★
                    </span>
                  ) : null}
                  <b className="font-bold text-head">{item.value}</b> {item.label}
                </p>
              </div>
            ))}
          </div>
        </Rise>
      </Container>
    </section>
  )
}

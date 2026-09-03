import Image from 'next/image'
import Link from 'next/link'
import { Container, Section, SectionHead } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { CaseCover } from '@/components/ui/case-cover'
import { authorInitials } from '@/lib/author-display'
import { getCaseStudies } from '@/lib/content'
import { cn } from '@/lib/utils'

export async function FeaturedCase() {
  const cases = await getCaseStudies()
  const featured = cases[0]
  if (!featured) return null

  return (
    <Section id="work">
      <Container>
        <SectionHead eyebrow="Recent work" heading="Real installs, real numbers." />

        <Reveal className="mt-16">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="card-pop group relative min-h-[430px] overflow-hidden rounded-card bg-ink">
              {/* A PHOTOGRAPH OR A DRAWN PANEL — <CaseCover> decides. This card used to
                  render nothing at all for a study without artwork, leaving the empty
                  navy rectangle the Seair study shipped with. The hover push-in is
                  applied to whichever of the two it produces; scale only, because the
                  cover is absolutely positioned and so grows inside a fixed box and
                  cannot shift anything. */}
              <CaseCover
                study={featured}
                /* This card lays its own eyebrow and title over the cover, so the
                   panel must not print them too — with both on, the figure appeared
                   twice and the two overlapped. */
                showMeta={false}
                className="absolute inset-0 h-full w-full"
                sizes="(max-width: 1024px) 100vw, 52vw"
                imageClassName="grayscale-[0.9] brightness-[0.8] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(185deg,rgba(0,51,102,0.35)_10%,rgba(8,20,34,0.92)_88%)]"
              />
              <div className="absolute right-8 bottom-8 left-8 text-white">
                {/* text-brand is correct here: this sits on the dark gradient overlay,
                    where #E6551E measures 5.01:1. Only use brand-strong on light. */}
                {featured.outcomes[0] ? (
                  <p className="font-mono text-[12px] font-medium tracking-[0.2em] text-brand uppercase sm:text-[11px]">
                    {featured.outcomes[0].value} {featured.outcomes[0].label}
                  </p>
                ) : null}
                <h3 className="mt-3 text-[28px] leading-tight font-bold tracking-[-0.03em]">
                  {/* No hover styling at all, by request — the underline that used to
                      be here is gone and nothing replaced it. Safe for SC 1.4.1: that
                      only governs links sitting inside a block of text, where they
                      need something beyond colour to be distinguishable. This is a
                      standalone heading in its own card. The focus ring is untouched,
                      so keyboard users still get a visible indicator. */}
                  <Link href={`/work/${featured.slug}`}>{featured.title}</Link>
                </h3>
              </div>
            </div>

            <div>
              {featured.quote ? (
                <>
                  <blockquote className="text-[22px] leading-snug font-medium text-balance text-head">
                    “{featured.quote.text}”
                  </blockquote>
                  <div className="mt-7 flex items-center gap-3.5">
                    {/* THE PERSON'S OWN PHOTOGRAPH WHERE THERE IS ONE, INITIALS WHERE
                        THERE IS NOT — and the history of this one circle is worth keeping.

                        It began as `/images/avatar-4.jpg`, hardcoded, while the name, role
                        and quote beside it all came from `featured`. That is a stock face
                        from the design comp belonging to the CloudScale placeholder, and
                        it rendered next to WHOEVER cases[0] happened to be. Survivable
                        while every case study was invented; not survivable once cases[0]
                        was a real, named client, because the card presented a stranger's
                        headshot as him.

                        It became a monogram, which was the honest answer while there was
                        no real picture: initials hold the circle the layout is built
                        around without asserting a likeness. The client has now supplied
                        the actual photographs, so the circle shows the person — and the
                        monogram stays as the fallback rather than being deleted, because
                        it is what any future study without a portrait will render, and
                        because it is still the right answer for that case.

                        `alt=""` and `aria-hidden` respectively: the name is the very next
                        element either way, so naming the image would announce the person
                        twice and "A K" would be read out before "Ajit Kumar". */}
                    {featured.quote.avatar ? (
                      <Image
                        src={featured.quote.avatar}
                        alt=""
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      /* Through `authorInitials`, not the hand-rolled
                         split/slice/map/join this used to carry. The rule already lives
                         in lib/author-display.ts and already serves <AuthorAvatar> and
                         the testimonial cards; a local copy is one more place to
                         disagree about a two-word surname. */
                      <span
                        aria-hidden="true"
                        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[15px] font-bold tracking-[-0.01em] text-brand-strong"
                      >
                        {authorInitials(featured.quote.author)}
                      </span>
                    )}
                    <div className="text-[14.5px]">
                      <b className="block font-bold text-head">{featured.quote.author}</b>
                      <span className="text-mut">{featured.quote.role}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </Reveal>

        {/* Three loose pills, the current case filled. This was briefly a segmented tray
            with icons and an underline that followed the pointer; the pills are the design
            the client wants, so the tray, the icons and the underline are all gone.

            .chip-pop is right here in a way it was not inside a tray. Its hover lifts the
            pill 3px with a brand border and a soft shadow, which reads as the pill coming
            off the surface, and a loose pill is exactly the thing that should do that. It
            owns the whole `transition` property, so nothing here may carry a
            `transition-*` utility. */}
        {/* ALL THREE ON ONE LINE, INCLUDING ON A PHONE, and the mobile padding is what buys
            that. At the desktop px-5 the row measures 324px against the 342px a 390px phone
            offers, which fits, but 312px at 360px and 272px at 320px do not, so it broke to
            2 + 1. Measured with the real font, px-3.5 and gap-2 bring the row to 284px,
            which holds three across from 360px up.

            Below that it wraps to 2 + 1 rather than shrinking further, which is the right
            trade: the alternative is type small enough to be hard to read on the narrowest
            phones, and two on a line still reads as a set.

            Padding and gap both return to their desktop values at sm, so nothing above
            640px moves. */}
        <Reveal className="mt-10">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {cases.map((c, i) => (
              <Link
                key={c.slug}
                href={`/work/${c.slug}`}
                aria-current={i === 0 ? 'true' : undefined}
                className={cn(
                  'rounded-full border px-3.5 py-2.5 text-[13.5px] font-semibold sm:px-5',
                  i === 0
                    ? /* The current case: a filled pill, already at maximum emphasis,
                         so it gets no hover treatment to escalate to. */
                      'border-head bg-head text-white'
                    : 'chip-pop border-line bg-surface text-head'
                )}
              >
                {c.client}
              </Link>
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}

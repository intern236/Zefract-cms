import Image from 'next/image'
import { Container, Section, SectionHead } from '@/components/ui/section'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { Counter } from '@/components/motion/counter'
import { Tilt } from '@/components/motion/tilt'
import { BENTO } from '@/content/home'

/**
 * The proof bento.
 *
 * Every number here came from the design comp, not the client — see the note at
 * the top of content/home.ts. The layout is a 3-column grid where the photo tile
 * spans both rows.
 */
export function ProofBento() {
  return (
    /* Tighter top padding than the site default, because this is the one section that
       follows a full-bleed band rather than another section — the client-logo marquee
       above it already supplies the visual break that the standard pt-24/md:pt-32 exists
       to create.

       THAT JUSTIFICATION HAS BEEN TRUE, THEN FALSE, THEN TRUE AGAIN, and the number never
       moved. While the marquee was removed at the client's request, what justified the
       same padding was the hero directly above: <Section> carries no bottom padding, so a
       normal boundary between two sections is just this one's `pt`, but the hero ends with
       `pb-28` — 112px of its own. The default would have stacked 112 + 128 = 240px and
       opened a hole where the logos had been. At pt-14/md:pt-18 the gap comes to 168px and
       184px either way, which is why restoring the strip changed this comment and not this
       class. Worth knowing before anyone "corrects" one to match the other. */
    <Section className="pt-14 md:pt-18">
      <Container>
        <SectionHead eyebrow={BENTO.eyebrow} heading={BENTO.heading} />

        {/* Three columns from lg, not from md.

            The three-up layout needs about 300px a column to hold its own type. At md the
            container is 705px, so three columns come out at 223px and the design breaks in
            two places at once: "6 weeks" wraps to two lines inside the orange tile, and the
            ink strip's labels collapse to three and four lines each. Measured at 768 and
            834; both are wrong, and 834 is iPad-portrait, so it is not an edge case.

            At lg the container is 961px, columns land at ~308px and everything sits on the
            line it was drawn on — so the fix is the breakpoint, not the type.

            Two columns in between: photo down the left across both rows, retention above
            launch on the right, strip full width underneath. `md:row-span-2` and
            `md:col-span-2` on the tiles below already describe exactly that, and they
            carry up to lg unchanged. */}
        <Stagger
          className="mt-16 grid gap-4.5 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_auto]"
          step={0.08}
        >
          {/* Photo tile — spans both rows. */}
          <StaggerItem className="md:row-span-2">
            <Tilt className="card-pop tilt group relative h-full min-h-[480px] overflow-hidden rounded-card bg-ink">
              <Image
                src="/images/team-studio.jpg"
                alt="The Zefract team at work in the studio"
                fill
                sizes="(max-width: 768px) 100vw, 38vw"
                /* See next.config.ts: this photo is grayscaled, darkened and sits
                   under a gradient, so 75 was paying for detail that all three
                   treatments discard. */
                quality={55}
                className="object-cover grayscale brightness-[0.78] contrast-[1.05] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                /* Eager because this image is INSIDE the initial viewport on a tall
                   mobile screen — measured at 305px above the fold — which makes it
                   the page's LCP element there. `lazy` is a declaration that an
                   image is off-screen, and it is not.

                   Honest caveat: A/B'd on a throttled mobile profile, lazy and eager
                   land within noise of each other (lazy 1.53-1.70s, eager
                   1.42-2.38s), because lazy never defers an in-viewport image
                   anyway. So this is the correct declaration rather than a
                   measured win. The bytes are where the actual gain came from - see
                   the `quality` prop above.

                   What must NOT come back is `fetchPriority="high"`, tried earlier:
                   it made a decorative photo compete with the fonts the hero text
                   needs, and that did measurably cost LCP. */
                loading="eager"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(185deg,rgba(0,51,102,0.42)_10%,rgba(8,20,34,0.9)_88%)]"
              />
              <span className="absolute top-6 left-7 z-2 inline-flex items-center gap-2 rounded-full bg-white/92 px-3.5 py-2 font-mono text-[12px] font-medium tracking-[0.18em] text-ink uppercase sm:text-[10.5px]">
                <span aria-hidden="true" className="text-brand-strong">
                  ✦
                </span>
                {BENTO.photo.chip}
              </span>
              <div className="absolute right-7 bottom-7 left-7 z-2 text-white">
                <p className="text-[76px] leading-none font-extrabold tracking-[-0.05em]">
                  <Counter value={BENTO.photo.value} />
                </p>
                <p className="mt-2 max-w-[24ch] text-[15px] text-[#C6D4E4]">
                  {BENTO.photo.caption}
                </p>
              </div>
            </Tilt>
          </StaggerItem>

          {/* Retention */}
          <StaggerItem>
            <Tilt className="card-pop tilt h-full rounded-card border border-line bg-surface p-7.5">
              <p className="font-mono text-[12px] font-medium tracking-[0.2em] text-mut uppercase sm:text-[11px]">
                {BENTO.retention.label}
              </p>
              <p className="mt-4 text-[52px] leading-none font-extrabold tracking-[-0.04em] text-head">
                <Counter value={BENTO.retention.value} />
              </p>
              <div className="mt-5 flex items-center">
                {['/images/avatar-1.jpg', '/images/avatar-2.jpg', '/images/avatar-3.jpg'].map(
                  (src, i) => (
                    <Image
                      key={src}
                      src={src}
                      alt=""
                      width={36}
                      height={36}
                      className={`size-9 rounded-full border-2 border-surface object-cover ${i > 0 ? '-ml-2.5' : ''}`}
                    />
                  )
                )}
                <span className="-ml-2.5 inline-flex size-9 items-center justify-center rounded-full border-2 border-surface bg-page text-[12px] font-bold text-mut sm:text-[11px]">
                  {BENTO.retention.extra}
                </span>
              </div>
              <p className="mt-5 text-[15px] text-mut">{BENTO.retention.quote}</p>
            </Tilt>
          </StaggerItem>

          {/* Median launch — the brand-orange tile */}
          <StaggerItem>
            <Tilt className="card-pop tilt h-full rounded-card bg-brand p-7.5 text-ink">
              {/* No opacity modifiers on this tile: ink at 80% over #E6551E measures
                  4.10:1 and at 90% measures 4.60:1. Full ink is 5.01:1. */}
              <p className="font-mono text-[12px] font-medium tracking-[0.2em] uppercase sm:text-[11px]">
                {BENTO.launch.label}
              </p>
              <p className="mt-4 text-[52px] leading-none font-extrabold tracking-[-0.04em]">
                <Counter value={BENTO.launch.value} />
              </p>
              <p className="mt-5 text-[15px]">{BENTO.launch.body}</p>
            </Tilt>
          </StaggerItem>

          {/* Wide ink strip */}
          <StaggerItem className="md:col-span-2">
            <Tilt className="card-pop tilt flex h-full flex-col items-start gap-6 rounded-card bg-ink px-7.5 py-6.5 text-white sm:flex-row sm:items-center">
              {BENTO.strip.map((item, i) => (
                <div key={item.label} className="flex items-center gap-6">
                  {i > 0 ? (
                    <span aria-hidden="true" className="hidden h-10 w-px bg-white/14 sm:block" />
                  ) : null}
                  {/* items-center, not items-baseline.

                      Baseline alignment is the right instinct for a big number beside a
                      label, and it is correct while the label is one line. This one is
                      not: `max-w-[18ch]` deliberately wraps it to two. Baseline then
                      pins the numeral to the FIRST line only, so the second line hangs
                      below and the pair reads bottom-heavy — measured, the label's centre
                      sat 20px below the numeral's, which is what makes the number look
                      raised and the text dropped.

                      Centring the two boxes lines their middles up instead. The same
                      pattern one line up on /services keeps items-baseline on purpose:
                      both sides there are single-line, which is exactly the case baseline
                      alignment is for. */}
                  <div className="flex items-center gap-3.5">
                    <span className="font-mono text-[40px] leading-none font-medium tracking-[-0.04em] text-brand">
                      <Counter value={item.value} />
                    </span>
                    <span className="max-w-[18ch] text-[13.5px] text-[#9FB2C7]">{item.label}</span>
                  </div>
                </div>
              ))}
            </Tilt>
          </StaggerItem>
        </Stagger>

        <Reveal>
          <p className="mt-6 text-center text-[13.5px] text-mut-2">{BENTO.caption}</p>
        </Reveal>
      </Container>
    </Section>
  )
}

import Link from 'next/link'
import { Container, Eyebrow, Heading } from '@/components/ui/section'
import { HeroAmbient } from '@/components/motion/hero-ambient'
import { BreadcrumbSchema } from '@/lib/schema'

/**
 * Shared hero for inner pages. Carries the breadcrumb trail both visually and as
 * BreadcrumbList JSON-LD, which the brief asks for (§11, L276-278).
 */
export function PageHero({
  eyebrow,
  heading,
  sub,
  trail,
}: {
  eyebrow: string
  heading: string | readonly string[]
  sub?: string
  trail?: { name: string; href: string }[]
}) {
  /* pt-28 below md, not pt-36. The fixed header pill ends at 82px (16px offset +
     66px tall), so 112px still clears it by 30px while giving back 32px of dead space
     at the top of every interior page. pb-10 trims another 24px. Desktop is unchanged
     — md:pt-44 / md:pb-16 restore the original values.

     Briefly tried at a flat 92px, to sit the breadcrumb 10px under the header pill. The
     client compared it against the original and preferred the original's proportions, so
     this is back as it was: the hero reads as a section with room around it rather than as
     a strip pinned to the underside of the nav. */
  return (
    <section className="hero-grid relative isolate overflow-clip pt-28 pb-10 md:pt-44 md:pb-16">
      {/* Same ambient wash on inner-page heroes — they carry the same grid and the
          same wide empty margins. */}
      <HeroAmbient />
      <Container>
        {trail && trail.length > 0 ? (
          <>
            <BreadcrumbSchema trail={trail} />
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-mut">
                {trail.map((crumb, i) => (
                  <li key={crumb.href} className="flex items-center gap-2">
                    {i > 0 ? <span aria-hidden="true">/</span> : null}
                    {i === trail.length - 1 ? (
                      <span aria-current="page" className="text-head">
                        {crumb.name}
                      </span>
                    ) : (
                      /* inline-flex with a minimum height, not padding or leading: on a
                         plain inline element the measured box comes from the font
                         metrics, so these links were 21px tall — under the 24px that
                         WCAG 2.2 SC 2.5.8 asks of a pointer target. */
                      <Link href={crumb.href} className="inline-flex min-h-6 items-center hover:text-head">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </>
        ) : null}

        <Eyebrow align="left" className="mb-5">
          {eyebrow}
        </Eyebrow>
        {/* Leading is restated here on purpose: tailwind-merge treats `font-size` as
            conflicting with `leading`, so overriding the size alone would drop the
            heading's tight line-height and leave the lines floating apart. */}
        <Heading
          as="h1"
          lines={heading}
          className="max-w-[18ch] text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02]"
        />
        {/* One treatment, not two. A `lead` variant briefly set a service document's tagline
            larger and in head colour; compared side by side against this, the client kept
            this one. So the tagline is styled exactly like any other page's standfirst and
            only the words differ, which is also why there is no prop to get wrong. */}
        {sub ? <p className="mt-6 max-w-[58ch] text-pretty text-[18px] text-mut">{sub}</p> : null}
      </Container>
    </section>
  )
}

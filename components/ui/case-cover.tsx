import Image from 'next/image'
import type { CaseStudy } from '@/content/types'
import { cn } from '@/lib/utils'

/**
 * A case study's cover: the photograph where there is one, a drawn panel where
 * there is not.
 *
 * WHY A DRAWN PANEL RATHER THAN A STOCK PHOTOGRAPH. The alternative to "blank"
 * is not "any picture" — a bought photograph of strangers at a laptop says
 * nothing true about the engagement, and this site has already had every
 * invented client deleted from it for the same reason. So the fallback is
 * explicitly a graphic: the lattice and the warm glow the page tops already use,
 * carrying the two things about the study that ARE true — its headline figure
 * and its sector.
 *
 * IT IS A REPLACEMENT, NOT A PERMANENT DESIGN. The moment a study gets a real
 * `image`, the photograph renders and this never appears for it again. Nothing
 * else has to change.
 *
 * SVG RATHER THAN A FILE IN /public, and that is a security decision as much as
 * a design one. next/image refuses to optimise SVG unless `dangerouslyAllowSVG`
 * is turned on, which enables script-carrying SVG for every image on the site;
 * turning that on to serve one placeholder would be a poor trade. Inline markup
 * needs no such flag, costs no request, and scales to any card size without a
 * second file.
 *
 * NO TEXT IN THE <svg>, only in the HTML layered over it. Text inside an SVG is
 * not selectable, is skipped by some translation tools and does not reflow — and
 * the client name is the one thing here a reader might want to copy.
 */
export function CaseCover({
  study,
  /** True for the one cover that is above the fold on its own page — it gets
   *  `priority` so it is not lazy-loaded out of the LCP. */
  priority = false,
  /**
   * Whether the drawn panel prints the client name and headline figure.
   *
   * FALSE WHERE THE CARD ALREADY DOES. <FeaturedCase> lays its own eyebrow and
   * title over the cover; leaving this on there printed the figure twice, four
   * lines apart, and the two overlapped. Where the surrounding card puts its
   * text BESIDE or BELOW the cover — the work index, the detail page — this
   * stays on and the panel carries the content.
   *
   * It has no effect on a real photograph, which never had text over it.
   */
  showMeta = true,
  className,
  imageClassName,
  sizes = '100vw',
}: {
  study: Pick<
    CaseStudy,
    'client' | 'sector' | 'title' | 'image' | 'imageAlt' | 'outcomes'
  >
  priority?: boolean
  showMeta?: boolean
  className?: string
  imageClassName?: string
  sizes?: string
}) {
  if (study.image) {
    return (
      <div className={cn('relative overflow-hidden bg-ink', className)}>
        <Image
          src={study.image}
          /* The study's own description of the picture where it has one; the
             derived form otherwise. See the note on CaseStudy.imageAlt — the
             derived version asserts the photograph IS the client, which is only
             true of a commissioned shot. */
          alt={study.imageAlt ?? `${study.client}: ${study.title}`}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover', imageClassName)}
        />
      </div>
    )
  }

  /* The headline figure, which on this study is "+30%". Falls back to the
     client's initial when a study has no outcomes at all — there is always
     something rather than an empty panel. */
  const lead = study.outcomes[0]

  return (
    <div className={cn('relative overflow-hidden bg-ink', className)}>
      {/* The lattice and the glow, drawn rather than classed: .hero-grid is
          pinned to the page background and its ::before is masked for a full-width
          section, neither of which survives being scaled into a card. */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 640 360"
      >
        <defs>
          <pattern id="case-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          </pattern>
          {/* Anchored to the lower LEFT rather than the bottom centre, because that
              is where the figure sits — the glow lights the content instead of
              washing an empty middle. `r` is generous: at 21:9 a tight radius
              leaves most of a very wide panel unlit, which is what made the first
              version read as an empty navy rectangle with a number in the corner. */}
          <radialGradient id="case-glow" cx="26%" cy="88%" r="82%">
            <stop offset="0%" stopColor="#E6551E" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#E6551E" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#E6551E" stopOpacity="0" />
          </radialGradient>
          {/* A cool counterweight in the opposite corner, so the panel has two
              light sources and does not fall to flat navy at the far edge. */}
          <radialGradient id="case-cool" cx="88%" cy="12%" r="60%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="640" height="360" fill="url(#case-cool)" />
        <rect width="640" height="360" fill="url(#case-glow)" />
        <rect width="640" height="360" fill="url(#case-grid)" />
      </svg>

      {!showMeta ? null : (
      /* Bottom-left. `pointer-events-none` because the whole card is usually a
         link and this must not become a second target inside it. */
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-7">
        <p className="font-mono text-[11px] tracking-[0.2em] text-white/55 uppercase">
          {study.client}
        </p>
        {/* Plain responsive steps, NOT `cqw`. Container query units resolve
            against the nearest element with `container-type`, and none of the
            three call sites establishes one — so `7cqw` silently fell back to
            the small viewport and sized the figure off the window rather than
            off the card. Breakpoints do the same job here with no such trap. */}
        <p className="mt-2.5 text-[40px] leading-none font-extrabold tracking-[-0.04em] text-white sm:text-[52px]">
          {lead ? lead.value : study.client.slice(0, 1)}
        </p>
        <p className="mt-2 max-w-[34ch] font-mono text-[11px] tracking-[0.16em] text-white/60 uppercase">
          {lead ? lead.label : study.sector}
        </p>
      </div>
      )}
    </div>
  )
}

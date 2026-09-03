import type { CSSProperties } from 'react'

/**
 * The hero's ambient background: soft colour washes drifting slowly off the top
 * and bottom edges.
 *
 * Ported from the reference file the client supplied. That file has two layers -
 * these orbs, and a canvas of "tracer dots" streaking across with fading tails.
 * Only the orbs are here; the tracer canvas is the dot animation that was asked
 * to be left out.
 *
 * The reference's LEFT and RIGHT orbs are gone at the client's request. They were
 * the two doing most of the work of filling the wide empty margins, so those
 * margins now carry only the grid and the dot trails below - worth knowing if the
 * sides ever read as bare again.
 *
 * A Server Component and pure CSS (see .hero-orbs in globals.css). This sits
 * above the fold beside the LCP element, so it must not wait on the client
 * bundle - and the reference's tracer layer was the only part that needed JS at
 * all.
 *
 * Palette mapped onto ours: mut grey at the top, brand orange at the bottom, at
 * the reference's own alphas (0.11 / 0.14) - which is what keeps this a wash
 * rather than a graphic.
 */
type Orb = {
  key: string
  className: string
  style: CSSProperties & Record<`--${string}`, string>
}

const ORBS: Orb[] = [
  {
    key: 'top',
    className: 'hero-orb hero-orb-t',
    style: {
      '--tone': 'color-mix(in srgb, var(--color-mut) 11%, transparent)',
      '--drift': 'orb-drift-3',
      '--dur': '24s',
    },
  },
  {
    key: 'bottom',
    className: 'hero-orb hero-orb-b',
    style: {
      '--tone': 'color-mix(in srgb, var(--color-brand) 14%, transparent)',
      // Same path as the left orb, run backwards, so the pair never mirrors.
      '--drift': 'orb-drift-1',
      '--dur': '30s',
      '--dir': 'reverse',
    },
  },
]

/**
 * Four dot trails: a horizontal and a vertical in the top-left, the same pair in
 * the bottom-right.
 *
 * Each is a train of nine dots crossing the WHOLE hero — full width for a
 * horizontal, full height for a vertical. The leading dot is at full strength and
 * the eight behind it fade back to almost nothing, so the group reads as a comet
 * rather than as a row of equal dots, which is what a single dot could not do.
 *
 * WHICH END LEADS depends on the direction of travel. A trail running right-to-left
 * needs its opaque dot on the LEFT, or the tail would arrive first. `reversed` flips
 * the opacity ramp for exactly that reason; the travel itself is the same keyframe
 * played backwards.
 *
 * Each trail also relocates between passes: `--hop1` to `--hop4` are four offsets
 * it cycles through — a different row for a horizontal, a different column for a
 * vertical — applied while it is faded out, so it is never seen jumping. Four
 * trails times four positions is sixteen placements in rotation.
 *
 * All offsets are multiples of the grid's 64px, and the base positions are snapped
 * to the same lattice with `round()`, so a trail always runs along a grid line
 * rather than a few pixels beside one. The plain percentage above each is the
 * fallback for engines without `round()`. Both offsets are measured from the
 * top-left, because that is the corner the lattice is anchored to.
 */
type Trail = {
  key: string
  className: string
  axis: 'h' | 'v'
  reversed?: boolean
  style: CSSProperties & Record<`--${string}`, string>
}

const BRIGHT = 'color-mix(in srgb, var(--color-brand) 95%, transparent)'

/**
 * Opacity per dot, leading dot first.
 *
 * MUST stay the same length as `--tail` in globals.css: the CSS sizes the train
 * from that count, this array supplies one opacity per dot. Nine steps down to 0.05
 * gives the tail somewhere to actually fade to — five stopped at 0.11, which read
 * as a hard end rather than a dissolve.
 */
const FADE = [1, 0.82, 0.66, 0.52, 0.4, 0.29, 0.2, 0.12, 0.05]

const TRAILS: Trail[] = [
  // Top-left pair. Horizontals set only `top` (the row) and verticals only `left`
  // (the column) — the other axis is the full hero now, so there is nothing to set.
  {
    key: 'tl-h',
    className: 'hero-trail hero-trail-h',
    axis: 'h',
    style: {
      top: 'calc(round(nearest, 26%, 64px))',
      '--travel': 'trail-x',
      '--hop': 'hop-y',
      // Rows: base, +128, +64, +256.
      '--hop1': '0px',
      '--hop2': '128px',
      '--hop3': '64px',
      '--hop4': '256px',
      '--dur': '6.6s',
      '--tone-bright': BRIGHT,
    },
  },
  {
    key: 'tl-v',
    className: 'hero-trail hero-trail-v',
    axis: 'v',
    style: {
      left: 'calc(round(nearest, 15%, 64px))',
      '--travel': 'trail-y',
      '--hop': 'hop-x',
      // Columns: base, +64, -64, +128.
      '--hop1': '0px',
      '--hop2': '64px',
      '--hop3': '-64px',
      '--hop4': '128px',
      '--dur': '4.9s',
      '--tone-bright': BRIGHT,
    },
  },
  // Bottom-right pair, both running against their counterparts.
  {
    key: 'br-h',
    className: 'hero-trail hero-trail-h',
    axis: 'h',
    reversed: true,
    style: {
      top: 'calc(round(nearest, 68%, 64px))',
      '--travel': 'trail-x',
      '--hop': 'hop-y',
      // Rows: base, -64, +64, -192 — upward, staying clear of the fold.
      '--hop1': '0px',
      '--hop2': '-64px',
      '--hop3': '64px',
      '--hop4': '-192px',
      '--dir': 'reverse',
      '--dur': '5.9s',
      '--tone-bright': BRIGHT,
    },
  },
  {
    key: 'br-v',
    className: 'hero-trail hero-trail-v',
    axis: 'v',
    reversed: true,
    style: {
      left: 'calc(round(nearest, 85%, 64px))',
      '--travel': 'trail-y',
      '--hop': 'hop-x',
      // Columns: base, -64, +64, -128.
      '--hop1': '0px',
      '--hop2': '-64px',
      '--hop3': '64px',
      '--hop4': '-128px',
      '--dir': 'reverse',
      '--dur': '4.5s',
      '--tone-bright': BRIGHT,
    },
  },
]

/**
 * The dots of one train.
 *
 * Index 0 is always the end nearest the container's origin. `reversed` decides which
 * end is the front, and the opacity ramp is measured outwards from there.
 */
function trainDots(axis: 'h' | 'v', reversed: boolean) {
  const lead = reversed ? 0 : FADE.length - 1
  return FADE.map((_, i) => {
    const offset = `calc(var(--pitch) * ${i})`
    return {
      key: i,
      isLead: i === lead,
      style: {
        opacity: FADE[Math.abs(i - lead)],
        ...(axis === 'h' ? { left: offset } : { top: offset }),
      } as CSSProperties,
    }
  })
}

export function HeroAmbient() {
  return (
    <div aria-hidden="true" className="hero-orbs">
      {ORBS.map((orb) => (
        <span key={orb.key} className={orb.className} style={orb.style} />
      ))}
      {TRAILS.map((trail) => (
        <span key={trail.key} className={trail.className} style={trail.style}>
          {/* Inner span is the train: it carries the travel, the outer element
              carries the hop. Two transform animations cannot share one element. */}
          <span>
            {trainDots(trail.axis, trail.reversed ?? false).map((dot) => (
              <i key={dot.key} style={dot.style} data-lead={dot.isLead ? '' : undefined} />
            ))}
          </span>
        </span>
      ))}
    </div>
  )
}

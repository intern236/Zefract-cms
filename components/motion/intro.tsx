'use client'

import { useEffect, useState } from 'react'

/**
 * The home page's intro: dots converge from every direction to build the mark, the
 * wordmark then opens out beside it into the header's lockup, then the panel lifts away.
 *
 * SEQUENCE, and each beat is separate on purpose:
 *   1. thirteen dots fly in from all around and settle into the Z, which is alone and
 *      centred the whole time it is being built
 *   2. the finished mark holds
 *   3. "ZEFRACT" opens out to its right, sliding the mark left into place beside it
 *   4. the lockup holds, then the panel carries it off the top and the site is there
 * The wordmark never appears before the mark is finished, so the two beats stay legible
 * as separate events, and they end in the same arrangement the header carries — which is
 * the point of landing on the lockup rather than the word alone.
 *
 * WHY THE DOTS COME FROM EVERYWHERE. Each module's entry vector points straight out from
 * the mark's centre through where that module lands, so a corner module flies in
 * diagonally, a top-row module drops from above, and so on — everything converges on the
 * middle. An earlier version sent them in from the left and right only, which read as a
 * sweep across the shape rather than an assembly.
 *
 * WHY THE ANIMATION IS CSS AND NOT JS. This markup is server-rendered, so the panel is
 * in the first HTML the browser gets and the sequence starts at first paint. Driving it
 * from JavaScript would mean waiting for hydration, and the page would show through for
 * a beat before the panel appeared over it — the one thing a preloader must never do.
 * The stylesheet is a render-blocking <link>, so the first painted frame already has the
 * start state. It also means the whole thing still completes with JavaScript disabled.
 *
 * HOME ONLY, AND ONLY ON A REAL LOAD. `played` is module scope: a hard load or refresh
 * gets a fresh module and plays, while a client-side navigation back to the home page
 * finds the flag already set and renders nothing. The flag is only ever written from an
 * effect, so the server module never mutates and SSR stays correct for everyone.
 *
 * Everything is aria-hidden and the panel unmounts when it is done. Under
 * prefers-reduced-motion it is not rendered at all — see the media query in globals.css.
 */

/** Where the mark's own geometry centres, in viewBox units. */
const CENTRE = 17
/** How far outside the artboard a dot starts, along its radial line. */
const THROW = 46

/**
 * The modules in ARRIVAL order: outermost first, closing inward, the slipped centre
 * module last. Corners alternate across the diagonal so the convergence has a rhythm
 * rather than going round the clock.
 */
const MODULES: readonly (readonly [number, number])[] = [
  [0, 0], [28, 28], [28, 0], [0, 28], // the four corners, furthest out
  [7, 0], [21, 28], [21, 0], [7, 28], // one step in along the top and bottom bars
  [14, 0], [14, 28], //                  the centre column, which closes the bars
  [21, 7], [7, 21], //                   the two that make the diagonal
]

/** The fracture lands last of all. */
const FRACTURE = [15.5, 15.5] as const

/** Total run, kept in step with the delays in globals.css. */
const TOTAL_MS = 3050

/** A dot's start offset: straight out from the centre, through where it lands. */
function throwFrom(x: number, y: number) {
  const dx = x + 3 - CENTRE
  const dy = y + 3 - CENTRE
  const len = Math.hypot(dx, dy) || 1
  return {
    '--dx': `${((dx / len) * THROW).toFixed(2)}px`,
    '--dy': `${((dy / len) * THROW).toFixed(2)}px`,
  } as React.CSSProperties
}

let played = false

export function Intro() {
  // Read during the first render so the panel is present in the SSR output.
  const [show] = useState(() => !played)
  const [done, setDone] = useState(false)

  useEffect(() => {
    played = true
    if (!show) return

    /* Measure the wordmark's natural width and hand it to CSS, so the box can animate
       open to exactly the right size and the mark lands in its true lockup position.
       Safe to do from JavaScript: this value is not needed until 1400ms, long after
       hydration, and the dots phase before it is pure CSS. The em fallback in the
       stylesheet covers the no-JS case. */
    const stage = document.querySelector<HTMLElement>('.intro-stage')
    const inner = document.querySelector<HTMLElement>('.intro-word-inner')
    if (stage && inner) {
      const set = () => stage.style.setProperty('--word-w', `${Math.ceil(inner.scrollWidth)}px`)
      if (document.fonts?.status === 'loaded') set()
      else void document.fonts?.ready.then(set)
    }
    // Nothing scrolls while the panel is up, or the reveal lands mid-page.
    document.documentElement.dataset.intro = 'true'
    const t = window.setTimeout(() => {
      delete document.documentElement.dataset.intro
      setDone(true)
    }, TOTAL_MS)
    return () => {
      window.clearTimeout(t)
      delete document.documentElement.dataset.intro
    }
  }, [show])

  if (!show || done) return null

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-stage">
        <svg className="intro-mark" viewBox="0 0 34 34" role="presentation">
          {MODULES.map(([x, y], i) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="6"
              height="6"
              rx="0.5"
              className="intro-module"
              style={{ ...throwFrom(x, y), '--i': i } as React.CSSProperties}
            />
          ))}
          <rect
            x={FRACTURE[0]}
            y={FRACTURE[1]}
            width="6"
            height="6"
            rx="0.5"
            className="intro-module intro-fracture"
            style={{ ...throwFrom(FRACTURE[0], FRACTURE[1]), '--i': MODULES.length } as React.CSSProperties}
          />
        </svg>

        {/* Masked wipe-up, the same gesture the section headings use. */}
        <span className="intro-word">
          <span className="intro-word-inner">Zefract</span>
        </span>
      </div>
    </div>
  )
}

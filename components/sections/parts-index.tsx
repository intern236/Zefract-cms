'use client'

import { useEffect, useRef } from 'react'

/**
 * The sticky index beside a service's parts, with the current part marked as you scroll.
 *
 * WHY AN OBSERVER AND NOT A SCROLL LISTENER. The active item changes about ten times over
 * the whole page. A scroll handler would run on every frame to discover that nothing had
 * changed; an IntersectionObserver fires only at the boundaries, which is exactly the event
 * being modelled.
 *
 * NO REACT STATE. The active item is written straight to a data attribute on the anchor, so
 * crossing a boundary costs one attribute write rather than a re-render of an eleven-element
 * list. Same reasoning as the header collapse in header-shell.tsx.
 *
 * THE ROOT MARGIN IS THE WHOLE TRICK. `-45% 0px -50% 0px` shrinks the observation box to a
 * thin band across the middle of the viewport, so a part counts as current only while it is
 * crossing that band. Without it, "intersecting" means "any pixel on screen" and three long
 * parts are intersecting at once with no way to rank them. The band's top edge sits below
 * the header, so a part is never marked current while it is still hidden behind the pill.
 *
 * At the very top and bottom of the list nothing is in the band — a short first part can be
 * scrolled past before it reaches the middle, and the last part cannot reach it at all. So
 * the last match is kept rather than cleared, which means the index always shows something
 * and never flickers to nothing between two parts.
 *
 * Below lg this is not rendered at all: at that width the index would sit above the content
 * as a list of ten links you scroll past to reach the thing they point at.
 */
export function PartsIndex({
  parts,
  label,
}: {
  parts: { id: string; name: string }[]
  /** Names the nav for assistive tech — "SEO, the ten parts" rather than a bare "list". */
  label: string
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const links = new Map<string, HTMLAnchorElement>()
    for (const a of root.querySelectorAll<HTMLAnchorElement>('a[data-part]')) {
      links.set(a.dataset.part!, a)
    }
    if (links.size === 0) return

    let current: string | null = null
    const mark = (id: string) => {
      if (id === current) return
      const previous = current ? links.get(current) : undefined
      previous?.removeAttribute('data-active')
      previous?.removeAttribute('aria-current')
      const next = links.get(id)
      next?.setAttribute('data-active', 'true')
      // The styling hook and the announced state are separate attributes on purpose:
      // data-active drives CSS, aria-current is what a screen reader reads out. Neither
      // can be derived from the other, and using aria-* as a style hook would mean the
      // day the styling changes someone silently edits the accessibility tree.
      next?.setAttribute('aria-current', 'true')
      current = id
    }

    const sections = parts
      .map((p) => document.getElementById(p.id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Several parts can cross the band in one callback on a fast scroll. The one
        // nearest the top of the viewport is the one being read.
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (hit) mark(hit.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )

    for (const section of sections) observer.observe(section)
    mark(sections[0].id) // something is always marked, including before the first scroll
    return () => observer.disconnect()
  }, [parts])

  return (
    <nav ref={ref} aria-label={label} className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
      <p className="font-mono text-[11px] tracking-[0.2em] text-mut-2 uppercase">
        {parts.length} parts
      </p>
      <ol className="mt-5 space-y-0.5">
        {parts.map((part, i) => (
          <li key={part.id}>
            {/* The rule on the left is the progress indicator: it is the full brand colour
                on the current part and a hairline everywhere else, so the eye can find its
                place in the list without reading it. Colour is not carrying this alone —
                the label goes to head weight at the same time, and aria-current names it
                for anyone not looking at either. */}
            <a
              href={`#${part.id}`}
              data-part={part.id}
              className="group flex items-center gap-3 border-l-2 border-line py-1.5 pl-4 text-[13.5px] text-mut transition-colors data-[active]:border-brand data-[active]:font-semibold data-[active]:text-head hover:text-head"
            >
              <span className="font-mono text-[11px] tracking-[0.1em] text-mut-2 group-data-[active]:text-brand-strong">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="leading-snug">{part.name}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

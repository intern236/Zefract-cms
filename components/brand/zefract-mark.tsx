/**
 * The Modular Z mark.
 *
 * 5x5 module grid: module 6u, gap 1u, pitch 7u, artboard 34u. The centre module
 * is offset +1.5u right and down — "slipped off the grid", which is the whole
 * idea of the identity. Geometry measured from the approved lockup; see
 * brand/CANVA-SPEC.md.
 *
 * Rendered inline rather than as an <img> so the fracture module can be animated
 * and the ink colour can inherit from context.
 */
const MODULES = [
  // top bar
  [0, 0], [7, 0], [14, 0], [21, 0], [28, 0],
  // diagonal
  [21, 7],
  [7, 21],
  // bottom bar
  [0, 28], [7, 28], [14, 28], [21, 28], [28, 28],
] as const

export function ZefractMark({
  className,
  title = 'Zefract',
  fractureClassName,
}: {
  className?: string
  /** Pass null for decorative use where an adjacent wordmark already names the brand. */
  title?: string | null
  fractureClassName?: string
}) {
  return (
    <svg
      viewBox="0 0 34 34"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <g fill="currentColor">
        {MODULES.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="0.5" />
        ))}
      </g>
      <rect
        x="15.5"
        y="15.5"
        width="6"
        height="6"
        rx="0.5"
        className={fractureClassName}
        fill="var(--color-brand)"
      />
    </svg>
  )
}

/**
 * Solid-Z fallback for sizes under ~24px.
 *
 * brand/CANVA-SPEC.md flags this: at favicon size the 1u gaps between modules
 * close up and the fracture disappears, so the modular mark reads as a smudge.
 */
export function ZefractMarkSolid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 34" className={className} role="img" aria-label="Zefract">
      <path
        d="M0 0h34v7L12 27h22v7H0v-7L22 7H0z"
        fill="currentColor"
      />
      <rect x="14" y="14" width="6" height="6" rx="0.5" fill="var(--color-brand)" />
    </svg>
  )
}

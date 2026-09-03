import { isTodo, todoLabel } from '@/lib/todo'

/**
 * Renders a value the client has not supplied yet as an obvious stub rather than
 * silently omitting it or inventing something plausible.
 *
 * In production the stub is hidden entirely — a live site should never show
 * scaffolding — but `npm run check:todos` still lists it, so nothing is forgotten.
 */
export function StubValue({
  value,
  className,
}: {
  value: string | undefined
  className?: string
}) {
  if (!value) return null

  if (!isTodo(value)) {
    return <span className={className}>{value}</span>
  }

  if (process.env.NODE_ENV === 'production') return null

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded border border-dashed border-brand/50 bg-brand/8 px-2 py-0.5 font-mono text-[11px] tracking-wide text-brand-strong"
      title="Placeholder, awaiting content from the client"
    >
      needs {todoLabel(value)}
    </span>
  )
}

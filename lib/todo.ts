/**
 * Visible placeholders for content the client has not supplied yet.
 *
 * The brief sanctions this at L214-215: "Where our content is not ready, use
 * clearly labelled placeholders so build is not blocked." It also lists
 * "unverifiable stats" as an explicit anti-goal (L185-186), so unknowns must stay
 * obviously unknown rather than turning into plausible-looking fake data.
 *
 * Every placeholder is greppable via `npm run check:todos`.
 */

const PREFIX = 'TODO::'

export type TodoString = string & { readonly __todo?: never }

/** Marks a value the client still owes us. Renders as a visible stub in the UI. */
export function TODO(what: string): TodoString {
  return `${PREFIX}${what}`
}

export function isTodo(value: unknown): value is TodoString {
  return typeof value === 'string' && value.startsWith(PREFIX)
}

/** The human-readable description inside a placeholder. */
export function todoLabel(value: string): string {
  return isTodo(value) ? value.slice(PREFIX.length) : value
}

/**
 * Resolves a possibly-placeholder value for display.
 * Returns `null` when the value is still a placeholder, so callers can decide
 * whether to render a stub, omit the element, or fall back.
 */
export function resolved(value: string | undefined): string | null {
  if (!value || isTodo(value)) return null
  return value
}

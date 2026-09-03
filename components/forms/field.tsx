import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

/**
 * One labelled form control — an input or a textarea — with its error message.
 *
 * WHY IT EXISTS. The contact form previously repeated this five times:
 *
 *     <div className="space-y-2">
 *       <Label htmlFor="name">Your name</Label>
 *       <Input id="name" name="name" required autoComplete="name" className={FIELD} />
 *     </div>
 *
 * The `id`/`htmlFor` pairing is the kind of duplication that eventually gets one letter wrong,
 * and a label whose `htmlFor` misses is invisible to a screen reader while looking perfectly
 * correct on screen. Deriving the id from `name` means the two cannot disagree. Same for the
 * `aria-invalid` and `aria-describedby` wiring the server errors need — five call sites is five
 * chances to skip it.
 *
 * A Server Component: no state, no handlers. It renders inside a client form, which is fine —
 * the form owns the interactivity, the field owns the markup.
 */

/**
 * THE FIELD TREATMENT, AND THE ACCESSIBILITY TRADE-OFF IN IT.
 *
 * shadcn ships <Input> as `bg-transparent` with `border-input`, and `--input` in this project is
 * #7e8896, a mid grey. The comment on that token explains why: WCAG SC 1.4.11 asks for 3:1 on the
 * visual boundary of a form control, the decorative hairline #e2e6ec measures 1.5:1, and #7e8896
 * measures 3.59:1 on white.
 *
 * THE RESTING BORDER WAS REMOVED ON REQUEST, and this is the note that keeps that a decision
 * rather than an accident. It is `border-transparent`, not a dropped border width: the box keeps
 * its geometry, so nothing reflows when a state paints the border back in, and hover, focus and
 * invalid each only have to change a colour.
 *
 * WHAT IT COSTS. bg-page on a white card is about 1.06:1, so at rest nothing identifies these
 * controls at 3:1 and SC 1.4.11 is not met while they sit idle. Every state that signals
 * something still draws a real border, so hover, focus and invalid are unaffected, as is the
 * focus ring below. Restoring the boundary without going back to an outlined look means a
 * darker fill, not a lighter hairline: bg-page itself would have to reach 3:1 against the card.
 *
 * The rest of the treatment is unchanged:
 *
 *   bg-page      a filled slot reads as somewhere to type; an outlined void does not, which is
 *                what made the old fields look like empty rectangles floating on the card
 *   rounded-12   `rounded-lg` resolves to this project's --radius of 18px, which on a 44px-tall
 *                box is nearly a pill — it read as a button, not a field
 *   h-12         48px, up from 44px. Comfortably over SC 2.5.8's 24px minimum and closer in
 *                weight to the 52px submit button underneath it
 *   px-4         16px, so text is not crowded against the border
 *   focus fill   the field turns white on focus, so the active row is obvious at a glance
 *
 * THE FOCUS RING IS NOT OPTIONAL HERE, and I removed it once by mistake. globals.css gives every
 * focusable element a 3px ink outline in `@layer base`, so it looked safe to drop the ring
 * utilities and rely on that. It is not: shadcn's <Input> base class carries `outline-none`, and
 * Tailwind utilities sit in a LATER layer than `@layer base`, so that one class suppresses the
 * global outline for every input on the site. Measured on a focused field afterwards:
 * `outline-style: none`, leaving focus signalled by a 1px border colour change and nothing else.
 *
 * So the ring is restored explicitly. Focus now changes three things at once — fill to white,
 * border to brand (3.32:1 against white, clearing SC 1.4.11's 3:1), and a 4px brand halo — which
 * is at least as strong as the `ring-3 ring-ring/50` this replaced.
 */
/**
 * EXPORTED so controls this component cannot render — the admin's title input,
 * its tag box, the status select — wear the identical treatment instead of a
 * hand-copied approximation of it. The budget select in the contact form still
 * restates it by hand and says so; anything new should import this.
 *
 * `focus-visible:outline-none` IS PART OF THE TREATMENT, not an omission of
 * one. The base layer gives every focusable element a 3px INK outline plus a
 * brand halo. shadcn's own <Input> carries `outline-none`, so a <Field> never
 * showed it — but a raw <input> styled with this constant did, and the result
 * was a black rectangle sitting outside the orange ring on every field in the
 * post editor. The focus indicator here is the brand border plus the 4px brand
 * ring below, which is at least as visible and is the one the rest of the site
 * uses; the ink outline was a second, uglier answer to a question already
 * answered.
 */
export const FIELD_BASE =
  'w-full min-w-0 rounded-[12px] border border-transparent bg-page text-base transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-mut-2 hover:border-brand/50 focus-visible:bg-surface focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/35 focus-visible:outline-none aria-invalid:border-destructive aria-invalid:bg-surface aria-invalid:ring-4 aria-invalid:ring-destructive/15 md:text-[15px]'

/** Height and inline padding, shared with the <select>s built on SELECT_BASE below. */
export const FIELD_HEIGHT = 'h-12 px-4'

/**
 * The same treatment, for a native <select>.
 *
 * IT EXISTS BECAUSE THE COPY WAS ALREADY DRIFTING. The contact form's budget select
 * restated every class in FIELD_BASE by hand and carried a comment admitting it: "Kept in
 * step with FIELD_BASE by hand… if the field treatment changes there, change it here too."
 * That is a promise someone eventually fails to keep, and the second select on that form —
 * the phone country code — would have made it two promises. One constant, no promise.
 *
 * `native-select` IS WHY IT COULD NOT SIMPLY REUSE FIELD_BASE. A select needs the
 * appearance reset (see globals.css, which also styles the open list where the browser
 * allows it) and a right-hand gutter for the chevron the form draws itself, because the
 * native arrow sits hard against the border with nothing to separate it.
 *
 * THE GUTTER IS APPLIED AT THE CALL SITE, NOT HERE, and that is not an oversight: it has to
 * come after FIELD_HEIGHT's `px-4`, or tailwind-merge resolves the two padding utilities in
 * favour of the later one and the chevron ends up sitting on the text. Call it as
 * `cn(SELECT_BASE, FIELD_HEIGHT, 'pr-10')`.
 */
export const SELECT_BASE = `${FIELD_BASE} native-select cursor-pointer`

type Common = {
  /** Doubles as the control's `id`, so label and control cannot drift apart. */
  name: string
  label: string
  /** Server-side message for this field. Absent when the field is fine. */
  error?: string
  /**
   * Marks the field as not required, in the label.
   *
   * The inverse of the usual asterisk-on-required convention, and deliberately so: four of the
   * five fields here are required, so asterisks would decorate almost every row and stop
   * carrying information. Naming the one exception is shorter and tells the visitor the thing
   * they actually want to know — what they can skip.
   */
  optional?: boolean
  className?: string
}

type InputField = Common & { as?: 'input' } & Omit<
    ComponentProps<typeof Input>,
    'id' | 'name' | 'className'
  >

type TextareaField = Common & { as: 'textarea' } & Omit<
    ComponentProps<typeof Textarea>,
    'id' | 'name' | 'className'
  >

export function Field({
  name,
  label,
  error,
  optional,
  className,
  ...rest
}: InputField | TextareaField) {
  const errorId = `${name}-error`
  /* Only points at the error when there is one. An aria-describedby referencing a missing id is
     ignored by some screen readers and read as empty by others — either way it is noise. */
  const described = error ? { 'aria-describedby': errorId } : {}

  const shared = {
    id: name,
    name,
    'aria-invalid': error ? true : undefined,
    ...described,
  }

  const { as = 'input', ...control } = rest as { as?: 'input' | 'textarea' } & Record<
    string,
    unknown
  >

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={name} className="text-[13.5px] font-semibold text-head">
          {label}
        </Label>
        {optional ? (
          <span className="font-mono text-[12px] tracking-[0.12em] text-mut-2 uppercase sm:text-[10px]">
            Optional
          </span>
        ) : null}
      </div>

      {as === 'textarea' ? (
        /* min-h-36 rather than `rows`, because rows does not survive `field-sizing-content` — the
           base <Textarea> sizes itself to its content, so an empty box renders at the 64px floor
           regardless of the rows asked for. It still grows as you type; this only sets where it
           starts, and a message field that opens at 64px asks for one sentence when the copy
           above it asks for a brief. */
        <Textarea
          {...shared}
          {...(control as ComponentProps<typeof Textarea>)}
          className={cn(FIELD_BASE, 'min-h-36 px-4 py-3 leading-relaxed', className)}
        />
      ) : (
        <Input
          {...shared}
          {...(control as ComponentProps<typeof Input>)}
          className={cn(FIELD_BASE, FIELD_HEIGHT, className)}
        />
      )}

      {error ? (
        /* Not role="alert": several of these can appear at once when a submission comes back, and
           a page full of competing live regions is read out as a jumble. The form's own summary
           carries the announcement; these are the per-field detail you find on the way through. */
        <p id={errorId} className="text-[13px] text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}

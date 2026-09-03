import { SITE, SOCIAL } from '@/content/site'
import { SOCIAL_GLYPHS } from '@/components/ui/social-icons'
import { cn } from '@/lib/utils'

/**
 * The brand's profiles elsewhere, as a row of icon links.
 *
 * A COMPONENT RATHER THAN MARKUP AT EACH CALL SITE, for the reason contact-channels.tsx
 * spells out about the email/call/WhatsApp rows: it renders in the footer and in the
 * contact page's Direct card, and two hand-built rows of the same five links are two
 * chances for the accessible name, the target size or the `rel` to end up different in the
 * place nobody looked at. This is the third layer of the same arrangement — content/site.ts
 * owns WHICH profiles, social-icons.tsx owns what each one LOOKS like, and this owns how a
 * row of them is built.
 *
 * IT READS THE SAME `SOCIAL` LIST THAT FEEDS `sameAs` on the Organization schema
 * (lib/schema.tsx), so a network added for a crawler is always a network a visitor can
 * reach. That is the inconsistency the shared list exists to prevent.
 *
 * THE ICON IS THE WHOLE VISIBLE LABEL, so the accessible name carries everything:
 * `aria-label` names the platform, the glyph is `aria-hidden` so the SVG contributes no
 * nothing-shaped noise beside it, and there is deliberately no `title` — a native tooltip
 * is a delayed grey box belonging to no part of this design, the same call <BackToTop>
 * makes.
 *
 * "ZEFRACT ON X" RATHER THAN "X", because a bare platform name in a link list reads as a
 * section rather than a destination, and X in particular is one character that could be
 * almost anything. The URL is deliberately not announced: across five links it is noise,
 * and the href is right there.
 *
 * `noopener` is the security half of `target="_blank"` — without it the opened tab gets a
 * handle on this one through window.opener. Same rel string as the WhatsApp button and the
 * author profile links.
 *
 * A Server Component: five anchors and no behaviour, so this costs no JavaScript on any
 * route it appears on.
 */
export function SocialLinks({
  className,
  as = 'ul',
  size = 'md',
}: {
  className?: string
  /**
   * The disc size, which is really a question about what the row sits next to.
   *
   * `md` (40px) is the standalone form — the footer, where the row is its own element under
   * the contact lines and has no neighbour to agree with.
   *
   * `sm` (32px) matches the icon circles in the contact page's Direct card exactly. That
   * card runs a column of 32px discs down its left edge, and a 40px row dropped into the
   * middle of it broke the column twice over: wider than its neighbours and, because it was
   * indented to clear them, starting at a different x. Matching the size lets it sit in the
   * same column, which is what makes it read as another row of the card rather than
   * something pasted into it.
   *
   * 32px IS STILL WELL OVER THE 24px WCAG 2.2 SC 2.5.8 ASKS FOR, so this trades none of the
   * target size the `md` note describes — it gives up only the headroom above the minimum,
   * which was never the reason for 40px.
   */
  size?: 'sm' | 'md'
  /**
   * The element the row is built from.
   *
   * `ul` IS THE DEFAULT AND THE RIGHT ANSWER ALMOST EVERYWHERE — five links of one kind are
   * a list, and announcing them as "list, 5 items" is what lets someone skip the set in one
   * gesture instead of arrowing through five unrelated things.
   *
   * `div` EXISTS FOR ONE CASE: the contact page's Direct card, where this row sits INSIDE
   * the list of contact channels. A <ul> nested in an <li> is valid HTML and is announced
   * as a sub-list of the item above it — so the profiles would be read as belonging to
   * WhatsApp, which is not what they are. A plain row inside that <li> is honest about
   * being one entry among the channels rather than a list within one.
   */
  as?: 'ul' | 'div'
}) {
  /* Built once and wrapped twice, so the anchor — which is the part carrying the
     accessible name, the target size and the rel — cannot differ between the two forms.
     Only the container changes. */
  /* The glyph is scaled with the disc rather than left at one size, so the mark keeps the
     same proportion inside it — 40% either way. A 16px glyph in a 32px circle reads as
     crowded next to the same glyph in a 40px one. */
  const disc = size === 'sm' ? 'size-8' : 'size-10'
  const glyph = size === 'sm' ? 'size-3.5' : 'size-4'

  const links = SOCIAL.map((profile) => {
    const Glyph = SOCIAL_GLYPHS[profile.platform]
    return (
      <a
        key={profile.platform}
        href={profile.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${SITE.name} on ${profile.label}`}
        /* BRAND AT REST, NOT ON HOVER. These were grey until hovered, which put the only
           signal that they are live behind an interaction half the audience cannot perform
           — a touchscreen has no hover state, so on a phone the row read as five decorative
           discs. Colouring them at rest is what makes them look like the links they are.

           `brand-strong` (#c2410c) rather than flat brand (#e6551e), the same call every
           other small orange mark on the site makes: at this size the glyph is non-text
           content needing 3:1, and brand-strong clears it against both the page and the
           card with room that flat brand does not have.

           HOVER THEREFORE MOVES THE SURFACE, not the glyph — the border warms and the disc
           tints. Something still has to change on hover, and with the icon already at full
           strength there is nowhere for its colour to go.

           The default 40px clears the 24px of WCAG 2.2 SC 2.5.8 comfortably and falls short
           of the 44px of SC 2.5.5 at AAA — the same trade <BackToTop> documents, and made
           here because a row of five 44px discs reads as a toolbar rather than as a
           footnote. `gap-2` keeps 8px between them, so no two targets are adjacent, and the
           32px variant still leaves a third more than the minimum. */
        className={cn(
          disc,
          'inline-flex items-center justify-center rounded-full border border-line bg-page text-brand-strong transition-colors hover:border-brand/50 hover:bg-brand/8'
        )}
      >
        <Glyph className={glyph} />
      </a>
    )
  })

  const row = cn('flex flex-wrap items-center gap-2', className)

  if (as === 'div') return <div className={row}>{links}</div>

  return (
    <ul className={row}>
      {links.map((link) => (
        <li key={link.key}>{link}</li>
      ))}
    </ul>
  )
}

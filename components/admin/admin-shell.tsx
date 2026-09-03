import type { ReactNode } from 'react'
import { Container } from '@/components/ui/section'

/**
 * The admin's page wrapper: clears the site header, holds the admin inside the
 * site's own measure, and marks the page so the decorative cursor ring stays
 * off a working surface.
 *
 * THE SITE HEADER AND FOOTER STAY. The admin is a section of the site behind a
 * password, not a separate application — the owner still wants a way back to
 * their own website from it. So this makes room for the site's chrome rather
 * than hiding it, and the admin renders as cards on the page background, the
 * same visual language as every other page here.
 *
 * THE STICKY STACK, defined here so the layers cannot drift apart:
 *
 *   0-82px     the site's floating header pill (fixed, top-4, ~66px tall)
 *   82-104px   clear air, so the two bars read as separate things
 *   104-160px  the admin bar        — ADMIN_BAR_TOP, sticky, 56px tall
 *   176px+     the section nav and the editor toolbar — PANEL_TOP, sticky
 *
 * 104px is also this wrapper's top padding, so the admin bar's resting position
 * and its stuck position are identical and it never appears to jump when the
 * page starts scrolling. 176px is the bar's bottom edge plus the 16px gap.
 *
 * THE BAND ABOVE THE BAR HAS TO BE MASKED, which is what the admin scrim rule
 * in globals.css does. The bar is sticky, so everything below it in the
 * document — the title, the permalink, the panels — scrolls up PAST it and
 * reappears in the 0-104px strip, where the site's floating pill only covers
 * the middle 1060px and the page shows through either side. Without the mask
 * that strip fills with half a title card sliding under the logo.
 */

/** Where the admin bar sits, and the padding that puts it there. */
export const ADMIN_BAR_TOP = 'top-[104px]'
/** Directly under the admin bar and its gap: 104 + 56 + 16. */
export const PANEL_TOP = 'top-[176px]'

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div data-admin-surface className="pt-[104px] pb-16">
      <Container>{children}</Container>
    </div>
  )
}

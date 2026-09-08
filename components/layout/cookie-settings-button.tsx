'use client'

import { CONSENT } from '@/content/site'
import { openConsentSettings } from '@/lib/consent'

/**
 * "Cookie settings" in the footer: the withdrawal route section 05 of the privacy policy
 * names, in the place it says to look.
 *
 * A BUTTON, NOT A LINK, because it goes nowhere. It reopens <ConsentBanner> where the
 * visitor already is, so there is no URL to give it and `href="#"` would be a lie told to
 * a screen reader and to anyone who middle-clicks. The footer's Legal group is a list of
 * links and this is the one entry that is not one; the styling matches them so the row
 * reads as a set, while the element underneath stays honest about what it does.
 *
 * IT IS THE ONLY THING IN THE FOOTER THAT NEEDS JAVASCRIPT, which is why it is a separate
 * file rather than a `'use client'` at the top of site-footer.tsx. Marking the whole footer
 * as a client component to get one button would ship the nav data, the contact channels and
 * the social list to the browser on every route on the site, to no purpose.
 *
 * NO STATE HERE. It calls into the store in lib/consent.ts and the banner, which subscribes,
 * does the rest. This component never needs to know whether the banner is open.
 */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openConsentSettings}
      /* min-h-6 matches the footer links either side of it, which carry it for the 24x24
         minimum WCAG 2.2 SC 2.5.8 asks of a target. `text-left` because a button centres
         its label by default and every neighbour in this column is left-aligned. */
      className="inline-flex min-h-6 items-center text-left text-[14.5px] text-head transition-colors hover:text-brand-strong"
    >
      {CONSENT.settingsLabel}
    </button>
  )
}

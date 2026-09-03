import { contactChannels } from '@/components/ui/contact-channels'

/**
 * The floating WhatsApp control: a green disc that opens into a "Chat with us" pill on
 * hover or keyboard focus. Bottom-right, under <BackToTop>, on every page.
 *
 * A FOURTH CONSUMER OF contactChannels(), NOT A FOURTH DEFINITION. WhatsApp already reaches
 * the visitor from the footer, the contact page's Direct panel and the CTA band, and that
 * module exists precisely so the number, the wa.me href and the prefilled message are
 * written once. Building this button its own `wa.me/...` string would be the fourth place
 * the same decision lives and the first to go stale — the exact drift contact-channels.tsx
 * was created to stop.
 *
 * IT INHERITS THE PLACEHOLDER GUARD FOR FREE. `contactChannels()` drops any channel whose
 * value is still a TODO, so if the number is ever pulled this returns null rather than
 * floating a control that links to `wa.me/` with nothing after it.
 *
 * NOT A CLIENT COMPONENT, AND THE OPEN ANIMATION IS WHY THAT IS WORTH NOTING. The obvious
 * way to expand a pill is to measure the label and animate a width in JS. This does it in
 * CSS instead — see the grid note below — so the whole control ships zero JavaScript on
 * every route on the site.
 *
 * WHERE IT SITS IN THE STACK. z-75, the same layer <BackToTop> uses and for the same
 * reasons: above page content and the header's scrim (70), below the header (80), the cursor
 * ring (90) and the mobile sheet (95). Below the sheet is the load-bearing one — a button
 * floating over an open mobile menu reads as a bug.
 *
 * IT OWNS THE BASE CORNER AND <BackToTop> SITS ABOVE IT. That component's own note
 * anticipated this ("if a floating WhatsApp button ever lands there too, these two have to
 * be offset from each other rather than stacked"), and the arithmetic tying the two together
 * is written out at the className in back-to-top.tsx. Change the size or the inset here and
 * that comment is the one to read. This takes the lower slot because it is always visible,
 * while back-to-top only appears past 600px of scroll: the permanent control belongs in the
 * corner the thumb reaches, the intermittent one goes above it.
 *
 * IT GROWS LEFTWARD, WHICH IS FREE. The element is pinned by `right`, so widening it can
 * only extend towards the middle of the screen — it can never push itself off the edge, and
 * nothing below it moves, so the expansion costs no layout shift.
 *
 * WHATSAPP GREEN RATHER THAN THE SITE'S BRAND ORANGE. The one place the palette is
 * deliberately broken. The control is recognised by its colour before it is read, and an
 * orange disc with an unfamiliar glyph is a mystery button. It is the only WhatsApp green on
 * the site — the footer, panel and CTA band all render the channel in the site palette,
 * because there the word "WhatsApp" sits beside the icon and does the identifying.
 */
export function WhatsAppButton() {
  const channel = contactChannels().find((c) => c.kind === 'whatsapp')
  if (!channel) return null

  return (
    <a
      href={channel.href}
      /* NOT the channel's own `ariaLabel`. That one reads "Chat with Zefract on WhatsApp,
         +91 93114 41557", which is right for the footer row where the visible text is a bare
         number. Here the visible text is "Chat with us", and WCAG 2.2 SC 2.5.3 (Label in
         Name) requires the accessible name to CONTAIN the visible label — otherwise someone
         using voice control says "click Chat with us" and nothing happens, because the name
         the browser matched against never had those words in it. This adds "on WhatsApp" to
         say where the link goes without breaking that containment.
         The number is deliberately not read out: on a control that appears on every page it
         is noise, and it is one tap away in the footer. */
      aria-label="Chat with us on WhatsApp"
      /* WhatsApp leaves the site. `noopener` is the security half — without it the opened
         tab gets a handle on this one through window.opener. */
      target="_blank"
      rel="noopener noreferrer"
      className={[
        /* `group` is what lets the label below react to hover and focus on the whole pill
           rather than on itself — the label has no size of its own to be hovered when it is
           closed, so it could never drive its own opening. */
        'group fixed z-75 flex items-center rounded-full',
        'right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))]',
        'md:right-8 md:bottom-[calc(2rem+env(safe-area-inset-bottom))]',
        /* The safe-area inset keeps it off the iOS home indicator, where a bottom-right
           floating control otherwise sits under the gesture bar and is hard to hit. */
        'bg-[#25D366] text-white',
        'shadow-[0_10px_28px_-8px_rgba(37,211,102,0.55)]',
        'transition-[background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'hover:bg-[#1DA851] hover:shadow-[0_16px_36px_-10px_rgba(37,211,102,0.7)]',
        'motion-reduce:transition-none',
        /* Offset against the page rather than the disc: a default ring would sit on a green
           almost the same as the button's own and effectively disappear. */
        'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink',
      ].join(' ')}
    >
      {/* The disc. 44px — deliberately one step LARGER than <BackToTop>'s 36px rather than
          matched to it. The two sit in one column, and equal discs made them read as a pair of
          equally weighted widgets; this is the conversion action and that one is a
          convenience, so the size difference is the thing that says which is which. An
          earlier 52px version was bigger still and overpowered the column.

          44px IS ALSO EXACTLY THE THRESHOLD OF WCAG 2.2 SC 2.5.5 (Target Size, Enhanced, AAA),
          which is a genuine outcome of the visual choice rather than the reason for it. It
          clears the 24px of SC 2.5.8 at AA nearly twice over. Worth knowing before anyone
          trims it: at 43px this stops meeting AAA, where <BackToTop> already sits below that
          line by its own documented trade.

          `shrink-0` so it stays a true circle when the label opens beside it. */}
      <span className="flex size-11 shrink-0 items-center justify-center">
        {/* 20px in a 44px disc — 45%, against the 39% <BackToTop> uses. A filled brand mark
            reads smaller than its box at the same ratio as a 1.5px stroked arrow, so the two
            glyphs look evenly weighted at these two percentages rather than at one shared
            number. */}
        <channel.Icon className="size-5" />
      </span>

      {/* THE LABEL OPENS BY ANIMATING A GRID TRACK FROM 0fr TO 1fr, and that is the whole
          trick: `1fr` resolves to the label's own content width, so the pill animates to
          exactly the right size without anyone measuring the text. Every other approach
          needs a number that the copy can then outgrow — a fixed `width` breaks the day the
          label changes, and a `max-width` guess has to overshoot, which strands the easing
          and makes the last part of the open look like it stalls.

          `min-w-0` ON THE INNER SPAN IS LOAD-BEARING. A grid item's automatic minimum size
          is its min-content width, so without this the track refuses to go below the width
          of "Chat with us" and the pill is simply always open. The `overflow-hidden` next to
          it is what clips the text while the track is narrower than the words.

          IT STAYS IN THE DOM WHEN CLOSED, which is the accessible choice: the text is real
          content, so it is the link's visible label for SC 2.5.3 (see the aria-label note
          above) even in the frames where it is clipped to nothing.

          Focus as well as hover, so a keyboard user sees the same label a pointer user does
          rather than tabbing onto an unlabelled green disc. */}
      <span
        className={[
          'grid grid-cols-[0fr] transition-[grid-template-columns]',
          'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]',
          'motion-reduce:transition-none',
        ].join(' ')}
      >
        <span className="min-w-0 overflow-hidden">
          {/* The right padding lives on the text, not the pill, so it is animated open with
              the label. On the pill it would be permanent and the closed state would be a
              20px-too-wide oval instead of a circle. */}
          {/* 14px, down from 15 with the disc. The type is not scaled for its own sake — at
              15px in a 36px pill the words sit closer to the rim than the glyph does to its
              own edge, which reads as text crowding a box that shrank around it. */}
          <span className="block pr-4.5 pl-0.5 text-[14px] font-semibold whitespace-nowrap">
            Chat with us
          </span>
        </span>
      </span>
    </a>
  )
}

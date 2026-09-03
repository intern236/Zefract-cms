import { Container, Eyebrow, headingClass } from '@/components/ui/section'
import { PillLink, PillAnchor } from '@/components/ui/pill'
import { Group, FadeItem } from '@/components/motion/reveal'
import { MaskedLines } from '@/components/motion/masked-lines'
import { CTA } from '@/content/home'
import { contactChannels } from '@/components/ui/contact-channels'
import { cn } from '@/lib/utils'

/**
 * Closing CTA band.
 *
 * `on-ink` switches the focus ring to white — the brand orange ring is far too
 * low-contrast against this background to satisfy WCAG 2.2 SC 2.4.13.
 */
export function CtaBand({
  spacing = 'default',
  layout = 'default',
}: {
  spacing?: 'default' | 'compact'
  /**
   * `pairs` lays the actions out two to a row on phones, in the order primary, Call,
   * Email, WhatsApp. The home page and the Services pages use it; work, about, contact and
   * the legal pages still take the single wrapping row. See the note on the row below.
   *
   * It is a phone setting only. From sm up both layouts render the same flex row, so the
   * two are indistinguishable on a laptop.
   */
  layout?: 'default' | 'pairs'
} = {}) {
  const channels = contactChannels()
  const pairs = layout === 'pairs'

  /* Split so the two action pills can be sized together — see the wrapper below. The email
     keeps its own width because it shows an address rather than a verb. Not needed in the
     `pairs` layout, where the grid already gives every cell the same width. */
  const emailChannels = channels.filter((c) => c.kind === 'email')
  const directChannels = channels.filter((c) => c.kind !== 'email')
  /* The order the pairs read in: primary and Call on the first row, Email and WhatsApp on
     the second. Reordering the DOM rather than using `order`, so the tab order matches what
     is on screen. Safe above sm, where Call is display:none on a fine pointer and the row
     falls back to primary, Email, WhatsApp exactly as it does today. */
  const pairedChannels = [
    ...channels.filter((c) => c.kind === 'phone'),
    ...emailChannels,
    ...channels.filter((c) => c.kind === 'whatsapp'),
  ]

  const renderChannel = (channel: (typeof channels)[number]) => {
    const { Icon } = channel
    /* The label, not the value: a pill row of three long addresses and numbers wraps badly
       and reads as data rather than as actions. The email keeps its address because it is
       short and is the one people copy. */
    const label = channel.kind === 'email' ? channel.value : `${channel.label} us`
    /* Half a row is 165px at 390px, and the address alone needs 235px — it would have to
       drop to about 7px type to fit, so in `pairs` the phone gets the word instead. Both
       labels are rendered and one is display:none, which takes it out of the accessibility
       tree too, so nothing is announced twice. */
    const shortLabel = channel.kind === 'phone' ? 'Call us' : channel.label

    return (
      <PillAnchor
        key={channel.kind}
        href={channel.href}
        variant="ghostOnInk"
        size={pairs ? 'compact' : undefined}
        {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
        {...(channel.ariaLabel ? { 'aria-label': channel.ariaLabel } : {})}
        /* CALL ONLY SHOWS WHERE A TAP CAN DIAL. A `tel:` link in desktop Chrome
           raises "Open Phone Link? … wants to open this application", which no
           website can suppress. A pill that answers a click with a browser
           interrogation is worse than no pill, and the number is still readable in
           the footer and on the contact page. Same rule as <ChannelValue>: a tel:
           link exists only where it works. */
        className={channel.kind === 'phone' ? 'tel-link' : undefined}
      >
        <Icon className="size-4 shrink-0" />
        {pairs ? (
          <>
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </PillAnchor>
    )
  }

  return (
    <section
      id="cta"
      className={cn(
        'on-ink bg-ink py-24 text-center text-white',
        /* Matches <Section>'s two rhythms. `compact` is a phone and tablet setting only:
           its lg value is the same 128px the default reaches at md, so desktop is
           untouched and only the range below 1024px tightens. */
        spacing === 'compact' ? 'mt-16 lg:mt-32' : 'mt-28 md:mt-32'
      )}
    >
      <Container>
        <Group>
          <FadeItem className="mb-6" y={10}>
            <Eyebrow className="text-[#9FB2C7]">{CTA.eyebrow}</Eyebrow>
          </FadeItem>
          <MaskedLines
            lines={CTA.heading}
            className={headingClass('h2', 'text-white')}
            delay={0.08}
          />
          <FadeItem className="mt-6" delay={0.26}>
            <p className="mx-auto max-w-[52ch] text-pretty text-[17.5px] text-[#C6D4E4]">
              {CTA.sub}
            </p>

            {/* TWO TO A ROW ON PHONES in the `pairs` layout, one row of four from sm up.
                `grid` and `sm:flex` are different tailwind-merge groups, so both survive the
                cn() and the display simply swaps at the breakpoint; grid-cols-2 goes inert
                once the container is a flex row.

                A grid and not a wrapping flex row, because grid cells are equal by default:
                the four pills come out the same width without anyone measuring a label. That
                is also why the `sm:contents` pairing below is skipped here, since it would
                put two pills in one cell. */}
            <div
              className={cn(
                'mt-10 flex flex-wrap justify-center gap-3',
                pairs && 'grid grid-cols-2 items-stretch sm:flex'
              )}
            >
              <PillLink href="/contact" variant="brand" size={pairs ? 'compact' : undefined}>
                {pairs ? (
                  <>
                    {/* "Start your project" needs 218px against a 165px column. The short
                        form is 140px at the compact size, so it holds one line. */}
                    <span className="sm:hidden">Start project</span>
                    <span className="hidden sm:inline">{CTA.primary}</span>
                  </>
                ) : (
                  CTA.primary
                )}
              </PillLink>
              {/* All three contact options, each with the icon it carries in the footer and on the
                  contact page. Email previously had no icon and Call was not offered here at all,
                  which left this band showing two of the three. The pills come from the same
                  contactChannels() definition, so the icon and the href cannot diverge from the
                  other two places these appear. */}
              {pairs ? (
                pairedChannels.map(renderChannel)
              ) : (
                <>
                  {emailChannels.map(renderChannel)}

                  {/* CALL AND WHATSAPP MATCH EACH OTHER, stacked. Each pill otherwise hugs its
                      own label, so "Call us" came out visibly narrower than "WhatsApp us" once
                      the row wrapped to one pill per line and the two sat directly above one
                      another.

                      A column wrapper rather than a width on the pills: a flex column stretches
                      its items to the container, and the container shrink-wraps to its widest
                      child, so the pair lands on the width of "WhatsApp us" without anyone
                      hardcoding what that is. Relabel either one and they stay matched.

                      `sm:contents` dissolves the wrapper from sm up, where the pills sit on one
                      line and should each keep their natural width, so the desktop row is
                      exactly what it was. Heights already agreed: both come from the same pill
                      size, which fixes the padding. */}
                  <div className="flex flex-col gap-3 sm:contents">
                    {directChannels.map(renderChannel)}
                  </div>
                </>
              )}
            </div>

            <p className="mt-7 text-[13.5px] text-[#9FB2C7]">{CTA.note}</p>
          </FadeItem>
        </Group>
      </Container>
    </section>
  )
}

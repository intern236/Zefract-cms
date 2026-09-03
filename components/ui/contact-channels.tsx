import { Mail, Phone } from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { CONTACT } from '@/content/site'
import { resolved } from '@/lib/todo'
import { whatsappHref } from '@/lib/whatsapp'
import { telHref } from '@/lib/phone'

/**
 * The three ways to reach Zefract, defined once.
 *
 * WHY THIS EXISTS RATHER THAN AN ICON PER CALL SITE. Email, call and WhatsApp appear in three
 * places — the footer, the contact page's Direct panel, and the CTA band — and each had built its
 * own row markup with its own href logic. Adding an icon to each by hand is three chances for the
 * icon, the label or the link to end up different, and this codebase has already been bitten by
 * exactly that: the budget select had to be kept "in step by hand" with the shared field styles,
 * and the practices cards drifted from the pillar hub. One definition, three consumers.
 *
 * A channel with an unresolved placeholder is simply absent from the list, so a surface never has
 * to check for itself — the footer and the panel both just map over whatever comes back.
 *
 * `Icon` is a component reference, not a rendered element, so each call site picks its own size.
 */

export type ContactChannelKind = 'email' | 'phone' | 'whatsapp'

export type ContactChannel = {
  kind: ContactChannelKind
  /** The word shown to the visitor. "Call" rather than "Phone" — it names the action. */
  label: string
  /** The address or number, formatted for reading. */
  value: string
  href: string
  /** WhatsApp leaves the site, so it needs target and rel; the other two do not. */
  external?: boolean
  /** Only where the visible text alone would not say what the link does. */
  ariaLabel?: string
  Icon: (props: { className?: string }) => React.ReactNode
}

export function contactChannels(): ContactChannel[] {
  const email = resolved(CONTACT.email)
  const phone = resolved(CONTACT.phone)
  const whatsapp = resolved(CONTACT.whatsapp)

  const channels: ContactChannel[] = []

  if (email) {
    channels.push({ kind: 'email', label: 'Email', value: email, href: `mailto:${email}`, Icon: Mail })
  }
  if (phone) {
    channels.push({ kind: 'phone', label: 'Call', value: phone, href: telHref(phone), Icon: Phone })
  }
  if (whatsapp) {
    channels.push({
      kind: 'whatsapp',
      label: 'WhatsApp',
      value: whatsapp,
      href: whatsappHref(whatsapp, CONTACT.whatsappPrefill),
      external: true,
      /* The visible text is a phone number, which does not say where the link goes. */
      ariaLabel: `Chat with Zefract on WhatsApp, ${whatsapp}`,
      Icon: WhatsAppIcon,
    })
  }

  return channels
}

/**
 * The value of a channel, linked where linking helps and plain text where it does not.
 *
 * THE PHONE NUMBER IS NOT A LINK ON DESKTOP, and that is the fix for a real complaint: clicking a
 * `tel:` link in desktop Chrome raises "Open Phone Link? localhost wants to open this
 * application". That prompt belongs to the browser's external-protocol handler and NO website can
 * suppress it — a page that could silently launch registered applications would be a security
 * hole. The only way to stop it appearing is not to hand the browser a `tel:` URL.
 *
 * So the number is a `tel:` link only where a tap can actually dial — coarse pointer, no hover,
 * which is the closest CSS gets to "this is a phone" — and elsewhere it is text with
 * `select-all`, so one click selects the whole number ready to copy. Nothing is lost: a desktop
 * visitor wants to read or copy the number, not have Chrome interrogate them about Phone Link.
 *
 * Both are rendered and one is hidden with `display: none`, which removes it from the
 * accessibility tree as well as the page — so the number is announced once, not twice.
 */
function ChannelValue({ channel }: { channel: ContactChannel }) {
  if (channel.kind !== 'phone') {
    return (
      <a
        href={channel.href}
        {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
        {...(channel.ariaLabel ? { 'aria-label': channel.ariaLabel } : {})}
        className="transition-colors hover:text-brand-strong"
      >
        {channel.value}
      </a>
    )
  }

  return (
    <>
      <a href={channel.href} className="tel-link items-center transition-colors hover:text-brand-strong">
        {channel.value}
      </a>
      <span className="tel-text select-all">{channel.value}</span>
    </>
  )
}

/**
 * One channel as an icon beside its value — the footer's treatment.
 *
 * `min-h-6` on the row, because a bare inline anchor measures to its font metrics and came out
 * 19px tall, under the 24px pointer target WCAG 2.2 SC 2.5.8 asks for. The icon is `shrink-0` so
 * a long address wraps without squashing it, and `aria-hidden` because the text beside it already
 * says what the link is.
 *
 * The row itself is no longer the anchor: the phone needs to render two variants inside it (see
 * ChannelValue), and an anchor cannot contain another anchor.
 */
export function ContactChannelRow({
  channel,
  className,
}: {
  channel: ContactChannel
  className?: string
}) {
  const { Icon } = channel
  return (
    <p
      className={
        className ?? 'group flex min-h-6 items-center gap-2.5 text-head transition-colors'
      }
    >
      <Icon className="size-4 shrink-0 text-mut-2" />
      <ChannelValue channel={channel} />
    </p>
  )
}

export { ChannelValue }

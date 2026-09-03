import Link from 'next/link'
import { ZefractLockup } from '@/components/brand/zefract-lockup'
import { SITE, CONTACT, FOOTER_NAV } from '@/content/site'
import { contactChannels, ContactChannelRow } from '@/components/ui/contact-channels'
import { SocialLinks } from '@/components/ui/social-links'

export function SiteFooter() {
  const channels = contactChannels()
  /**
   * Read at render time rather than typed in, so the copyright line is never a year out of date.
   *
   * WORTH KNOWING WHEN THIS ACTUALLY UPDATES. The footer is in the shared layout and every page
   * here is statically prerendered, so "render time" means BUILD time — this resolves once when
   * the site is built and is then served from the CDN. Any deploy in the new year rolls it over,
   * which in practice is every site that ships more than once a year, and it is why `new Date()`
   * is safe to use here at all: it runs on the server during the build, never in the visitor's
   * browser, so there is no hydration mismatch and no JavaScript shipped for it.
   *
   * If the year ever has to roll over without a deploy, the fix is a scheduled rebuild on the
   * host rather than moving this into a client component — a client component would make the
   * whole line depend on JavaScript and on the visitor's own clock being right.
   */
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-site px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <ZefractLockup showDescriptor />
            <p className="mt-6 max-w-[34ch] text-[15px] text-mut">{SITE.description}</p>

            {/* Email, call and WhatsApp, each with its own icon. The rows come from
                contactChannels() rather than being written out here, so the icon, the label and
                the href are the same three definitions the contact page uses. */}
            <div className="mt-6 space-y-2 text-[15px]">
              {channels.map((channel) => (
                <ContactChannelRow key={channel.kind} channel={channel} />
              ))}
            </div>

            {/* The brand's profiles elsewhere. Same component, same SOCIAL list and same
                markup as the contact page's Direct card — see social-links.tsx for why
                this is not written out here. */}
            <SocialLinks className="mt-6" />
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_NAV.map((group) => (
              <div key={group.heading}>
                <h2 className="font-mono text-[12px] font-medium tracking-[0.2em] text-mut uppercase sm:text-[11px]">
                  {group.heading}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {/* min-h-6 keeps every footer link at the 24x24 minimum that
                          WCAG 2.2 SC 2.5.8 requires — at 14.5px they were ~22px. */}
                      <Link
                        href={link.href}
                        className="inline-flex min-h-6 items-center text-[14.5px] text-head transition-colors hover:text-brand-strong"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-7 text-[13.5px] text-mut sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.legalName}. All rights reserved.
          </p>
          <p>{CONTACT.responseTime}</p>
        </div>
      </div>
    </footer>
  )
}

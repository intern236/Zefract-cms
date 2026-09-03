import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { ContactForm } from '@/components/forms/contact-form'
import { CONTACT } from '@/content/site'
import { contactChannels, ChannelValue } from '@/components/ui/contact-channels'
import { SocialLinks } from '@/components/ui/social-links'
import { authoredMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...authoredMetadata('/contact'),
  keywords: ['contact Zefract', 'start a project', 'get a quote', 'software development quote'],
}

export default function ContactPage() {
  const channels = contactChannels()

  return (
    <>
      <PageHero
        eyebrow="Next step"
        heading="Contact Zefract: Start Your Project"
        sub="Send whatever you have: a brief, a deck, or three bullet points. You get scope, a timeline and a number back within three working days."
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Contact', href: '/contact' },
        ]}
      />

      <Section spacing="tight" className="pb-24">
        <Container>
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <Reveal>
              <ContactForm />
            </Reveal>

            <Reveal delay={0.08}>
              <div className="card-pop rounded-card border border-line bg-surface p-7">
                <h2 className="font-mono text-[12px] tracking-[0.2em] text-mut uppercase sm:text-[11px]">
                  Direct
                </h2>
                {/* Email, call and WhatsApp. The rows are generated from contactChannels(), the
                    same source the footer uses, so the icon and the label cannot differ between
                    the two places a visitor sees them.

                    The icon sits in its own column with the label and value stacked beside it,
                    rather than inline with the value: at this size the three glyphs down the left
                    edge are what makes the options scannable, which is the point of having them. */}
                <ul className="mt-5 space-y-4 text-[15.5px]">
                  {channels.map((channel) => {
                    const { Icon } = channel
                    return (
                      <li key={channel.kind} className="flex items-start gap-3">
                        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-page text-brand-strong">
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-mut">{channel.label}</span>
                          {/* min-h-6 because a bare inline anchor measures to its font metrics,
                              which left these contact links 19px tall — under the 24px pointer
                              target WCAG 2.2 SC 2.5.8 asks for.

                              <ChannelValue> decides whether the value is a link: the phone is one
                              only on a device that can dial, so desktop Chrome never raises its
                              "Open Phone Link?" prompt. See the note in contact-channels.tsx. */}
                          <span className="flex min-h-6 items-center font-semibold text-head">
                            <ChannelValue channel={channel} />
                          </span>
                        </span>
                      </li>
                    )
                  })}
                  {/* THE OFFICE ROW WAS REMOVED AT THE CLIENT'S REQUEST. It printed a
                      "Office" label above `CONTACT.address`, which is still unsupplied —
                      so in development it showed a placeholder chip and in production it
                      showed a label with nothing under it, which is the worse of the two:
                      a heading for a value that never arrives reads as a broken card
                      rather than as a card that does not list an address.

                      `CONTACT.address` IS DELIBERATELY STILL A PLACEHOLDER in
                      content/site.ts, not deleted with the row. Nothing renders it now,
                      but it is what gates the map embed and the LocalBusiness schema —
                      lib/schema.tsx says in as many words that it does not emit that
                      schema because there is no address to publish. Dropping the marker
                      would remove the only record that those two are still owed.
                      `npm run check:todos` keeps reporting it. */}
                </ul>

                {/* BELOW THE RULE, not inside the channel list, which is where this
                    briefly sat. Two placements have been tried and this is the one that
                    holds: in the list it had to agree with a column of 32px icons and a
                    set of labelled rows it is not really a member of — these are not a way
                    to reach us, they are where we already are. Under the rule it is its
                    own thing and can be its own size.

                    NO HEADING. It carried an "Elsewhere" label the first time; a row of
                    five recognisable marks under a card headed "Direct" does not need one,
                    and each link states its platform for anyone not going by the glyph.

                    THE RULE MOVES HERE FROM THE PARAGRAPH BELOW rather than a second one
                    being added. The card is meant to read as two bands with one line
                    between them — how to reach us, then everything after — so the response
                    time keeps a plain margin and this owns the divider. */}
                <div className="mt-7 border-t border-line pt-5">
                  <SocialLinks />
                </div>

                <p className="mt-5 text-[14.5px] text-mut">{CONTACT.responseTime}</p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  )
}

import type { ServicePlans } from './types'

/**
 * Productised plans, keyed by the pillar page they belong to.
 *
 * SOURCE. The client's own pricing design, transcribed from it. These are commercial figures,
 * so they are reproduced exactly: every price, every cap, every band. Nothing here is rounded,
 * converted or restated.
 *
 * RUPEES, DELIBERATELY, and against an earlier decision recorded in content/service-points.ts
 * that stripped rupees from the Paid Marketing document "since the site serves clients outside
 * India". That was right for the service pages and is wrong here: these are the plans as sold,
 * and a plan quoted in a currency nobody is billed in is not a plan. The contact form still
 * offers dollar budget bands, which is a mismatch a visitor can see one scroll apart, and it
 * needs the client's own rupee bands rather than an invented exchange rate.
 *
 * The only edits to the copy are two em dashes, rewritten per house style: "AI Search & GEO —
 * citation tracking" takes a colon, and "into a retainer — and the ones that don't" takes a
 * comma. Both are marked at the line.
 */
export const PILLAR_PLANS: Record<string, ServicePlans> = {
  'marketing-and-growth': {
    /* No number. The design this came from opened with "01", which belongs to a numbered
       sequence; on this page it is the only such section, so a "01" promised an "02" that does
       not exist. Numbering that encodes nothing is decoration. */
    eyebrow: 'The shape of the offer',
    /* A NON-BREAKING HYPHEN in "on-ramp" (U+2011), not the ordinary one. A browser treats a
       hyphen as a legal break point, so the heading was wrapping mid-word as "on-" then
       "ramp,", which reads as a typesetting error rather than a line break. It renders
       identically; only the break behaviour differs, and the balancer still has the spaces to
       work with. */
    heading: 'Three tiers, one on‑ramp, no mystery.',
    intro:
      "Every plan is a fixed monthly fee for a written scope. Ad spend is always separate and always billed to the client's own card. Every engagement opens with a paid Foundation Sprint, because nothing we sell works on broken tracking.",
    tiers: [
      {
        number: '01',
        name: 'Beam',
        tagline: 'One channel, run properly.',
        price: '₹35,000',
        priceUnit: '/month',
        sprint: '+ ₹40,000 foundation sprint',
        features: [
          'One primary channel: Google Ads or local SEO',
          'Google Business Profile management, 1 location',
          'Conversion + call tracking, GA4 & GTM upkeep',
          '2 landing pages per quarter',
          'Ad spend managed up to ₹75,000/month',
          'Monthly report + 30-minute call, in plain English',
        ],
        fits: 'single-location clinic, small law or CA practice, local service business with ₹25K–50K/month to put behind ads.',
      },
      {
        number: '02',
        name: 'Spectrum',
        tagline: 'Found, chosen, and measured.',
        price: '₹75,000',
        priceUnit: '/month',
        sprint: '+ ₹65,000 foundation sprint',
        featured: true,
        badge: 'Most clients land here',
        features: [
          'SEO + Google Ads + Meta Ads, run as one system',
          '4 content pieces & 12–16 social creatives a month',
          'Landing pages plus an active CRO test queue',
          'Google Business Profile for up to 3 locations',
          'Live dashboard + fortnightly working call',
          'Ad spend managed up to ₹2,00,000/month',
        ],
        fits: 'multi-location practices, competitive verticals, D2C brands, anyone spending ₹75K–2L/month on media.',
      },
      {
        number: '03',
        name: 'Prism',
        tagline: 'The whole spectrum, one team.',
        price: '₹1,10,000',
        priceUnit: '/month +',
        sprint: '+ ₹1,00,000 foundation sprint',
        features: [
          'Everything in Spectrum, at higher volume',
          /* Em dash in the source, a colon here. */
          'AI Search & GEO: citation tracking and entity work',
          '20 hours a month of retained build capacity',
          'Quarterly strategy + a live experiment roadmap',
          'Named pod, weekly show-the-work notes',
          'Ad spend to ₹5,00,000/month, then 8% of the excess',
        ],
        fits: 'multi-city or scaling businesses that need the product improved and the demand built at the same time.',
      },
    ],
  },
}

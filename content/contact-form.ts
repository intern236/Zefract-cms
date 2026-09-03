/**
 * Shared shape of the start-a-project form.
 *
 * Here rather than inside the form component because the API route validates against the same
 * list. Two copies would drift the first time a band is renamed, and the failure mode is quiet:
 * the form would offer a value the server then rejects as "not from the list".
 *
 * Plain data with no React in it, like the rest of content/ — so it can be imported from a
 * client component and a server route handler alike.
 */

/**
 * Budget bands, in order. The empty option in the markup is the placeholder, not a value.
 *
 * RUPEES AND PER MONTH, derived from the plans rather than converted from the dollar bands
 * these replace. Each band contains exactly one tier, so a visitor picking a band has already
 * told us which plan they are shopping for:
 *
 *   under 50,000        Beam, at 35,000
 *   50,000 to 1,00,000  Spectrum, at 75,000
 *   1,00,000 to 2,00,000  Prism, at 1,10,000
 *   2,00,000+           above Prism, which is a conversation rather than a plan
 *
 * The old bands were dollar project totals, which contradicted the rupee prices published on
 * /services/marketing-and-growth one scroll away. No exchange rate was applied to get here and
 * none should be: these are the numbers the plans are sold at.
 *
 * THE PERIOD IS STATED ON PURPOSE. A bare "Under 50,000" reads as a project total to someone
 * enquiring about a build and as a retainer to someone shopping the plans, and the two differ
 * by an order of magnitude. Saying "/month" costs six characters and removes the ambiguity.
 * The cost of that choice is that a one-off project enquiry has no natural band left and lands
 * on "Not sure yet", which is why that option stays first-class rather than being a fallback.
 *
 * CHANGING A STRING HERE CHANGES STORED DATA. app/api/contact/route.ts validates submissions
 * against this exact list, so a renamed band is rejected the moment the two disagree, and rows
 * already in MongoDB keep whatever label they were submitted with.
 */
export const BUDGETS = [
  'Under ₹50,000/month',
  '₹50,000 to ₹1,00,000/month',
  '₹1,00,000 to ₹2,00,000/month',
  '₹2,00,000+/month',
  'Not sure yet',
] as const

export type Budget = (typeof BUDGETS)[number]

/**
 * The confirmation email sent back to whoever filled the form in.
 *
 * HERE RATHER THAN IN lib/mail.ts, unlike the internal notification's wording. That one is
 * scaffolding for our own inbox and nobody outside the team reads it. This is customer-facing
 * copy in the site's own voice, so it belongs with the rest of the copy the client can edit
 * without opening a file that also holds SMTP credentials handling.
 *
 * IT HAS TO AGREE WITH THE SUCCESS SCREEN, which is the same promise made twice to the same
 * person seconds apart — see the sent state in components/forms/contact-form.tsx. That screen
 * says "reply to the confirmation email and say so", which is why `replyTo` on this message is
 * the team inbox rather than the no-reply sender: the instruction has to actually work.
 *
 * `{name}` is the only placeholder, substituted in lib/mail.ts. Deliberately not a template
 * function — this file stays plain data, and one token is not worth a renderer.
 *
 * NO EM DASHES, per the site-wide copy rule.
 */
export const CONFIRMATION = {
  subject: 'We have your message',
  heading: 'Thanks, that reached us.',
  /** Paragraphs, in order. An array rather than one blob, same reasoning as Service.description. */
  body: [
    'Hi {name}, this is just to confirm your message arrived. A real person has it, not a queue.',
    'You will get scope, a timeline and a number back within three working days. If it is urgent, reply to this email and say so.',
  ],
  /** Labels the copy of their own submission below the message. */
  echoLabel: 'What you sent us',
  signoff: 'The Zefract team',
} as const

import { COMPANY, LEGAL_EMAILS, SITE, CONTACT } from '@/content/site'
import type { LegalDocument } from '@/content/types'

/**
 * The terms and conditions, as supplied by the client.
 *
 * TRANSCRIBED, NOT WRITTEN — the same rule as content/privacy.ts, and it matters
 * more here. These clauses allocate money, intellectual property and liability
 * between two companies; a word changed on the drafter's behalf changes what has
 * been agreed. Three kinds of change were made and no others:
 *
 *   1. The two editorial notes — one inside clause 07 headed "RESOLVE BEFORE
 *      PUBLISHING", one at the end of clause 25 — are not published. Both are
 *      addressed to whoever finalises the document. Both are reproduced verbatim
 *      at the foot of this file so neither decision is lost.
 *   2. The GSTIN row the document prints as "GST registration number" is not
 *      published. It was a placeholder here until the client, seeing it render as
 *      a stub, asked for the row to come out of both legal pages. See the note on
 *      COMPANY in content/site.ts for what that leaves unstated.
 *   3. Straight quotes are typographic, and a missing space after a comma in the
 *      registered address is closed up.
 *
 * NOTE WHAT CLAUSE 07 THEREFORE SAYS. With the editorial note removed, this page
 * states the rolling-monthly model only — three-month minimum, 30 days' notice,
 * no exit fee. That is exactly what the note instructs: it says not to publish the
 * twelve-month amortised alternative until the pricing maths is final. So the
 * omission is the client's decision being followed, not a gap.
 */

/**
 * The two dates in the masthead, supplied by the client.
 *
 * THEY ARE DIFFERENT DATES AND BOTH ARE DELIBERATE. These terms took effect on
 * 3 August 2026; they were last revised on 1 September 2026. A single constant used
 * to serve both rows, on the assumption that version 1.0 was issued and effective
 * on one day — that is no longer true, so they are separate values.
 *
 * WRITTEN OUT IN FULL, not numerically. "03/09/2026" is the third of September in
 * India and the ninth of March in the United States, and this document is read in
 * both. The month in words cannot be misread, which for the date a legal
 * obligation starts is worth the extra characters.
 */
const EFFECTIVE = '3 August 2026'
const UPDATED = '1 September 2026'

export const TERMS: LegalDocument = {
  eyebrow: 'Legal · Terms of engagement',
  title: 'Terms & Conditions',
  standfirst:
    'The rules of working with us. No capital-letter walls, no clauses designed to be skimmed past. If a term here would surprise you in month three, we’ve written it wrong.',
  meta: [
    { label: 'Effective', value: EFFECTIVE },
    { label: 'Last updated', value: UPDATED },
    { label: 'Version', value: '1.0' },
    { label: 'Governing law', value: 'India' },
    { label: 'Registered office', value: COMPANY.registeredOffice },
    { label: 'CIN', value: COMPANY.cin },
    { label: 'PAN', value: COMPANY.pan },
  ],
  lede: [
    'These terms govern every engagement between Zefract Tech Pvt Ltd and a client, and your use of www.zefract.com. They are written to be read by the person signing them, not only by their lawyer. Where we’ve had to use a legal term, we’ve said what it means.',
    'By signing a proposal or Statement of Work, paying an invoice, or instructing us to begin work, you agree to these terms on behalf of your organisation and confirm you have authority to do so.',
  ],
  unit: 'Clause',
  summary: {
    label: 'The short version',
    text: 'You own your accounts, your data and your finished work. We charge a fixed fee for a written scope, and your ad budget never passes through us. We don’t guarantee rankings, because nobody honestly can. Either side can leave with 30 days’ notice after the minimum term, and we hand everything back without charging you an exit fee.',
    note: 'Everything below is the detail behind those five sentences. The short version is not the contract — it’s here so you know what you’re reading.',
  },
  related: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Request a Data Processing Addendum', href: `mailto:${LEGAL_EMAILS.privacy}` },
  ],
  clauses: [
    {
      n: '01',
      heading: 'Who these terms bind, and what wins if documents disagree',
      plain:
        'Your signed Statement of Work beats this page. This page beats anything we said on a call. Nothing you paste into a purchase order changes either.',
      blocks: [
        {
          kind: 'p',
          text: `These terms are between Zefract Tech Pvt Ltd, a company incorporated in India with CIN ${COMPANY.cin} and registered office at ${COMPANY.registeredOffice} (“Zefract”, “we”, “us”), and the organisation named in the Statement of Work (“Client”, “you”).`,
        },
        {
          kind: 'p',
          text: 'Where documents conflict, this order of precedence applies, highest first:',
        },
        {
          kind: 'steps',
          items: [
            'A separately negotiated Master Services Agreement signed by both parties, if one exists.',
            'The signed Statement of Work or accepted proposal for the engagement in question.',
            'A signed change note issued under that Statement of Work.',
            'These Terms & Conditions.',
            'Anything else — decks, emails, call notes, rate cards.',
          ],
        },
        {
          kind: 'p',
          text: 'Your standard purchase order terms, vendor portal click-throughs and supplier codes do not apply to this engagement unless we have signed them separately. This is not us being difficult; it is us avoiding two contradictory contracts covering the same work.',
        },
      ],
    },
    {
      n: '02',
      heading: 'Definitions',
      blocks: [
        { kind: 'p', text: 'To save repeating ourselves:' },
        {
          kind: 'table',
          columns: ['Term', 'Means'],
          rows: [
            [
              'Statement of Work (SOW)',
              'The written document listing the scope, deliverables, timeline, fees and term of a specific engagement.',
            ],
            [
              'Foundation Sprint',
              'The paid two-to-three-week onboarding that installs and verifies measurement before a retainer begins.',
            ],
            [
              'Deliverables',
              'The specific outputs listed in the SOW — websites, code, designs, campaigns, content, reports.',
            ],
            [
              'Client Materials',
              'Anything you give us: logos, copy, images, data, brand assets, credentials, product information.',
            ],
            [
              'Zefract Background IP',
              'Everything we owned or built before the engagement, and anything general we build across clients: frameworks, code libraries, templates, audit methodologies, internal tooling.',
            ],
            [
              'Ad Spend / Media Budget',
              'Money paid to an advertising platform for impressions or clicks. Never our fee.',
            ],
            [
              'Change Note',
              'A short written record of an agreed change to scope, timeline or fee, signed by both sides before the work happens.',
            ],
            [
              'Platform',
              'Any third-party service the work depends on — Google, Meta, Microsoft, LinkedIn, AWS, a hosting provider, an app store.',
            ],
          ],
        },
      ],
    },
    {
      n: '03',
      heading: 'What we do',
      plain:
        'Marketing, design, engineering, AI and cloud work. What you get is whatever your SOW says — not everything listed on our website.',
      blocks: [
        {
          kind: 'p',
          text: 'Zefract provides services across five practice areas: Marketing & Growth (SEO, AEO, GEO, paid media, content, lifecycle marketing, social), Experience & Design (UX research, UI, design systems, brand), Engineering (web, SaaS and mobile builds, APIs, QA automation), AI & Automation, and Cloud, Data & Security.',
        },
        {
          kind: 'p',
          text: 'The services you receive are only those written into your SOW. Nothing described on our website, in a proposal deck, or in a sales conversation forms part of the engagement unless it appears in the SOW. We would rather write a shorter scope we can hold to than a longer one we can’t.',
        },
        {
          kind: 'p',
          text: 'We may use subcontractors, freelancers or specialist partners to deliver part of an engagement. We remain fully responsible to you for their work, we bind them to the same confidentiality and data protection obligations, and we tell you if a named individual in your SOW is being replaced.',
        },
      ],
    },
    {
      n: '04',
      heading: 'How an engagement starts',
      plain:
        'Proposal, then signed SOW, then a paid Foundation Sprint, then the retainer. We don’t start work on a verbal go-ahead.',
      blocks: [
        {
          kind: 'p',
          text: 'Proposals are valid for 30 days from issue and may be revised after that, because platform costs and our capacity both move.',
        },
        {
          kind: 'p',
          text: 'Engagement begins when you sign the SOW and the first invoice is paid. We do not begin billable work on a verbal instruction or an unsigned document. If you ask us to start before signature and we agree in writing, these terms apply from the moment work starts and the SOW is signed retrospectively.',
        },
        {
          kind: 'p',
          text: 'The Foundation Sprint is mandatory and paid. Every marketing retainer opens with two to three weeks of measurement work: conversion and call tracking installed and verified, analytics and tag management configured, Google Business Profile claimed and cleaned, a keyword and competitor map, a conversion-ready landing page, and a written 90-day plan naming the numbers we expect to move.',
        },
        {
          kind: 'p',
          text: 'We do not waive it, and we do not fold it into month one. Nothing we sell works on broken measurement, and a retainer that starts with archaeology instead of execution costs you a month you paid for. If the Sprint doesn’t convert into a retainer, the work is still yours — findings, tracking setup, plan and landing page — and it is documented well enough for another agency to pick up.',
        },
        {
          kind: 'p',
          lead: 'Media budget floors.',
          text: 'Paid search and social campaigns need enough conversion volume for bidding algorithms to learn. Where a proposed budget falls below the floor stated in the SOW, we will say so and either recommend a different channel or decline the paid engagement. We will not take a fee to run a campaign we expect to fail.',
        },
      ],
    },
    {
      n: '05',
      heading: 'Fees, tax and payment',
      plain:
        'Fixed monthly fee, invoiced in advance, payable in 14 days. GST is extra. Late payment pauses work, and we tell you before it does.',
      blocks: [
        { kind: 'sub', heading: 'How we invoice' },
        {
          kind: 'list',
          items: [
            'Retainers are invoiced monthly in advance, on the first working day of the month. The first invoice covers the Foundation Sprint and the first month.',
            'Fixed-price builds are invoiced against milestones set in the SOW, typically 40% on signature, 40% on staging handover, 20% on go-live. Larger builds may be phased differently.',
            'Add-ons and additional work are invoiced on completion, against a signed change note.',
            'Payment terms are 14 days from invoice date unless the SOW says otherwise.',
          ],
        },
        { kind: 'sub', heading: 'Taxes' },
        {
          kind: 'p',
          text: `All fees are exclusive of tax. GST is charged at the applicable rate on Indian engagements. For clients outside India, fees are exclusive of any VAT, sales tax, withholding or equivalent, which is your responsibility. Where you are required to deduct tax at source (TDS), you may do so at the correct statutory rate and must provide the Form 16A deduction certificate promptly. Our PAN is ${COMPANY.pan} and our TAN is ${COMPANY.tan}. Any other deduction, bank charge or currency conversion loss is for your account, and the amount we receive must equal the invoice.`,
        },
        { kind: 'sub', heading: 'Late payment' },
        {
          kind: 'p',
          text: 'If an invoice is more than 7 days overdue we will contact you. If it is more than 14 days overdue, we may:',
        },
        {
          kind: 'list',
          items: [
            'Charge interest at 1.5% per month on the outstanding amount, or the maximum permitted by law if lower;',
            'Pause delivery on written notice, having given you at least 5 working days to settle first;',
            'Withhold delivery of work-in-progress, though never revoke your access to your own accounts or live systems.',
          ],
        },
        {
          kind: 'p',
          text: 'We will not let a live campaign or a production website fail because of an unpaid invoice without telling you in advance and giving you the chance to fix it. Pausing work is a commercial step, not a hostage-taking one.',
        },
        { kind: 'sub', heading: 'Refunds and price changes' },
        {
          kind: 'p',
          text: 'Retainer fees cover a period of work, and are not refundable for a period in which the work was performed. Where a milestone is invoiced and the work has not yet been done, the unearned portion is refundable. We may revise list prices with 60 days’ written notice; a signed SOW is held at its agreed price for its stated term.',
        },
        {
          kind: 'p',
          lead: 'Discounted rates.',
          text: 'Where a discount is granted in exchange for something — a named case study, a filmed testimonial, reference calls — and that consideration is not provided within the agreed window, we may revert the engagement to list price on 30 days’ written notice. The discount is a trade, not a concession.',
        },
      ],
    },
    {
      n: '06',
      heading: 'Ad spend and media budgets',
      plain:
        'Your ad budget goes on your card, into your account. We never bill you for media, mark it up, or hide the split between our fee and your spend.',
      blocks: [
        {
          kind: 'p',
          text: 'This clause matters more than its length suggests, so we’ve made it explicit.',
        },
        {
          kind: 'list',
          items: [
            {
              lead: 'Media is billed by the platform to you, directly.',
              text: 'Your Google Ads, Meta, Microsoft Advertising and LinkedIn accounts are billed to your own payment method. Ad spend does not pass through Zefract’s accounts.',
            },
            {
              lead: 'We do not mark up media.',
              text: 'Our fee is the number in the SOW. There is no percentage skim on top of your spend, and no bundled “one number” that hides the ratio between the two.',
            },
            {
              lead: 'You set the budget.',
              text: 'We recommend, you decide, and we work to the cap in the SOW. We will not exceed an agreed monthly budget without written approval.',
            },
            {
              lead: 'Spend management ceilings.',
              text: 'Each plan includes management of ad spend up to a stated monthly ceiling. Above that ceiling, a management percentage stated in the SOW applies to the excess.',
            },
            {
              lead: 'Pacing is not exact.',
              text: 'Auction dynamics, seasonality, approval delays and mid-month launches mean actual spend in a given month may land slightly above or below target. We manage to the period, not the day, and we flag material variance in your report.',
            },
            {
              lead: 'You are responsible for platform charges',
              text: 'including any incurred before a pause takes effect. Platform pause instructions are not always instantaneous.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'Where Zefract exceptionally funds media on your behalf — which we do only by prior written agreement — it is recharged at cost with the platform invoice attached, and requires a deposit.',
        },
      ],
    },
    {
      n: '07',
      heading: 'Term, notice and exit',
      plain:
        'Three months minimum so the work has time to compound, then rolling monthly with 30 days’ notice. No multi-year lock-in, and no fee for taking your things and leaving.',
      blocks: [
        { kind: 'sub', heading: 'Minimum term and notice' },
        {
          kind: 'p',
          text: 'Retainer engagements carry a three-month minimum term from the start of the retainer, excluding the Foundation Sprint. SEO, content and creative testing take longer than a month to show anything real, and an engagement cancelled in week five costs you money and teaches you nothing.',
        },
        {
          kind: 'p',
          text: 'After the minimum term the engagement continues on a rolling monthly basis. Either party may end it with 30 days’ written notice, effective at the end of a billing month. You pay for the notice period and the work continues through it — we don’t down tools the day notice arrives.',
        },
        {
          kind: 'p',
          text: 'The minimum term protects the ramp. The rolling monthly protects you. Long lock-ins are how agencies survive work that isn’t good enough, and we would rather be kept because you want to keep us.',
        },
        { kind: 'sub', heading: 'What happens at the end' },
        {
          kind: 'p',
          text: 'Within 15 working days of the last day of the engagement, we will:',
        },
        {
          kind: 'list',
          items: [
            'Transfer or confirm your ownership of every account, asset and file listed in Clause 11;',
            'Hand over source files, working files, documentation and access in usable, non-proprietary formats;',
            'Provide a written handover note covering what was running, what was in progress, and what the next agency or in-house team needs to know;',
            'Remove our administrative access from your systems and revoke our credentials.',
          ],
        },
        {
          kind: 'callout',
          label: 'No exit fee. None.',
          text: 'Some agencies charge an hourly “transition fee” to package up and hand back assets the client already owns. We think that’s an exit toll dressed as a service, and it exists to make leaving expensive.',
        },
        {
          kind: 'p',
          text: 'We do not charge for handover. It is included in every engagement, and it is one of the reasons we can afford to offer 30 days’ notice. If you want us to do additional migration work beyond handover — rebuilding something in a new stack, training your new team over several sessions — that’s a new scope with its own quote, and you’re free to decline it.',
        },
        {
          kind: 'p',
          text: 'Outstanding invoices remain payable, and handover is not conditional on anything beyond your account being settled to date.',
        },
      ],
    },
    {
      n: '08',
      heading: 'What you’re responsible for',
      plain:
        'Access, assets, approvals and a decision-maker who replies. Most missed deadlines in this industry are approval delays, not build delays.',
      blocks: [
        { kind: 'p', text: 'You agree to:' },
        {
          kind: 'list',
          items: [
            'Give us access to the accounts, systems and analytics the work needs, within 5 working days of request, using delegated access rather than shared passwords.',
            'Provide Client Materials — logos, brand assets, product information, copy, images, data — in the formats and to the deadlines in the SOW.',
            'Name one decision-maker with authority to approve work, and a deputy. Consolidated feedback from one named person moves faster than five conflicting opinions, and we will ask you to reconcile contradictory feedback before we act on it.',
            'Respond within 5 working days to requests for approval, feedback or information, unless the SOW sets a different window.',
            'Warrant that you have the rights to everything you give us — you own it, or you hold a licence permitting its use for the purpose intended. This includes fonts, stock images, music, third-party copy, customer photographs, and any personal data.',
            'Confirm your own legal compliance. Claims made in your marketing, regulatory disclosures in your sector, accessibility requirements, and consents for data you supply are yours to get right. We will flag anything that looks wrong to us, but we are not your compliance function and we are not your lawyers.',
            'Keep your platforms in good standing — billing current, accounts unsuspended, domain and hosting renewed.',
          ],
        },
        { kind: 'sub', heading: 'When delays are yours' },
        {
          kind: 'p',
          text: 'Where a delay in access, materials or approval holds up delivery, timelines shift by at least the length of the delay and the fee doesn’t change. Retainer months are not carried forward or credited for time lost to awaiting approval, because the team was reserved and the capacity was held.',
        },
        {
          kind: 'p',
          text: 'If an engagement is blocked on your side for more than 30 consecutive days, we may treat it as paused. A paused engagement may be restarted within 60 days at the same rate; after that, a re-onboarding fee may apply because the account context has gone stale and the platform state has moved.',
        },
      ],
    },
    {
      n: '09',
      heading: 'Revisions and scope changes',
      plain:
        'Two rounds of revisions on most things. A change of direction isn’t a revision — it’s new work, and we’ll write a short note saying what it costs before we do it.',
      blocks: [
        {
          kind: 'p',
          lead: 'Revisions.',
          text: 'Unless the SOW says otherwise, each deliverable includes two rounds of consolidated revisions within the approved direction. A round means one collected set of feedback, not a trickle of individual comments over three weeks. Additional rounds are billed at the hourly rate in the SOW.',
        },
        {
          kind: 'p',
          lead: 'What counts as a scope change.',
          text: 'Not a revision, and therefore new work:',
        },
        {
          kind: 'list',
          items: [
            'A new creative direction after one was approved;',
            'Extra pages, templates, channels, locations, languages or campaign types;',
            'Rework caused by a change in your brand, product, pricing or positioning;',
            'Integrations, platforms or third-party systems not named in the SOW;',
            'Compressed timelines requiring out-of-hours or weekend work.',
          ],
        },
        {
          kind: 'p',
          lead: 'Nothing changes without a change note.',
          text: 'Every scope change is recorded in writing — what’s changing, what it costs, what it does to the timeline — and confirmed by both sides before work begins. This is a firm rule and it protects both of us. It stops scope creeping quietly into the retainer until the margin disappears, and it stops you receiving an invoice you didn’t expect.',
        },
        {
          kind: 'p',
          lead: 'Acceptance.',
          text: 'Deliverables submitted for approval are deemed accepted if you don’t respond within 10 working days. We will send a reminder before that happens; we will not use silence as a trap.',
        },
      ],
    },
    {
      n: '10',
      heading: 'Intellectual property',
      plain:
        'Once you’ve paid in full, the finished work is yours. Our reusable tools and frameworks stay ours, and you get a licence to keep using them inside what we built for you.',
      blocks: [
        { kind: 'sub', heading: 'What becomes yours' },
        {
          kind: 'p',
          text: 'On full payment of all sums due under the relevant SOW, Zefract assigns to you all intellectual property rights in the Deliverables created specifically for you under that SOW: website designs and front-end code, brand and visual assets, ad copy and creative, content and copywriting, custom application code, and reports and documentation.',
        },
        {
          kind: 'p',
          text: 'The assignment is worldwide, perpetual and irrevocable. We will sign any further document reasonably needed to record it. Until payment is made in full, you hold a limited, revocable licence to use the Deliverables for review purposes only.',
        },
        { kind: 'sub', heading: 'What stays ours' },
        {
          kind: 'p',
          text: 'Zefract Background IP remains ours. That includes our audit and diagnostic methodologies, internal frameworks and playbooks, reusable code libraries, components and boilerplate, our own tooling and dashboards, project templates, and the general skills, techniques and know-how our team develops. Where any of this is embedded in a Deliverable, you receive a perpetual, worldwide, royalty-free, non-exclusive licence to use, modify and maintain it as part of that Deliverable — including through a different agency or an in-house team.',
        },
        {
          kind: 'p',
          text: 'That licence is broad on purpose. You should never be locked into Zefract because a component we reused is one we won’t let you keep using.',
        },
        { kind: 'sub', heading: 'Client Materials' },
        {
          kind: 'p',
          text: 'Everything you give us stays yours. You grant us a licence to use it for the duration of the engagement, for the purpose of doing the work — including for the case-study rights in Clause 15, if you’ve agreed to those.',
        },
        { kind: 'sub', heading: 'Third-party materials' },
        {
          kind: 'p',
          text: 'Some Deliverables include licensed third-party components — fonts, stock images, plugins, themes, libraries, APIs. These stay with their owners and are governed by their own licences. We will tell you what’s licensed, on what terms, and what it costs to keep. Ongoing licence renewals are your responsibility after handover.',
        },
        { kind: 'sub', heading: 'Moral rights' },
        {
          kind: 'p',
          text: 'To the extent permitted by law, we waive any moral rights in the Deliverables that would prevent you using, modifying or attributing them as you choose.',
        },
      ],
    },
    {
      n: '11',
      heading: 'Account and asset ownership',
      plain:
        'Every account is in your name, owned by your business, from day one. We’re a user on your account, never the owner of it. If we part ways, you don’t lose your history.',
      blocks: [
        {
          kind: 'p',
          text: 'The single most damaging pattern in this industry is the agency that owns the client’s accounts. When that relationship ends, the client loses their ad history, their conversion data, their reviews, their domain, or all four — and has to start again. We don’t do it, and we’d encourage you to check whether anyone else you’re considering does.',
        },
        {
          kind: 'table',
          columns: ['Asset', 'Owned by', 'Our access'],
          rows: [
            [
              'Google Ads account',
              'You',
              'Linked to our manager account; you can unlink in one click',
            ],
            [
              'Meta / LinkedIn / Microsoft ad accounts',
              'You, in your Business Manager',
              'Partner access, revocable by you',
            ],
            [
              'Google Analytics & Tag Manager',
              'You',
              'Named user with the minimum role required',
            ],
            ['Google Business Profile', 'You', 'Manager, not primary owner'],
            [
              'Domain name',
              'You, in your registrar account',
              'Delegated access only where you ask for it',
            ],
            [
              'Hosting & DNS',
              'You, unless a Zefract care plan says otherwise in writing',
              'Administrative',
            ],
            ['CMS, CRM, email platform', 'You', 'Named user'],
            ['Source code repository', 'You', 'Collaborator, removable by you'],
            ['Social profiles', 'You', 'Manager or editor role'],
            ['Historical campaign and analytics data', 'You', 'Exportable by you at any time'],
          ],
        },
        {
          kind: 'p',
          text: 'Where an account has to be created new, we create it in your name, on your billing details, and give you owner-level access on day one. Where you are already using an agency-owned account, migrating you to your own is part of the Foundation Sprint.',
        },
        {
          kind: 'p',
          text: 'We will never withhold, disable, delete or hold access to your accounts as leverage in a commercial dispute. If you owe us money, we will pursue that through the routes in Clause 5 and Clause 25 — never by taking your business offline.',
        },
      ],
    },
    {
      n: '12',
      heading: 'Results, platforms, and what we won’t promise',
      plain:
        'We commit to the work, the method and the reporting. We don’t guarantee a ranking, a lead number or an ROI, because those depend on platforms nobody controls. Any agency that guarantees them is either misinformed or hoping you won’t check.',
      blocks: [
        { kind: 'sub', heading: 'No guarantee of outcomes' },
        {
          kind: 'p',
          text: 'We do not guarantee, and no employee, partner or subcontractor of Zefract is authorised to guarantee:',
        },
        {
          kind: 'list',
          items: [
            'A specific search engine ranking or position for any keyword, on any engine, at any time;',
            'A specific volume of traffic, leads, enquiries, downloads or sales;',
            'A specific cost per acquisition, return on ad spend, or return on investment;',
            'Citation or inclusion in AI-generated answers, overviews or assistants;',
            'Approval of any ad, page, app or listing by any platform;',
            'Any timeline for organic results, which are inherently cumulative and non-linear.',
          ],
        },
        {
          kind: 'p',
          text: 'Google’s own guidance is that no agency can guarantee a number-one ranking. We agree with it. What we do commit to is the scope in your SOW, executed to a professional standard, measured honestly, and reported whether the number went up or down.',
        },
        { kind: 'sub', heading: 'Platform dependency, algorithms and AI search' },
        {
          kind: 'p',
          text: 'Our work runs on platforms we don’t own and can’t control. Google, Meta, Microsoft, LinkedIn, app stores, hosting providers and AI assistants can and do change their algorithms, ranking systems, policies, pricing, APIs and answer formats without notice.',
        },
        {
          kind: 'p',
          text: 'This has become sharper, not gentler. The growth of AI-generated overviews and assistant-mediated answers is shifting how search traffic behaves across entire categories — organic click-through can fall on queries where visibility and citation have actually improved. We name this explicitly because it is where honest work most often gets misread as failure.',
        },
        {
          kind: 'p',
          text: 'Our undertaking is this: where a platform shift moves your numbers, we will tell you it happened, show you the evidence, and separate platform effect from campaign effect in your reporting — before you have to ask. What we cannot do is accept liability for the shift itself.',
        },
        {
          kind: 'p',
          text: 'Accordingly, we are not liable for: algorithm or ranking changes; manual actions or penalties arising from work we did not perform; ad account suspension or disapproval by a platform; changes to platform pricing, auction dynamics or API access; a platform discontinuing a product or format; or outages of third-party services.',
        },
        { kind: 'sub', heading: 'Methods' },
        {
          kind: 'p',
          text: 'We use only methods permitted by the relevant platform’s guidelines. We do not buy links, use private blog networks, cloak, spin content, run fake reviews, or manipulate engagement metrics. If you ask us to, we will decline. If your site carries penalties from previous work of that kind, we will tell you what remediation costs before we take on the ranking brief.',
        },
      ],
    },
    {
      n: '13',
      heading: 'Development engagements',
      plain:
        'Extra rules for builds: how we scope them, what testing you get, a 30-day defect warranty, and why a care plan matters after launch.',
      blocks: [
        { kind: 'sub', heading: 'How builds are scoped' },
        {
          kind: 'p',
          text: 'Builds up to the threshold stated in our rate card are sold as fixed price, fixed scope, fixed timeline against a published rate card. Larger custom builds — applications, portals, platforms — begin with a paid discovery phase producing a technical specification, architecture and phased plan. That specification is the scope. We do not quote a fixed price for a large custom build from a brief alone, because doing so requires either padding the number or absorbing the risk, and both end badly.',
        },
        {
          kind: 'p',
          text: 'Discovery output is yours on payment, whether or not you proceed to build with us.',
        },
        { kind: 'sub', heading: 'Environments, testing and acceptance' },
        {
          kind: 'p',
          text: 'Work is delivered to a staging environment for review. You test against the acceptance criteria in the SOW and report defects in a single consolidated list. A deliverable is accepted when you confirm it, when you use it in production, or 10 working days after submission with no response.',
        },
        {
          kind: 'p',
          text: 'We test on the browser and device matrix named in the SOW — typically the current and previous major versions of mainstream browsers. Support for legacy browsers or unusual environments is scoped and priced separately.',
        },
        { kind: 'sub', heading: 'Defect warranty' },
        {
          kind: 'p',
          text: 'For 30 days after go-live, we fix at no charge any defect where the Deliverable doesn’t do what the approved specification says it does. This does not cover: new features or changes of mind; problems caused by changes you or a third party made to the code; failures of third-party services, plugins or APIs; content or data errors; or issues arising from you not applying security updates we’ve recommended.',
        },
        {
          kind: 'p',
          text: 'After 30 days, maintenance falls under a care plan or is billed hourly.',
        },
        { kind: 'sub', heading: 'Care plans' },
        {
          kind: 'p',
          text: 'We recommend a care plan on every build — hosting, updates, security patching, backups, uptime monitoring and a monthly allowance of small changes. Software that isn’t maintained doesn’t stay still; it degrades, and the failure modes are security ones. Care plans are optional, and if you decline, we’ll ask you to confirm in writing that ongoing maintenance is your responsibility.',
        },
        { kind: 'sub', heading: 'Code, licensing and open source' },
        {
          kind: 'p',
          text: 'Custom code written for you is yours on full payment, per Clause 10. Builds typically incorporate open-source components under their own licences (MIT, Apache 2.0 and similar); we document what’s included and its licence terms. We do not knowingly include components whose licence terms conflict with your intended commercial use, and we’ll flag it if your use case creates one.',
        },
        { kind: 'sub', heading: 'Security' },
        {
          kind: 'p',
          text: 'We build to accepted secure-development practice and address the common vulnerability classes. No software is free of vulnerabilities. Penetration testing, formal security audit and compliance certification are separate scopes, and we’ll recommend them where your sector calls for it.',
        },
      ],
    },
    {
      n: '14',
      heading: 'Confidentiality',
      plain: 'What you tell us stays with us, for three years after we finish. It runs both ways.',
      blocks: [
        {
          kind: 'p',
          text: 'Each party will keep the other’s confidential information confidential, use it only for the engagement, and disclose it only to people who need it and are bound by equivalent obligations. This covers business plans, financials, customer data, pricing, strategy, source code, unreleased products, and anything marked or evidently confidential.',
        },
        {
          kind: 'p',
          text: 'It doesn’t cover information that is public through no fault of the receiver, was already lawfully known, is independently developed, or must be disclosed by law or a court — in which case the disclosing party is told first, where legally permitted.',
        },
        {
          kind: 'p',
          text: 'These obligations run for three years after the engagement ends. Trade secrets and personal data are protected for as long as the law requires, without a time limit.',
        },
        {
          kind: 'p',
          text: 'We will sign your NDA if you’d prefer your own paper. Where an NDA and these terms conflict on confidentiality, the NDA wins.',
        },
      ],
    },
    {
      n: '15',
      heading: 'Case studies and testimonials',
      plain:
        'We ask before we publish anything about your project. Every quote is approved in writing by the person named. We don’t invent numbers, and we don’t reword your quote without showing you.',
      blocks: [
        {
          kind: 'p',
          text: 'We would like to write about the work. We will not do it without your permission.',
        },
        {
          kind: 'list',
          items: [
            {
              lead: 'Named case studies, logos and testimonials require your prior written consent.',
              text: 'Not a nod on a call, and not an opt-out buried in a clause. Written, and specific to what’s being published.',
            },
            {
              lead: 'You approve the draft.',
              text: 'You see the full case study before it goes live and can require changes or withdraw consent before publication.',
            },
            {
              lead: 'Quotes are approved by the named individual attributed to them.',
              text: 'If we propose an edit to wording — for length or clarity — that revised wording goes back to the same person for sign-off. We do not alter an approved quote unilaterally.',
            },
            {
              lead: 'We publish only verified figures.',
              text: 'Every metric is one we can evidence from a platform or analytics source, with the measurement window stated. We do not round favourably, extrapolate, or present a placeholder as a result.',
            },
            {
              lead: 'You can withdraw later.',
              text: 'Give us written notice and we’ll take a case study down or anonymise it within 30 days. Printed and cached material may take longer to disappear, and third-party syndication may be outside our control.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'Without your consent, we may still describe the work anonymously and generically — “a Delhi-based trade data company” — with no logo, no name, no identifying detail, and no figure specific enough to identify you.',
        },
      ],
    },
    {
      n: '16',
      heading: 'Data protection',
      plain:
        'Your customers’ data stays yours. We process it on your instructions, we don’t reuse it, and we’ll sign a formal data processing agreement if you want one.',
      blocks: [
        {
          kind: 'p',
          text: 'Both parties will comply with applicable data protection law, including India’s Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025, and where relevant the UK and EU GDPR.',
        },
        {
          kind: 'p',
          text: 'Where we process personal data on your behalf — in your CRM, ad accounts, email platform or application database — you are the Data Fiduciary / controller and we are the Data Processor. We will act only on your documented instructions, apply appropriate security measures, bind our people and sub-processors to confidentiality, help you respond to individuals’ rights requests, notify you of a personal data breach without undue delay and in any case within 24 hours of becoming aware, and return or delete the data at the end of the engagement.',
        },
        {
          kind: 'p',
          text: 'You warrant that you have a lawful basis for the personal data you give us, that necessary notices and consents are in place, and that our processing under the SOW is within the purpose you told individuals about. If an instruction would put us in breach of data protection law, we will tell you in writing and decline it.',
        },
        {
          kind: 'p',
          text: 'A Data Processing Addendum with Article 28 terms, our sub-processor list, Standard Contractual Clauses and a security schedule is available on request and forms part of the agreement once signed. Our Privacy Policy explains how we handle data in our own right.',
        },
      ],
    },
    {
      n: '17',
      heading: 'AI tooling',
      plain:
        'Yes, we use AI tools. On business tiers that don’t train on your data, always reviewed by a person, and never as a substitute for the work you’re paying for.',
      blocks: [
        {
          kind: 'p',
          text: 'We use AI tools in research, drafting, code assistance, analysis and quality checking. We think saying so is better than the alternative, which is most of the industry using them and not mentioning it.',
        },
        { kind: 'p', text: 'Our commitments:' },
        {
          kind: 'list',
          items: [
            'We use business or enterprise tiers configured so that inputs are not used to train the provider’s models.',
            'We do not put your confidential material or personal data into consumer AI tools.',
            'Every AI-assisted output is reviewed, edited and verified by a person before it reaches you. Nothing ships unreviewed.',
            'Factual claims and statistics are checked against sources regardless of how the draft was produced.',
            'We do not represent generated output as original research or as human-conducted interviews.',
            'If your policy requires AI tooling excluded from your engagement, tell us and we’ll contract for it. It may affect the timeline and the fee, and we’ll say so up front.',
          ],
        },
        {
          kind: 'p',
          text: 'You are responsible for disclosing AI-assisted content where your own sector, platform or regulator requires it.',
        },
      ],
    },
    {
      n: '18',
      heading: 'Third-party costs and services',
      plain:
        'Hosting, licences, stock images and plugins are extra, at cost, with your approval first.',
      blocks: [
        {
          kind: 'p',
          text: 'Some engagements need third-party products: hosting, domains, SSL certificates, premium plugins or themes, stock photography, fonts, SaaS subscriptions, SMS or WhatsApp API credits, testing services. These are not included in our fees unless the SOW says so.',
        },
        {
          kind: 'p',
          text: 'Where we procure them for you, they are recharged at cost with no margin, and we get your approval before incurring anything above ₹5,000. Wherever possible we set them up in your name on your billing, so you keep them without transfer when the engagement ends.',
        },
        {
          kind: 'p',
          text: 'Third-party products are governed by their own terms, and we are not liable for their performance, pricing changes, availability or discontinuation.',
        },
      ],
    },
    {
      n: '19',
      heading: 'Warranties and disclaimers',
      plain:
        'We promise the work will be done properly by qualified people. We don’t promise it will produce a particular commercial result.',
      blocks: [
        {
          kind: 'p',
          text: 'We warrant that our services will be performed with reasonable skill and care, to the standard reasonably expected of a competent professional studio; that our people have the skills and experience the work requires; that Deliverables will substantially conform to the SOW; and that, to our knowledge, Deliverables we create will not infringe a third party’s intellectual property.',
        },
        {
          kind: 'p',
          text: 'Beyond those warranties and any that cannot be excluded by law, services and Deliverables are provided as is. We give no other warranty, express or implied, including implied warranties of merchantability, fitness for a particular purpose, or non-infringement, and no warranty as to commercial outcomes, which Clause 12 addresses in full.',
        },
        {
          kind: 'p',
          text: 'Nothing in these terms excludes or limits liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for anything else that cannot lawfully be excluded.',
        },
      ],
    },
    {
      n: '20',
      heading: 'Limitation of liability',
      plain:
        'Our total liability is capped at what you paid us in the last twelve months. We’re not liable for lost profits or lost business.',
      blocks: [
        { kind: 'p', text: 'Subject to Clause 19, and to the fullest extent permitted by law:' },
        {
          kind: 'p',
          text: 'Neither party is liable for indirect, incidental, special, punitive or consequential loss; for loss of profit, revenue, business, goodwill, anticipated savings or opportunity; or for loss or corruption of data, except where caused by that party’s breach of Clause 16 — even if the possibility was known.',
        },
        {
          kind: 'p',
          text: 'Our total aggregate liability arising out of or in connection with an engagement, whether in contract, tort, negligence, statute or otherwise, is limited to the total fees paid by you to Zefract under the relevant SOW in the twelve months preceding the event giving rise to the claim. For engagements shorter than twelve months, it is limited to total fees paid.',
        },
        {
          kind: 'p',
          text: 'For the avoidance of doubt, ad spend paid by you to a platform is not a fee paid to Zefract and does not count toward that cap.',
        },
        {
          kind: 'p',
          text: 'Claims must be brought within twelve months of the date you became aware, or reasonably should have become aware, of the circumstances giving rise to them.',
        },
        {
          kind: 'p',
          text: 'These limits reflect the fees charged and the allocation of risk both parties have accepted. A higher cap can be negotiated, and it will be reflected in the price.',
        },
      ],
    },
    {
      n: '21',
      heading: 'Indemnity',
      plain:
        'If we get sued because of something you gave us, you cover it. If you get sued because of something we made, we cover it. Symmetrical.',
      blocks: [
        {
          kind: 'p',
          text: 'You indemnify us against claims, losses and reasonable legal costs arising from: Client Materials you supplied, including infringement of a third party’s rights; claims, offers or representations in your marketing that you asked us to publish; your breach of data protection law in relation to data you supplied; your breach of law or regulation applicable to your business; and your use of Deliverables outside the purpose in the SOW.',
        },
        {
          kind: 'p',
          text: 'We indemnify you against claims, losses and reasonable legal costs arising from: a Deliverable we originated infringing a third party’s intellectual property; our breach of Clause 14 or Clause 16; and our gross negligence or wilful misconduct. Our indemnity is subject to the cap in Clause 20 except in cases of gross negligence, wilful misconduct or fraud.',
        },
        {
          kind: 'p',
          text: 'The party seeking indemnity must notify the other promptly, let them control the defence, and cooperate reasonably. Neither party settles a claim in a way that admits the other’s liability without written consent.',
        },
      ],
    },
    {
      n: '22',
      heading: 'Non-solicitation',
      plain:
        'Please don’t hire our team directly during the engagement or for twelve months after. If you want to, talk to us — there’s a fee, not a ban.',
      blocks: [
        {
          kind: 'p',
          text: 'During the engagement and for twelve months after it ends, neither party will directly solicit for employment or engagement any employee or contractor of the other who was materially involved in the work, without the other’s written consent.',
        },
        {
          kind: 'p',
          text: 'This doesn’t catch general public job advertisements, or an individual approaching you unprompted. Where you do want to hire someone from our team, tell us — we would rather agree a recruitment fee, typically 25% of first-year compensation, than lose a client over it. People move, and we’d rather handle it as a commercial matter than a legal one.',
        },
      ],
    },
    {
      n: '23',
      heading: 'Suspension and termination for cause',
      plain:
        'Either side can end things immediately for a serious, unfixed breach. We’ll also walk away from work that’s unethical or illegal, and we’ll tell you why.',
      blocks: [
        {
          kind: 'p',
          text: 'Either party may terminate immediately on written notice if the other: commits a material breach that is not remedied within 15 days of written notice describing it; becomes insolvent, enters liquidation or has a receiver appointed; or is unable to perform for more than 60 consecutive days due to force majeure.',
        },
        {
          kind: 'p',
          text: 'We may additionally suspend or terminate if you instruct us to do something illegal, in breach of a platform’s terms, or in breach of data protection law; if you make claims in marketing we consider misleading and won’t correct them; or if invoices remain unpaid more than 30 days after written notice.',
        },
        {
          kind: 'p',
          text: 'We may also decline or exit work we consider unethical — deceptive advertising, manipulated reviews, targeting that exploits vulnerable people. We will explain our reasoning in writing, give reasonable notice where safe to do so, refund unearned fees, and complete handover under Clause 7.',
        },
        {
          kind: 'p',
          text: 'On termination for any reason: fees for work performed to the date of termination remain payable; unearned prepaid fees are refunded; Clauses 10, 11, 14, 15, 16, 20, 21, 22 and 25 survive; and handover under Clause 7 happens regardless of why the engagement ended.',
        },
      ],
    },
    {
      n: '24',
      heading: 'Force majeure',
      blocks: [
        {
          kind: 'p',
          text: 'Neither party is liable for failure or delay caused by events beyond its reasonable control: natural disaster, epidemic, war, terrorism, civil unrest, government action, strikes, or failure of internet infrastructure, power, or essential third-party services. The affected party must notify the other promptly and take reasonable steps to mitigate. Payment obligations for work already performed are not suspended. If the event continues beyond 60 days, either party may terminate without liability.',
        },
      ],
    },
    {
      n: '25',
      heading: 'Governing law and disputes',
      plain:
        'Indian law. Talk to us first, then mediate, then arbitrate in Delhi. Courts are the last resort, not the first.',
      blocks: [
        {
          kind: 'p',
          text: 'These terms and any engagement are governed by the laws of India, without regard to conflict of law rules. The United Nations Convention on Contracts for the International Sale of Goods does not apply.',
        },
        {
          kind: 'p',
          lead: 'Escalation.',
          text: 'Before formal proceedings, the parties will try to resolve the dispute in this order:',
        },
        {
          kind: 'steps',
          items: [
            'Direct discussion — written notice describing the issue and what you want, followed by a good-faith conversation between the engagement leads within 10 working days.',
            'Senior escalation — if unresolved after 15 further days, escalation to a director or equivalent on each side.',
            'Mediation — if still unresolved after 30 days, a single mediator agreed between the parties, costs shared equally.',
            'Arbitration — failing mediation, final and binding arbitration under the Arbitration and Conciliation Act, 1996, before a sole arbitrator, seated in Noida, Uttar Pradesh, India, conducted in English.',
          ],
        },
        {
          kind: 'p',
          text: 'Subject to the above, the courts at Gautam Buddha Nagar, Uttar Pradesh, India have exclusive jurisdiction. Either party may seek urgent injunctive relief from a court at any time without completing the escalation steps, particularly to protect confidential information or intellectual property.',
        },
      ],
    },
    {
      n: '26',
      heading: 'General',
      blocks: [
        {
          kind: 'p',
          lead: 'Entire agreement.',
          text: 'The SOW, any signed MSA or DPA, and these terms are the whole agreement. Each party confirms it hasn’t relied on any statement not written into them. This doesn’t limit liability for fraudulent misrepresentation.',
        },
        {
          kind: 'p',
          lead: 'Changes to these terms.',
          text: 'We may update these terms and will post the revised version here with a new date. For engagements already running, changes take effect at the start of the next renewal period and we will give at least 30 days’ written notice of a material change. If you don’t accept it, you may terminate at the end of the notice period without penalty. Changes never apply retrospectively.',
        },
        {
          kind: 'p',
          lead: 'Assignment.',
          text: 'Neither party may assign the agreement without the other’s written consent, not unreasonably withheld — except that either may assign to a successor in a merger or sale of substantially all its business, on written notice.',
        },
        {
          kind: 'p',
          lead: 'Independent contractors.',
          text: 'The parties are independent. Nothing here creates a partnership, joint venture, agency or employment relationship. Neither may bind the other.',
        },
        {
          kind: 'p',
          lead: 'No third-party rights.',
          text: 'No one other than the parties has any right to enforce these terms.',
        },
        {
          kind: 'p',
          lead: 'Severability.',
          text: 'If a provision is held invalid or unenforceable, it is modified to the minimum extent needed to be enforceable, or severed. The rest stays in force.',
        },
        {
          kind: 'p',
          lead: 'Waiver.',
          text: 'Not enforcing a right doesn’t waive it. A waiver is only effective in writing.',
        },
        {
          kind: 'p',
          lead: 'Notices.',
          text: `Formal notices — termination, breach, dispute — must be in writing by email to the address in the SOW with delivery confirmation, or by registered post to the registered office. Notices to Zefract go to ${LEGAL_EMAILS.legal}. Day-to-day project communication over email, Slack or WhatsApp is not formal notice.`,
        },
        {
          kind: 'p',
          lead: 'Counterparts and e-signature.',
          text: 'An SOW may be signed in counterparts and by electronic signature, which is as binding as ink.',
        },
        {
          kind: 'p',
          lead: 'Language.',
          text: 'English governs. Any translation is for convenience only.',
        },
      ],
    },
    {
      n: '27',
      heading: 'Using this website',
      plain:
        'Read it, share it, quote it with a link. Don’t scrape it, copy it wholesale, or use it to train a model without asking.',
      blocks: [
        {
          kind: 'p',
          text: `All content on www.zefract.com — text, design, code, logos, images, case studies and the Zefract name and mark — is owned by or licensed to ${SITE.legalName} and protected by copyright and trade mark law.`,
        },
        {
          kind: 'p',
          text: 'You may read, share and link to it freely, and quote short extracts with attribution and a link back. You may not republish substantial portions, use our content commercially without permission, remove attribution, or scrape the site at scale — including for training machine learning models — without our written consent. Our published robots.txt sets out what automated agents may access; please respect it.',
        },
        {
          kind: 'p',
          text: 'Content on this site, including pricing ranges, benchmarks and audit findings, is provided for general information. It is not professional, legal, financial or tax advice, and it does not create a client relationship. Advice specific to your business comes through an engagement, not a web page.',
        },
        {
          kind: 'p',
          text: 'We link to third-party sites we find useful. We don’t control them and aren’t responsible for their content or their privacy practices.',
        },
        {
          kind: 'p',
          text: 'We aim to keep the site available but don’t guarantee uninterrupted access, and we may change or remove content at any time.',
        },
      ],
    },
    {
      n: '28',
      heading: 'Contact',
      blocks: [
        {
          kind: 'p',
          text: 'Questions about these terms, or a clause you’d like negotiated — most of them are negotiable, and we’d rather have the conversation before signature than after:',
        },
        {
          kind: 'defs',
          items: [
            { label: 'Legal', value: LEGAL_EMAILS.legal, href: `mailto:${LEGAL_EMAILS.legal}` },
            {
              label: 'Accounts',
              value: LEGAL_EMAILS.accounts,
              href: `mailto:${LEGAL_EMAILS.accounts}`,
            },
            {
              label: 'Privacy',
              value: LEGAL_EMAILS.privacy,
              href: `mailto:${LEGAL_EMAILS.privacy}`,
            },
            { label: 'General', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
            {
              label: 'Registered office',
              value: `${SITE.legalName}, ${COMPANY.registeredOffice}`,
            },
            { label: 'CIN', value: COMPANY.cin },
            { label: 'PAN', value: COMPANY.pan },
            { label: 'TAN', value: COMPANY.tan },
          ],
        },
      ],
    },
  ],
}

/**
 * The two editorial notes the client's document carries, kept here because both
 * are addressed to whoever finalises it rather than to a reader. Verbatim:
 *
 * INSIDE CLAUSE 07, headed "EDITORIAL NOTE — RESOLVE BEFORE PUBLISHING":
 *
 *   "If the two-term commitment structure is adopted (rolling monthly vs. a
 *   12-month term with the website build amortised into the retainer), this clause
 *   needs a second subsection setting out: the discounted 12-month rate; the
 *   amortised build value; and the early-exit balance — i.e. that on early
 *   termination the unamortised portion of the build becomes payable, calculated as
 *   (build value ÷ 12) × months remaining. Do not publish that language until the
 *   amortisation maths in the pricing document is final. As drafted, this page
 *   reflects the rolling-monthly model only."
 *
 * AT THE END OF CLAUSE 25:
 *
 *   "Editorial note — seat and jurisdiction now set to Noida / Gautam Buddha Nagar,
 *   matching the registered office. Still open: once target export markets are
 *   confirmed (UAE, UK, Australia), decide whether a separate contracting entity or
 *   an alternative seat is needed for those clients, since some enterprise buyers
 *   will not accept an Indian seat. Same decision as target-geography selection."
 *
 * Neither is a gap in the published page. The first instructs that the twelve-month
 * alternative NOT be published yet, which is what clause 07 above does; the second
 * records a decision already made and a later one that does not change this text.
 */

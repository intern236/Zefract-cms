import { COMPANY, GRIEVANCE_OFFICER, LEGAL_EMAILS, SITE, CONTACT } from '@/content/site'
import type { LegalDocument } from '@/content/types'

/**
 * The privacy policy, as supplied by the client.
 *
 * TRANSCRIBED, NOT WRITTEN. Every clause below is the client's own wording from
 * Zefract_Privacy_Policy.docx. Nothing has been paraphrased, softened or
 * summarised, because a privacy policy is a legal statement about what an
 * organisation does and rewriting one on its author's behalf changes what has
 * been promised. Four kinds of change were made and no others:
 *
 *   1. The editorial note addressed to the client — which says "remove before
 *      publishing" in its own text — is not published. It is an instruction to
 *      whoever finalises the document, not a term offered to a reader. It is
 *      reproduced verbatim at the foot of this file so it is not lost.
 *   2. Values the document left as template text — "name your CRM", "full name
 *      of the officer", "DD Month 2026" — were TODO() placeholders, rendering as
 *      visible stubs in development and omitted in production, because inventing
 *      a sub-processor or a date would be publishing a false statement of fact.
 *      THE CLIENT HAS NOW SUPPLIED ALL OF THEM, which is why this file no longer
 *      imports TODO. Nothing on this page is a placeholder any more. What the
 *      site as a whole still owes is in content/site.ts and listed by
 *      `npm run check:todos`.
 *   3. Straight quotes are typographic, and a missing space after a comma in the
 *      registered address is closed up.
 *   4. TWO ROWS ARE GONE, both removed on the client's instruction after they
 *      saw them rendered: the "Functional" category from the cookie table in
 *      section 05, and the GSTIN row from the identity block in section 01. Each
 *      was a row the source document left as template text, so each rendered as a
 *      placeholder stub. These are the only changes that alter what the document
 *      says rather than how it reads, so each is recorded twice: here, and in
 *      full at the row's old position, with the text as supplied and the
 *      condition under which it has to come back.
 *
 * SECTION 05 NOW DESCRIBES SOMETHING THAT EXISTS. It used to be the one part of this
 * document the site contradicted: it promised a consent banner, non-essential cookies
 * off by default, a "Cookie settings" link in the footer and Global Privacy Control
 * honoured, while Google Tag Manager loaded ungated for every visitor. All four are
 * built — the Consent Mode defaults in components/analytics/google-tag-manager.tsx,
 * the banner in components/layout/consent-banner.tsx, the footer control in
 * components/layout/cookie-settings-button.tsx, and the GPC check in lib/consent.ts.
 * The copy they render is CONSENT in content/site.ts, deliberately next to this file
 * so the two are edited together.
 *
 * WHAT STILL HAS TO AGREE WITH IT. Section 05's table names GA4, the Google Ads tag,
 * the Meta Pixel and the LinkedIn Insight Tag. Those are configured inside the GTM
 * container, not in this repository, so nothing here can check that the list is
 * accurate or that every one of them is actually set to respect the consent signals
 * the site now sends. That is a container review, and it is the remaining half of
 * making this section true.
 */

/**
 * The two dates in the masthead, supplied by the client.
 *
 * THEY ARE DIFFERENT DATES AND BOTH ARE DELIBERATE. The policy took effect on
 * 3 August 2026; it was last revised on 1 September 2026. A single constant used
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

export const PRIVACY: LegalDocument = {
  eyebrow: 'Legal · Privacy',
  title: 'Privacy Policy',
  standfirst:
    'We collect less than most agencies, we tell you exactly what we do with it, and we never sell it. This page is the long version, written so you can actually read it.',
  meta: [
    { label: 'Effective', value: EFFECTIVE },
    { label: 'Last updated', value: UPDATED },
    { label: 'Version', value: '1.0' },
    { label: 'Applies to', value: 'zefract.com and all Zefract services' },
    { label: 'Registered office', value: COMPANY.registeredOffice },
    { label: 'CIN', value: COMPANY.cin },
    { label: 'PAN', value: COMPANY.pan },
  ],
  lede: [
    'Zefract Tech Pvt Ltd builds products and grows them. Doing that means we handle personal data — yours if you visit this site or talk to us about work, and your customers’ if you hire us to run marketing or build software. Those are two different jobs with two different sets of rules, and this policy keeps them clearly apart.',
    'Where the law uses a technical word, we use it and then explain it. Where a section only applies to some readers — people in the EU or UK, for example — we say so at the top of that section.',
  ],
  unit: 'Section',
  related: [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Request a Data Processing Addendum', href: `mailto:${LEGAL_EMAILS.privacy}` },
  ],
  clauses: [
    {
      n: '01',
      heading: 'Who we are',
      plain:
        'Zefract is an Indian private limited company based in Delhi NCR. We’re the ones responsible for the data described in this policy, and here’s how to reach us.',
      blocks: [
        {
          kind: 'p',
          text: 'Zefract Tech Pvt Ltd (“Zefract”, “we”, “us”, “our”) is a private limited company incorporated in India, operating as a product-and-growth studio: one team that designs, builds and markets digital products for founders and small-to-mid-sized businesses.',
        },
        {
          kind: 'defs',
          items: [
            { label: 'Legal name', value: SITE.legalName },
            { label: 'CIN', value: COMPANY.cin },
            { label: 'PAN', value: COMPANY.pan },
            { label: 'Registered office', value: COMPANY.registeredOffice },
            {
              label: 'Email',
              value: LEGAL_EMAILS.privacy,
              href: `mailto:${LEGAL_EMAILS.privacy}`,
            },
            { label: 'Website', value: 'www.zefract.com', href: SITE.url },
          ],
        },
        {
          kind: 'p',
          text: 'Under India’s Digital Personal Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025, Zefract is a Data Fiduciary — the organisation that decides why and how personal data is used. You are a Data Principal — the person the data is about. Under the UK and EU GDPR the equivalent terms are controller and data subject. This policy uses both where it helps.',
        },
        {
          kind: 'p',
          text: 'This policy covers www.zefract.com, our proposals and sales conversations, our client engagements, our hiring process, and our email and social channels. It does not cover third-party websites we link to.',
        },
      ],
    },
    {
      n: '02',
      heading: 'The two roles we play, and why it matters to you',
      plain:
        'For our own website and sales, we decide what happens to data — so this policy governs. For data inside a client’s ad account, CRM or database, the client decides and we just follow instructions. If you’re a customer of one of our clients, their privacy policy is the one you want, not this one.',
      blocks: [
        {
          kind: 'p',
          text: 'Most agency privacy policies blur this line. We’d rather draw it, because it determines who you go to when you want something done about your data.',
        },
        {
          kind: 'table',
          columns: ['Situation', 'Our role', 'Who is accountable'],
          rows: [
            [
              'You browse zefract.com, download something, or fill in the contact form',
              'Data Fiduciary / controller',
              'Zefract. This policy applies in full.',
            ],
            [
              'You email us a brief, take a call, or receive a proposal',
              'Data Fiduciary / controller',
              'Zefract.',
            ],
            ['You apply for a role with us', 'Data Fiduciary / controller', 'Zefract.'],
            [
              'You are a named contact at a client company',
              'Data Fiduciary / controller',
              'Zefract, for the business relationship.',
            ],
            [
              'You are a customer or lead of a Zefract client, and your data sits in their CRM, ad account, email list or database that we operate',
              'Data Processor',
              'The client. We act only on their written instructions. Contact them first — see §12.',
            ],
          ],
        },
        {
          kind: 'p',
          text: 'If you contact us about data we hold as a processor, we will not act on it unilaterally. We will tell you who the responsible business is, or pass your request to them, within a reasonable time. That isn’t us dodging — it’s the correct handling, and doing otherwise would be a breach of our duty to the client.',
        },
      ],
    },
    {
      n: '03',
      heading: 'What we collect',
      plain:
        'Contact details you give us, what you do on our website, and the working files of a live project. We don’t buy lists, we don’t scrape, and we don’t collect sensitive categories like health or biometric data.',
      blocks: [
        { kind: 'sub', heading: 'Data you give us directly' },
        {
          kind: 'list',
          items: [
            {
              lead: 'Enquiry and brief data',
              text: '— name, work email, phone number, company, role, country, budget range, and whatever you write in the message field.',
            },
            {
              lead: 'Meeting and call data',
              text: '— scheduling details, and notes we take. If we record a call, we ask first and you can say no. Recordings are never made covertly.',
            },
            {
              lead: 'Client onboarding data',
              text: '— billing contact, registered address, GSTIN or VAT number, PAN or tax ID, bank details for refunds, and the named contacts on the account.',
            },
            {
              lead: 'Credentials and access',
              text: '— where you grant us access to your Google Ads, Meta Business, Analytics, CMS, hosting or repository. See §9 for how we handle these.',
            },
            {
              lead: 'Candidate data',
              text: '— CV, portfolio, work history, notice period, expected compensation, and interview notes.',
            },
            {
              lead: 'Subscription data',
              text: '— the email address you give us for our newsletter or teardowns, and whether you opened or clicked.',
            },
          ],
        },
        { kind: 'sub', heading: 'Data we collect automatically when you use this site' },
        {
          kind: 'list',
          items: [
            'IP address (which we truncate for analytics), approximate city-level location, device type, browser, operating system and screen size.',
            'Pages viewed, referring URL, time on page, scroll depth, and which links and buttons you clicked.',
            'Cookie and local storage identifiers, subject to your consent choices — see §5.',
            'Server logs, including request timestamps and error traces, kept for security and debugging.',
          ],
        },
        { kind: 'sub', heading: 'Data we get from third parties' },
        {
          kind: 'list',
          items: [
            'Aggregate campaign and traffic reporting from Google, Microsoft, Meta and LinkedIn.',
            'Publicly available business information — company website, LinkedIn company page, published funding or hiring news — used to research a prospect before a first call.',
            'Payment confirmations from our payment processor. We never see or store your full card number.',
          ],
        },
        { kind: 'sub', heading: 'What we deliberately do not collect' },
        {
          kind: 'p',
          text: 'We do not collect special or sensitive category data — health, biometric, genetic, caste, religious belief, political opinion, sexual orientation or trade union membership — and we ask you not to send it. We do not buy contact lists, scrape personal email addresses, or use data brokers to enrich profiles of individuals. If a client’s project requires handling sensitive categories, that is scoped, contracted and secured separately before any work begins.',
        },
      ],
    },
    {
      n: '04',
      heading: 'Why we use it, and on what legal basis',
      plain:
        'To reply to you, to do the work you hired us for, to get paid, to keep the site secure, and to send marketing you asked for. Each purpose has a lawful basis listed below, so you can check our reasoning rather than take our word for it.',
      blocks: [
        {
          kind: 'p',
          text: 'Under the DPDP Act, our lawful ground is consent or one of the legitimate uses the Act permits. Under the UK and EU GDPR the available bases are broader; where you are in the UK, EEA or Switzerland, the GDPR column applies.',
        },
        {
          kind: 'table',
          columns: ['What we do', 'Data used', 'DPDP basis', 'GDPR basis'],
          rows: [
            [
              'Reply to your enquiry and prepare a proposal',
              'Enquiry, brief, meeting notes',
              'Consent — you gave it to us for exactly this',
              'Steps prior to entering a contract',
            ],
            [
              'Deliver the work in your Statement of Work',
              'Client, project and access data',
              'Legitimate use — performance of a contract',
              'Performance of a contract',
            ],
            [
              'Invoice you, collect payment, meet tax and audit duties',
              'Billing, tax and payment data',
              'Legal obligation',
              'Legal obligation',
            ],
            [
              'Measure how the site performs and improve it',
              'Analytics and usage data',
              'Consent, via the cookie banner',
              'Consent',
            ],
            [
              'Send you our newsletter or a teardown you asked for',
              'Email address, engagement data',
              'Consent, withdrawable any time',
              'Consent, or soft opt-in for existing clients',
            ],
            [
              'Keep the site and our systems secure, prevent fraud and abuse',
              'IP, logs, device data',
              'Legitimate use — security and prevention of fraud',
              'Legitimate interests',
            ],
            [
              'Assess a job application',
              'Candidate data',
              'Consent, and steps prior to employment',
              'Steps prior to a contract',
            ],
            [
              'Defend a legal claim, or comply with a lawful order',
              'Whatever the matter requires',
              'Legal obligation / enforcement of legal right',
              'Legal obligation, legitimate interests',
            ],
          ],
        },
        { kind: 'sub', heading: 'What we never do with it' },
        {
          kind: 'p',
          text: 'We do not sell personal data. We do not rent, licence or trade it. We do not share your enquiry with other agencies as a referral. We do not use your project data to train third-party AI models — see §6. And we do not use automated decision-making that produces a legal or similarly significant effect on you.',
        },
      ],
    },
    {
      n: '05',
      heading: 'Cookies and tracking',
      plain:
        'Necessary cookies load automatically because the site can’t work without them. Everything else — analytics, advertising pixels — stays off until you agree, and you can change your mind at any time from the link in the footer.',
      blocks: [
        {
          kind: 'p',
          text: 'We use a consent banner on first visit. Non-essential cookies are set to “off” by default. We do not use pre-ticked boxes, and we do not treat continued scrolling as consent.',
        },
        {
          kind: 'table',
          columns: ['Category', 'What it does', 'Examples', 'Consent needed'],
          rows: [
            [
              'Strictly necessary',
              'Routing, security, load balancing, remembering your cookie choice',
              'Session cookie, consent record',
              'No — the site cannot function without these',
            ],
            [
              'Analytics',
              'Counts visits and shows us which pages help and which don’t',
              'Google Analytics 4, with IP anonymisation',
              'Yes',
            ],
            [
              'Advertising & attribution',
              'Tells us which ad or campaign led to an enquiry',
              'Google Ads tag, Meta Pixel, LinkedIn Insight Tag',
              'Yes',
            ],
          ],
        },
        /* THE "FUNCTIONAL" ROW WAS REMOVED AT THE CLIENT'S REQUEST. The source
           document listed a fourth category — "Embedded media, scheduling widget,
           chat" — and left its Examples cell as template text, which rendered as a
           placeholder stub. The client's answer was to drop the row rather than
           name the tools, which is consistent: the site embeds no video, runs no
           scheduling widget and carries no chat, so the category described cookies
           it does not set.

           IT HAS TO COME BACK THE DAY ANY OF THOSE ARRIVE. A Calendly embed, a
           YouTube player or a chat bubble each set third-party cookies, and this
           table is the disclosure that has to account for them. Adding one of those
           to the site without restoring this row makes the policy inaccurate. The
           row as supplied was:

             ['Functional', 'Embedded media, scheduling widget, chat', <tools>, 'Yes'] */
        {
          kind: 'p',
          text: 'You can withdraw or change consent at any time through the Cookie settings link in our footer, and independently through your browser settings. Blocking analytics and advertising cookies will not stop you using any part of this site. We honour Global Privacy Control signals where your browser sends them.',
        },
        {
          kind: 'p',
          text: 'Consent records — what you agreed to, when, and from which banner version — are kept as proof of consent for as long as the DPDP Rules require, and no longer.',
        },
      ],
    },
    {
      n: '06',
      heading: 'Who we share it with',
      plain:
        'A short list of service providers who help us run the studio, each under contract. Nobody else, unless the law requires it or you ask us to.',
      blocks: [
        { kind: 'p', text: 'We share personal data only in these circumstances:' },
        {
          kind: 'steps',
          items: [
            'Service providers (sub-processors) who process data on our instructions under a written agreement with confidentiality and security terms.',
            'Professional advisers — our accountants, auditors and lawyers — where they need it to advise us.',
            'Authorities, where we are legally required to disclose. We will tell you unless we are legally barred from doing so.',
            'A buyer, if Zefract is acquired or merged. You will be told before your data moves and this policy will continue to apply until you are given a new one.',
          ],
        },
        { kind: 'sub', heading: 'Current categories of service provider' },
        {
          kind: 'table',
          columns: ['Purpose', 'Provider category', 'Where processed'],
          /* EVERY PROVIDER HERE WAS SUPPLIED BY THE CLIENT and is transcribed as
             given, including the two rows that name no product. The table was
             briefly cut to four rows while the providers were unknown; the client
             then sent the full eight, so it is whole again and no cell is a
             placeholder.

             THE HOSTING ROW SAID "VERCEL" FOR ONE REVISION AND NOW SAYS NETLIFY,
             which is what this repository actually deploys to: netlify.toml is a
             configured build with @netlify/plugin-nextjs in package.json, while
             vercel.json is the untouched create-next-app stub. The client corrected
             it once the discrepancy was raised. It mattered enough to raise because
             this is not a typo — it names the company that holds every visitor's
             data, and section 07 leans on it for the transfer disclosure.

             THE REGION IS RESEARCHED, NOT SUPPLIED, at the client's request, and it
             is deliberately the same shape as the sentence they had written for
             Vercel. Netlify serves from a CDN of 70-plus points of presence
             worldwide, and its origin infrastructure runs on AWS with a United
             States region as the default; EU residency (Frankfurt) exists only as
             an Enterprise arrangement, which is not what this site is on. So the
             accurate statement is a global edge with primary processing in the US.

             CONFIRM IT AGAINST NETLIFY'S OWN DPA BEFORE LAUNCH. This says where a
             third party processes personal data, and the only citable source for
             that is the processor's contract, not a description of its network. If
             the site later moves to a region-pinned or Enterprise plan, this cell
             changes with it. It is also what makes section 07 true: that section
             names the United States first among the countries data reaches, and
             this row is the reason it does.

             TWO ROWS DESCRIBE AN ABSENCE, AND THAT IS ALLOWED. "No dedicated ESP
             currently" and "Provider to be determined" are honest answers to the
             question the column asks, which is more than an omitted row would be —
             a reader can see that email marketing sends nothing today and that a
             payment processor is coming. They should be revisited when either
             changes, because both will start touching personal data the day they
             are chosen. */
          rows: [
            [
              'Website hosting and CDN',
              'Netlify',
              'Global edge; primary processing facilities in the United States',
            ],
            ['Email and documents', 'Google Workspace', 'Global'],
            ['CRM and proposals', 'Google Workspace / manual processes', 'Global'],
            ['Analytics', 'Google Analytics 4', 'Global'],
            ['Advertising platforms', 'Google, Meta, Microsoft, LinkedIn', 'Global'],
            ['Email marketing', 'No dedicated ESP currently', 'N/A'],
            ['Payments and invoicing', 'Provider to be determined', 'Provider-dependent'],
            ['Project management and file storage', 'Google Workspace/Microsoft', 'Global'],
          ],
        },
        {
          kind: 'p',
          text: `A current and complete sub-processor list is available on request from ${LEGAL_EMAILS.privacy}. Clients on an active engagement are notified before we add a sub-processor that will touch their data, and may object.`,
        },
        { kind: 'sub', heading: 'AI and machine learning tools' },
        {
          kind: 'p',
          text: 'We use AI tools in parts of our work — research, drafting, code assistance and analysis. Where we do, we use business or enterprise tiers configured so that inputs are not used to train the provider’s models, and we do not paste client confidential material or personal data into consumer AI tools. Any AI-assisted output is reviewed by a person before it reaches you. If your organisation needs AI tooling excluded entirely from your engagement, say so and we will contract for that.',
        },
      ],
    },
    {
      n: '07',
      heading: 'Sending data outside India',
      plain:
        'Some of our tools store data abroad. When that happens we make sure there’s a contract in place that keeps your protections travelling with the data.',
      blocks: [
        {
          kind: 'p',
          text: 'Zefract operates from India and serves clients globally. Personal data may therefore be transferred to, stored in, or accessed from countries other than the one you are in — most commonly the United States, the European Union, Singapore and the United Arab Emirates, depending on where our service providers operate.',
        },
        {
          kind: 'p',
          text: 'The DPDP Act permits transfer of personal data outside India except to territories the Central Government restricts by notification. We monitor those notifications and will stop or relocate a transfer if a destination becomes restricted.',
        },
        {
          kind: 'p',
          text: 'Where data of individuals in the UK or EEA is transferred outside those areas, we rely on the UK International Data Transfer Addendum or the European Commission’s Standard Contractual Clauses, together with a transfer risk assessment where one is required. You can request a copy of the safeguards applied to a specific transfer.',
        },
      ],
    },
    {
      n: '08',
      heading: 'How long we keep it',
      plain:
        'Only as long as the purpose lasts, plus whatever the tax and legal rules force us to keep. Then we delete it or strip the identifying parts out.',
      blocks: [
        {
          kind: 'p',
          text: 'We do not keep personal data indefinitely “just in case”. Each category has a defined retention period:',
        },
        {
          kind: 'table',
          columns: ['Data', 'Kept for', 'Why'],
          rows: [
            [
              'Enquiry that did not become a project',
              '24 months from last contact',
              'Buying cycles in our category are long; then deleted',
            ],
            [
              'Client contract, SOW and project records',
              '7 years after the engagement ends',
              'Limitation periods and contractual defence',
            ],
            [
              'Invoices, tax and accounting records',
              '8 years',
              'Indian tax and companies-law retention',
            ],
            [
              'Client working files and deliverables',
              '12 months after handover, then deleted unless you ask us to keep them',
              'Transition support',
            ],
            [
              'Platform credentials and access tokens',
              'Revoked within 5 working days of engagement end',
              'Least-privilege principle',
            ],
            [
              'Newsletter subscription',
              'Until you unsubscribe, plus a suppression record',
              'The suppression record exists so we don’t email you again by mistake',
            ],
            [
              'Unsuccessful candidate data',
              '12 months, with consent; otherwise 6 months',
              'Future roles and equal-opportunity records',
            ],
            ['Website server logs', '90 days', 'Security and debugging'],
            ['Cookie consent records', 'As required by the DPDP Rules', 'Proof of consent'],
            ['Call recordings', '90 days unless the project needs them longer', 'Accuracy of notes'],
          ],
        },
        {
          kind: 'p',
          text: 'When a period ends we delete the data or irreversibly anonymise it. Anonymised, aggregate statistics — such as “38% of enquiries came from organic search” — carry no personal data and may be kept indefinitely.',
        },
      ],
    },
    {
      n: '09',
      heading: 'How we protect it',
      plain:
        'Encryption, multi-factor authentication, least-privilege access, and never asking you for a password. We use delegated access to your platforms, not shared logins.',
      blocks: [
        {
          kind: 'p',
          text: 'We apply reasonable security safeguards proportionate to the data we hold, as required by Rule 6 of the DPDP Rules, 2025 and by Article 32 of the UK and EU GDPR:',
        },
        {
          kind: 'list',
          items: [
            'Encryption in transit (TLS 1.2 or higher) and at rest with our infrastructure providers.',
            'Multi-factor authentication on every account that touches client data, without exception.',
            'Role-based access on a need-to-know basis, reviewed when someone joins, changes role or leaves.',
            'A password manager for all shared secrets. Credentials are never sent over email, WhatsApp or Slack.',
            'Access logs and activity monitoring, retained for at least one year in line with Rule 6.',
            'Confidentiality obligations and security training for every employee and contractor.',
            'Documented backup and recovery procedures for systems we host.',
          ],
        },
        { kind: 'sub', heading: 'How we take access to your platforms' },
        {
          kind: 'p',
          text: 'We ask for delegated access — a Google Ads manager account link, a Meta Business Manager partner request, a named Analytics user, a repository collaborator invite. We do not ask for your username and password, and you should be sceptical of any agency that does. Delegated access means you can see exactly what we can reach, and revoke it in one click without changing a single password.',
        },
        {
          kind: 'p',
          text: 'No system is perfectly secure, and we will not pretend otherwise. What we will do is tell you quickly and honestly if something goes wrong — see §13.',
        },
      ],
    },
    {
      n: '10',
      heading: 'Your rights',
      plain:
        'You can ask what we hold, correct it, delete it, take it elsewhere, withdraw consent, and complain. It’s free, and we aim to answer within 30 days.',
      blocks: [
        { kind: 'sub', heading: 'If you are in India — your rights as a Data Principal' },
        {
          kind: 'list',
          items: [
            {
              lead: 'Access',
              text: '— a summary of the personal data we process about you, what we do with it, and who we’ve shared it with.',
            },
            {
              lead: 'Correction and completion',
              text: '— to have inaccurate or incomplete data corrected, completed or updated.',
            },
            {
              lead: 'Erasure',
              text: '— to have your data deleted, unless we are required by law to keep it.',
            },
            {
              lead: 'Withdraw consent',
              text: '— as easily as you gave it. Withdrawal doesn’t undo processing that already happened lawfully.',
            },
            {
              lead: 'Nominate',
              text: '— to name someone who can exercise these rights on your behalf if you die or become incapacitated.',
            },
            {
              lead: 'Grievance redressal',
              text: '— to raise a complaint with our Grievance Officer and, if unresolved, with the Data Protection Board of India. See §14.',
            },
          ],
        },
        {
          kind: 'p',
          text: 'The DPDP Act also places duties on you: don’t impersonate someone else when making a request, don’t suppress material information, and don’t file a frivolous or false complaint. We mention it because the Act does.',
        },
        { kind: 'sub', heading: 'If you are in the UK, EEA or Switzerland' },
        {
          kind: 'p',
          text: 'You additionally have the right to restrict processing, to object to processing based on legitimate interests or direct marketing, to data portability in a machine-readable format, and not to be subject to solely automated decision-making with legal or similarly significant effects. You may complain to your national supervisory authority — in the UK, the Information Commissioner’s Office at ico.org.uk.',
        },
        { kind: 'sub', heading: 'If you are in the UAE, Australia, Singapore or elsewhere' },
        {
          kind: 'p',
          text: 'We extend the access, correction, deletion and objection rights above to everyone, regardless of location. Where your local law gives you more, your local law wins.',
        },
        { kind: 'sub', heading: 'How to make a request' },
        {
          kind: 'p',
          text: `Email ${LEGAL_EMAILS.privacy} with the words “Privacy request” in the subject line and tell us what you want. We will:`,
        },
        {
          kind: 'steps',
          items: [
            'Acknowledge within 3 working days.',
            'Verify your identity — proportionately. For a request tied to an email address we already hold, replying from that address is usually enough. We will not demand ID documents we don’t need.',
            'Respond substantively within 30 days. If a request is complex we may take up to 60 days, and we will tell you why before the first 30 are up.',
          ],
        },
        {
          kind: 'p',
          text: 'There is no charge. If a request is manifestly unfounded or repetitive we may decline it, and we will explain our reasoning in writing so you can challenge it.',
        },
      ],
    },
    {
      n: '11',
      heading: 'Children’s data',
      plain:
        'Our services are for businesses. We don’t knowingly collect data from anyone under 18, and we don’t run behavioural advertising aimed at children.',
      blocks: [
        {
          kind: 'p',
          text: 'Zefract sells business-to-business services. This website is not directed at children, and we do not knowingly collect personal data from anyone under 18 years of age — the threshold set by the DPDP Act, which is higher than the age used in many other jurisdictions.',
        },
        {
          kind: 'p',
          text: `We do not track children, run behavioural advertising directed at them, or process children’s data for profiling. If we learn we have collected data from a child without verifiable consent from a parent or lawful guardian, we will delete it promptly. If you believe this has happened, contact ${LEGAL_EMAILS.privacy}.`,
        },
        {
          kind: 'p',
          text: 'If a client engagement would require processing children’s data — an education or paediatric-care client, for example — we treat that as a separate scoping exercise with its own consent architecture, before any work starts.',
        },
      ],
    },
    {
      n: '12',
      heading: 'Data we handle on behalf of clients',
      plain:
        'When we run your ads, email or CRM, your customers’ data stays yours. We follow your instructions, we don’t reuse the data, and we hand it all back and delete our copies when we’re done.',
      blocks: [
        {
          kind: 'p',
          text: 'Running marketing and building software means touching data that belongs to our clients and their customers. For that data we are a Data Processor under the DPDP Act and a processor under the GDPR. Our commitments:',
        },
        {
          kind: 'list',
          items: [
            'We act only on documented instructions from the client, set out in the Statement of Work or a data processing addendum.',
            'We do not use client data for our own purposes. Not for benchmarking, not for lookalike audiences on another account, not for training models, not for prospecting.',
            'We keep it separated. Client data lives in the client’s own accounts and workspaces wherever technically possible, not pooled in ours.',
            'We flag unlawful instructions. If an instruction would breach data protection law — uploading a purchased list, for example — we say so in writing and decline.',
            'We assist with rights requests. If one of your customers asks you to delete their data, we help you honour it inside the systems we operate.',
            'We return and delete. At the end of an engagement we hand over what’s ours to hand over and delete our working copies, on the timeline in §8.',
          ],
        },
        {
          kind: 'p',
          text: `Clients who need a formal Data Processing Addendum — including GDPR Article 28 terms, our sub-processor list, Standard Contractual Clauses and a security schedule — can request one at ${LEGAL_EMAILS.privacy}. We will sign one. We’d rather you asked.`,
        },
        {
          kind: 'p',
          text: 'If you are a customer of one of our clients and want your data accessed, corrected or deleted, please contact that business directly. They control it. If you’re not sure who to contact, write to us and we’ll point you in the right direction without disclosing anything we shouldn’t.',
        },
      ],
    },
    {
      n: '13',
      heading: 'If something goes wrong',
      plain:
        'If there’s a breach affecting your data, we tell you — in plain language, quickly, with what happened and what to do about it. No burying it in a status page.',
      blocks: [
        { kind: 'p', text: 'In the event of a personal data breach, we will:' },
        {
          kind: 'steps',
          items: [
            'Contain the incident and assess what data and whose data is affected.',
            'Notify affected individuals without delay, in plain language: what happened, what data was involved, what the likely consequences are, what we have done, what you can do to protect yourself, and who to contact.',
            'Notify the Data Protection Board of India within the timelines set by the DPDP Rules, and follow up with the detailed report within the period the Rules allow.',
            'Notify affected clients without undue delay where the breach touches data we process for them, so they can meet their own obligations. Contractually, that means within 24 hours of becoming aware.',
            'Notify supervisory authorities in other jurisdictions — such as the ICO within 72 hours — where their law applies.',
            'Publish a post-incident summary of what we changed, where doing so does not create further risk.',
          ],
        },
        {
          kind: 'p',
          text: `We maintain an incident response procedure and access logs sufficient to investigate. Suspected security issues can be reported to ${LEGAL_EMAILS.security}. We will acknowledge a good-faith report within 3 working days and will not pursue legal action against researchers who report responsibly and do not access or exfiltrate data beyond what is needed to demonstrate the issue.`,
        },
      ],
    },
    {
      n: '14',
      heading: 'Grievance Officer and complaints',
      plain:
        'A named human is responsible for privacy complaints here. If we don’t sort it out, you can escalate to the regulator — and here’s how.',
      blocks: [
        {
          kind: 'p',
          text: 'As required by the DPDP Act and by the Information Technology (Intermediary Guidelines) framework, we publish the name and contact details of the person responsible for handling privacy grievances.',
        },
        {
          kind: 'defs',
          items: [
            { label: 'Grievance Officer', value: GRIEVANCE_OFFICER.name },
            { label: 'Designation', value: GRIEVANCE_OFFICER.designation },
            {
              label: 'Email',
              value: GRIEVANCE_OFFICER.email,
              href: `mailto:${GRIEVANCE_OFFICER.email}`,
            },
            { label: 'Phone', value: GRIEVANCE_OFFICER.phone },
            { label: 'Address', value: COMPANY.registeredOffice },
            {
              label: 'Response time',
              value: 'Acknowledged in 3 working days, resolved within 30 days',
            },
          ],
        },
        {
          kind: 'p',
          lead: 'Escalating.',
          text: 'If we don’t resolve your grievance to your satisfaction, you may complain to the Data Protection Board of India, which is constituted and accepting complaints. The Board expects you to have raised the matter with us first, so please give us the chance.',
        },
        {
          kind: 'p',
          text: 'If you are in the UK or EEA, you may instead complain to your supervisory authority. Nothing in this policy removes that right.',
        },
      ],
    },
    {
      n: '15',
      heading: 'Changes to this policy',
      plain:
        'We’ll update this page when the law or our tools change. Meaningful changes get emailed to clients and subscribers — not slipped in quietly.',
      blocks: [
        {
          kind: 'p',
          text: 'We review this policy at least once a year and whenever we adopt a new tool, enter a new market, or the law changes materially. The “last updated” date at the top always reflects the current version.',
        },
        {
          kind: 'p',
          text: 'For material changes — a new purpose, a new category of recipient, a shorter or longer retention period — we will give notice at least 14 days before the change takes effect, by email to clients and subscribers and by a notice on this page. Where a change requires fresh consent under the DPDP Act, we will ask for it rather than assume it.',
        },
        {
          kind: 'p',
          text: 'Previous versions are archived and available on request, so you can see exactly what changed and when.',
        },
      ],
    },
    {
      n: '16',
      heading: 'Contact us',
      blocks: [
        {
          kind: 'p',
          text: 'Questions about this policy, a rights request, or something you think we’ve got wrong:',
        },
        {
          kind: 'defs',
          items: [
            {
              label: 'Privacy',
              value: LEGAL_EMAILS.privacy,
              href: `mailto:${LEGAL_EMAILS.privacy}`,
            },
            {
              label: 'Grievances',
              value: LEGAL_EMAILS.grievance,
              href: `mailto:${LEGAL_EMAILS.grievance}`,
            },
            {
              label: 'Security',
              value: LEGAL_EMAILS.security,
              href: `mailto:${LEGAL_EMAILS.security}`,
            },
            { label: 'General', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
            { label: 'Post', value: `${SITE.legalName}, ${COMPANY.registeredOffice}` },
          ],
        },
        {
          kind: 'p',
          text: 'We read everything sent to these addresses. A real person replies.',
        },
      ],
    },
  ],
}

/**
 * The editorial note the client's document carries inside section 14, kept here
 * because it is addressed to whoever finalises the policy and asks in its own
 * first words to be removed before publishing. Verbatim:
 *
 *   "Editorial note — remove before publishing: the DPDP Rules were notified on
 *   13 November 2025 with full compliance required by 13 May 2027. The Board is
 *   already operational and complaints can already be filed, so a named Grievance
 *   Officer should be live at launch rather than deferred to 2027. If Zefract is
 *   later designated a Significant Data Fiduciary, a Data Protection Officer based
 *   in India and annual DPIAs and audits become mandatory — revisit this section
 *   then."
 *
 * The action it asks for is the GRIEVANCE_OFFICER placeholders in content/site.ts.
 */

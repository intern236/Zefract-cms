import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { BackToTop } from '@/components/layout/back-to-top'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { MotionProvider } from '@/components/motion/motion-provider'
import { CursorRing } from '@/components/motion/cursor-ring'
import { ConsentBanner } from '@/components/layout/consent-banner'
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from '@/components/analytics/google-tag-manager'
import { OrganizationSchema } from '@/lib/schema'
import { ANALYTICS, SITE } from '@/content/site'
import { PAGE_META } from '@/content/meta'
import { absoluteUrl } from '@/lib/url'

/* The home page has no metadata export of its own: its title and description ARE the
   layout's default and description, below. So the authored row for '/' is applied here
   rather than in app/page.tsx, which is also what keeps `title.default` and `openGraph`
   saying the same thing. */
const HOME = PAGE_META['/']

/**
 * The two typefaces, SELF-HOSTED rather than fetched from Google at build time.
 *
 * WHY THIS CHANGED FROM next/font/google. That loader downloads the files from
 * fonts.googleapis.com DURING THE BUILD. When it cannot reach them it does not
 * fail — it warns and silently substitutes a fallback, so the build goes green
 * and the site ships in the wrong typeface. That is the worst failure shape
 * available: no error, no broken page, just a site that quietly stops looking
 * like itself. It has already happened here once.
 *
 * The files are the SAME ONES Google serves — pulled from the exact gstatic URLs
 * its stylesheet points at, latin subset, and committed. Nothing about the
 * rendered type changes; what changes is that a build can no longer depend on a
 * third party being reachable. That matters most on the deploy host, where a
 * transient DNS or egress failure would otherwise ship a fallback font to
 * production with nobody watching the log.
 *
 * `--font-jakarta` and `--font-jetbrains` are unchanged, so globals.css and every
 * `font-mono` utility keep working untouched.
 */
const jakarta = localFont({
  /* The VARIABLE font, one file covering 200-800. The previous
     `Plus_Jakarta_Sans({ subsets: ['latin'] })` with no `weight` resolved to
     exactly this, which is why the site can use font-medium through
     font-extrabold from a single 26KB request. `weight` is the supported RANGE,
     not a single value — a fixed number here would collapse every weight on the
     site to one. */
  src: './fonts/plus-jakarta-sans-latin-variable.woff2',
  weight: '200 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-jakarta',
  /* The metrics Next uses to build a size-adjusted fallback, so the swap from
     the system font to this one shifts the text as little as possible. Naming it
     is what keeps `display: swap` from costing layout shift. */
  fallback: ['system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
})

const jetbrains = localFont({
  /* 500 only — the single weight every mono label on this site uses. Matches the
     previous `weight: ['500']` exactly; shipping the whole family would be four
     files nothing asks for. */
  src: './fonts/jetbrains-mono-latin-500.woff2',
  weight: '500',
  style: 'normal',
  display: 'swap',
  variable: '--font-jetbrains',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
})

export const metadata: Metadata = {
  /* Every relative URL in every page's metadata is resolved against this — the
     canonicals, the OG images, the lot — so it is the single hinge the whole site's
     host canonicalisation turns on. Through absoluteUrl so it carries the normalised
     apex origin and cannot pick up a trailing slash. */
  metadataBase: new URL(absoluteUrl('/')),
  title: {
    /* The authored home title, used verbatim. It already reads as a complete title, so
       unlike `template` below it gets no site name appended. */
    default: HOME.title,
    template: `%s | ${SITE.name}`,
  },
  description: HOME.description,
  /* Google ignores the keywords meta tag and has since 2009; it is here because it costs
     nothing and was asked for. The keyword work that actually ranks is the titles, the
     descriptions, and the alias phrasing written into the page copy itself — see `aliases`
     in content/services.overrides.ts. Pages with sharper terms set their own list, which
     REPLACES this one (metadata fields do not merge); everything else inherits it. */
  keywords: [
    SITE.name,
    'software development company',
    'digital engineering',
    'AI and automation',
    'cloud modernization',
    'digital marketing agency',
    'UX design',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: HOME.title,
    description: HOME.description,
    /* Matches the `canonical: '/'` above exactly — Next renders that as the bare
       origin, so og:url must not carry a trailing slash either. */
    url: absoluteUrl('/'),
    locale: 'en_US',
  },
  /* Card type ONLY, no title or description, and that is the fix rather than an omission.
     Metadata objects replace rather than merge, so a title here is inherited wholesale by
     every page that does not set its own `twitter` — which was all of them — stamping the
     generic site title onto each page's X card. With only `card` set, X falls back to the
     page's own og:title, og:description and og:image, which are per-page already. */
  twitter: {
    card: 'summary_large_image',
  },
  robots: { index: true, follow: true },
  /**
   * Google Search Console ownership token, rendered into the document head as
   * `<meta name="google-site-verification" content="…">`.
   *
   * THE ENVIRONMENT WINS WHERE IT IS SET, so a deploy preview or a second property can be
   * verified without touching the repository. Where it is not, the token in content/site.ts
   * is used — see the note there for why a public-by-definition value lives in the content
   * layer rather than in a hosting dashboard, which is the same call ANALYTICS.gtmId makes.
   *
   * STILL SPREAD CONDITIONALLY. With both sources empty this renders no tag at all rather
   * than an empty one, which is what an unverifiable `content=""` would be.
   *
   * ON EVERY PAGE, NOT ONLY THE HOME PAGE. Search Console asks for the tag on the home page
   * and checks it there; metadata declared in the root layout is inherited by every route,
   * and no page sets `verification` of its own, so the tag is present site-wide. A superset
   * of what is required, and it means verification survives the home page being rebuilt.
   */
  ...(process.env.GOOGLE_SITE_VERIFICATION || ANALYTICS.googleSiteVerification
    ? {
        verification: {
          google:
            process.env.GOOGLE_SITE_VERIFICATION || ANALYTICS.googleSiteVerification,
        },
      }
    : {}),
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} ${jetbrains.variable} h-full`}
    >
      <head>
        {/* Scroll reveals start at opacity 0 and are animated in by Motion. If JS
            never runs, that would leave most of the page invisible - so undo it.

            The carousel's arrows and dots go the other way: the track itself is a
            native scroll container and still works, but the controls that drive it
            cannot, so they are hidden rather than left sitting there dead. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}[data-carousel-controls]{display:none !important}`}</style>
        </noscript>
        <GoogleTagManager />
      </head>
      {/* suppressHydrationWarning is here for browser extensions, not for our own
          markup. Grammarly and similar tools stamp attributes onto <body> before
          React hydrates (data-gr-ext-installed, data-new-gr-c-s-check-loaded),
          which React then reports as a server/client mismatch on every page load
          for anyone who has one installed.

          Scope matters: this suppresses mismatch warnings for THIS element's own
          attributes only, not for its subtree. A genuine hydration bug in any
          component below still surfaces normally - which is why it goes here and
          not on <html>, and never on a component that renders real content. */}
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        {/* First thing in the body, where GTM's install instructions put it. */}
        <GoogleTagManagerNoScript />
        <OrganizationSchema />
        {/* data-skip-link is how <BackToTop> finds this. It hands focus here after a
            KEYBOARD activation, so that going back to the top moves the tab position
            there too rather than leaving it stranded on a button that just hid itself.
            An attribute rather than an `a[href="#main"]` selector, so the coupling is
            greppable and does not break the day this href changes. */}
        <a
          href="#main"
          data-skip-link
          className="sr-only rounded-full bg-ink px-5 py-3 text-sm text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          {/* The two floating controls, in the order they stack up the corner. Both are
              `position: fixed`, so DOM order sets only the tab order, not the layout —
              WhatsApp comes second so a keyboard user reaches "back to top" first, which is
              the one that acts on the page they are already reading. */}
          <BackToTop />
          <WhatsAppButton />
          <CursorRing />
          {/* LAST IN THE DOCUMENT, WHICH IS WHERE A CONSENT NOTICE BELONGS. It is a labelled
              region rather than a dialog and it does not take focus on a first visit, so
              putting it earlier would only push it in front of the skip link and the header
              for every keyboard user on every page. It renders nothing at all until the
              browser has read the cookie — see the component for why that is what keeps the
              whole site statically rendered. */}
          <ConsentBanner />
        </MotionProvider>
      </body>
    </html>
  )
}

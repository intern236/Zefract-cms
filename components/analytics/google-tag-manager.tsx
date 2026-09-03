import Script from 'next/script'

import { ANALYTICS } from '@/content/site'

/**
 * Google Tag Manager, split into the two halves GTM's own install instructions ask for.
 *
 * The container is the client's (GTM-KX4R5W99, supplied with the SEO brief). Everything it
 * actually fires, whether that is GA4, Ads or something added next month, is configured
 * inside GTM rather than here. That is the point of a tag manager: this file should not
 * need editing again.
 *
 * The ID lives in `content/site.ts` rather than an environment variable on purpose. A GTM
 * container ID is public by definition, since it ships in the page source of every site
 * that uses one, so there is nothing to protect. An unset variable in a hosting dashboard
 * is the usual reason a tag silently stops firing after a deploy.
 */

/**
 * The `<head>` half: the loader.
 *
 * `afterInteractive` rather than `beforeInteractive`, deliberately. GTM is a marketing tag,
 * not something the page needs in order to render, and `beforeInteractive` would put it in
 * front of the app's own JavaScript in the download order. `afterInteractive` still runs on
 * the initial page load, just once hydration has started, and it is the same strategy Next's
 * own `@next/third-parties` GoogleTagManager uses.
 *
 * The `id` is required for inline scripts: Next uses it to track this one and guarantee it
 * executes exactly once, including across client-side route changes.
 */
export function GoogleTagManager() {
  return (
    <Script id="gtm-loader" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${ANALYTICS.gtmId}');`}
    </Script>
  )
}

/**
 * The `<body>` half: the no-JavaScript fallback.
 *
 * Goes immediately after the opening `<body>` tag, per GTM's instructions. It is the only
 * way a visitor with JavaScript disabled registers at all, and a plain pageview tag still
 * fires through it.
 *
 * Written as JSX rather than pasted in as the raw HTML string so the attributes go through
 * React normally: `style` is an object, and the iframe gets a `title` that the raw snippet
 * omits, which is what stops it being flagged as an unlabelled frame by an accessibility
 * audit.
 */
export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${ANALYTICS.gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  )
}

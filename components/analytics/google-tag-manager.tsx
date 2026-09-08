import Script from 'next/script'

import { ANALYTICS } from '@/content/site'
import { CONSENT_COOKIE, CONSENT_GRANTED_PREFIX } from '@/lib/consent'

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
 *
 * IT NO LONGER LOADS UNGATED. The loader below now opens with a Consent Mode v2 default of
 * `denied` for every advertising and analytics storage type, which is the half of the
 * consent gate that has to exist here rather than in <ConsentBanner> — see the note on the
 * loader itself for why the ordering is not negotiable.
 */

/**
 * The `<head>` half: consent defaults, then the loader.
 *
 * `afterInteractive` rather than `beforeInteractive`, deliberately. GTM is a marketing tag,
 * not something the page needs in order to render, and `beforeInteractive` would put it in
 * front of the app's own JavaScript in the download order. `afterInteractive` still runs on
 * the initial page load, just once hydration has started, and it is the same strategy Next's
 * own `@next/third-parties` GoogleTagManager uses.
 *
 * The `id` is required for inline scripts: Next uses it to track this one and guarantee it
 * executes exactly once, including across client-side route changes.
 *
 * WHY THE CONSENT DEFAULTS ARE IN THIS SAME STRING rather than in a <Script> of their own.
 * A Consent Mode default only counts if it is set BEFORE the container loads; arriving
 * afterwards it is a late correction, and any tag that already fired has already written
 * its cookie. Two sibling <Script> tags with the same strategy would almost certainly run
 * in order, and "almost certainly" is not a basis for the one instruction whose lateness is
 * a compliance failure rather than a bug. One script cannot race itself.
 *
 * WHAT `denied` ACTUALLY DOES. It is not the same as not loading GTM. The container still
 * loads and Google's own tags still run, but they run in the cookieless mode Consent Mode
 * defines: no identifiers written, no `_ga` cookie, no ad storage, only anonymous pings
 * that carry no way to recognise the visitor again. That is what lets section 05 of the
 * privacy policy say non-essential cookies are off by default and be telling the truth,
 * while still leaving the container in place to be told the moment consent arrives.
 *
 * `functionality_storage` AND `security_storage` ARE GRANTED, and that is not a loophole.
 * They are the strictly necessary categories the policy's own table lists as needing no
 * consent: remembering the visitor's cookie choice is itself one of them.
 *
 * THE COOKIE IS READ HERE, SYNCHRONOUSLY, and it is what a returning visitor's experience
 * depends on. Without it, someone who accepted six months ago would load every page in the
 * denied state until React hydrated and <ConsentBanner> pushed an update, losing the
 * pageview that prompted the visit. The regular expression and the prefix it matches are
 * built from lib/consent.ts rather than typed out, so renaming the cookie or raising the
 * banner version cannot leave this line behind. It is wrapped in try/catch because a
 * throw here would take the container down with it, and no analytics is a worse outcome
 * than analytics that starts a moment late.
 *
 * NO `wait_for_update`. Google's snippet often carries one, and it exists for gates that
 * resolve consent asynchronously — a CMP fetching a record over the network. This one
 * resolves it in the same synchronous block, before gtm.js is even requested, so there is
 * nothing to wait for and a wait would only delay the first tag by that many milliseconds.
 */
export function GoogleTagManager() {
  return (
    <Script id="gtm-loader" strategy="afterInteractive">
      {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','personalization_storage':'denied','functionality_storage':'granted','security_storage':'granted'});
try{var zfc=document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]*)/);
if(zfc&&decodeURIComponent(zfc[1]).indexOf('${CONSENT_GRANTED_PREFIX}')===0){gtag('consent','update',{'ad_storage':'granted','ad_user_data':'granted','ad_personalization':'granted','analytics_storage':'granted','personalization_storage':'granted'})}}catch(e){}
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
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
 *
 * IT IS OUTSIDE THE CONSENT GATE, AND IT HAS TO BE. Consent Mode is JavaScript; this frame
 * is what runs when there is none, so there is no mechanism here to gate with. What that
 * leaves is narrow rather than nothing: a visitor with JavaScript disabled cannot be shown
 * a banner, cannot answer one, and cannot have an answer stored, so the only two options
 * are this frame or no measurement at all for that visitor. Worth knowing it is a deliberate
 * edge and not an oversight — if a strict reading is ever required, delete this component
 * and the <GoogleTagManagerNoScript /> call in app/layout.tsx, and the site measures
 * nothing without JavaScript.
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

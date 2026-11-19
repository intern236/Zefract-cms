import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Build output directory, overridable per-process.
   *
   * Defaults to `.next`, so nothing changes for `npm run dev` or a normal build.
   * The escape hatch exists because a production build and a running dev server
   * otherwise share one `.next` root: `next dev` writes `.next/dev`, `next build`
   * writes `.next/build`, and BOTH rewrite the manifests at the root. On Windows,
   * where an open file is locked, that collides — Turbopack writes a `.tmp.xxx` file
   * and renames it, the rename hits the lock, and you get
   * `EPERM: operation not permitted, rename ...` followed by
   * `Could not find files for /_error in .next/build-manifest.json`.
   *
   * So any verification build should run isolated:
   *   ZEFRACT_DIST_DIR=.next-verify npm run build
   *   ZEFRACT_DIST_DIR=.next-verify npx next start -p 3100
   */
  distDir: process.env.ZEFRACT_DIST_DIR || '.next',
  /**
   * URLs serve WITHOUT a trailing slash, and `/about/` redirects to `/about`.
   *
   * STATED EXPLICITLY THOUGH `false` IS ALREADY NEXT'S DEFAULT. This is the other half of
   * the canonicalisation the rest of this file enforces: every canonical tag, sitemap entry,
   * OG url and JSON-LD URL the site publishes is written without a trailing slash (see
   * lib/url.ts, which strips one defensively), so the SERVER has to agree or `/about/` and
   * `/about` are two URLs for one page — the same duplicate-content problem the www rule
   * below exists to prevent, one character further along.
   *
   * Relying on the default would leave that agreement undocumented and one keystroke from
   * being reversed: flipping this to `true` would silently invalidate every canonical on the
   * site. Written down, it is greppable and the diff would be obvious.
   *
   * NOTE THE REDIRECT IS 308, NOT 301 — it is Next's own, emitted before any rule in this
   * file, and it is not configurable here. 308 preserves the request method; search engines
   * treat it exactly as they treat 301. Making it a literal 301 would mean intercepting in
   * proxy.ts before Next's own handler, which is real complexity for no ranking difference.
   *
   * `skipTrailingSlashRedirect` must stay unset. Setting it would serve BOTH forms with 200,
   * which is the one outcome this is here to prevent.
   */
  trailingSlash: false,
  images: {
    /**
     * Allowed `quality` values for next/image.
     *
     * Next only serves qualities on this list, so a `quality` prop outside it is a
     * build error rather than a silent fallback. 55 exists for the bento's team
     * photo, which is rendered grayscale, at 78% brightness, under a dark gradient -
     * three treatments that throw away exactly the detail a high JPEG quality pays
     * for. It is also that page's LCP element on mobile, so the bytes matter.
     * 75 is Next's default and stays for everything else.
     */
    qualities: [55, 75],
  },
  /**
   * Response headers.
   *
   * WHY THESE EXIST. The admin panel's own guards are sound, but every one of
   * them answers "is this the admin?" — none of them answers "is the admin
   * being shown this page by someone else". Without a framing rule, an attacker
   * can put /admin/blog in an invisible iframe on their own site, float their
   * own buttons over it, and let a logged-in admin click Delete for them; the
   * session cookie rides along because it is a top-level GET, not a
   * cross-site POST, so SameSite=Lax does not help. `frame-ancestors 'none'`
   * is the fix, and it is one line.
   *
   * SITE-WIDE, NOT /admin-ONLY, because none of these pages is meant to be
   * embedded anywhere and a rule with an exception is a rule someone has to
   * remember. This is deliberately NOT a full Content-Security-Policy: the app
   * ships inline styles and Next's own inline bootstrap script, so a script-src
   * worth having needs per-request nonces threaded through the document — real
   * work with real breakage, and a separate decision from closing the framing
   * hole today.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          /* The modern rule and its pre-CSP predecessor. Old browsers honour
             only the second, current ones prefer the first; sending both costs
             nothing and leaves no gap. */
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Frame-Options', value: 'DENY' },
          /* No MIME sniffing anywhere. The blog-image route already sets this
             per-response; this makes it the default for everything else. */
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          /**
           * HSTS — the other half of the http -> https redirect.
           *
           * A REDIRECT ALONE LEAVES A HOLE. It only works once the insecure request has
           * already been made, so the very first visit still goes out over http and can
           * be intercepted before the 301 is ever seen. This tells the browser to rewrite
           * http to https ITSELF, before anything leaves the machine, for a year after
           * the last time it heard from us.
           *
           * DELIBERATELY WITHOUT `includeSubDomains` AND `preload`, and that is a staged
           * choice rather than an oversight. HSTS is close to irreversible: backing it out
           * means serving max-age=0 and waiting for every browser that cached it to come
           * back. `includeSubDomains` extends that promise to every subdomain at once,
           * including any that is not on https yet, and `preload` hard-codes the domain
           * into browser binaries and takes weeks to undo. Neither is safe to assert on
           * someone else's DNS without checking it first.
           *
           * TO STRENGTHEN, once every subdomain is confirmed https-only, append
           * `; includeSubDomains` — and only then consider `; preload` plus submission to
           * hstspreload.org. Note www must keep a valid certificate either way, since the
           * redirect above sends browsers to https on that host before they reach the apex.
           *
           * Ignored when served over http, per the spec, so it costs nothing on the
           * requests the redirect is still catching.
           */
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          /* Cross-origin requests get the origin only, never the path — so an
             outbound link from /admin/blog/<id>/edit cannot hand a third party
             a post id, while same-origin navigation keeps the full referrer
             that analytics and the server rely on. */
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          /* Nothing here uses a camera, a microphone or location, so nothing —
             including anything that ever gets injected into a post — may ask. */
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  /**
   * Appendix B is the source of truth for service URLs, and it lists `/services/ai-search`
   * as one page. That service is now two — see SPLITS in scripts/generate-services.mjs — so
   * the old URL has no route and would 404 for anyone holding a link to it.
   *
   * It points at GEO rather than AEO because GEO inherited three of the original page's
   * four sub-service groups, so it is the closer match for whatever the old URL ranked for.
   * Permanent, because the split is not going to be reversed.
   */
  async redirects() {
    return [
      /**
       * www -> apex, permanently.
       *
       * The apex is the canonical host (content/site.ts), so every canonical tag,
       * sitemap entry and JSON-LD URL this site publishes says `zefract.com`. If the
       * www host also SERVES those pages rather than redirecting, every page becomes a
       * duplicate of itself under a second hostname — which is the exact condition the
       * canonicals exist to resolve, and the one Search Console reports as "Duplicate
       * without user-selected canonical".
       *
       * IN THE REPOSITORY RATHER THAN ONLY IN A DASHBOARD. Host canonicalisation was
       * previously a comment asking whoever deployed to set it in Netlify, which is a
       * control nobody can review in a diff and nobody notices the loss of. This is the
       * same rule, versioned, and it travels to any host.
       *
       * IT CANNOT LOOP ON ITS OWN: the `has` clause fires only when the request's Host
       * is exactly `www.zefract.com`, and the destination is a different host that
       * therefore never matches again. It CAN loop against a misconfigured platform —
       * if Netlify's primary domain is left as www, Netlify sends apex -> www and this
       * sends www -> apex. The primary domain must be `zefract.com`. Deploy previews
       * are unaffected: they answer on *.netlify.app, which does not match.
       *
       * Netlify's own primary-domain redirect does the same job when it is set
       * correctly, so on that host this is redundant and harmless. It is what keeps the
       * behaviour true on a platform that has no such setting.
       */
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.zefract.com' }],
        /* Absolute, and https rather than protocol-relative, so an insecure request to
           the www host lands on the canonical URL in ONE hop rather than being handed to
           the http -> https rule below for a second. Chained redirects cost a round trip
           and dilute the signal a permanent redirect is meant to send. */
        destination: 'https://zefract.com/:path*',
        /* 301, stated explicitly, rather than `permanent: true`. They are not the same
           number: Next emits 308 for `permanent`, which preserves the request method
           where 301 historically allowed a POST to become a GET. Search engines treat the
           two identically, but 301 is what SEO tooling looks for and what was asked for,
           and the Redirect type takes one of `permanent` or `statusCode`, never both. */
        statusCode: 301,
      },
      /**
       * http -> https, on the canonical host.
       *
       * NEXT CANNOT MATCH ON PROTOCOL. `RouteHas` is `header | cookie | query | host`
       * (next/dist/lib/load-custom-routes.d.ts) with no protocol type, so the scheme has
       * to be read out of the `x-forwarded-proto` header a terminating proxy sets.
       *
       * THE HOST CONDITION IS NOT DECORATION — IT IS WHAT KEEPS `npm run dev` WORKING.
       * Next synthesises that header when it is absent, in base-server.js:
       *
       *     req.headers['x-forwarded-proto'] ??= isHttps ? 'https' : 'http'
       *
       * and `isHttps` falls back to `socket.encrypted`, which is false for a plain
       * `next dev`. So on http://localhost:3000 the header IS `http`, and a rule keyed on
       * that alone would match every local request and redirect the developer to
       * production. Requiring the host to be `zefract.com` as well means it can only ever
       * fire on the deployed site; `has` is an AND, and localhost matches neither.
       *
       * ON NETLIFY THIS NEVER RUNS, and that is expected. TLS terminates at the edge and
       * the platform already redirects http to https before a function is invoked, so
       * this is the version-controlled backstop for that behaviour rather than the thing
       * doing the work — the same relationship the www rule above has with the primary
       * domain setting. It earns its place on any host that forwards http through.
       *
       * The www host is deliberately absent here: the rule above already catches it and
       * sends it straight to the secure apex.
       */
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'zefract.com' },
          { type: 'header', key: 'x-forwarded-proto', value: 'http' },
        ],
        destination: 'https://zefract.com/:path*',
        statusCode: 301,
      },
      {
        source: '/services/ai-search',
        destination: '/services/ai-search-geo',
        permanent: true,
      },
      /**
       * Appendix B lists this service as `/services/email-crm-automation`. It is now
       * `/services/email-marketing`: the client's own document is titled "Email Marketing
       * Services" and treats CRM as one line inside its data-and-tracking section rather
       * than as a third of the name. Same page, same four Appendix D groups, new name and
       * URL — so this is a rename with a redirect, not a page that went away.
       */
      {
        source: '/services/email-crm-automation',
        destination: '/services/email-marketing',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/cms/login',
        permanent: true,
      },
      {
        source: '/invite/:token',
        destination: '/cms/login?invite=:token',
        permanent: false,
      },
      {
        source: '/reset/:token',
        destination: '/cms/reset/:token',
        permanent: false,
      },
      {
        source: '/:workspace/posts/:path*',
        destination: '/cms/:workspace/posts/:path*',
        permanent: false,
      },
      {
        source: '/:workspace/posts',
        destination: '/cms/:workspace/posts',
        permanent: false,
      },
      {
        source: '/:workspace/inbox/:path*',
        destination: '/cms/:workspace/inbox/:path*',
        permanent: false,
      },
      {
        source: '/:workspace/inbox',
        destination: '/cms/:workspace/inbox',
        permanent: false,
      },
      {
        source: '/:workspace/settings',
        destination: '/cms/:workspace/settings',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;

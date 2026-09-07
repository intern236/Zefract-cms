import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/admin-session'
import { isStagingHost } from '@/lib/staging'

/**
 * Two jobs, both of them routing-layer decisions that need the request in hand.
 *
 * `proxy.ts`, not `middleware.ts`, since Next 16 renamed the convention; same
 * behaviour, new name. Runs on the edge runtime, which is why it imports only
 * lib/admin-session.ts (jose, edge-safe) and lib/staging.ts (which reaches no
 * further than content/site.ts and lib/todo.ts, both plain data), and never
 * lib/admin-auth.ts (bcrypt and the Mongo driver, Node-only).
 *
 * 1. KEEPS LOGGED-OUT VISITORS OUT OF /admin.
 *
 * THIS IS CONVENIENCE, NOT THE CONTROL. It exists so a logged-out admin gets a
 * login form instead of an error, and so drive-by crawlers of /admin see a
 * redirect. The actual security boundary is in the server: the protected admin
 * layout calls requireAdmin(), and every server action and admin route handler
 * re-verifies the session before doing anything. Routing-layer auth has been
 * bypassed before (the x-middleware-subrequest bug), so nothing may depend on
 * this file being here.
 *
 * /admin/login passes through unconditionally, since it is the one admin page a
 * logged-out visitor is supposed to reach, and redirecting it to itself is a loop.
 *
 * 2. MARKS EVERY RESPONSE ON A NON-CANONICAL HOST `noindex, nofollow`.
 *
 * WHY THE MATCHER IS NOW SITE-WIDE, where it used to be `/admin/:path*`. The
 * indexing decision applies to every page, not to one subtree, and the host it
 * depends on is only knowable per request. Widening the matcher is what that
 * costs; the admin check is gated on the path instead, so its behaviour is
 * unchanged for every route it used to run on and for every route it did not.
 *
 * WHY HERE RATHER THAN next.config.ts. A `headers()` entry with
 * `missing: [{ type: 'host', value: 'zefract.com' }]` would express this with no
 * runtime cost at all, and it was the first choice. It was rejected because host
 * values there are matched as patterns: if the match is not anchored, then
 * `staging.zefract.com` CONTAINS `zefract.com` and would be read as production,
 * failing open, silently, in exactly the case this exists for. An exact string
 * comparison in JavaScript has no such question hanging over it, and the failure
 * mode of getting it wrong here is loud.
 *
 * WHY NOT A `<meta name="robots">` TAG. Same directive, worse coverage: a meta tag
 * reaches HTML documents only, must be threaded through a root `generateMetadata`
 * (which cannot coexist with the static `metadata` export app/layout.tsx already
 * has), and is overridable by any page that sets its own `robots` field. The
 * header applies to every response on the host and cannot be forgotten.
 */

/** `/admin` and everything under it, but not `/administrators`. */
function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

/**
 * The indexing directive, attached to whatever response we are about to return.
 *
 * `nofollow` alongside `noindex` because staging pages link to staging pages: without
 * it a crawler that reached one URL is invited to walk the rest of the host and
 * discover every page it is not supposed to have.
 *
 * Applied to the /admin redirect as well as to pass-through responses. Costs nothing,
 * and means there is no response shape on a staging host that escapes the rule.
 */
function withIndexingPolicy(response: NextResponse, request: NextRequest): NextResponse {
  if (isStagingHost(request.headers.get('host'))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isAdminPath(pathname) && pathname !== '/admin/login') {
    const authed = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)
    if (!authed) {
      return withIndexingPolicy(
        NextResponse.redirect(new URL('/admin/login', request.url)),
        request,
      )
    }
  }

  return withIndexingPolicy(NextResponse.next(), request)
}

/**
 * Every route that serves a document, and nothing else.
 *
 * `_next/` covers the build output and the image optimiser. The second clause drops
 * anything whose last path segment carries an extension, which is the public/ tree
 * (/images/*, /__forms.html) plus the two metadata routes that already answer for
 * themselves: /robots.txt decides its own contents in app/robots.ts, and
 * /sitemap.xml publishes apex URLs on every host because absoluteUrl builds them
 * from SITE.url.
 *
 * The exclusions are about invocation count, not correctness: crawling of those
 * paths on a staging host is already closed off by `Disallow: /`.
 */
export const config = {
  matcher: ['/((?!_next/|.*[.][^/]*$).*)'],
}

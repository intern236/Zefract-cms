import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/admin-session'

/**
 * Keeps logged-out visitors out of /admin at the routing layer.
 *
 * `proxy.ts`, not `middleware.ts` — Next 16 renamed the convention; same
 * behaviour, new name. Runs on the edge runtime, which is why it imports only
 * lib/admin-session.ts (jose, edge-safe) and never lib/admin-auth.ts (bcrypt
 * and the Mongo driver, Node-only).
 *
 * THIS IS CONVENIENCE, NOT THE CONTROL. It exists so a logged-out admin gets a
 * login form instead of an error, and so drive-by crawlers of /admin see a
 * redirect. The actual security boundary is in the server: the protected admin
 * layout calls requireAdmin(), and every server action and admin route handler
 * re-verifies the session before doing anything. Routing-layer auth has been
 * bypassed before (the x-middleware-subrequest bug), so nothing may depend on
 * this file being here.
 *
 * /admin/login passes through unconditionally — it is the one admin page a
 * logged-out visitor is supposed to reach, and redirecting it to itself is a
 * loop.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') return NextResponse.next()

  const authed = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)
  if (!authed) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}

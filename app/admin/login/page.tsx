import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Container } from '@/components/ui/section'
import { verifySession } from '@/lib/admin-auth'
import { LoginForm } from './login-form'

/**
 * The admin sign-in page — the one /admin route a logged-out visitor reaches.
 *
 * Noindex AND out of the sitemap AND disallowed in robots.ts: an admin login
 * URL in a search index is an invitation. The 404 page's canonical lesson
 * applies here too — `alternates` is left empty so nothing inherits the root's
 * canonical onto a page that must not present itself as content.
 */
export const metadata: Metadata = {
  title: 'Admin sign in',
  alternates: {},
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  /* Already signed in? Straight to the posts — showing a login form to a live
     session is only confusing. */
  if (await verifySession()) redirect('/admin/blog')

  return (
    /* data-admin-surface: no decorative cursor ring over a password form —
       same reasoning as the dashboard layout. */
    <section data-admin-surface className="hero-grid relative isolate overflow-clip px-0 pt-36 pb-28 md:pt-44">
      <Container>
        <div className="mx-auto max-w-[440px]">
          <LoginForm />
        </div>
      </Container>
    </section>
  )
}

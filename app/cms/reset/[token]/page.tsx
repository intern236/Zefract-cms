import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/section'
import { PillButton } from '@/components/ui/pill'
import { findReset } from '@cms-logic/lib/auth/reset'
import { ResetPasswordForm } from './reset-form'

export const metadata: Metadata = {
  title: 'Choose a new password',
  referrer: 'no-referrer',
  alternates: {},
  robots: { index: false, follow: false },
}

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const found = await findReset(token)

  return (
    <section data-admin-surface className="hero-grid relative isolate overflow-clip px-0 pt-36 pb-28 md:pt-44">
      <Container>
        <div className="mx-auto max-w-[440px]">
          {found ? (
            <ResetPasswordForm token={token} email={found.email} />
          ) : (
            <div className="card-pop rounded-card border border-line bg-surface p-7 md:p-9">
              <h1 className="text-[24px] font-extrabold tracking-[-0.025em] text-head">
                This link has expired
              </h1>
              <p className="mt-2 text-[15px] text-mut">
                Password reset links work once and expire after 30 minutes. Request a fresh one to choose your password.
              </p>
              <div className="mt-7 border-t border-line pt-6">
                <Link href="/cms/forgot" className="block">
                  <PillButton variant="ink" className="w-full">
                    Send a new link
                  </PillButton>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

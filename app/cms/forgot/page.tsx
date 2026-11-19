import type { Metadata } from 'next'
import { Container } from '@/components/ui/section'
import { ForgotPasswordForm } from './forgot-form'

export const metadata: Metadata = {
  title: 'Reset password',
  alternates: {},
  robots: { index: false, follow: false },
}

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string }>
}) {
  const { workspace } = await searchParams

  return (
    <section data-admin-surface className="hero-grid relative isolate overflow-clip px-0 pt-36 pb-28 md:pt-44">
      <Container>
        <div className="mx-auto max-w-[440px]">
          <ForgotPasswordForm workspace={typeof workspace === 'string' ? workspace : undefined} />
        </div>
      </Container>
    </section>
  )
}

import type { Metadata } from 'next'
import { LegalPage } from '@/components/ui/legal-page'
import { authoredMetadata } from '@/lib/seo'
import { TERMS } from '@/content/terms'

export const metadata: Metadata = {
  ...authoredMetadata('/terms'),
  /* Indexable now, for the reasons set out on /privacy. */
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <LegalPage
      doc={TERMS}
      trail={[
        { name: 'Home', href: '/' },
        { name: 'Terms', href: '/terms' },
      ]}
    />
  )
}

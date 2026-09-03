import type { Metadata } from 'next'
import { LegalPage } from '@/components/ui/legal-page'
import { authoredMetadata } from '@/lib/seo'
import { PRIVACY } from '@/content/privacy'

export const metadata: Metadata = {
  ...authoredMetadata('/privacy'),
  /**
   * NOW INDEXABLE, WHERE IT WAS `index: false`.
   *
   * The old note said a legal page ranking for anything wastes crawl budget, and
   * that was right about the page it was written for — four invented headings under
   * an "awaiting final copy" banner, which had nothing to rank for and would have
   * embarrassed the site if it did. What is here now is the client's real policy:
   * sixteen sections naming a Data Fiduciary, a grievance route and a retention
   * schedule.
   *
   * That page should be indexed. A findable, dated privacy policy is one of the
   * signals a search engine reads as evidence that a business is real and
   * accountable, and it is the page an enterprise buyer's procurement check looks
   * for first. Crawl budget is not a live concern on a site of this size.
   */
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <LegalPage
      doc={PRIVACY}
      trail={[
        { name: 'Home', href: '/' },
        { name: 'Privacy', href: '/privacy' },
      ]}
    />
  )
}

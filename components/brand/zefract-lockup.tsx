import Link from 'next/link'
import { ZefractMark } from './zefract-mark'
import { SITE } from '@/content/site'
import { cn } from '@/lib/utils'

/**
 * Mark + wordmark lockup for the header and footer.
 *
 * The approved design comp used a lowercase `zefract✦` wordmark, but the signed-off
 * logo is the Modular Z with a capitalised wordmark — so the lockup wins and the
 * star treatment is retired, keeping the site and the logo files on one identity.
 */
export function ZefractLockup({
  className,
  showDescriptor = false,
  href = '/',
}: {
  className?: string
  /** "TECH PVT LTD" under the wordmark — used in the footer, not the header. */
  showDescriptor?: boolean
  href?: string | null
}) {
  const content = (
    <span className={cn('flex items-center gap-3', className)}>
      <ZefractMark className="h-8 w-8 shrink-0 text-head" title={null} />
      <span aria-hidden="true" className="h-7 w-px bg-line" />
      <span className="flex flex-col leading-none">
        <span className="text-[22px] font-extrabold tracking-[-0.04em] text-head">
          {SITE.name}
        </span>
        {showDescriptor ? (
          <span className="mt-1.5 font-mono text-[10px] tracking-[0.16em] text-mut">
            TECH PVT LTD
          </span>
        ) : null}
      </span>
    </span>
  )

  if (!href) return content

  return (
    <Link href={href} aria-label={`${SITE.name} home`} className="inline-flex">
      {content}
    </Link>
  )
}

import type { NextRequest } from 'next/server'
import { withSite } from '@cms-logic/lib/api/handler'
import { siteInfo } from '@cms-logic/lib/api/serialize'

export const dynamic = 'force-dynamic'

/** The client's site settings: name, blog options, CTA, social links, logo. */
export function GET(req: NextRequest) {
  return withSite(req, async ({ ws }) => siteInfo(ws))
}

import type { NextRequest } from 'next/server'
import { withSite } from '@cms-logic/lib/api/handler'
import { liveTags } from '@cms-logic/lib/content/posts'

export const dynamic = 'force-dynamic'

/** Every tag on a published post, with counts. */
export function GET(req: NextRequest) {
  return withSite(req, async ({ ws, tx }) => ({ items: await liveTags(tx, ws.id) }))
}

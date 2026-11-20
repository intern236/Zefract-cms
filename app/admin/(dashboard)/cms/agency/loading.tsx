import { PageSkeleton } from '@cms-logic/components/ui/page-skeleton'


/**
 * Clients, Team, Email outbox and Add a client are children of `agency`, so the
 * loading state has to live here: one level up (cms/), the `agency` segment never
 * changes between them and that boundary would never show.
 */
export default function AgencyLoading() {
    return <PageSkeleton />
}
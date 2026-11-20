import { PageSkeleton } from '@cms-logic/components/ui/page-skeleton'


/**
 * Shown the instant a sidebar link is clicked (Dashboard, Posts, Authors, Inbox,
 * Settings — the direct children of this folder), inside the sidebar shell, while
 * the page's data loads. A loading.tsx only appears when the segment directly
 * below it changes, so deeper navigations need their own (see posts/loading.tsx).
 */
export default function WorkspaceLoading() {
    return <PageSkeleton />
}
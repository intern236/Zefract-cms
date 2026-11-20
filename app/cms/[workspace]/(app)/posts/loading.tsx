import { PageSkeleton } from '@cms-logic/components/ui/page-skeleton'


/** Posts list → a post's editor (or "New post") stays inside `posts`, so the parent loading.tsx would not show. */
export default function PostsLoading() {
    return <PageSkeleton tiles={0} rows={8} />
}
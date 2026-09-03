import { redirect } from 'next/navigation'

/** /admin has nothing of its own — the blog list is the admin's front page. */
export default function AdminIndexPage() {
  redirect('/admin/blog')
}

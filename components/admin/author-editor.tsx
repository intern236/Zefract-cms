'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExternalLink, Globe, Lock, Trash2 } from 'lucide-react'
import { AdminBar } from '@/components/admin/admin-bar'
import { AdminShell } from '@/components/admin/admin-shell'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { ImagePreview } from '@/components/media/image-preview'
import { ImageUploader } from '@/components/media/image-uploader'
import { AuthorAvatar } from '@/components/ui/author-avatar'
import { LinkedInGlyph, XGlyph } from '@/components/ui/social-icons'
import { FIELD_BASE, FIELD_HEIGHT } from '@/components/forms/field'
import { Label } from '@/components/ui/label'
import { AUTHOR_LIMITS, type AuthorOption } from '@/lib/author-display'
import { deleteAsset } from '@/app/admin/(dashboard)/blog/media-actions'
import { deleteAuthor, saveAuthor } from '@/app/admin/(dashboard)/authors/actions'
import type { CloudinaryImage } from '@/lib/cloudinary/types'
import { slugify } from '@/lib/slug'
import { absoluteUrl } from '@/lib/url'
import { cn } from '@/lib/utils'

/**
 * The author form: a portrait on the left, who they are on the right.
 *
 * ONE PAGE, NOT THE POST EDITOR'S PANELS. An author is eight fields; splitting
 * eight fields across a section nav would be ceremony around a form that fits on
 * a screen. The post editor earns its panels because a post has five genuinely
 * separate concerns and a body that must not lose its caret when you look at
 * something else — neither is true here.
 *
 * NO AUTOSAVE, and that is the deliberate difference from the post editor. A
 * post autosaves because it is long-form writing where losing a paragraph
 * matters. This is a short form: saving it is one click, and a background write
 * that silently republished a byline across every post someone wrote would be a
 * surprise rather than a convenience.
 *
 * Everything here is RE-VALIDATED SERVER-SIDE in authors/actions.ts — the URL
 * parsing especially, since these end up in hrefs on a public page. The checks
 * in this file are conveniences; none of them is a control.
 */

/** The portrait's own size cap, mirrored from the server so the counter and the
 *  save cannot disagree about the number. */
const { name: NAME_MAX, role: ROLE_MAX, bio: BIO_MAX, avatarAlt: ALT_MAX } = AUTHOR_LIMITS

export function AuthorEditor({
  author,
  /** True when this author already has a published post, which locks the URL.
   *  Computed server-side — the form only renders the consequence. */
  slugLocked = false,
  postCount = 0,
}: {
  author?: AuthorOption
  slugLocked?: boolean
  postCount?: number
}) {
  const router = useRouter()

  const [name, setName] = useState(author?.name ?? '')
  const [slug, setSlug] = useState(author?.slug ?? '')
  /* Until the admin touches the URL it tracks the name live; the first manual
     edit detaches it. An existing author is detached from the start. Same
     arrangement, and the same reasoning, as the post editor's slug. */
  const [slugTouched, setSlugTouched] = useState(Boolean(author))
  const [role, setRole] = useState(author?.role ?? '')
  const [bio, setBio] = useState(author?.bio ?? '')
  const [avatar, setAvatar] = useState<CloudinaryImage | null>(author?.avatar ?? null)
  const [avatarAlt, setAvatarAlt] = useState(author?.avatarAlt ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(author?.linkedinUrl ?? '')
  const [xUrl, setXUrl] = useState(author?.xUrl ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(author?.websiteUrl ?? '')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [removingAvatar, setRemovingAvatar] = useState(false)

  const touch = useCallback(() => setDirty(true), [])

  const onNameChange = (value: string) => {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
    touch()
  }

  const onSave = async () => {
    setBusy('save')
    setErrors({})
    setNotice(null)

    const result = await saveAuthor({
      id: author?.id,
      name,
      slug,
      role,
      bio,
      avatar,
      avatarAlt,
      linkedinUrl,
      xUrl,
      websiteUrl,
    })

    setBusy(null)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    setDirty(false)
    if (!author) {
      /* A created author gets a real id; replacing the URL means a reload or a
         second save cannot create a duplicate. Same as the post editor. */
      router.replace(`/admin/authors/${result.id}/edit`)
      return
    }
    router.refresh()
    setNotice('Saved.')
  }

  /**
   * Takes the portrait off the author and the asset off Cloudinary.
   *
   * The record is not saved by this — the removal is part of the edit and takes
   * effect on the next save, exactly as removing a post's cover does. The asset
   * delete is refused server-side if anything still references it.
   */
  const onRemoveAvatar = async () => {
    const removed = avatar
    setRemovingAvatar(true)
    setAvatar(null)
    setAvatarAlt('')
    touch()
    if (removed) {
      const result = await deleteAsset(removed.publicId)
      if (!result.ok) setErrors((prev) => ({ ...prev, avatar: result.error }))
    }
    setRemovingAvatar(false)
  }

  const onDelete = async () => {
    if (!author) return
    setBusy('delete')
    setDeleteError(null)
    const result = await deleteAuthor(author.id)
    if (result.ok) {
      router.push('/admin/authors')
      return
    }
    setBusy(null)
    setDeleteError(result.error)
  }

  const profileHref = author ? `/authors/${author.slug}` : null

  return (
    <AdminShell>
      <AdminBar
        title={author ? 'Edit Author' : 'New Author'}
        back={{ href: '/admin/authors', label: 'Authors' }}
        actions={
          <>
            <span
              className={cn(
                'hidden items-center gap-1.5 text-[12.5px] font-semibold sm:inline-flex',
                dirty ? 'text-mut' : 'text-emerald-700'
              )}
            >
              {dirty ? 'Unsaved changes' : author ? 'Saved' : 'Not saved yet'}
            </span>
            {profileHref && postCount > 0 ? (
              <Link
                href={profileHref}
                target="_blank"
                rel="noreferrer"
                className="hidden h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[13px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong sm:inline-flex"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                View
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onSave}
              disabled={busy !== null}
              className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              {busy === 'save' ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      />

      {errors.form ? (
        <p className="mt-4 rounded-tile border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          {errors.form}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-tile border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-800">
          {notice}
        </p>
      ) : null}

      <main className="mt-4 grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* ---- Portrait -------------------------------------------------- */}
        <section className="rounded-card border border-line bg-surface p-5">
          <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-head">Photo</h2>

          <div className="mt-4">
            {avatar ? (
              <ImagePreview image={avatar} busy={removingAvatar} onReplace={onRemoveAvatar} onRemove={onRemoveAvatar} />
            ) : (
              <ImageUploader
                kind="avatar"
                onUploaded={(image) => {
                  setAvatar(image)
                  touch()
                }}
                label="Upload photo"
                disabled={removingAvatar}
              />
            )}
            {errors.avatar ? <p className="mt-2 text-[13px] text-red-600">{errors.avatar}</p> : null}
          </div>

          {/* The crop is face-aware and square, which is not obvious from a
              rectangular upload box — so the result is shown rather than
              described. It is also the only place the author sees what the
              byline will actually look like before they save. */}
          <div className="mt-5 flex items-center gap-3 rounded-tile border border-line bg-page p-3">
            <AuthorAvatar
              author={{ name: name || 'New author', avatar, avatarAlt: avatarAlt || null }}
              size={44}
            />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-bold text-head">{name || 'New author'}</p>
              <p className="truncate text-[12px] text-mut-2">
                {avatar ? 'Cropped to a square around the face' : 'Initials until a photo is added'}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Label htmlFor="avatarAlt" className="text-[13.5px] font-semibold text-head">
              Alt Text
            </Label>
            <textarea
              id="avatarAlt"
              value={avatarAlt}
              maxLength={ALT_MAX}
              onChange={(event) => {
                setAvatarAlt(event.target.value)
                touch()
              }}
              placeholder="Describe the photo…"
              aria-invalid={errors.avatarAlt ? true : undefined}
              className={cn(FIELD_BASE, 'mt-1.5 min-h-16 px-4 py-3 text-[14px] leading-relaxed')}
            />
            <Counter value={avatarAlt.length} max={ALT_MAX} />
            <p className="mt-1 text-[12px] text-mut-2">Falls back to the name if left empty.</p>
          </div>
        </section>

        {/* ---- Identity -------------------------------------------------- */}
        <div className="space-y-4">
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-head">Details</h2>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="authorName" className="text-[13.5px] font-semibold text-head">
                  Name
                </Label>
                <input
                  id="authorName"
                  value={name}
                  maxLength={NAME_MAX}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder="Ajit Kumar"
                  aria-invalid={errors.name ? true : undefined}
                  className={cn(FIELD_BASE, FIELD_HEIGHT, 'mt-1.5')}
                />
                {errors.name ? <p className="mt-1 text-[13px] text-red-600">{errors.name}</p> : null}
              </div>

              <div>
                <Label htmlFor="authorRole" className="text-[13.5px] font-semibold text-head">
                  Role <span className="font-normal text-mut-2">(Optional)</span>
                </Label>
                <input
                  id="authorRole"
                  value={role}
                  maxLength={ROLE_MAX}
                  onChange={(event) => {
                    setRole(event.target.value)
                    touch()
                  }}
                  placeholder="Head of Engineering"
                  aria-invalid={errors.role ? true : undefined}
                  className={cn(FIELD_BASE, FIELD_HEIGHT, 'mt-1.5')}
                />
                {errors.role ? <p className="mt-1 text-[13px] text-red-600">{errors.role}</p> : null}
              </div>
            </div>

            <div className="mt-5">
              <Label htmlFor="authorSlug" className="text-[13.5px] font-semibold text-head">
                Profile URL
              </Label>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="shrink-0 font-mono text-[12.5px] text-mut-2">/authors/</span>
                <input
                  id="authorSlug"
                  value={slug}
                  maxLength={AUTHOR_LIMITS.slug}
                  disabled={slugLocked}
                  onChange={(event) => {
                    setSlugTouched(true)
                    setSlug(slugify(event.target.value))
                    touch()
                  }}
                  placeholder="ajit-kumar"
                  aria-invalid={errors.slug ? true : undefined}
                  className={cn(FIELD_BASE, FIELD_HEIGHT, 'font-mono text-[13px] disabled:opacity-60')}
                />
              </div>
              {slugLocked ? (
                /* Stated, not just greyed. A disabled field with no explanation
                   reads as a bug; this says which rule is holding it and why,
                   and the server enforces the same thing regardless. */
                <p className="mt-1.5 flex items-start gap-1.5 text-[12.5px] text-mut">
                  <Lock className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                  Locked — this profile is live, and changing its address would break every link
                  to it.
                </p>
              ) : (
                <p className="mt-1.5 text-[12.5px] text-mut-2">
                  {absoluteUrl(`/authors/${slug || 'name'}`)} — locks once a post of theirs is
                  published.
                </p>
              )}
              {errors.slug ? <p className="mt-1 text-[13px] text-red-600">{errors.slug}</p> : null}
            </div>

            <div className="mt-5">
              <Label htmlFor="authorBio" className="text-[13.5px] font-semibold text-head">
                Bio <span className="font-normal text-mut-2">(Optional)</span>
              </Label>
              <textarea
                id="authorBio"
                value={bio}
                maxLength={BIO_MAX}
                onChange={(event) => {
                  setBio(event.target.value)
                  touch()
                }}
                placeholder="Two or three sentences on what they work on…"
                aria-invalid={errors.bio ? true : undefined}
                className={cn(FIELD_BASE, 'mt-1.5 min-h-28 px-4 py-3 text-[14px] leading-relaxed')}
              />
              <Counter value={bio.length} max={BIO_MAX} />
              {errors.bio ? <p className="mt-1 text-[13px] text-red-600">{errors.bio}</p> : null}
            </div>
          </section>

          {/* ---- Links ---------------------------------------------------- */}
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-head">
              Links <span className="text-[13px] font-normal text-mut-2">(Optional)</span>
            </h2>
            <p className="mt-1 text-[12.5px] text-mut-2">
              Full addresses, including https:// — these feed the profile page and the author&apos;s
              structured data.
            </p>

            <div className="mt-4 space-y-4">
              <LinkField
                id="linkedinUrl"
                label="LinkedIn"
                Icon={LinkedInGlyph}
                value={linkedinUrl}
                error={errors.linkedinUrl}
                placeholder="https://www.linkedin.com/in/…"
                onChange={(value) => {
                  setLinkedinUrl(value)
                  touch()
                }}
              />
              <LinkField
                id="xUrl"
                label="X"
                Icon={XGlyph}
                value={xUrl}
                error={errors.xUrl}
                placeholder="https://x.com/…"
                onChange={(value) => {
                  setXUrl(value)
                  touch()
                }}
              />
              <LinkField
                id="websiteUrl"
                label="Website"
                Icon={Globe}
                value={websiteUrl}
                error={errors.websiteUrl}
                placeholder="https://…"
                onChange={(value) => {
                  setWebsiteUrl(value)
                  touch()
                }}
              />
            </div>
          </section>

          {author ? (
            <section className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-head">
                Delete author
              </h2>
              <p className="mt-1 max-w-[62ch] text-[13px] text-mut">
                {postCount === 0
                  ? 'No posts name this author, so nothing else changes.'
                  : `${postCount} ${postCount === 1 ? 'post names' : 'posts name'} this author. ` +
                    'Those posts are kept — they fall back to the company byline.'}
              </p>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={busy !== null}
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 text-[13px] font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Delete author
              </button>
            </section>
          ) : null}
        </div>
      </main>

      {author ? (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Delete this author?"
          description={
            postCount === 0
              ? `“${author.name}” will be removed. No posts name them, so nothing else changes.`
              : `“${author.name}” will be removed and ${postCount} ${
                  postCount === 1 ? 'post' : 'posts'
                } will fall back to the company byline. The posts themselves are kept.`
          }
          confirmLabel="Delete author"
          busyLabel="Deleting…"
          busy={busy === 'delete'}
          error={deleteError}
          onConfirm={onDelete}
        />
      ) : null}
    </AdminShell>
  )
}

function LinkField({
  id,
  label,
  Icon,
  value,
  error,
  placeholder,
  onChange,
}: {
  id: string
  label: string
  Icon: (props: { className?: string }) => React.ReactNode
  value: string
  error?: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <Label htmlFor={id} className="flex items-center gap-1.5 text-[13.5px] font-semibold text-head">
        <Icon className="size-3.5" />
        {label}
      </Label>
      <input
        id={id}
        type="url"
        inputMode="url"
        value={value}
        maxLength={AUTHOR_LIMITS.url}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={cn(FIELD_BASE, FIELD_HEIGHT, 'mt-1.5 text-[13.5px]')}
      />
      {error ? <p className="mt-1 text-[13px] text-red-600">{error}</p> : null}
    </div>
  )
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <p
      className={cn(
        'mt-1 text-right font-mono text-[11px] tabular-nums',
        value >= max ? 'text-brand-strong' : 'text-mut-2'
      )}
    >
      {value}/{max}
    </p>
  )
}

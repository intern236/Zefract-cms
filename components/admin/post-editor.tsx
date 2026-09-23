'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EditorContent, Extension, useEditor, useEditorState, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image as TiptapImage } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TableKit } from '@tiptap/extension-table'
import {
  Check, ChevronDown, Eye, FileText, FolderOpen, HelpCircle, ImageIcon, Rocket, Search,
  Tag, UserRound,
} from 'lucide-react'
import { BodyFaqNotice } from '@/components/admin/body-faq-notice'
import { FaqFields } from '@/components/admin/faq-fields'
import { FormatSwitch } from '@/components/admin/format-switch'
import { FIELD_BASE } from '@/components/forms/field'
import { Label } from '@/components/ui/label'
import { AdminBar } from '@/components/admin/admin-bar'
import { AdminShell, PANEL_TOP } from '@/components/admin/admin-shell'
import { CategoryField } from '@/components/admin/category-field'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { CoverMeta, CoverPicker } from '@/components/admin/cover-field'
import { EditorNav, type EditorSection } from '@/components/admin/editor-nav'
import { EditorToolbar } from '@/components/admin/editor-toolbar'
import { AuthorPicker } from '@/components/admin/author-picker'
import { SeoPanel } from '@/components/admin/seo-panel'
import { StatusPill } from '@/components/admin/status-pill'
import { TagInput } from '@/components/admin/tag-input'
import { absoluteUrl } from '@/lib/url'
import type { AuthorOption } from '@/lib/author-display'
import { validateFile, type CloudinaryImage } from '@/lib/cloudinary/types'
import { startUpload } from '@/lib/cloudinary/upload-client'
import { bodyUrl, isStoredImageSrc } from '@/lib/cloudinary/url'
import { slugify } from '@/lib/slug'
/**
 * The same decoder the save action runs, applied as the writer types.
 *
 * WHY THE EDITOR NEEDS IT TOO. savePost() decodes what it stores and lib/blog.ts decodes
 * what it reads, so the SITE is correct either way. The editor is the one surface that is
 * not: its fields hold React state seeded once from the post, so a title pasted as
 * `Why &quot;Minimum&quot;` would keep showing entities after saving, until a full page
 * reload — which is exactly the shape of "it is still broken" that gets reported twice.
 * Decoding here means the field shows what will be published, at the moment it is pasted.
 *
 * ON CHANGE RATHER THAN ON PASTE, because a paste handler has to reimplement insertion at
 * the caret and a controlled input makes that worse, not better. The only case where typing
 * differs is someone typing the five characters of `&amp;` by hand, which collapses to
 * `&` on the final keystroke — the value the save would have stored anyway.
 */
import { decodeHtmlEntities } from '@/lib/html-entities'
/* Dependency-free, so it can run here in the browser and show a writer exactly what the
   published page will turn into FAQ schema. The page calls the same function server-side. */
import { extractBodyFaqs } from '@/lib/faq-extract'
/* From the head-reading module, not lib/post-page-html.ts: importing the latter would pull
   sanitize-html into this client bundle to run four regular expressions. That split is the
   whole reason lib/post-page-meta.ts exists. */
import {
  pageDescription,
  pageHasFaqSchema,
  pageTitle,
  pageWordCount,
  type PostFormat,
} from '@/lib/post-page-meta'
import { cn } from '@/lib/utils'
import { savePost, deletePost, type SaveResult } from '@/app/admin/(dashboard)/blog/actions'
import { adoptRemoteImage, deleteAsset } from '@/app/admin/(dashboard)/blog/media-actions'

/**
 * The post editor, as an application: a 56px action bar across the top, the
 * post's sections down the left, and one panel at a time in the middle.
 *
 * WHY A SHELL RATHER THAN A PAGE. The site's header, footer and floating
 * controls are hidden on these routes (see the shell rules in globals.css),
 * because a writing surface wants its vertical space back — the fixed header
 * pill alone cost 112px before an editor could start. What replaces them is
 * this bar, which is half the height and carries things an editor actually
 * needs: what state the post is in, whether it is saved, and how to publish it.
 *
 * ONE PANEL AT A TIME, ALL OF THEM MOUNTED. The panels are hidden with a class
 * rather than unmounted, so switching to Tags and back leaves the body exactly
 * as it was — caret, selection, undo history and all. Unmounting TipTap to look
 * at a tag field would throw that away.
 *
 * Everything sent from here is RE-VALIDATED AND SANITISED SERVER-SIDE in
 * actions.ts. The checks in this file are conveniences; none is a control.
 */

/** What the edit page passes down: the post with Dates already dropped, because
 *  a client component prop must cross the serialisation boundary. */
export type EditorPost = {
  id: string
  title: string
  slug: string
  description: string
  /** The byline description: shown on post cards and under the title. Null shows nothing. */
  excerpt: string | null
  category: string | null
  tags: string[]
  /** Questions published as an accordion and as FAQPage schema. */
  faqs: { question: string; answer: string }[]
  /** Which surface wrote it, and how the published page renders it. */
  format: PostFormat
  /** The body: TipTap's HTML for an editor post, the pasted document for an HTML one. */
  contentHtml: string
  /** The Cloudinary cover, or null. Legacy MongoDB covers arrive as
   *  `legacyCoverUrl` instead — see the note on the cover panel. */
  coverImage: CloudinaryImage | null
  /** A pre-Cloudinary cover's URL, for the posts that still have one. Display
   *  only: uploading a new image replaces it and clears the legacy record. */
  legacyCoverUrl: string | null
  coverAlt: string | null
  coverCaption: string | null
  seoTitle: string | null
  focusKeyword: string | null
  /** Who wrote it, or null for the company byline. */
  authorId: string | null
  status: 'draft' | 'published'
  /** True once published even if since unpublished — the slug lock's flag. */
  everPublished: boolean
}

/** The editorial cap shown beside the title. The search-result limit is a
 *  different, shorter number and lives in the SEO panel, which explains it. */
const TITLE_TARGET = 100
/** Matches POST_LIMITS.tagCount in lib/blog.ts, which enforces it server-side. */
const TAG_MAX = 12
/* The FAQ caps and the introduction's, mirrored from POST_LIMITS for the same
   reason TAG_MAX is: lib/blog.ts imports the MongoDB driver, so it cannot be
   imported into a client component. Change one, change the other. */
const FAQ_MAX = 12
const FAQ_QUESTION_MAX = 200
const FAQ_ANSWER_MAX = 900
const EXCERPT_MAX = 400

/** The editor sections an HTML-page post does not get. See the filter on `sections`. */
const HTML_HIDDEN_SECTIONS = new Set(['cover', 'seo'])

/**
 * How long after typing stops before a draft saves itself. Three seconds is
 * long enough never to fire mid-sentence, short enough that closing the tab
 * rarely costs a paragraph. The timer re-arms on every keystroke, so it
 * measures a pause rather than an interval.
 */
const AUTOSAVE_MS = 3000

/**
 * Uploads an image dropped into the post's TEXT.
 *
 * Goes to Cloudinary through the same signed-upload service the cover uses —
 * one path for every image the editor produces, which is also what keeps the
 * sanitiser's allowlist honest: it now accepts only our own cloud and the
 * legacy blob route.
 *
 * Body images get `c_limit` rather than the cover's 16:9 crop, because a
 * diagram, a screenshot and a photograph are all legitimate inline and cropping
 * them to a ratio would ruin two of the three.
 */
async function uploadBodyImage(file: File): Promise<{ url?: string; error?: string }> {
  const problem = validateFile(file)
  if (problem) return { error: problem }

  const result = await startUpload(file, 'body').done
  if (!result.ok) return { error: result.error }
  return { url: bodyUrl(result.image.publicId) }
}

/**
 * Brings an image that belongs to someone else's server into ours.
 *
 * TWO ROUTES, IN THIS ORDER, because neither covers everything:
 *
 *   1. Fetch the bytes here and upload them like any other file. This is the
 *      one that works for a paste from the site's own pages, including
 *      localhost — the address is same-origin, so there is nothing to block —
 *      and it reuses the signed upload path exactly as the file picker does.
 *   2. If that fetch is refused (a cross-origin host with no CORS header, which
 *      is most of the web), hand the URL to the server and let Cloudinary
 *      fetch it instead.
 *
 * A `null` return means neither worked, and the caller says so rather than
 * letting the image disappear quietly on save.
 */
async function adoptImage(src: string): Promise<string | null> {
  try {
    const response = await fetch(src)
    if (response.ok) {
      const blob = await response.blob()
      if (blob.type.startsWith('image/')) {
        const name = `pasted.${blob.type.split('/')[1]?.split('+')[0] ?? 'png'}`
        const { url } = await uploadBodyImage(new File([blob], name, { type: blob.type }))
        if (url) return url
      }
    }
  } catch {
    /* CORS, or the host is unreachable from here. Fall through to the server,
       which asks Cloudinary to fetch it from its own network instead. */
  }

  /* A relative URL cannot be resolved by anything outside this browser, so
     there is no point asking the server to try. */
  const absolute = /^https?:\/\//i.test(src)
  if (!absolute) return null

  const result = await adoptRemoteImage(src)
  return result.ok ? result.url : null
}

/**
 * Lets a link be marked as a button.
 *
 * A GLOBAL ATTRIBUTE ON THE EXISTING LINK MARK, rather than a replacement for
 * it: StarterKit already configures Link the way this editor wants it, and
 * swapping the mark out to add one flag would mean owning that configuration
 * forever. This adds the flag and leaves everything else alone.
 *
 * It round-trips as `data-button`, which is the single attribute the sanitiser
 * allows on a link (see lib/blog.ts) and what `.blog-prose a[data-button]`
 * styles. So what the editor shows and what the published page shows are the
 * same markup through the same stylesheet — which is the rule this whole
 * editor is built on.
 *
 * TWO VARIANTS, matching the pair the site's own pages use: a solid pill for
 * the primary action and a bordered one for the secondary beside it. `solid`
 * stores as a valueless attribute so the common case is the shortest markup.
 */
export type LinkButtonVariant = 'solid' | 'outline'

const LinkButtonAttribute = Extension.create({
  name: 'linkButtonAttribute',
  addGlobalAttributes() {
    return [
      {
        types: ['link'],
        attributes: {
          button: {
            default: null,
            parseHTML: (element): LinkButtonVariant | null => {
              if (!element.hasAttribute('data-button')) return null
              return element.getAttribute('data-button') === 'outline' ? 'outline' : 'solid'
            },
            renderHTML: (attributes) =>
              attributes.button
                ? { 'data-button': attributes.button === 'outline' ? 'outline' : '' }
                : {},
          },
        },
      },
    ]
  },
})

/**
 * Points every `<img>` with this src at a new one, or removes them when `to` is
 * null. Returns how many nodes it touched.
 *
 * Removals are collected and applied BACK TO FRONT. Deleting a node shifts
 * every position after it, so deleting front to back makes each subsequent
 * position wrong by the size of everything already removed — the classic way
 * this kind of loop corrupts a document.
 */
function retargetImages(editor: Editor, from: string, to: string | null): number {
  const { state } = editor
  const tr = state.tr
  const doomed: Array<{ pos: number; size: number }> = []
  let touched = 0

  state.doc.descendants((node, pos) => {
    if (node.type.name !== 'image' || node.attrs.src !== from) return true
    touched += 1
    if (to) tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: to })
    else doomed.push({ pos, size: node.nodeSize })
    return true
  })

  for (const { pos, size } of doomed.reverse()) tr.delete(pos, pos + size)
  if (touched > 0) editor.view.dispatch(tr)
  return touched
}

/** Which section owns which error, so the nav can flag it. */
const ERROR_SECTION: Record<string, string> = {
  title: 'content',
  content: 'content',
  excerpt: 'content',
  faqs: 'faq',
  cover: 'cover',
  coverAlt: 'cover',
  coverCaption: 'cover',
  category: 'category',
  tags: 'tags',
  slug: 'seo',
  description: 'seo',
  seoTitle: 'seo',
  focusKeyword: 'seo',
}

export function PostEditor({
  post,
  usedCategories = [],
  usedTags = [],
  authors = [],
}: {
  post?: EditorPost
  /** Categories and tags already on other posts, offered as one-click chips so
   *  the same subject is not re-typed — and re-spelled — on every post. */
  usedCategories?: string[]
  usedTags?: string[]
  /** Everyone who can be credited. Empty until the first author exists, in
   *  which case the panel says so and points at where to make one. */
  authors?: AuthorOption[]
}) {
  const router = useRouter()

  const [section, setSection] = useState('content')
  /**
   * The two writing surfaces, and why BOTH bodies are held here at once.
   *
   * A post stores one body, but the editor holds two drafts: TipTap's document and the
   * pasted page. Switching format therefore loses nothing and needs no confirmation —
   * flip back and the other one is still exactly as it was. What IS destructive is
   * saving in the format the post was not saved in, and <FormatSwitch> shows a warning
   * strip for precisely as long as that mismatch exists.
   *
   * `pageHtml` seeds from the post ONLY when the post is already an HTML one. Seeding it
   * from an editor post's contentHtml would put TipTap's markup into the paste box, where
   * it looks like a draft somebody started and is really a copy of the other surface.
   */
  const [format, setFormat] = useState<PostFormat>(post?.format ?? 'editor')
  const [pageHtml, setPageHtml] = useState(post?.format === 'html' ? post.contentHtml : '')
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  /* Until the admin touches the slug, it tracks the title live. The first
     manual edit detaches it; an existing post is detached from the start. */
  const [slugTouched, setSlugTouched] = useState(Boolean(post))
  const [slugEditing, setSlugEditing] = useState(false)
  const [description, setDescription] = useState(post?.description ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [category, setCategory] = useState(post?.category ?? '')
  const [tags, setTags] = useState<string[]>(post?.tags ?? [])
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(post?.faqs ?? [])
  const [coverImage, setCoverImage] = useState<CloudinaryImage | null>(post?.coverImage ?? null)
  const [coverAlt, setCoverAlt] = useState(post?.coverAlt ?? '')
  const [coverCaption, setCoverCaption] = useState(post?.coverCaption ?? '')
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? '')
  const [focusKeyword, setFocusKeyword] = useState(post?.focusKeyword ?? '')
  const [authorId, setAuthorId] = useState(post?.authorId ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<'save' | 'publish' | 'unpublish' | 'delete' | 'upload' | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmRemoveCover, setConfirmRemoveCover] = useState(false)
  const [coverError, setCoverError] = useState<string | null>(null)
  const [removingCover, setRemovingCover] = useState(false)

  /* Save state, which is what the bar and the footer report. */
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [autosaving, setAutosaving] = useState(false)
  /**
   * The clock, sampled into state rather than read while rendering: Date.now()
   * during render is impure, and React's own lint rule catches it. Sampled in
   * an effect, refreshed on a timer, and stamped again at each save. 0 means
   * "not sampled yet", which only happens before anything has been saved.
   */
  const [now, setNow] = useState(0)

  const inlineImageRef = useRef<HTMLInputElement>(null)

  const slugLocked = post?.everPublished ?? false
  const status = post?.status ?? 'draft'

  /** How many pasted images are still being copied into Cloudinary. Shown in
   *  the bar, and checked before a save so nothing is written mid-flight. */
  const [adopting, setAdopting] = useState(0)

  /* The handlers below run long after useEditor returns, so they reach the
     instance through a ref rather than the binding it is assigned to — which
     does not exist yet at the point the configuration object is built. */
  const editorRef = useRef<Editor | null>(null)
  /* Sources already put through adoption. Without this, the transaction that
     rewrites a src re-fires onUpdate, which starts adoption again — and a
     source that FAILED would be retried on every keystroke thereafter. */
  const seenSourcesRef = useRef<Set<string>>(new Set())

  const insertUploadedFiles = useCallback(async (files: File[]) => {
    setAdopting((count) => count + files.length)
    for (const file of files) {
      const { url, error } = await uploadBodyImage(file)
      const instance = editorRef.current
      if (url && instance) {
        instance
          .chain()
          .focus()
          .setImage({ src: url, alt: file.name.replace(/\.[a-z0-9]+$/i, '') })
          .run()
      } else if (error) {
        setNotice(error)
      }
      setAdopting((count) => count - 1)
    }
  }, [])

  /**
   * Finds images in the document that still live on someone else's server and
   * copies them into ours.
   *
   * This is the fix for the bug where a pasted section looked perfect in the
   * editor and arrived on the site with every image missing: the sanitiser
   * drops foreign image sources on save, and nothing used to say so. Now the
   * editor never holds an image it cannot keep — either the src is rewritten to
   * our own copy, or the image is removed here and the author is told, at paste
   * time, while they still have the original to hand.
   */
  const adoptForeignImages = useCallback(async () => {
    const instance = editorRef.current
    if (!instance) return

    const foreign = new Set<string>()
    instance.state.doc.descendants((node) => {
      if (node.type.name !== 'image') return true
      const src = String(node.attrs.src ?? '')
      if (src && !isStoredImageSrc(src) && !seenSourcesRef.current.has(src)) foreign.add(src)
      return true
    })
    if (foreign.size === 0) return

    for (const src of foreign) seenSourcesRef.current.add(src)
    setAdopting((count) => count + foreign.size)

    let failed = 0
    await Promise.all(
      [...foreign].map(async (src) => {
        const url = await adoptImage(src)
        const live = editorRef.current
        if (live) {
          if (url) retargetImages(live, src, url)
          else failed += retargetImages(live, src, null)
        }
        setAdopting((count) => count - 1)
      })
    )

    if (failed > 0) {
      setNotice(
        `${failed} pasted ${failed === 1 ? 'image was' : 'images were'} removed — ` +
          'they could not be imported. Add them with the image button instead.'
      )
    }
  }, [])

  /* Deferred a tick: onUpdate fires while ProseMirror is still applying the
     transaction, and dispatching another one from inside that is how you get
     "Applying a mismatched transaction". */
  const scheduleAdoption = useCallback(() => {
    setTimeout(() => void adoptForeignImages(), 0)
  }, [adoptForeignImages])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        /* h2 THROUGH h6. The page supplies its own h1 — that is the post's
           title field, so a second h1 inside the body would give the document
           two titles — and the sanitiser's allowlist in lib/blog.ts matches
           exactly this configuration. Widened from [2, 3] so a long article can
           carry a real hierarchy instead of flattening every subdivision below
           the second level into bold paragraphs. */
        heading: { levels: [2, 3, 4, 5, 6] },
        link: { openOnClick: false, autolink: true },
      }),
      TiptapImage.configure({ allowBase64: false }),
      /**
       * TABLES, so a comparison stops being pasted in as a screenshot.
       *
       * A picture of a table is unreadable on a phone, invisible to search and
       * to an answer engine, cannot be selected, copied or translated, and has
       * no alt text worth writing — "a table comparing X and Y" is not the
       * table. Marked up properly it is scannable, indexable and the kind of
       * structured content the site's own AEO page sells.
       *
       * `resizable: false` ON PURPOSE. Column widths dragged in a 900px admin
       * panel are a property of that panel, not of the article, and the
       * sanitiser drops the `colgroup` they are stored in (see lib/blog.ts) —
       * so leaving the handles on would offer a control whose effect is
       * discarded on save. The published table sizes itself from its content.
       *
       * A HEADER ROW BY DEFAULT: `withHeaderRow` is the TipTap default and is
       * kept, because a comparison table without header cells gives a screen
       * reader nothing to associate each figure with, and gives a search engine
       * no column names to read.
       */
      TableKit.configure({ table: { resizable: false } }),
      LinkButtonAttribute,
      Placeholder.configure({ placeholder: 'Start writing your story…' }),
    ],
    content: post?.contentHtml ?? '',
    /* SSR: without this the editor renders on the server too and hydration
       mismatches — the v3 equivalent of the trap motion-provider.tsx documents. */
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'blog-prose tiptap-editing' },
      /**
       * An image FILE on the clipboard — a screenshot, or a copied file — goes
       * straight up. Without this it arrives as a `data:` URL, which the Image
       * extension is configured to refuse and the sanitiser would strip anyway.
       */
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((file) =>
          file.type.startsWith('image/')
        )
        if (files.length === 0) return false
        event.preventDefault()
        void insertUploadedFiles(files)
        return true
      },
      handleDrop: (_view, event) => {
        const dropped = event instanceof DragEvent ? event.dataTransfer?.files : undefined
        const files = Array.from(dropped ?? []).filter((file) => file.type.startsWith('image/'))
        if (files.length === 0) return false
        event.preventDefault()
        void insertUploadedFiles(files)
        return true
      },
    },
    onUpdate: () => {
      setDirty(true)
      /* Anything pasted as MARKUP — a section copied from a web page — lands
         with its images still pointing at the other server. They are adopted
         here rather than in handlePaste because by this point ProseMirror has
         actually put them in the document, so there is something to rewrite. */
      scheduleAdoption()
    },
  })

  /* Kept in a ref for the paste and drop handlers, which were built before this
     binding existed. In an effect, not during render — writing a ref while
     rendering is the impurity the lint rules here already caught once. Nothing
     can paste before the first effect flush, so there is no gap. */
  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  /* One subscription for everything read off the document: the word count the
     footer shows, and whether a heading exists, which the SEO checks ask about.
     The heading test walks the doc rather than serialising it — getHTML() on
     every keystroke would rebuild the whole post to answer a yes/no. */
  const docState = useEditorState({
    editor,
    selector: ({ editor: instance }) => {
      if (!instance) return { words: 0, hasHeading: false, text: '' }
      let hasHeading = false
      instance.state.doc.descendants((node) => {
        if (node.type.name === 'heading') {
          hasHeading = true
          return false
        }
        return !hasHeading
      })
      /* The plain text is already being built for the word count, so the
         keyword check reuses it rather than serialising the doc a second
         time. */
      const text = instance.getText()
      return { words: text.split(/\s+/).filter(Boolean).length, hasHeading, text }
    },
  })
  const words = docState?.words ?? 0
  const hasHeading = docState?.hasHeading ?? false
  const bodyText = docState?.text ?? ''

  /**
   * The same two numbers for a pasted page, counted from the markup.
   *
   * AN ESTIMATE, AND DELIBERATELY NOT THE STORED ONE. What gets saved on the post is
   * computed on the server by readingMinutes(), which runs the real text extractor. This
   * is a live figure for a textarea that changes on every keystroke, and doing it with a
   * regular expression here keeps sanitize-html — around 50KB — out of the admin bundle
   * for a number that is only ever advisory.
   *
   * STYLE AND SCRIPT BLOCKS COME OUT FIRST, and that is the whole reason this is not a
   * bare tag strip. A page carrying a 6KB stylesheet would otherwise report roughly 600
   * words of CSS as prose, which is wrong by more than the number is worth.
   */
  const isPage = format === 'html'
  const pageWords = useMemo(() => (isPage ? pageWordCount(pageHtml) : 0), [isPage, pageHtml])
  const shownWords = isPage ? pageWords : words
  const shownMinutes = shownWords === 0 ? 0 : Math.max(1, Math.round(shownWords / 200))

  /**
   * The page's own title and description, read live out of the paste box.
   *
   * THIS IS WHY AN HTML POST HAS NO TITLE OR DESCRIPTION FIELD, though it has the others.
   * Both are already in the document somebody pasted — the `<title>` and the meta
   * description — and asking again would be asking a writer to keep two copies of the
   * same fact in step, where the copy that loses is always the one nobody can see from
   * where they are working. Tags, author, category, FAQ and the byline description are a
   * different matter: a pasted page carries none of them in a form the site can use, so
   * those ARE fields, in their usual tabs.
   *
   * SO THE PAGE IS THE SOURCE. These two are read back out of it, shown in the panel so
   * the writer can confirm they were found, and sent as the post’s stored title and
   * description — which the blog index card, the admin list and the sitemap all need
   * whether or not the post page itself uses them. savePost() derives the same two values
   * server-side from the same helpers, so a request that skips this UI cannot store a post
   * with a title its page does not have.
   */
  const detectedTitle = useMemo(() => (isPage ? pageTitle(pageHtml) : null), [isPage, pageHtml])
  const detectedDescription = useMemo(
    () => (isPage ? pageDescription(pageHtml) : null),
    [isPage, pageHtml]
  )

  /**
   * What actually gets sent as the post’s identity.
   *
   * For a written post these are the fields, unchanged. For a pasted page they are the
   * page’s own head, because there are no fields — see detectedTitle above.
   */
  const outgoingTitle = isPage ? (detectedTitle ?? '') : title
  const outgoingDescription = isPage ? (detectedDescription ?? '') : description

  /**
   * The slug, which is the one thing a pasted page cannot supply.
   *
   * A page carries its title and its description; it does not carry the URL it should
   * live at. So the slug follows the detected title the same way it follows the title
   * field on a written post — until somebody edits it, after which it is theirs.
   *
   * DERIVED AT USE RATHER THAN SYNCED INTO STATE. The alternative is an effect watching
   * detectedTitle and calling setSlug, which is a setState in an effect body: the
   * cascading render this codebase has already recorded a lint error against twice. A
   * value computed where it is read needs no synchronising and cannot fall behind.
   */
  const effectiveSlug = isPage && !slugTouched ? slugify(detectedTitle ?? '') : slug

  /** Any edit anywhere counts, not just typing in the body. */
  const touch = useCallback(() => setDirty(true), [])

  const onTitleChange = (raw: string) => {
    const value = decodeHtmlEntities(raw)
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
    touch()
  }

  const submit = useCallback(
    async (intent: 'save' | 'publish' | 'unpublish', options?: { silent?: boolean }) => {
      if (!editor) return
      const silent = options?.silent ?? false
      /* An image still on its way to Cloudinary is still pointing at the other
         server in the document. Saving now would store markup the sanitiser
         strips, which is the exact failure the adoption path exists to end —
         so the save waits rather than racing it. */
      if (adopting > 0) {
        if (!silent) setNotice('Still importing a pasted image. One moment.')
        return
      }
      if (silent) setAutosaving(true)
      else {
        setBusy(intent)
        setErrors({})
        setNotice(null)
      }

      const result: SaveResult = await savePost({
        id: post?.id,
        title: outgoingTitle,
        slug: effectiveSlug,
        description: outgoingDescription,
        excerpt,
        category,
        tags: tags.join(', '),
        faqs,
        format,
        /* The active surface's body, and only that one. The other draft stays in state
           for the length of the session and is never written — a post has one body. */
        contentHtml: format === 'html' ? pageHtml : editor.getHTML(),
        authorId,
        coverImage,
        coverAlt,
        coverCaption,
        seoTitle,
        focusKeyword,
        intent,
      })

      if (silent) setAutosaving(false)
      else setBusy(null)

      if (!result.ok) {
        /* A silent autosave never interrupts: an incomplete draft is a normal
           state to be typing in, and stamping validation onto sections the
           writer has not reached yet would be noise. */
        if (!silent) {
          setErrors(result.errors)
          /* Send them to the section that actually holds the problem, rather
             than leaving a red dot on a nav they have to go hunting through. */
          const firstKey = Object.keys(result.errors).find((key) => ERROR_SECTION[key])
          if (firstKey) setSection(ERROR_SECTION[firstKey])
        }
        return
      }

      const stamp = new Date()
      setDirty(false)
      setSavedAt(stamp)
      /* Re-sample alongside the save, so the label reads "just now" at once
         rather than waiting for the next tick of the interval below. */
      setNow(stamp.getTime())

      if (!post) {
        /* A created post gets a real id; replacing the URL means a reload or a
           second save cannot create a duplicate. */
        router.replace(`/admin/blog/${result.id}/edit`)
        return
      }
      router.refresh()
      /* A warning outranks the success line, and is shown even on an autosave:
         it means content did not make it into the post, which the writer needs
         to know at the moment it happens rather than on the published page. */
      if (result.warning) {
        setNotice(result.warning)
        return
      }
      if (!silent) {
        setNotice(
          intent === 'publish'
            ? `Published — live at /blog/${result.slug}`
            : intent === 'unpublish'
              ? 'Unpublished. The post is a draft again and its page now 404s.'
              : null
        )
      }
    },
    [
      editor, post, outgoingTitle, effectiveSlug, outgoingDescription, excerpt, category,
      tags, faqs, format, pageHtml, coverImage, coverAlt, coverCaption, seoTitle,
      focusKeyword, authorId, router, adopting,
    ]
  )

  /**
   * Autosave, for an existing DRAFT only.
   *
   * NEVER FOR A PUBLISHED POST, and that restriction is the design: a published
   * post's page is live, so saving in the background would push half-finished
   * edits to real readers seconds after they were typed. Those wait for a
   * deliberate Save.
   *
   * Never for an unsaved new post either — there is no id to update and the
   * required fields are usually still empty, so it would only produce failures.
   * The guard waits for the fields the server insists on, so autosave never
   * fires a request it already knows will be rejected.
   *
   * `submit` is rebuilt on every keystroke, which re-arms this timer each time
   * — that IS the debounce: it fires three seconds after typing stops.
   */
  /* Reads the outgoing values rather than the fields, so a pasted page autosaves on the
     strength of its own head and body instead of on two inputs it does not have. */
  const canAutosave = Boolean(
    post &&
      post.status === 'draft' &&
      outgoingTitle.trim() &&
      outgoingDescription.trim() &&
      shownWords > 0
  )
  useEffect(() => {
    if (!canAutosave || !dirty || busy !== null || autosaving) return
    const id = window.setTimeout(() => void submit('save', { silent: true }), AUTOSAVE_MS)
    return () => window.clearTimeout(id)
  }, [canAutosave, dirty, busy, autosaving, submit])

  /* Keeps the relative timestamp honest as time passes. No initial sample in
     the effect body — `now` is only read once something has been saved, and
     each save stamps it; sampling here too would be a synchronous setState in
     an effect, i.e. a cascading render for a value nothing is showing yet. */
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const saveState = useMemo(() => {
    /* Ahead of "Saving…" because it is what a save is currently waiting on —
       and because an image being copied in the background is otherwise
       invisible, which is how a writer ends up publishing mid-import. */
    if (adopting > 0) {
      return {
        tone: 'busy' as const,
        label: adopting === 1 ? 'Importing image…' : `Importing ${adopting} images…`,
      }
    }
    if (autosaving || busy === 'save' || busy === 'publish' || busy === 'unpublish') {
      return { tone: 'busy' as const, label: 'Saving…' }
    }
    if (dirty) return { tone: 'dirty' as const, label: 'Unsaved changes' }
    if (!savedAt) return { tone: 'idle' as const, label: 'Not saved yet' }

    const seconds = Math.max(0, Math.round((now - savedAt.getTime()) / 1000))
    if (seconds < 60) return { tone: 'saved' as const, label: 'Saved' }
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return { tone: 'saved' as const, label: `Saved ${minutes} min ago` }
    return {
      tone: 'saved' as const,
      label: `Saved ${savedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
    }
  }, [adopting, autosaving, busy, dirty, savedAt, now])

  const onInlineImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !editor) return
    setBusy('upload')
    const { url, error } = await uploadBodyImage(file)
    setBusy(null)
    if (error) return setNotice(error)
    if (url) {
      editor
        .chain()
        .focus()
        .setImage({ src: url, alt: file.name.replace(/\.[a-z0-9]+$/i, '') })
        .run()
    }
  }

  /**
   * Takes the cover off the post, and the asset off Cloudinary.
   *
   * THE ORDER IS DELIBERATE and the opposite of the replace flow's. Here the
   * end state is "no image", so removing it from the editor first means the
   * writer sees the result immediately; the asset delete that follows is
   * cleanup. It is refused server-side if another post still uses the image,
   * and anything that fails is collected by `npm run media:sweep`.
   *
   * The post is not saved by this — the removal is part of the edit, and takes
   * effect on the next save like every other change.
   */
  const onRemoveCover = async () => {
    const removed = coverImage
    setRemovingCover(true)
    setCoverError(null)

    setCoverImage(null)
    setCoverAlt('')
    setCoverCaption('')
    touch()

    if (removed) {
      const result = await deleteAsset(removed.publicId, post?.id)
      if (!result.ok) setCoverError(result.error)
    }

    setRemovingCover(false)
    setConfirmRemoveCover(false)
  }

  const onDelete = async () => {
    if (!post) return
    setBusy('delete')
    setDeleteError(null)
    const result = await deletePost(post.id)
    if (result.ok) {
      /* No state reset before navigating: the component is about to unmount,
         and clearing `busy` first would flash the buttons back to life. */
      router.push('/admin/blog')
      return
    }
    setBusy(null)
    setDeleteError(result.error)
  }

  /**
   * Six sections, one job each: write it, picture it, file it, credit it, label
   * it, make it findable. Each panel holds one idea, so a section is never a lucky
   * bag of unrelated fields and the nav label says exactly what is behind it.
   *
   * THERE IS NO LONGER AN “HTML” SECTION. It was a source view over TipTap’s
   * document, added when pasting markup was the only way to get a table or a
   * section the toolbar had no button for. The HTML page format replaced the whole
   * reason for it: a writer who has markup now picks that format and pastes the
   * document itself. Keeping both meant two boxes of HTML in one editor, editing
   * different documents, each of them plausibly the post — which is exactly what it
   * looked like on screen. components/admin/html-source.tsx went with it.
   */
  const sections: EditorSection[] = [
    {
      id: 'content',
      label: 'Content',
      icon: FileText,
      flagged: Boolean(errors.title || errors.content),
    },
    {
      id: 'cover',
      label: 'Cover Image',
      icon: ImageIcon,
      flagged: Boolean(errors.cover || errors.coverAlt || errors.coverCaption),
    },
    {
      id: 'category',
      label: 'Category',
      icon: FolderOpen,
      flagged: Boolean(errors.category),
    },
    /* Between Category and Tags: filing the post, then crediting it, then
       labelling it. The byline is a fact about the post rather than a way of
       finding it, so it sits with the filing rather than with the index terms. */
    { id: 'author', label: 'Author', icon: UserRound, flagged: false },
    { id: 'tags', label: 'Tags', icon: Tag, flagged: Boolean(errors.tags) },
    /* After the labelling, before SEO. An FAQ is content the reader sees, so it
       belongs with the writing rather than in the panel of things written for a
       crawler — even though publishing it as schema is most of why it is here. */
    { id: 'faq', label: 'FAQ', icon: HelpCircle, flagged: Boolean(errors.faqs) },
    {
      id: 'seo',
      label: 'SEO',
      icon: Search,
      flagged: Boolean(errors.description || errors.slug || errors.seoTitle || errors.focusKeyword),
    },
  ]
  /**
   * WHICH SECTIONS A PASTED PAGE GETS: Content, Category, Author, Tags and FAQ.
   *
   * Each of those now does something on the site for an HTML post, which is the only test
   * a panel has to pass to be offered — a control whose value goes nowhere is worse than an
   * absent one, because it makes a promise about the published page that the page does not
   * keep. What each one reaches:
   *
   *   Tags     — the "Tagged" row under the page, the chips on its cards, the tag pages
   *   Author   — the "written by" card under the page, the author's profile, the schema
   *   FAQ      — the accordion under the page, with schema unless the page has its own
   *   Category — the date line on its cards
   *   (and the Byline description, in Content, is the line on its cards)
   *
   * TWO STAY HIDDEN, for the reason the rule gives. SEO reads a title and description the
   * pasted page already carries in its own head, and the editor shows those as read-only
   * readouts at the top. Cover Image decorates a hero an HTML post does not render.
   */
    .filter((entry) => !isPage || !HTML_HIDDEN_SECTIONS.has(entry.id))

  /* Landing on a section that has just been filtered away would show an empty middle
     column with no tab selected. Switching format sends you back to the body, which is
     the thing that actually changed. */
  const activeSection = sections.some((entry) => entry.id === section) ? section : 'content'

  const panelId = (id: string) => `panel-${id}`
  const shown = (id: string) => (activeSection === id ? undefined : 'hidden')

  /* Preview needs somewhere to point. A published post has a live page; a saved
     draft has the admin-only preview route; an unsaved post has neither, so the
     control says so rather than pretending. */
  const previewHref = post
    ? post.status === 'published'
      ? `/blog/${post.slug}`
      : `/admin/blog/${post.id}/preview`
    : null

  return (
    <AdminShell>
      <AdminBar
        title={post ? 'Edit Post' : 'New Post'}
        back={{ href: '/admin/blog', label: 'Posts' }}
        badge={<StatusPill status={status} />}
        actions={
          <>
            <span
              className={cn(
                'hidden items-center gap-1.5 text-[12.5px] font-semibold sm:inline-flex',
                saveState.tone === 'saved' ? 'text-emerald-700' : 'text-mut'
              )}
            >
              {saveState.tone === 'saved' ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-1.5 rounded-full',
                    saveState.tone === 'busy' ? 'bg-brand' : 'bg-mut-2'
                  )}
                />
              )}
              {saveState.label}
            </span>

            {previewHref ? (
              <Link
                href={previewHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[13px] font-semibold text-head transition-colors hover:border-brand/50 hover:text-brand-strong"
              >
                <Eye className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Preview</span>
              </Link>
            ) : (
              <span
                title="Save a draft first"
                className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-full border border-line px-3.5 text-[13px] font-semibold text-mut-2"
              >
                <Eye className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Preview</span>
              </span>
            )}

            {/* Split button: the expected action on the left, the other one
                behind the caret. Which is which flips with status — a draft
                wants publishing, a live post wants saving. */}
            <div className="relative flex">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void submit(status === 'published' ? 'save' : 'publish')}
                className="inline-flex h-9 items-center gap-1.5 rounded-l-full bg-brand pr-3 pl-4 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-hover disabled:opacity-60"
              >
                <Rocket className="size-3.5" aria-hidden="true" />
                {busy === 'publish'
                  ? 'Publishing…'
                  : busy === 'save'
                    ? 'Saving…'
                    : status === 'published'
                      ? 'Save changes'
                      : 'Publish'}
              </button>
              <button
                type="button"
                aria-label="More publish options"
                aria-expanded={menuOpen}
                disabled={busy !== null}
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex h-9 items-center rounded-r-full border-l border-ink/15 bg-brand px-2 text-ink transition-colors hover:bg-brand-hover disabled:opacity-60"
              >
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </button>

              {menuOpen ? (
                <>
                  {/* Closes on any outside click without a document listener. */}
                  <button
                    type="button"
                    aria-hidden="true"
                    tabIndex={-1}
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div className="absolute top-11 right-0 z-50 w-52 overflow-hidden rounded-tile border border-line bg-surface py-1 shadow-[0_18px_40px_-20px_rgba(8,20,34,0.28)]">
                    {status === 'published' ? (
                      <MenuItem
                        onClick={() => {
                          setMenuOpen(false)
                          void submit('unpublish')
                        }}
                      >
                        Unpublish
                      </MenuItem>
                    ) : (
                      <MenuItem
                        onClick={() => {
                          setMenuOpen(false)
                          void submit('save')
                        }}
                      >
                        Save draft
                      </MenuItem>
                    )}
                    {post ? (
                      <MenuItem
                        destructive
                        onClick={() => {
                          setMenuOpen(false)
                          setDeleteError(null)
                          setConfirmDelete(true)
                        }}
                      >
                        Delete post
                      </MenuItem>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </>
        }
      />

      {notice || errors.form ? (
        <div
          role="status"
          className={cn(
            'mt-4 rounded-tile border px-4 py-2.5 text-[13px]',
            errors.form
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-600/25 bg-emerald-600/8 text-emerald-800'
          )}
        >
          {errors.form ?? notice}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-4 md:flex-row">
        <aside className="shrink-0 md:w-[188px]">
          <div className={cn('rounded-card border border-line bg-surface md:sticky', PANEL_TOP)}>
            <EditorNav
              sections={sections}
              active={activeSection}
              onSelect={setSection}
              panelId={panelId}
            />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div>
            {/* WHICH DOCUMENT THIS IS, above everything it governs. See
                <FormatSwitch> for why it is here rather than in a panel. */}
            <FormatSwitch
              value={format}
              onChange={(next) => {
                setFormat(next)
                touch()
              }}
              savedAs={post?.format}
              /* THE SAME FLAG THE SLUG LOCK USES, for the same reason and with the same
                 semantics: once published, still locked after an unpublish. The two
                 formats do not share a body, so switching one on a live post is one
                 click between a published page and an empty one. savePost() refuses it
                 server-side; this is the half that stops anyone trying. */
              locked={post?.everPublished ?? false}
            />

            {/* ---- Title and permalink: the document's identity, always on
                    screen whichever section is open. ------------------------ */}
            <div className="rounded-tile border border-line bg-surface px-4 py-3.5 md:px-5">
              {/**
                * ON A PASTED PAGE THE TITLE IS A READOUT, NOT A FIELD.
                *
                * The page has a <title> and that is the post’s title. An input here would
                * be a second place to write the same thing, and the two would disagree the
                * first time somebody edited one of them — with the page winning on the
                * published tab and the field winning in the admin list, which is the worst
                * possible split because neither reader can see the other.
                *
                * IT REPORTS ABSENCE LOUDLY, because "no <title>" is the one thing here a
                * writer must fix in their HTML and cannot fix from this screen. The save
                * refuses it too — this is the earlier, kinder half of the same rule.
                */}
              {isPage ? (
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[10.5px] tracking-[0.16em] text-mut-2 uppercase">
                    Title
                  </span>
                  {detectedTitle ? (
                    <span className="min-w-0 flex-1 text-[21px] leading-tight font-extrabold tracking-[-0.025em] text-head md:text-[23px]">
                      {detectedTitle}
                    </span>
                  ) : (
                    <span className="min-w-0 flex-1 text-[14px] font-semibold text-brand-strong">
                      No &lt;title&gt; in your HTML yet. Add one — it names the post
                      everywhere.
                    </span>
                  )}
                </div>
              ) : (
              <div className="flex items-center gap-3">
                <input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(event) => onTitleChange(event.target.value)}
                  placeholder="Enter your post title…"
                  aria-label="Post title"
                  aria-invalid={errors.title ? true : undefined}
                  maxLength={TITLE_TARGET}
                  /* Borderless on purpose: inside its own card, a second box
                     around the biggest text on the page is one frame too many.
                     The global focus ring is suppressed because a 3px outline
                     around 24px type reads as an error state; the caret and the
                     placeholder carry focus instead. */
                  className="min-w-0 flex-1 bg-transparent text-[22px] leading-tight font-extrabold tracking-[-0.025em] text-head outline-none placeholder:font-bold placeholder:text-mut-2/60 focus-visible:shadow-none focus-visible:outline-none md:text-[25px]"
                />
                <span
                  className={cn(
                    'shrink-0 font-mono text-[11px] tabular-nums',
                    title.length >= TITLE_TARGET ? 'text-brand-strong' : 'text-mut-2'
                  )}
                >
                  {title.length}/{TITLE_TARGET}
                </span>
              </div>
              )}

              {/* The description, alongside the title it was found with. Both come out of
                  the same head, so reporting them apart would make one of them look like
                  a setting rather than something the page already said. */}
              {isPage ? (
                <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-line pt-2.5">
                  <span className="shrink-0 font-mono text-[10.5px] tracking-[0.16em] text-mut-2 uppercase">
                    Description
                  </span>
                  <span
                    className={cn(
                      'min-w-0 flex-1 text-[13px] leading-[1.5]',
                      detectedDescription ? 'text-mut' : 'font-semibold text-brand-strong'
                    )}
                  >
                    {detectedDescription ??
                      'No meta description in your HTML yet. Add one — it is what search results show.'}
                  </span>
                </div>
              ) : null}
            </div>

            {/* The permalink, with the slug editable in place. */}
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[12.5px]">
              <span className="font-semibold text-mut">Permalink:</span>
              <span className="font-mono text-mut-2">{absoluteUrl('/blog')}/</span>
              {slugEditing && !slugLocked ? (
                <>
                  <input
                    value={slug}
                    autoFocus
                    onChange={(event) => {
                      setSlugTouched(true)
                      setSlug(slugify(event.target.value))
                      touch()
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === 'Escape') setSlugEditing(false)
                    }}
                    aria-label="URL slug"
                    className={cn(FIELD_BASE, 'h-7 w-56 px-2 font-mono text-[12.5px]')}
                  />
                  <button
                    type="button"
                    onClick={() => setSlugEditing(false)}
                    className="font-semibold text-brand-strong hover:text-brand"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  {/* effectiveSlug, not slug: on a pasted page the slug follows the
                      page’s own <title> until somebody edits it here. */}
                  <span className="font-mono font-semibold text-head">
                    {effectiveSlug || 'your-post-slug'}
                  </span>
                  {slugLocked ? (
                    <span className="text-mut-2">· locked, the post is published</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        /* Seed the field from what is on screen before opening it, so a
                           pasted page’s derived slug is what you start editing rather
                           than the empty state behind it. */
                        setSlug(effectiveSlug)
                        setSlugEditing(true)
                      }}
                      className="font-semibold text-brand-strong hover:text-brand"
                    >
                      Edit
                    </button>
                  )}
                </>
              )}
            </div>
            {errors.slug ? <p className="mt-1 px-1 text-[12.5px] text-red-600">{errors.slug}</p> : null}

            {/* ---- The byline description --------------------------------
                The line under the title, written for readers. Shown on every post
                card — the blog index, tag pages, author pages — and under the
                headline on the post itself, through <BylineDescription>.

                IT WAS CALLED "INTRODUCTION", printed only on the post, and fell back to
                the meta description when left empty. That fallback is how the SEO
                snippet ended up on the blog cards, which the client flagged. So the
                field is named for where it shows, and the fallback is gone: empty means
                no line at all, anywhere. Anything already typed as an introduction
                carries straight over — the stored key did not change.

                IN THE CONTENT PANEL, NOT THE SEO ONE, because it is copy on the page.
                The meta description in SEO is written for a search result; this is
                written for someone already on the site.

                ALWAYS VISIBLE, like the title and permalink above it, because it is part
                of how the post opens rather than a setting behind a tab. */}
            {/* In both formats. On an HTML post it is the line on the post's CARDS only:
                the pasted page opens with its own introduction, so ours is not printed
                above it. The hint below says which, so nobody expects it on the page. */}
            <div className={cn('mt-4 rounded-tile border border-line bg-surface p-5', shown('content'))}>
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor="excerpt" className="text-[13.5px] font-semibold text-head">
                  Byline description
                </Label>
                <span className="font-mono text-[12px] tracking-[0.12em] text-mut-2 uppercase sm:text-[10px]">
                  Optional
                </span>
              </div>
              <textarea
                id="excerpt"
                name="excerpt"
                value={excerpt}
                maxLength={EXCERPT_MAX}
                onChange={(event) => {
                  setExcerpt(decodeHtmlEntities(event.target.value))
                  touch()
                }}
                placeholder="One or two sentences on what this post is about, written for readers…"
                aria-invalid={errors.excerpt ? true : undefined}
                className={cn(FIELD_BASE, 'mt-2 min-h-20 px-4 py-3 text-[14px] leading-relaxed')}
              />
              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                {/* Says where the text goes, and — just as important — that leaving it
                    empty does NOT bring the meta description back. The old hint said the
                    opposite, and a writer who remembers it would otherwise leave this
                    blank expecting a line to appear. */}
                <p className="text-[12.5px] text-mut-2">
                  {isPage
                    ? excerpt.trim()
                      ? 'Shown under the title on this post’s blog cards. Not printed on the post itself: your HTML page has its own introduction.'
                      : 'Empty: no description shows on this post’s blog cards. The meta description in your HTML is never shown on the site.'
                    : excerpt.trim()
                      ? 'Shown under the title on the blog cards and at the top of the post. Cards show the first three lines.'
                      : 'Empty: no description shows on the blog cards or under the title. The SEO meta description is never shown on the site.'}
                </p>
                <span
                  className={cn(
                    'font-mono text-[11px] tabular-nums',
                    excerpt.length >= EXCERPT_MAX ? 'text-brand-strong' : 'text-mut-2'
                  )}
                >
                  {excerpt.length}/{EXCERPT_MAX}
                </span>
              </div>
              {errors.excerpt ? (
                <p className="mt-1 text-[13px] text-red-600">{errors.excerpt}</p>
              ) : null}
            </div>

            {/* ---- Panels ---------------------------------------------- */}

            {/* Content: the writing surface. */}
            <section
              role="tabpanel"
              id={panelId('content')}
              aria-label="Content"
              /* The card carries the focus state now that the writing surface
                 inside it does not — see the note on .tiptap-editing in
                 globals.css. A border warming to brand says "you are working in
                 here" without drawing a frame around the whole viewport. */
              className={cn(
                'mt-4 rounded-tile border border-line bg-surface transition-colors focus-within:border-brand/45',
                shown('content')
              )}
            >
              {/**
                * ONE CARD, TWO SURFACES. The toolbar and TipTap for a written post; a
                * single textarea holding a whole document for a pasted one.
                *
                * SWAPPED RATHER THAN GIVEN ITS OWN SECTION, because they are the same
                * thing: the post's body. A separate "HTML page" tab would leave the
                * Content tab showing an empty editor on a post that has plenty of
                * content, which is the shape of bug where somebody retypes an article.
                *
                * TIPTAP STAYS MOUNTED UNDERNEATH, hidden rather than unmounted. Its
                * document is one of the two drafts this editor holds (see the state
                * note above), and unmounting it would throw that draft away the moment
                * anyone looked at the other surface.
                */}
              {isPage ? (
                <div className="p-4 md:p-5">
                  <p className="max-w-[76ch] text-[13px] leading-[1.6] text-mut">
                    Paste the whole page, <code className="font-mono text-[12px]">&lt;html&gt;</code> and
                    all. Its layout, CSS, comments, <code className="font-mono text-[12px]">&lt;title&gt;</code>,
                    meta description and structured data are all kept. The page publishes inside
                    this site&rsquo;s header and footer, followed by the tags, author and FAQ set in
                    the other tabs.
                  </p>
                  {/* THE ONE THING THAT DOES NOT SURVIVE, said before the paste rather
                      than discovered after it. See lib/post-page-html.ts. */}
                  <p className="mt-1.5 max-w-[76ch] text-[12.5px] leading-[1.55] text-mut-2">
                    <code className="font-mono text-[12px]">&lt;script&gt;</code> is removed on save,
                    so anything driven by JavaScript will look right but will not move. JSON-LD
                    structured data is the exception and is kept.
                  </p>
                  <textarea
                    value={pageHtml}
                    onChange={(event) => {
                      setPageHtml(event.target.value)
                      touch()
                    }}
                    spellCheck={false}
                    aria-label="Page HTML"
                    aria-invalid={errors.content ? true : undefined}
                    placeholder="<!DOCTYPE html>&#10;<html>&#10;  …"
                    className={cn(
                      FIELD_BASE,
                      'mt-3.5 min-h-[520px] px-4 py-3 font-mono text-[12.5px] leading-[1.7]'
                    )}
                  />
                </div>
              ) : null}

              {/* HIDDEN, NOT UNMOUNTED, and the `hidden` attribute is doing real work
                  here rather than tidying. Taking <EditorContent> out of the tree
                  detaches TipTap's view, and a writer who glances at the HTML surface
                  and switches back has no guarantee of getting their caret, their
                  selection or their undo history returned. This is the same "all panels
                  mounted" contract the section nav already runs on, for the same
                  reason. */}
              <div hidden={isPage}>
                {editor ? (
                  <EditorToolbar
                    editor={editor}
                    onPickImage={() => inlineImageRef.current?.click()}
                  />
                ) : (
                  /* Holds the toolbar's height while TipTap mounts, so the card
                     does not jump taller a beat after the page paints. */
                  <div aria-hidden="true" className="h-[45px] border-b border-line" />
                )}
                <EditorContent editor={editor} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line px-4 py-2.5 md:px-5">
                {errors.content ? (
                  <p className="text-[12.5px] text-red-600">{errors.content}</p>
                ) : (
                  <span />
                )}
                <p className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-mut-2 tabular-nums">
                  <span>{shownWords} words</span>
                  <span aria-hidden="true">·</span>
                  <span>{shownMinutes} min read</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'size-1.5 rounded-full',
                        saveState.tone === 'saved' && 'bg-emerald-600',
                        saveState.tone === 'busy' && 'bg-brand',
                        saveState.tone === 'dirty' && 'bg-mut-2',
                        saveState.tone === 'idle' && 'bg-line-strong'
                      )}
                    />
                    {canAutosave && saveState.tone === 'saved' ? 'Autosaved' : saveState.label}
                  </span>
                </p>
              </div>
            </section>

            {/* Cover image: the picture on the left where it can be seen at a
                useful size, and what is written about it on the right. */}
            <Panel id={panelId('cover')} label="Cover Image" hidden={activeSection !== 'cover'}>
              <div className="grid gap-8 lg:grid-cols-2">
                <CoverPicker
                  image={coverImage}
                  legacyUrl={post?.legacyCoverUrl ?? null}
                  error={errors.cover}
                  busy={busy !== null}
                  onUploaded={(image) => {
                    /* The previous asset is NOT deleted here. It goes only once
                       the post has been saved pointing at the new one — see the
                       replace note in blog/actions.ts. A failed save therefore
                       leaves the old image intact and still referenced. */
                    setCoverImage(image)
                    touch()
                  }}
                  onRemove={() => setConfirmRemoveCover(true)}
                />

                {/* Always rendered, not gated on there being an image. Gating
                    them left half the panel holding a dashed apology, and the
                    column jumped in height the moment an upload finished. The
                    save action clears both when there is no cover, so nothing
                    stale can be stored by filling them in early. */}
                <CoverMeta
                  alt={coverAlt}
                  caption={coverCaption}
                  errors={errors}
                  onAltChange={(value) => {
                    setCoverAlt(value)
                    touch()
                  }}
                  onCaptionChange={(value) => {
                    setCoverCaption(value)
                    touch()
                  }}
                />
              </div>
            </Panel>

            {/* Category: its own section, because filing a post is a separate
                decision from illustrating it. */}
            <Panel id={panelId('category')} label="Category" hidden={activeSection !== 'category'}>
              <div className="max-w-md">
                <CategoryField
                  value={category}
                  used={usedCategories}
                  error={errors.category}
                  onChange={(value) => {
                    setCategory(value)
                    touch()
                  }}
                />
              </div>
            </Panel>

            {/* Author: who gets the byline. Optional — a post with none keeps
                the company byline it had before authors existed, which is why
                this panel never flags an error. */}
            <Panel id={panelId('author')} label="Author" hidden={activeSection !== 'author'}>
              <div className="max-w-xl">
                <AuthorPicker
                  authors={authors}
                  value={authorId}
                  onChange={(value) => {
                    setAuthorId(value)
                    touch()
                  }}
                />
              </div>
            </Panel>

            {/* Tags: its own section, because it is a list you build rather
                than a field you fill. */}
            <Panel id={panelId('tags')} label="Tags" hidden={activeSection !== 'tags'}>
              <div className="max-w-xl">
                <TagInput
                  tags={tags}
                  max={TAG_MAX}
                  error={errors.tags}
                  used={usedTags}
                  onChange={(next) => {
                    setTags(next)
                    touch()
                  }}
                />
              </div>
            </Panel>

            {/* FAQ: the questions this post answers, as an accordion on the page
                and as FAQPage structured data. */}
            {/* FULL WIDTH, like Cover, HTML and SEO, and unlike Category, Author
                and Tags. That split is not arbitrary: those three hold one short
                control each, and a lone select stretched across 900px looks
                broken, so they are capped. This panel holds a repeating card
                with a long question and a longer answer in it — the same shape
                as the cover panel's two columns — and capping it at max-w-2xl
                left the rows stopping two thirds of the way across with dead
                space beside every one of them.

                The measure of the PROSE inside is a separate decision and stays:
                a paragraph of guidance set across the full panel would run to
                about 110 characters a line, which is past the point it is
                comfortable to read. Boxes fill, sentences do not. */}
            <Panel id={panelId('faq')} label="FAQ" hidden={activeSection !== 'faq'}>
              {/* READ ONLY WHILE THIS PANEL IS OPEN. getHTML() serialises the whole
                  document, which is not worth doing on every render of an editor that
                  re-renders on every keystroke. The body cannot change while this panel
                  is showing — the writing surface is on another tab — and switching here
                  is itself a render, so the list is always current when it is seen. */}
              <BodyFaqNotice
                panelCount={faqs.length}
                /* A written post: questions typed into its article. Never for a pasted page —
                   the hidden TipTap document behind it is not that post's body, and the
                   page itself is arbitrary markup the extractor is not built to read. */
                bodyFaqs={
                  !isPage && activeSection === 'faq' && editor ? extractBodyFaqs(editor.getHTML()) : []
                }
                /* A pasted page: whether it already brings its own FAQPage, the same test the
                   post page uses to decide whether this panel's questions get schema. */
                pageHasFaqSchema={isPage && activeSection === 'faq' && pageHasFaqSchema(pageHtml)}
              />
              <FaqFields
                faqs={faqs}
                max={FAQ_MAX}
                questionMax={FAQ_QUESTION_MAX}
                answerMax={FAQ_ANSWER_MAX}
                error={errors.faqs}
                onChange={(next) => {
                  setFaqs(next)
                  touch()
                }}
              />
            </Panel>


            {/* SEO: everything a search engine is handed, and how it scores. */}
            <Panel id={panelId('seo')} label="SEO" hidden={activeSection !== 'seo'}>
              <SeoPanel
                title={title}
                seoTitle={seoTitle}
                description={description}
                slug={slug}
                slugLocked={slugLocked}
                focusKeyword={focusKeyword}
                bodyText={bodyText}
                words={words}
                hasCover={Boolean(coverImage || post?.legacyCoverUrl)}
                coverAlt={coverAlt}
                hasHeading={hasHeading}
                tagCount={tags.length}
                errors={errors}
                onSeoTitle={(value) => {
                  setSeoTitle(decodeHtmlEntities(value))
                  touch()
                }}
                onDescription={(value) => {
                  setDescription(decodeHtmlEntities(value))
                  touch()
                }}
                onSlug={(value) => {
                  setSlugTouched(true)
                  setSlug(value)
                  touch()
                }}
                onFocusKeyword={(value) => {
                  setFocusKeyword(value)
                  touch()
                }}
              />
            </Panel>

          </div>

          {/* Hidden pickers, triggered from the toolbar and the cover panel. */}
          <input ref={inlineImageRef} type="file" accept="image/*" className="hidden" onChange={onInlineImage} />
        </main>
      </div>

      <ConfirmDialog
        open={confirmRemoveCover}
        onOpenChange={(next) => {
          if (!removingCover) setConfirmRemoveCover(next)
        }}
        title="Remove cover image?"
        description="This image will be removed from this post. If no other post is using it, it will also be deleted from storage."
        confirmLabel="Remove image"
        busyLabel="Removing…"
        busy={removingCover}
        error={coverError}
        onConfirm={onRemoveCover}
      />

      {post ? (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={(next) => {
            /* A dismiss mid-request would leave the action running behind a
               closed dialog, so the only way out while busy is it finishing. */
            if (busy !== 'delete') setConfirmDelete(next)
          }}
          title="Delete this post?"
          description={`“${post.title}” and its page will be removed permanently. There is no undo. Any images it used stay in the library.`}
          confirmLabel="Delete post"
          busyLabel="Deleting…"
          busy={busy === 'delete'}
          error={deleteError}
          onConfirm={onDelete}
        />
      ) : null}
    </AdminShell>
  )
}

/** A settings panel: the same card and heading for every section but Details,
 *  which brings its own chrome because it is the editor. */
function Panel({
  id,
  label,
  hidden,
  children,
}: {
  id: string
  label: string
  hidden: boolean
  children: React.ReactNode
}) {
  return (
    <section
      role="tabpanel"
      id={id}
      aria-label={label}
      className={cn('mt-4 rounded-tile border border-line bg-surface p-5', hidden && 'hidden')}
    >
      <h2 className="mb-4 text-[15px] font-bold tracking-[-0.01em] text-head">{label}</h2>
      {children}
    </section>
  )
}

function MenuItem({
  onClick,
  destructive,
  children,
}: {
  onClick: () => void
  destructive?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'block w-full px-4 py-2 text-left text-[13px] font-semibold transition-colors',
        destructive ? 'text-mut hover:bg-red-50 hover:text-red-600' : 'text-head hover:bg-page'
      )}
    >
      {children}
    </button>
  )
}

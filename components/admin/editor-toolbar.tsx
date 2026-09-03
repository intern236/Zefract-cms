'use client'

import { useEditorState, type Editor } from '@tiptap/react'
import { PANEL_TOP } from '@/components/admin/admin-shell'
import type { LinkButtonVariant } from '@/components/admin/post-editor'
import {
  Bold, ChevronDown, Code2, ImagePlus, Italic, Link2, List, ListOrdered,
  Minus, Quote, Redo2, Square, SquareMousePointer, Strikethrough, Underline, Undo2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The formatting bar over the post body.
 *
 * THE BLOCK TYPE IS A DROPDOWN, not a row of heading buttons. Paragraph,
 * heading, subheading, quote and code block are mutually exclusive — a block is
 * exactly one of them — and a menu says that where five toggles imply they
 * combine. It also names them in words, which is what someone who does not
 * think in "H2" needs.
 *
 * NO H1. The post's title is the page's h1; a second one inside the body is a
 * document with two titles, and the sanitiser's allowlist in lib/blog.ts does
 * not include h1 for the same reason. So "Heading" is h2 and "Subheading" is
 * h3 — the labels say what they do, the levels stay correct underneath.
 *
 * Everything here maps to something the sanitiser will actually keep. A control
 * that produced markup the server strips on save would be a button that quietly
 * undoes itself, which is worse than no button.
 */

const BLOCKS = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'h2', label: 'Heading' },
  { value: 'h3', label: 'Subheading' },
  { value: 'quote', label: 'Quote' },
  { value: 'code', label: 'Code block' },
] as const

type BlockValue = (typeof BLOCKS)[number]['value']

function applyBlock(editor: Editor, value: BlockValue) {
  const chain = editor.chain().focus()
  switch (value) {
    case 'h2':
      chain.setHeading({ level: 2 }).run()
      break
    case 'h3':
      chain.setHeading({ level: 3 }).run()
      break
    case 'quote':
      chain.setBlockquote().run()
      break
    case 'code':
      chain.setCodeBlock().run()
      break
    default:
      /* Leaving a quote needs the wrapper lifted as well as the node reset —
         setParagraph alone would leave the paragraph inside the blockquote. */
      chain.unsetBlockquote().setParagraph().run()
  }
}

/** One toolbar control. onMouseDown preventDefault keeps the editor's selection
 *  alive through the click — without it every button press collapses it. */
function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-[8px] text-mut transition-colors',
        'hover:bg-page hover:text-head disabled:opacity-35 disabled:hover:bg-transparent',
        active && 'bg-brand/10 text-brand-strong'
      )}
    >
      {children}
    </button>
  )
}

export function EditorToolbar({
  editor,
  onPickImage,
}: {
  editor: Editor
  onPickImage: () => void
}) {
  /* v3: the editor no longer re-renders React on every transaction, so the
     active states are read through one useEditorState subscription rather than
     a forced update per keystroke. */
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      block: (instance.isActive('heading', { level: 2 })
        ? 'h2'
        : instance.isActive('heading', { level: 3 })
          ? 'h3'
          : instance.isActive('blockquote')
            ? 'quote'
            : instance.isActive('codeBlock')
              ? 'code'
              : 'paragraph') as BlockValue,
      bold: instance.isActive('bold'),
      italic: instance.isActive('italic'),
      underline: instance.isActive('underline'),
      strike: instance.isActive('strike'),
      code: instance.isActive('code'),
      link: instance.isActive('link'),
      linkButton: (instance.getAttributes('link').button ?? null) as LinkButtonVariant | null,
      bulletList: instance.isActive('bulletList'),
      orderedList: instance.isActive('orderedList'),
      canUndo: instance.can().undo(),
      canRedo: instance.can().redo(),
    }),
  })

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL (https://…)', previous ?? 'https://')
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  /**
   * Cycles the selected link through the two button styles and back to plain:
   * solid pill -> outlined pill -> ordinary link.
   *
   * ONE CONTROL, THREE STATES, rather than two separate buttons. The site's own
   * calls to action come in exactly this pair — a solid primary next to an
   * outlined secondary — so cycling is how you build that pair, and there is
   * never a question of which of two toolbar buttons is currently winning.
   *
   * A LINK IS STILL A LINK. This sets one attribute on the existing mark rather
   * than making a new kind of node, so the thing keeps its href, stays keyboard
   * reachable, and reads as a link to a screen reader — it is styled as a
   * button, which is exactly what the site's own CTAs are.
   *
   * It only applies to a selection that already IS a link, because a button
   * without a destination is decoration. The control disables itself otherwise,
   * which is also the hint about what to do first.
   */
  const NEXT_VARIANT: Record<string, LinkButtonVariant | null> = {
    none: 'solid',
    solid: 'outline',
    outline: null,
  }

  const cycleLinkButton = () => {
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .updateAttributes('link', { button: NEXT_VARIANT[state.linkButton ?? 'none'] })
      .run()
  }

  const divider = <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-line" />

  return (
    /* STICKY, so a long post never strands the controls above the fold. The
       offset comes from PANEL_TOP, which puts it directly under the admin bar,
       which in turn sits under the site header — one stack, defined once in
       admin-shell.tsx. z-10 and the solid fill keep prose from showing through
       while stuck; the document card is deliberately NOT overflow-hidden,
       because sticky dies inside an overflow-clipping ancestor. */
    <div
      className={cn(
        'sticky z-10 flex flex-wrap items-center gap-0.5 rounded-t-tile border-b border-line bg-surface px-2 py-1.5 md:px-3',
        PANEL_TOP
      )}
    >
      {/* The block menu. `native-select` is the same appearance reset the
          contact form's budget select uses, so the open list is styled by the
          rules already in globals.css rather than a second set here. */}
      <div className="relative mr-1">
        <select
          aria-label="Block type"
          value={state.block}
          onChange={(event) => applyBlock(editor, event.target.value as BlockValue)}
          className="native-select h-8 cursor-pointer rounded-[8px] border border-line bg-surface pr-7 pl-2.5 text-[12.5px] font-semibold text-head transition-colors outline-none hover:border-brand/50 focus-visible:border-brand"
        >
          {BLOCKS.map((block) => (
            <option key={block.value} value={block.value}>
              {block.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-mut-2"
        />
      </div>

      {divider}

      <ToolButton label="Bold" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton label="Italic" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton
        label="Underline"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="size-4" />
      </ToolButton>
      <ToolButton label="Strikethrough" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="size-4" />
      </ToolButton>
      <ToolButton label="Inline code" active={state.code} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code2 className="size-4" />
      </ToolButton>
      <ToolButton label="Link" active={state.link} onClick={setLink}>
        <Link2 className="size-4" />
      </ToolButton>
      {/* The label names what the NEXT click does, so the control explains the
          cycle without needing a legend beside it. */}
      <ToolButton
        label={
          state.linkButton === 'solid'
            ? 'Button: solid — click for outlined'
            : state.linkButton === 'outline'
              ? 'Button: outlined — click for a normal link'
              : 'Show link as a button'
        }
        active={state.linkButton !== null}
        disabled={!state.link}
        onClick={cycleLinkButton}
      >
        {state.linkButton === 'outline' ? (
          <Square className="size-4" />
        ) : (
          <SquareMousePointer className="size-4" />
        )}
      </ToolButton>

      {divider}

      <ToolButton
        label="Bullet list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolButton>
      <ToolButton
        label="Numbered list"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolButton>
      <ToolButton label="Quote" active={state.block === 'quote'} onClick={() => applyBlock(editor, 'quote')}>
        <Quote className="size-4" />
      </ToolButton>

      {divider}

      <ToolButton label="Insert image" onClick={onPickImage}>
        <ImagePlus className="size-4" />
      </ToolButton>
      <ToolButton label="Divider line" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </ToolButton>

      {/* Undo and redo sit at the far end, away from everything that changes
          formatting — they act on the document, not on the selection. */}
      <div className="ml-auto flex items-center gap-0.5">
        <ToolButton label="Undo" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </ToolButton>
        <ToolButton label="Redo" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </ToolButton>
      </div>
    </div>
  )
}

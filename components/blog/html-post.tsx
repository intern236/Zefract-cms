import { Container, Section } from '@/components/ui/section'
import { htmlPostDocument, HTML_POST_SCOPE_CLASS } from '@/lib/blog'
import { cn } from '@/lib/utils'

/**
 * A post whose body is a whole HTML page, rendered as a section of this site.
 *
 * IT USED TO REPLACE THE PAGE AND NOW SITS INSIDE IT. The first version suppressed the
 * site's header and footer so the pasted document owned the viewport, which is what was
 * asked for and, seen on screen, read as a raw file served by accident rather than as a
 * post on a website. So the chrome is back: real header above, real footer below, and the
 * document in the middle with the same top clearance and horizontal measure every other
 * page on the site gets. The post's tags, author card and FAQ follow it, rendered by the
 * post page after this component; what it deliberately does not get (the hero, the cover,
 * the prose column) is listed with reasons in app/blog/[slug]/page.tsx.
 *
 * WHICH MAKES THE PAGE'S OWN CSS A PROBLEM, and lib/scope-css.ts is the answer. A
 * stylesheet written for a standalone document says `body { background: … }` and
 * `h2 { font-size: 27px }`, and with a header and footer on the page those rules reach
 * both. htmlPostDocument() rewrites every selector to sit under HTML_POST_SCOPE_CLASS
 * before it gets here, and this component is what puts that class on the wrapper. The two
 * have to agree; the constant is shared so they cannot drift.
 *
 * WHAT MAKES IT SAFE. Nothing here. The boundary is lib/post-page-html.ts and it ran on
 * SAVE, which is the same rule the rich editor's posts follow and why
 * `dangerouslySetInnerHTML` is not dangerous on either path: what is in the database is
 * already what is safe to serve. That module is also what removes `<script>`, so a page
 * pasted here renders exactly as designed and does not execute.
 *
 * WHY THE DOCUMENT IS TAKEN APART FIRST. The root layout owns `<html>` and `<body>` for
 * every route, and the App Router allows exactly one root layout, so a stored document's
 * own `<html>`/`<body>` cannot become the real ones. htmlPostDocument() lifts the styles,
 * the stylesheet links and the page's JSON-LD out of the head — all three are valid in a
 * body and all three have to render for the page to look and index like itself — drops the
 * tags that would be duplicates or strays, and hands back the body.
 *
 * NO LAYOUT STYLES ON THE WRAPPER ITSELF beyond the scope class. The pasted page's own CSS
 * owns everything inside it, and a max-width or a padding added here would fight whatever
 * the author already wrote. <Container> supplies the page gutter, which is a property of
 * this site rather than of the post.
 */
export function HtmlPost({ html }: { html: string }) {
  const doc = htmlPostDocument(html)

  return (
    /**
     * pt-28 md:pt-36 clears the fixed header pill, which ends at 82px on a phone and needs
     * more room on a desktop. The numbers are <PageHero>'s own, one step down: that
     * component opens every other page on the site, and its pt-28 / md:pt-44 is where the
     * clearance is derived. An HTML post has no hero of ours to breathe under, so it takes
     * the phone value unchanged and a little less than the desktop one.
     */
    <Section spacing="tight" className="pt-28 pb-20 md:pt-36">
      <Container>
        <div
          data-html-post
          className={cn(HTML_POST_SCOPE_CLASS)}
          dangerouslySetInnerHTML={{
            /* Styles first, so a rule is in the document before the markup it applies to
               and the page cannot paint once unstyled. */
            __html: doc.head ? `${doc.head}\n${doc.body}` : doc.body,
          }}
        />
      </Container>
    </Section>
  )
}

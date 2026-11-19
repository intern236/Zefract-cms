'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AnimatedMark } from '@/components/motion/animated-mark'
import { SITE, NAV } from '@/content/site'
import { cn } from '@/lib/utils'
import { logout } from '@cms-logic/lib/actions/auth'

export type MegaColumn = {
  slug: string
  name: string
  outcome: string
  services: { slug: string; name: string }[]
}

export type SupportLink = { slug: string; name: string; outcome: string }

/**
 * Shared nav-link styling with NO display utility.
 *
 * The display class is applied per call site on purpose. This used to start with
 * `block`, which tailwind-merge treated as conflicting with the shadcn trigger's
 * own `inline-flex items-center` and dropped it — leaving the trigger's chevron
 * to fall below the label instead of sitting beside it.
 */
const linkBase =
  'rounded-full px-3.5 py-2 font-mono text-[11px] font-medium tracking-[0.16em] uppercase text-mut transition-colors hover:bg-ink/6 hover:text-head'

const linkClass = `block ${linkBase}`

export function HeaderShell({
  columns,
  support,
  signedIn = false,
}: {
  columns: MegaColumn[]
  support: SupportLink[]
  signedIn?: boolean
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  /**
   * Collapse the header once the page has scrolled past the hero's top edge.
   *
   * The state is written straight to a data attribute on the DOM node rather than
   * held in React. Scrolling then costs one attribute write per frame at most and
   * never re-renders the tree, which keeps it off the INP budget. All the visual
   * change lives in CSS (see the [data-header] rules in globals.css).
   */
  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    /**
     * Separate collapse and expand points, not one threshold.
     *
     * With a single value, resting the scroll position on it makes the header
     * flip back and forth on every small movement — and the longer the transition,
     * the worse that reads. The 60px dead zone means a deliberate scroll is needed
     * to change state in either direction.
     */
    const COLLAPSE_AT = 120
    const EXPAND_AT = 60
    let queued = false

    const apply = () => {
      queued = false
      const y = window.scrollY
      const isCollapsed = el.dataset.scrolled === 'true'
      const next = isCollapsed ? (y < EXPAND_AT ? 'false' : 'true') : y > COLLAPSE_AT ? 'true' : 'false'
      if (el.dataset.scrolled !== next) el.dataset.scrolled = next

      /* A second, much lower threshold, for the scrim behind the pill. It cannot
         reuse COLLAPSE_AT: content starts passing behind the header from the very
         first pixel of scroll, so a 120px threshold would leave text bleeding
         through for the whole first swipe. Nothing to hide at rest, so the scrim
         stays off at y=0 and the hero's grid reaches the top edge untouched. */
      const past = y > 4 ? 'true' : 'false'
      if (el.dataset.past !== past) el.dataset.past = past
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(apply)
    }

    apply() // handle a restored scroll position on load
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        ref={headerRef}
        data-header
        data-scrolled="false"
        data-past="false"
        /* calc + max-width rather than a single min(): the collapse animates
           max-width, and interpolating between two plain lengths is unambiguous
           where interpolating between math functions is not. */
        className="fixed top-4 left-1/2 z-80 w-[calc(100%-28px)] max-w-[1060px] -translate-x-1/2 rounded-full border border-line/90 bg-white/75 shadow-[0_18px_40px_-20px_rgba(8,20,34,0.28)] backdrop-blur-lg"
      >
        <div data-header-bar className="flex items-center justify-between gap-4 py-2.5 pr-3 pl-6">
          <Link href="/" aria-label={`${SITE.name} home`} className="flex items-center gap-2.5">
            <span data-header-mark className="block h-7 w-7 shrink-0 transition-[height,width] duration-300">
              <AnimatedMark className="h-full w-full text-head" />
            </span>
            <span
              data-header-wordmark
              className="text-[22px] font-extrabold tracking-[-0.04em] text-head transition-[font-size] duration-300"
            >
              {SITE.name}
            </span>
          </Link>

          {/* Desktop nav. Radix drives the mega menu so it opens on keyboard as well
            as pointer — a hover-only menu would fail WCAG 2.1.1. */}
          {/* `static` on the root and the item is deliberate: both default to
            `relative`, which would make the dropdown position against the trigger
            and overflow the header's right edge. Removing them promotes the fixed
            <header> to the containing block, so the panel can span its full width. */}
          <NavigationMenu data-header-nav className="static hidden lg:flex" viewport={false}>
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem className="static">
                <NavigationMenuTrigger
                  className={cn(
                    'inline-flex h-auto items-center leading-none',
                    linkBase,
                    'bg-transparent hover:bg-ink/6 data-[state=open]:bg-ink/6',
                    // shadcn offsets the chevron by top-px, which suits mixed-case
                    // labels. Ours is all-caps, so the optical centre is higher.
                    '[&>svg]:top-0'
                  )}
                >
                  Services
                </NavigationMenuTrigger>
                {/* Spanning the header takes `fixed`, not `absolute`.
                  Radix injects an unstyled wrapper with an inline `position:relative`
                  between the nav and the list, and an inline style cannot be beaten by
                  a class — so `absolute` would anchor to that ~340px wrapper and spill
                  past the header's right edge. The header carries -translate-x-1/2, and
                  a transformed ancestor is the containing block for fixed descendants,
                  so `fixed inset-x-0` resolves against the header itself.
                  Insets rather than a centring transform: the open/close animation
                  drives `transform`, which would clobber -translate-x-1/2 mid-flight. */}
                <NavigationMenuContent className="mt-3 rounded-3xl border-line p-0 md:fixed md:inset-x-0 md:w-auto">
                  <div className="grid w-full grid-cols-5 gap-x-6 gap-y-2 p-8">
                    {columns.map((col) => (
                      <div key={col.slug}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={`/services/${col.slug}`}
                            className="mb-3 block text-[13.5px] leading-snug font-bold text-head hover:text-brand-strong"
                          >
                            {col.name}
                          </Link>
                        </NavigationMenuLink>
                        <ul className="space-y-1">
                          {col.services.map((s) => (
                            <li key={s.slug}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={`/services/${s.slug}`}
                                  className="block py-1 text-[13px] leading-snug text-mut hover:text-head"
                                >
                                  {s.name}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {support.length > 0 ? (
                    /* NO RADIUS OF ITS OWN — the panel clips it.
                       This carried `rounded-b-3xl`, which left a white crescent in each bottom
                       corner of the open menu. The bar is flush with the panel on all three edges
                       (measured: identical left, right and bottom), so it was never a spacing
                       problem: the bar rounded at 39.6px inside a panel that clips at 18px, and the
                       21.6px the bar pulled away from each corner showed the panel's own white
                       background through.
                       The mismatch is the tailwind-merge trap this file already documents at
                       <SheetContent>. The panel asks for `rounded-3xl`, but shadcn's base carries
                       `group-data-[viewport=false]/navigation-menu:rounded-lg`; merge keeps both
                       because a variant-prefixed class is a different group to a plain one, and the
                       prefixed one sorts later — so the panel is 18px and its `rounded-3xl` is inert.
                       Rather than matching a number that is itself accidental, the bar now states no
                       radius at all. The panel is `overflow-hidden`, so it clips this to whatever its
                       own corner is, and the two cannot disagree again if that number changes. */
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line bg-page px-7 py-4">
                      {support.map((s) => (
                        <NavigationMenuLink asChild key={s.slug}>
                          <Link
                            href={`/services/${s.slug}`}
                            className="text-[13px] font-semibold text-head hover:text-brand-strong"
                          >
                            {s.name}
                            <span className="ml-2 font-normal text-mut">{s.outcome}</span>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  ) : null}
                </NavigationMenuContent>
              </NavigationMenuItem>

              {NAV.filter((n) => n.label !== 'Services').map((n) => (
                <NavigationMenuItem key={n.href}>
                  <NavigationMenuLink asChild>
                    <Link href={n.href} className={linkClass}>
                      {n.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className="hidden rounded-full border border-line px-5 py-3 font-mono text-[11px] font-medium tracking-[0.14em] text-head uppercase transition hover:-translate-y-0.5 hover:border-head hover:bg-ink/5 sm:inline-flex"
            >
              Start a project
            </Link>
            {signedIn ? (
              <form action={logout} className="hidden sm:inline-flex">
                <button
                  type="submit"
                  className="rounded-full bg-ink px-5 py-3 font-mono text-[11px] font-medium tracking-[0.14em] text-white uppercase shadow-[0_14px_30px_-12px_rgba(8,20,34,0.45)] transition hover:-translate-y-0.5 hover:bg-ink-2 cursor-pointer"
                >
                  Sign out
                </button>
              </form>
            ) : (
              <Link
                href="/cms/login"
                className="hidden rounded-full bg-ink px-5 py-3 font-mono text-[11px] font-medium tracking-[0.14em] text-white uppercase shadow-[0_14px_30px_-12px_rgba(8,20,34,0.45)] transition hover:-translate-y-0.5 hover:bg-ink-2 sm:inline-flex"
              >
                Sign in
              </Link>
            )}

            {/* Mobile */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                aria-label="Open menu"
                className="inline-flex size-11 items-center justify-center rounded-full text-head lg:hidden"
              >
                <Menu className="size-5" />
              </SheetTrigger>
              {/* The `!` is load-bearing. <SheetContent> carries
                `data-[side=right]:w-3/4`, and a variant-prefixed utility sorts after a
                plain one in the generated CSS, so it won regardless of the order these
                classes appear in — the panel came out 240px at a 320px viewport instead
                of the 294px asked for here, crowding the longer service names against
                its right edge. tailwind-merge cannot resolve this either: it treats the
                prefixed and unprefixed classes as different groups and keeps both. */}
              <SheetContent side="right" className="w-[min(92vw,380px)]! overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="px-4 pb-10">
                  {columns.map((col) => (
                    <div key={col.slug} className="border-b border-line py-4">
                      <Link
                        href={`/services/${col.slug}`}
                        onClick={() => setMobileOpen(false)}
                        /* leading-6 gives this block link a 24px box. At 15px with the
                           default line-height it measured 21px, under SC 2.5.8's 24px
                           pointer target — and these are the top-level links in the
                           mobile menu, so they are the ones most often aimed at. */
                        className="block text-[15px] leading-6 font-bold text-head"
                      >
                        {col.name}
                      </Link>
                      <ul className="mt-2 space-y-1">
                        {col.services.map((s) => (
                          <li key={s.slug}>
                            <Link
                              href={`/services/${s.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="block py-1.5 text-[14px] text-mut"
                            >
                              {s.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {NAV.filter((n) => n.label !== 'Services').map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setMobileOpen(false)}
                      className="block border-b border-line py-4 text-[15px] font-bold text-head"
                    >
                      {n.label}
                    </Link>
                  ))}
                  <Link
                    href="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-4 font-mono text-[12px] tracking-[0.14em] text-white uppercase sm:text-[11px]"
                  >
                    Start a project
                  </Link>
                  {signedIn ? (
                    <form action={logout} className="mt-3">
                      <button
                        type="submit"
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex w-full items-center justify-center rounded-full border border-line py-3.5 font-mono text-[12px] tracking-[0.14em] text-head uppercase transition hover:bg-ink/5 cursor-pointer"
                      >
                        Sign out
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/cms/login"
                      onClick={() => setMobileOpen(false)}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-line py-3.5 font-mono text-[12px] tracking-[0.14em] text-head uppercase transition hover:bg-ink/5"
                    >
                      Sign in
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Backdrop for the floating pill.

        The pill is inset 14px each side and sits 16px down, so on a phone there is a
        16px strip above it and a 14px gutter either side where page content scrolls
        past in full view — measured at 375/390/430, page text was visible at 20 of the
        sampled points in that strip. This covers it with the page colour, fading out
        below the pill so there is no hard edge.

        A SIBLING of <header>, not a child: the header carries -translate-x-1/2, and a
        transformed ancestor is the containing block for fixed descendants, so a nested
        `fixed inset-x-0` would resolve against the pill's own 362px box instead of the
        viewport. Same trap the mega menu documents above.

        lg:hidden — from lg up the pill is a 1060px island in a much wider viewport and
        content passing either side of it is the intended look, not a defect.

        z-70 keeps it under the header (80) and over page content. */}
      <div aria-hidden="true" data-header-scrim className="lg:hidden" />
    </>
  )
}

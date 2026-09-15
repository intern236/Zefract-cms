'use client'

import { useMemo } from 'react'
import { Check, Info, X } from 'lucide-react'
import { FIELD_BASE } from '@/components/forms/field'
import { Label } from '@/components/ui/label'
import { slugify } from '@/lib/slug'
import { absoluteUrl, siteHost } from '@/lib/url'
import { cn } from '@/lib/utils'

/**
 * The SEO section: what a search engine will be given, what it will look like,
 * and where it currently falls short.
 *
 * THE SCORE IS COMPUTED, NOT ASSERTED. Every check is a property of what has
 * actually been typed — a length, a presence, a substring — so the number moves
 * as the work does and cannot flatter anyone. Nothing blocks a save: these are
 * things worth knowing before publishing, not rules, which is why a failed
 * check is grey rather than red.
 *
 * THE KEYWORD CHECKS ONLY EXIST WHEN THERE IS A KEYWORD. Showing four
 * permanently-failing rows to someone who has not set one would report a good
 * post as 0/10 and teach them to ignore the score. With no keyword the list is
 * six checks long; with one it is ten.
 *
 * The lengths are the ones lib/seo.ts already clamps generated copy to, for the
 * same reason: roughly 60 characters of title and 160 of description are what a
 * result shows. They are approximate by nature — search engines measure pixels,
 * not characters — so they warn rather than forbid.
 */

const TITLE_MIN = 20
const TITLE_MAX = 60
const DESCRIPTION_MIN = 70
/** What a search result actually displays. Guidance, not a cap — see
 *  DESCRIPTION_LIMIT below for the difference, which used to not exist. */
const DESCRIPTION_MAX = 160
/**
 * What the field accepts. Mirrors POST_LIMITS.description in lib/blog.ts, which
 * enforces it server-side and is the number that counts.
 *
 * MIRRORED BY HAND RATHER THAN IMPORTED, and it has to be: lib/blog.ts pulls in
 * the MongoDB driver, so importing it into this client component would be a
 * build error. Same arrangement, and the same reason, as TITLE_TARGET and
 * TAG_MAX in post-editor.tsx. Change one, change the other.
 *
 * THE GAP BETWEEN THIS AND DESCRIPTION_MAX IS THE POINT. Past 160 characters a
 * description is still published in full and still indexed; what happens is that
 * a result shows only the first part of it. Before, the published description
 * was clamped at 155 whatever was typed, so the two numbers described the same
 * wall and the writer could not tell the difference between advice and a limit.
 * Now the counter warns at 160 and the field stops at 320.
 */
const DESCRIPTION_LIMIT = 320
const KEYWORD_MAX = 60
const WORDS_MIN = 300

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text
  const cut = text.slice(0, limit)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

export function SeoPanel({
  title,
  seoTitle,
  description,
  slug,
  slugLocked,
  focusKeyword,
  bodyText,
  words,
  hasCover,
  coverAlt,
  hasHeading,
  tagCount,
  errors,
  onSeoTitle,
  onDescription,
  onSlug,
  onFocusKeyword,
}: {
  /** The post's own headline, used when no SEO title overrides it. */
  title: string
  seoTitle: string
  description: string
  slug: string
  slugLocked: boolean
  focusKeyword: string
  /** The body as plain text, for the "keyword appears in the content" check. */
  bodyText: string
  words: number
  hasCover: boolean
  coverAlt: string
  hasHeading: boolean
  tagCount: number
  errors: Record<string, string>
  onSeoTitle: (value: string) => void
  onDescription: (value: string) => void
  onSlug: (value: string) => void
  onFocusKeyword: (value: string) => void
}) {
  /* What a result would actually show: the override where there is one, the
     headline where there is not. Everything below judges THIS, not the raw
     title field, because this is the string that ships. */
  const effectiveTitle = seoTitle.trim() || title.trim()

  const checks = useMemo(() => {
    const keyword = focusKeyword.trim().toLowerCase()
    const t = effectiveTitle.length
    const d = description.trim().length

    const base = [
      {
        label: 'Title is 20–60 characters',
        pass: t >= TITLE_MIN && t <= TITLE_MAX,
        detail: t === 0 ? 'not written' : `${t} chars`,
      },
      {
        /* Names the reason rather than the rule. The number is not a limit any
           more — a longer description publishes whole — so a check reading
           "70-160 characters" would look like a cap the writer had broken. */
        label: 'Description fits a search result',
        pass: d >= DESCRIPTION_MIN && d <= DESCRIPTION_MAX,
        detail: d === 0 ? 'not written' : `${d} / ${DESCRIPTION_MAX}`,
      },
      { label: 'At least 300 words', pass: words >= WORDS_MIN, detail: `${words} words` },
      {
        label: 'Uses a heading to break up the text',
        pass: hasHeading,
        detail: hasHeading ? 'yes' : 'none',
      },
      {
        label: 'Cover image has alt text',
        pass: hasCover && coverAlt.trim().length > 0,
        detail: !hasCover ? 'no cover' : coverAlt.trim() ? 'yes' : 'missing',
      },
      { label: 'Has at least one tag', pass: tagCount > 0, detail: `${tagCount} tags` },
    ]

    if (!keyword) {
      return [
        { label: 'Focus keyword is set', pass: false, detail: 'not set' },
        ...base,
      ]
    }

    return [
      { label: 'Focus keyword is set', pass: true, detail: 'set' },
      {
        label: 'Keyword appears in the title',
        pass: effectiveTitle.toLowerCase().includes(keyword),
        detail: effectiveTitle.toLowerCase().includes(keyword) ? 'yes' : 'missing',
      },
      {
        label: 'Keyword appears in the description',
        pass: description.toLowerCase().includes(keyword),
        detail: description.toLowerCase().includes(keyword) ? 'yes' : 'missing',
      },
      {
        label: 'Keyword appears in the URL',
        pass: slug.includes(slugify(keyword)) && slugify(keyword).length > 0,
        detail: slug.includes(slugify(keyword)) ? 'yes' : 'missing',
      },
      {
        label: 'Keyword appears in the content',
        pass: bodyText.toLowerCase().includes(keyword),
        detail: bodyText.toLowerCase().includes(keyword) ? 'yes' : 'missing',
      },
      ...base,
    ]
  }, [
    focusKeyword, effectiveTitle, description, slug, bodyText, words,
    hasHeading, hasCover, coverAlt, tagCount,
  ])

  const passed = checks.filter((check) => check.pass).length
  const host = siteHost()

  return (
    <div className="space-y-7">
      <div className="grid gap-7 lg:grid-cols-2">
        {/* ---- What gets published ------------------------------------- */}
        <div className="space-y-5">
          <div>
            <Label htmlFor="focusKeyword" className="text-[13.5px] font-semibold text-head">
              Focus Keyword
            </Label>
            <div className="relative mt-1.5">
              <input
                id="focusKeyword"
                name="focusKeyword"
                value={focusKeyword}
                maxLength={KEYWORD_MAX}
                onChange={(event) => onFocusKeyword(event.target.value)}
                placeholder="The phrase this post should rank for"
                aria-invalid={errors.focusKeyword ? true : undefined}
                className={cn(FIELD_BASE, 'h-11 pr-16 pl-4 text-[14px]')}
              />
              <InlineCounter value={focusKeyword.length} max={KEYWORD_MAX} />
            </div>
            <p className="mt-1.5 text-[12.5px] text-mut-2">
              Never published. It is what the checks below measure against.
            </p>
            {errors.focusKeyword ? (
              <p className="mt-1 text-[13px] text-red-600">{errors.focusKeyword}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="seoTitle" className="text-[13.5px] font-semibold text-head">
              SEO Title
            </Label>
            <div className="relative mt-1.5">
              <input
                id="seoTitle"
                name="seoTitle"
                value={seoTitle}
                maxLength={80}
                onChange={(event) => onSeoTitle(event.target.value)}
                placeholder={title.trim() || 'Defaults to the post title'}
                aria-invalid={errors.seoTitle ? true : undefined}
                className={cn(FIELD_BASE, 'h-11 pr-16 pl-4 text-[14px]')}
              />
              <InlineCounter value={effectiveTitle.length} max={TITLE_MAX} />
            </div>
            <p className="mt-1.5 text-[12.5px] text-mut-2">
              Leave empty to use the post title. Set it when the headline is too long for a
              result.
            </p>
            {errors.seoTitle ? (
              <p className="mt-1 text-[13px] text-red-600">{errors.seoTitle}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="description" className="text-[13.5px] font-semibold text-head">
              Meta Description
            </Label>
            <div className="relative mt-1.5">
              <textarea
                id="description"
                name="description"
                value={description}
                /* The hard cap, so the field itself stops at what the server
                   will store. Without it an over-long description was accepted
                   here and refused on save, which is the worst order to find
                   out. The counter's 160 is the softer, editorial number. */
                maxLength={DESCRIPTION_LIMIT}
                onChange={(event) => onDescription(event.target.value)}
                placeholder="Write a short description…"
                aria-invalid={errors.description ? true : undefined}
                className={cn(FIELD_BASE, 'min-h-28 pr-16 pl-4 py-3 text-[14px] leading-relaxed')}
              />
              <InlineCounter value={description.length} max={DESCRIPTION_MAX} top />
            </div>
            <p className="mt-1.5 text-[12.5px] text-mut-2">
              For search results only — it is not shown on the site. The line under the
              title on blog cards and on the post is the Byline description, in the
              Content panel.
            </p>
            {/* Only once it is over, so the ordinary case stays quiet. It says what
                happens rather than telling the writer off: the description publishes
                whole either way, and the only consequence is where a result stops
                showing it. The preview above draws that cut. */}
            {description.length > DESCRIPTION_MAX ? (
              <p className="mt-1 text-[12.5px] text-mut">
                Published in full. A search result shows roughly the first{' '}
                {DESCRIPTION_MAX} characters, so the rest is for the reader who
                opens the page. The field stops at {DESCRIPTION_LIMIT}.
              </p>
            ) : null}
            {errors.description ? (
              <p className="mt-1 text-[13px] text-red-600">{errors.description}</p>
            ) : null}
          </div>
        </div>

        {/* ---- The address, and the result ----------------------------- */}
        <div className="space-y-5">
          <div>
            <Label htmlFor="seoSlug" className="text-[13.5px] font-semibold text-head">
              URL Slug
            </Label>
            <input
              id="seoSlug"
              name="seoSlug"
              value={slug}
              disabled={slugLocked}
              onChange={(event) => onSlug(slugify(event.target.value))}
              placeholder="from-the-title"
              aria-invalid={errors.slug ? true : undefined}
              className={cn(
                FIELD_BASE,
                'mt-1.5 h-11 px-4 font-mono text-[13.5px] disabled:cursor-not-allowed disabled:opacity-60'
              )}
            />
            <p className="mt-1.5 font-mono text-[12.5px] break-all text-mut-2">
              {host}/blog/<span className="font-semibold text-head">{slug || '…'}</span>
            </p>
            {slugLocked ? (
              <p className="mt-1 text-[12.5px] text-mut-2">
                Locked: the post is published and this URL may already be linked.
              </p>
            ) : null}
            {errors.slug ? <p className="mt-1 text-[13px] text-red-600">{errors.slug}</p> : null}
          </div>

          {/* The result itself, in this site's colours rather than Google's.
              It started with Google's link blue and was changed on request: an
              imported blue was the only thing on the page that belonged to
              another brand, and the layout alone — title over URL over snippet
              — already reads unmistakably as a search result. Brand orange for
              the title, green for the URL, both from the palette. */}
          <div className="rounded-tile border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-head">Google Preview</p>
              <span title="An approximation — search engines measure pixels, not characters, and rewrite snippets they think fit better.">
                <Info className="size-3.5 text-mut-2" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-3 border-t border-line pt-3">
              {/* brand-strong, not brand: this is small text on white, where
                  #E6551E measures 3.32:1 and misses AA. Same rule as every
                  other small orange label on the site. */}
              <p className="text-[16px] leading-snug font-medium text-brand-strong">
                {truncate(effectiveTitle || 'Your post title', TITLE_MAX)}
              </p>
              {/* The real published URL, built by the same helper the page's own
                  canonical uses — so what the writer is shown here is the address that
                  will actually be indexed, host and all, rather than a lookalike. */}
              <p className="mt-1 truncate font-mono text-[12px] text-emerald-700">
                {slug ? absoluteUrl(`/blog/${slug}`) : `${absoluteUrl('/blog')}/…`}
              </p>
              <p className="mt-1.5 text-[13px] leading-[1.5] text-mut">
                {truncate(
                  description.trim() ||
                    'Your description appears here, under the title and the link.',
                  DESCRIPTION_MAX
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Score and checks ------------------------------------------- */}
      <div className="border-t border-line pt-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <ScoreDial passed={passed} total={checks.length} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-head">
              {passed === checks.length
                ? 'Everything checks out'
                : `${checks.length - passed} thing${checks.length - passed === 1 ? '' : 's'} left`}
            </p>
            <p className="mt-1 max-w-[52ch] text-[12.5px] text-mut">
              Guidance, not gates — none of this stops you publishing. The score is the
              proportion of the checks below that currently pass.
            </p>
          </div>
        </div>

        <ul className="mt-5 grid gap-x-8 gap-y-1.5 md:grid-cols-2">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center gap-2.5 text-[13px]">
              <span
                className={cn(
                  'grid size-4 shrink-0 place-items-center rounded-full',
                  check.pass ? 'bg-emerald-600/12 text-emerald-700' : 'bg-page text-mut-2'
                )}
              >
                {check.pass ? (
                  <Check className="size-2.5" aria-hidden="true" />
                ) : (
                  <X className="size-2.5" aria-hidden="true" />
                )}
              </span>
              <span className={cn('min-w-0 flex-1', check.pass ? 'text-head' : 'text-mut')}>
                {check.label}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-mut-2 tabular-nums">
                {check.detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * The score as a ring: passed checks out of the total, drawn as a percentage.
 *
 * An SVG circle with a dashed stroke — `strokeDasharray` is the circumference
 * and `strokeDashoffset` is the unfilled remainder, which is the standard way
 * to draw an arc without a chart library for one number.
 *
 * `-rotate-90` because SVG circles start at three o'clock and a gauge that
 * starts anywhere but the top reads as broken.
 *
 * Emerald past 80, brand below it. Two states, not a traffic light: the useful
 * distinction is "ready" versus "still work to do", and a third colour in the
 * middle only invites arguing about where the boundaries are.
 */
function ScoreDial({ passed, total }: { passed: number; total: number }) {
  const score = total === 0 ? 0 : Math.round((passed / total) * 100)
  const good = score >= 80
  const radius = 26
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="relative size-16">
        <svg viewBox="0 0 64 64" className="size-16 -rotate-90" role="img" aria-label={`SEO score ${score} out of 100`}>
          <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="6" className="stroke-line" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - score / 100)}
            className={cn(
              'transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none',
              good ? 'stroke-emerald-600' : 'stroke-brand'
            )}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <span className="font-mono text-[16px] font-medium text-head tabular-nums">{score}</span>
        </span>
      </div>
      <div>
        <p className="font-mono text-[10.5px] font-medium tracking-[0.16em] text-mut-2 uppercase">
          SEO score
        </p>
        <p
          className={cn(
            'text-[13.5px] font-bold',
            good ? 'text-emerald-700' : 'text-brand-strong'
          )}
        >
          {good ? 'Good' : score >= 50 ? 'Fair' : 'Needs work'}
        </p>
        <p className="font-mono text-[11px] text-mut-2 tabular-nums">
          {passed}/{total} checks
        </p>
      </div>
    </div>
  )
}

/** The counter that sits inside a field, as the reference lays it out. */
function InlineCounter({ value, max, top }: { value: number; max: number; top?: boolean }) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute right-3 font-mono text-[11px] tabular-nums',
        /* A textarea grows, so its counter pins to the top rather than floating
           in the middle of a box the writer keeps making taller. */
        top ? 'top-3' : 'top-1/2 -translate-y-1/2',
        value > max ? 'text-brand-strong' : 'text-mut-2'
      )}
    >
      {value}/{max}
    </span>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CaseNarrative } from '@/components/sections/case-narrative'
import { PageHero } from '@/components/ui/page-hero'
import { Container, Section } from '@/components/ui/section'
import { Reveal } from '@/components/motion/reveal'
import { CtaBand } from '@/components/sections/cta-band'
import { CaseStudySchema } from '@/lib/schema'
import { getCaseStudies, getCaseStudy, getService } from '@/lib/content'
import { authoredMetadataFor, clampDescription, firstSentence, pageOpenGraph } from '@/lib/seo'

export async function generateStaticParams() {
  const cases = await getCaseStudies()
  return cases.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const study = await getCaseStudy(slug)
  if (!study) return {}

  const keywords = [study.client, study.sector, `${study.sector} case study`]

  /* The client wrote a title and description for all three case studies, so this is the
     path every one of them takes. The derived version below is kept for the fourth study,
     which will exist before anyone writes a row for it. */
  const authored = authoredMetadataFor(`/work/${slug}`)
  if (authored) return { ...authored, keywords }

  /* First sentence only: these titles are two sentences, which reaches 80 characters once
     the `| Zefract` template is added and gets cut off in the result. Then clamped to 55,
     because one first sentence (Veloce's) is itself 60 characters and still overflowed the
     ~60 the SERP shows; the clamp cuts at a word boundary and drops trailing punctuation,
     so the shortened form reads as a phrase rather than an amputation. */
  const title = clampDescription(`${study.client}: ${firstSentence(study.title)}`, 55)
  const description = clampDescription(study.problem)

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/work/${slug}` },
    /* Own share card rather than the root's, which titles every page with the site name.
       See the note on pageOpenGraph for why the whole object has to be restated. */
    openGraph: pageOpenGraph({ title, description, path: `/work/${slug}` }),
  }
}

export default async function CaseStudyPage({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params
  const study = await getCaseStudy(slug)
  if (!study) notFound()

  const related = (
    await Promise.all(study.services.map((s) => getService(s)))
  ).filter((s) => s !== undefined)

  return (
    <>
      <CaseStudySchema study={study} />
      <PageHero
        eyebrow={`${study.client} · ${study.sector}`}
        heading={study.title}
        trail={[
          { name: 'Home', href: '/' },
          { name: 'Work', href: '/work' },
          { name: study.client, href: `/work/${study.slug}` },
        ]}
      />

      <Section spacing="tight">
        <Container>
          {/* NO COVER IMAGE ON THIS PAGE, at the client's request.
              The 21:9 banner that used to sit here is gone; the study's cover still
              renders on the surfaces that lead TO this page — the home page's featured
              card and the Work index — where it is doing the job of getting the card
              looked at. Here the reader has already arrived, and the facts and the
              figures start the page instead.

              <CaseCover> and the `image` field are untouched, so putting the banner back
              is this block and nothing else. */}

          {/* The engagement's own facts, where the client's document supplies them.
              First on the page now, which suits them: they answer "who and when" before
              the reader starts on "what happened". */}
          {study.facts && study.facts.length > 0 ? (
            <Reveal>
              {/* AUTO-FIT, NOT A FIXED FOUR. Seair's document supplies four facts and
                  Eximpedia's supplies five, and `sm:grid-cols-4` stranded the fifth
                  alone on a second row. auto-fit lays as many equal columns as fit and
                  collapses the empty tracks, so four comes out as four and five as
                  five without either study having to pad or drop a row. */}
              <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-y border-line py-7 sm:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]">
                {study.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="font-mono text-[11px] tracking-[0.16em] text-mut-2 uppercase">
                      {fact.label}
                    </dt>
                    <dd className="mt-1.5 text-[15px] font-semibold text-head">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ) : null}

          <Reveal className="mt-14">
            {/* Same reasoning as the facts row above: Seair has three outcomes,
                Eximpedia has four, and a hard `sm:grid-cols-3` left the fourth card
                sitting alone at full width under the other three. 14rem is the floor a
                44px figure and its label need before the label starts wrapping badly;
                at the 1180px container that yields four columns for four cards and
                three for three. */}
            <div className="grid gap-4.5 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
              {study.outcomes.map((o) => (
                <div key={o.label} className="rounded-card border border-line bg-surface p-7">
                  <p className="text-[44px] leading-none font-extrabold tracking-[-0.04em] text-head">
                    {o.value}
                  </p>
                  <p className="mt-2 text-[14.5px] text-mut">{o.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/**
           * ONE READING COLUMN AND ONE RAIL, for the whole body of the page.
           *
           * WHAT THIS REPLACES. The summary sat in its own `lg:grid-cols-[1fr_0.8fr]`
           * grid and the written document came after it in a separate section that
           * centred itself — so "The problem" and "What we did" were flush left while
           * every paragraph of the document below started about 260px further in. Two
           * left margins on one page, with the seam right where a reader crosses from
           * the summary into the story. That is the layout complaint.
           *
           * The quote and the service chips were the other half of it. They are short,
           * the bullet list beside them is not, and they scrolled away after a screen —
           * leaving a column-wide hole running the length of the document.
           *
           * SO: explicit row and column placement rather than source order. The summary
           * takes row 1 of the reading column, the document takes row 2 of the SAME
           * column at the same measure, and the rail spans both rows and sticks. The
           * DOM order stays summary -> rail -> document, which is what the single
           * column below lg renders and is exactly the order it had before, so nothing
           * about the phone layout changes.
           *
           * `lg:self-start` is load-bearing on the rail: a grid item stretches to its
           * row height by default, which would leave `sticky` with nothing to travel
           * inside. It has to be its own content's height for the stick to happen.
           */}
          <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
            {/* max-w-[68ch] here rather than on each child: it is the measure the
                document below shares, so the summary and the story line up on both
                edges instead of only the left. */}
            <div className="min-w-0 max-w-[68ch] lg:col-start-1 lg:row-start-1">
              <Reveal>
                <h2 className="text-[26px] font-extrabold tracking-[-0.025em] text-head">
                  The problem
                </h2>
                <p className="mt-3 text-[16.5px] leading-relaxed text-mut">{study.problem}</p>
              </Reveal>

              <Reveal className="mt-10">
                <h2 className="text-[26px] font-extrabold tracking-[-0.025em] text-head">
                  What we did
                </h2>
                <ul className="mt-4 space-y-3">
                  {study.what.map((item) => (
                    <li key={item} className="flex gap-3 text-[16.5px] leading-relaxed text-mut">
                      <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <aside className="lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
              {study.quote ? (
                <Reveal>
                  <figure className="rounded-card border border-line bg-surface p-7">
                    <blockquote className="text-[18px] leading-relaxed text-head">
                      “{study.quote.text}”
                    </blockquote>
                    <figcaption className="mt-5 text-[14px]">
                      <b className="block font-bold text-head">{study.quote.author}</b>
                      <span className="text-mut">{study.quote.role}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              ) : null}

              {related.length > 0 ? (
                <Reveal className="mt-6">
                  <p className="font-mono text-[12px] tracking-[0.2em] text-mut uppercase sm:text-[11px]">
                    Services used
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {related.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/services/${s.slug}`}
                        /* .chip-pop, same as every other pill on the site. It owns
                           the transition, so no transition-* utility here — that
                           would win the cascade and strand the transform. */
                        className="chip-pop rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] font-semibold text-head"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </Reveal>
              ) : null}
            </aside>

            {/* The client's written case study, where there is one. It follows the
                summary rather than replacing it: the block above is what a reader
                scans to decide whether to read on, and this is what they read. Row 2
                of the same column, so the two share a left edge and a measure. */}
            <div className="min-w-0 max-w-[68ch] lg:col-start-1 lg:row-start-2">
              <CaseNarrative study={study} />
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  )
}

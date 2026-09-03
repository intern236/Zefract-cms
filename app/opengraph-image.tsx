import { ImageResponse } from 'next/og'
import { SITE } from '@/content/site'
import { siteHost } from '@/lib/url'

/**
 * The site's Open Graph card, generated once at build time.
 *
 * WHY IT EXISTS AT ALL. The root metadata declares `twitter.card = 'summary_large_image'`,
 * which promises an image and had none, so every share rendered as a bare link with an empty
 * frame. This file is the Next convention for it: exporting it here gives every route an
 * `og:image` through metadata inheritance, so a page has to opt out rather than remember to
 * opt in.
 *
 * Drawn rather than shipped as a file so it cannot drift from the brand tokens. Satori, which
 * backs ImageResponse, supports a subset of CSS: every element with more than one child needs
 * an explicit `display: flex`, and there is no `gap` shorthand inheritance to rely on, hence
 * the margins below.
 */
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${SITE.name}: ${SITE.tagline}`

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0F2038',
          padding: '72px 80px',
        }}
      >
        {/* The brand rule, standing in for the mark: Satori cannot rasterise the SVG
            wordmark, and a wrong logo is worse than an honest one. */}
        <div style={{ display: 'flex', width: 132, height: 10, background: '#E6551E' }} />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
            }}
          >
            {SITE.name}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 40,
              color: '#C6D4E4',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            {SITE.tagline}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 26, color: '#9FB2C7', letterSpacing: '0.1em' }}>
          {siteHost()}
        </div>
      </div>
    ),
    size
  )
}

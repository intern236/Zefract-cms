import { Marquee } from '@/components/sections/marquee'
import { CLIENT_LOGOS } from '@/content/site'

/**
 * The client logo strip, between the hero and the proof bento.
 *
 * ITS OWN COMPONENT RATHER THAN JSX IN app/page.tsx, because building the items means
 * mapping data into markup and the home page is a list of sections. It also keeps the one
 * place that knows how a logo is drawn — the height cap and the width cap — next to
 * the note explaining why those numbers are what they are.
 *
 * A SERVER COMPONENT. <Marquee> is the client half and needs to be, since it tracks hover
 * and focus to pause itself; these nodes are built on the server and handed over as
 * elements, so nothing about the logos or their addresses enters the client bundle as data.
 *
 * Logos are display-only. The strip stops on hover and on keyboard focus — see the note in
 * marquee.tsx — so the moving row remains easy to inspect.
 */
export function ClientLogos() {
  return (
    <Marquee
      /* Names the whole strip for assistive tech. "Clients we have worked with" rather
         than "logos": it describes what the list IS, not what it is made of. */
      label="Clients we have worked with"
      className="mt-10"
      items={CLIENT_LOGOS.map((client) => ({
        key: client.name,
        node: (
          <span className="inline-flex h-10 items-center transition-opacity hover:opacity-70">
            {/* eslint-disable-next-line @next/next/no-img-element -- These are 5-24KB WebP
                files already sized at 3x the box they render in, with alpha. Next's
                optimizer would put a proxy hop in front of an asset it cannot meaningfully
                improve, which is the same call the blog covers and the author avatars make.

                CAPPED ON BOTH AXES, AND THAT IS WHAT MAKES THE ROW LOOK EVEN. Height alone
                is the obvious rule and it is wrong here: these marks range from 6.9:1
                (Proffer, a long wordmark) to 1.2:1 (Decor Masters, a stacked mark), so at
                one shared height the wordmarks run 230px wide while the stacked ones shrink
                to 38px and read as an afterthought. Capping width as well lets the wide ones
                be short and the compact ones be tall, which balances them by area rather
                than by a number they do not share.

                `width` and `height` are the file's own, so the browser reserves the correct
                box before the bytes arrive; the CSS caps then scale it down. Without them a
                strip that is already moving also jumps as each logo lands. */}
            <img
              src={client.logo}
              /* The company name identifies each display-only mark. */
              alt={client.name}
              width={client.width}
              height={client.height}
              loading="lazy"
              decoding="async"
              className="h-auto max-h-10 w-auto max-w-[150px] object-contain"
            />
          </span>
        ),
      }))}
    />
  )
}

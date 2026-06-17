import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const PLACEHOLDER = '<!-- HOME_HERO_PRELOAD -->'

const FALLBACK_PRELOAD =
  '<link rel="preload" href="/webp/logo.webp" as="image" type="image/webp" fetchpriority="high" />'

export function heroPreloadPlugin() {
  return {
    name: 'utilcar-hero-preload',
    transformIndexHtml(html) {
      if (!html.includes(PLACEHOLDER)) return html

      const metaPath = join(process.cwd(), 'src/generated/home-hero-preload.json')
      if (!existsSync(metaPath)) {
        return html.replace(PLACEHOLDER, FALLBACK_PRELOAD)
      }

      try {
        const { href } = JSON.parse(readFileSync(metaPath, 'utf8'))
        if (!href || typeof href !== 'string') {
          return html.replace(PLACEHOLDER, FALLBACK_PRELOAD)
        }
        const safeHref = href.replace(/"/g, '&quot;')
        return html.replace(
          PLACEHOLDER,
          `<link rel="preload" href="${safeHref}" as="image" fetchpriority="high" crossorigin="anonymous" />`,
        )
      } catch {
        return html.replace(PLACEHOLDER, FALLBACK_PRELOAD)
      }
    },
  }
}

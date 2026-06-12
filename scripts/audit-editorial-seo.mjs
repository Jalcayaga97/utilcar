/**
 * Auditoría SEO editorial vs fallback (hero / SITE).
 * npm run audit:editorial-seo
 */
import {
  createAuditClient,
  SERVICE_SUB_PAGE_KEYS,
  resolveSocialImageUrlAudit,
} from './lib/imageAuditShared.mjs'

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b._type === type)
}

function ogSource(seoOg, heroUrl) {
  if (seoOg) return 'editorial'
  if (heroUrl) return 'hero-fallback'
  return 'site-fallback'
}

export async function runAudit() {
  const client = createAuditClient()
  const docs = await client.fetch(`*[_type == "serviceSubPage" && !(_id in path("drafts.**"))]{
    pageKey,
    blocks[]{
      _type, title, description,
      image{ asset->{ url } },
      ogImage{ asset->{ url } }
    }
  }`)
  const byKey = Object.fromEntries(docs.map((d) => [d.pageKey, d]))

  console.info('\n══════════════════════════════════════')
  console.info('  Auditoría SEO editorial')
  console.info('══════════════════════════════════════\n')
  console.info(
    `${'Servicio'.padEnd(22)} ${'Title'.padEnd(6)} ${'Desc'.padEnd(6)} ${'OG'.padEnd(6)} Source`,
  )
  console.info(`${'─'.repeat(22)} ${'─'.repeat(6)} ${'─'.repeat(6)} ${'─'.repeat(6)} ${'─'.repeat(14)}`)

  const counts = { editorial: 0, 'hero-fallback': 0, 'site-fallback': 0 }

  for (const { value: pageKey, title } of SERVICE_SUB_PAGE_KEYS) {
    const doc = byKey[pageKey]
    const seo = blockOfType(doc?.blocks, 'seoBlock')
    const hero = blockOfType(doc?.blocks, 'heroBlock')
    const hasTitle = Boolean(String(seo?.title ?? '').trim())
    const hasDesc = Boolean(String(seo?.description ?? '').trim())
    const seoOg = seo?.ogImage?.asset?.url ?? null
    const heroUrl = hero?.image?.asset?.url ?? null
    const source = ogSource(seoOg, heroUrl)
    counts[source] = (counts[source] ?? 0) + 1

    const resolved = resolveSocialImageUrlAudit({ seoOgImageUrl: seoOg, heroImageUrl: heroUrl })
    console.info(
      `${title.slice(0, 22).padEnd(22)} ${(hasTitle ? '✓' : '—').padEnd(6)} ${(hasDesc ? '✓' : '—').padEnd(6)} ${(resolved ? '✓' : '✗').padEnd(6)} ${source}`,
    )
  }

  console.info('\n── Fuentes og:image ──')
  console.info(`  editorial:      ${counts.editorial ?? 0}`)
  console.info(`  hero-fallback:  ${counts['hero-fallback'] ?? 0}`)
  console.info(`  site-fallback:  ${counts['site-fallback'] ?? 0}`)
  console.info('\n(fallback runtime se mantiene — este reporte es informativo)')

  return { counts, errors: 0, warnings: 0 }
}

const isMain = process.argv[1]?.endsWith('audit-editorial-seo.mjs')
if (isMain) {
  await runAudit()
}

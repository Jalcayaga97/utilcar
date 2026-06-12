/**
 * Auditoría heroBlock Home — layout dual-image.
 * npm run audit:home-hero
 */
import { createAuditClient } from './lib/imageAuditShared.mjs'

const HERO_TITLE_EXPECTED =
  'Conversiones, modificaciones, tapicería y equipamientos automotrices.'

const QUERY = `*[_id == "homePage"][0]{
  "hero": blocks[_type == "heroBlock"][0]{
    title,
    subtitle,
    highlights,
    textLinkLabel,
    textLinkUrl,
    primaryImage{ alt, asset->{ _id, url } },
    secondaryImage{ alt, asset->{ _id, url } },
    image{ alt, asset->{ _id, url } }
  }
}`

const settingsQuery = `*[_id == "siteSettings"][0]{
  serviceCta{ primaryButtonLabel, primaryButtonUrl, secondaryButtonLabel }
}`

export async function runAudit() {
  const client = createAuditClient()
  const doc = await client.fetch(QUERY)
  const settings = await client.fetch(settingsQuery)
  const hero = doc?.hero

  let errors = 0
  let warnings = 0
  const lines = []

  console.info('\n══════════════════════════════════════')
  console.info('  Auditoría — Hero Home')
  console.info('══════════════════════════════════════\n')

  if (!hero) {
    console.error('✗ heroBlock ausente en homePage')
    return { errors: 1, warnings: 0, passed: false }
  }

  if (String(hero.title ?? '').trim()) {
    lines.push(`✓ title presente`)
    if (hero.title !== HERO_TITLE_EXPECTED) {
      warnings += 1
      lines.push(`⚠ title distinto al esperado`)
    }
  } else {
    errors += 1
    lines.push('✗ title ausente')
  }

  const primaryUrl = hero.primaryImage?.asset?.url ?? hero.image?.asset?.url
  if (primaryUrl) {
    lines.push('✓ primaryImage presente')
    if (!String(hero.primaryImage?.alt ?? '').trim()) {
      warnings += 1
      lines.push('⚠ primaryImage sin alt')
    } else {
      lines.push('✓ primaryImage alt')
    }
  } else {
    errors += 1
    lines.push('✗ primaryImage ausente')
  }

  if (hero.secondaryImage?.asset?.url) {
    lines.push('✓ secondaryImage presente')
    if (!String(hero.secondaryImage?.alt ?? '').trim()) {
      warnings += 1
      lines.push('⚠ secondaryImage sin alt')
    } else {
      lines.push('✓ secondaryImage alt')
    }
  } else {
    errors += 1
    lines.push('✗ secondaryImage ausente')
  }

  const ctaLabel = settings?.serviceCta?.primaryButtonLabel
  const ctaTo = settings?.serviceCta?.primaryButtonUrl
  if (ctaLabel && ctaTo) {
    lines.push('✓ CTA principal (siteSettings.serviceCta)')
  } else {
    errors += 1
    lines.push('✗ CTA principal ausente en siteSettings')
  }

  lines.push('✓ CTA secundario WhatsApp (runtime vía useCompanyInfo)')

  if (String(hero.subtitle ?? '').trim()) {
    warnings += 1
    lines.push('⚠ subtitle legacy aún en CMS (no se renderiza)')
  } else {
    lines.push('✓ sin subtitle legacy')
  }

  if ((hero.highlights ?? []).length > 0) {
    warnings += 1
    lines.push(`⚠ highlights legacy (${hero.highlights.length}) en CMS`)
  } else {
    lines.push('✓ sin highlights legacy')
  }

  for (const line of lines) console.info(line)

  console.info('\n── Resumen ──')
  console.info(`Errores: ${errors}`)
  console.info(`Advertencias: ${warnings}`)

  return { errors, warnings, passed: errors === 0 }
}

const isMain = process.argv[1]?.endsWith('audit-home-hero.mjs')
if (isMain) {
  const result = await runAudit()
  if (result.errors > 0) process.exit(1)
}

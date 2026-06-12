/**
 * Auditoría global Home CMS.
 * npm run audit:home
 */
import { createAuditClient } from './lib/imageAuditShared.mjs'
import { auditHomeShowcaseBlocks } from './audit-home-showcase.mjs'
import { auditHomeServicesContext } from './audit-home-services.mjs'
import { auditHomeBrandsBlocks } from './audit-home-brands.mjs'
import { EXPECTED_SERVICE_COUNT } from './lib/serviceCatalogManifest.mjs'

const LEGACY_ROOT_FIELDS = [
  'hero',
  'services',
  'highlights',
  'portfolioPreview',
  'ctaBanner',
  'specialtiesNew',
  'especialidades',
]

const HOME_QUERY = `*[_id == "homePage"][0]{
  _id,
  blocks[]{
    _type, _key, enabled, order, title, eyebrow, description,
    images[]{
      _key, alt, title,
      image{ asset->{ _id, url } }
    },
    brands[]{
      _key, name, active, website,
      logo{ alt, asset->{ _id, url, extension, originalFilename } }
    },
    textLinkLabel, textLinkUrl, primaryCta, secondaryLink,
    image{ alt, asset->{ _id, url } },
    primaryImage{ alt, asset->{ _id, url } },
    secondaryImage{ alt, asset->{ _id, url } },
    items[]{ _key, title, description, link{ label, path }, image{ alt, asset->{ url } } },
    categories[]{ _key, title, description, heroImage{ alt, asset->{ url } } },
    featuredProjects[]{ _key, projectId },
    buttonLabel, buttonLink, primaryLabel, primaryTo
  },
  ctaBanner,
  specialtiesNew,
  highlights,
  portfolioPreview
}`

const DRAFT_QUERY = `*[_id == "drafts.homePage"][0]{ _id, "blockCount": count(blocks) }`

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b._type === type)
}

export async function runAudit() {
  const client = createAuditClient()
  const doc = await client.fetch(HOME_QUERY)
  const draft = await client.fetch(DRAFT_QUERY)

  let errors = 0
  let warnings = 0
  const lines = []

  console.info('\n══════════════════════════════════════')
  console.info('  Auditoría global — Home')
  console.info('══════════════════════════════════════\n')

  if (!doc) {
    console.error('✗ homePage publicado no encontrado')
    process.exit(1)
  }
  lines.push('✓ documento publicado')

  if (draft && (draft.blockCount ?? 0) > 0) {
    warnings += 1
    lines.push(`⚠ draft inconsistente (${draft.blockCount} bloques en drafts.homePage)`)
  } else {
    lines.push('✓ sin draft huérfano')
  }

  const blocks = doc.blocks ?? []
  const required = ['heroBlock', 'specialtiesBlock', 'servicesBlock', 'portfolioBlock', 'ctaBlock']
  for (const type of required) {
    const block = blockOfType(blocks, type)
    if (!block) {
      errors += 1
      lines.push(`✗ ${type} ausente`)
    } else {
      lines.push(`✓ ${type}`)
    }
  }

  const hero = blockOfType(blocks, 'heroBlock')
  const heroUrl = hero?.primaryImage?.asset?.url ?? hero?.image?.asset?.url
  if (!heroUrl) {
    errors += 1
    lines.push('✗ hero primaryImage')
  } else {
    lines.push('✓ hero primaryImage')
    const alt =
      hero?.primaryImage?.alt ?? hero?.image?.alt ?? hero?.primaryImageAlt ?? hero?.imageAlt
    if (!String(alt ?? '').trim()) {
      warnings += 1
      lines.push('⚠ hero sin alt')
    } else {
      lines.push('✓ hero alt')
    }
  }

  if (!hero?.secondaryImage?.asset?.url) {
    warnings += 1
    lines.push('⚠ secondaryImage ausente')
  } else {
    lines.push('✓ secondaryImage')
  }

  const services = blockOfType(blocks, 'servicesBlock')
  const serviceCount = services?.items?.length ?? 0
  if (serviceCount < EXPECTED_SERVICE_COUNT) {
    errors += 1
    lines.push(`✗ servicesBlock items (${serviceCount}/${EXPECTED_SERVICE_COUNT})`)
  } else {
    lines.push(`✓ servicesBlock (${serviceCount} items)`)
  }

  const servicesAudit = auditHomeServicesContext({ homeBlocks: blocks })
  errors += servicesAudit.errors
  warnings += servicesAudit.warnings
  for (const line of servicesAudit.lines) {
    if (!lines.includes(line)) lines.push(line)
  }

  const specialties = blockOfType(blocks, 'specialtiesBlock')
  const specCount = specialties?.categories?.length ?? 0
  if (specCount < 3) {
    errors += 1
    lines.push(`✗ specialtiesBlock (${specCount}/3)`)
  } else {
    lines.push(`✓ specialtiesBlock (${specCount} categorías)`)
    for (const cat of specialties.categories ?? []) {
      if (!cat.heroImage?.asset?.url) {
        warnings += 1
        lines.push(`  WARN: specialty "${cat.title}" sin heroImage`)
      }
    }
  }

  const portfolio = blockOfType(blocks, 'portfolioBlock')
  const featured = portfolio?.featuredProjects?.length ?? 0
  const embedded = portfolio?.items?.length ?? 0
  if (featured < 1) {
    errors += 1
    lines.push('✗ featuredProjects vacío')
  } else {
    lines.push(`✓ featuredProjects (${featured})`)
  }
  if (embedded > 0) {
    warnings += 1
    lines.push(`⚠ portfolioBlock con ${embedded} items embebidos (legacy)`)
  }

  const cmsFirstActive = blocks.length >= 5
  const seo = blockOfType(blocks, 'seoBlock')
  if (seo) {
    if (!seo?.title) {
      warnings += 1
      lines.push('⚠ seoBlock sin title')
    } else {
      lines.push('✓ seoBlock')
    }
  } else if (!cmsFirstActive) {
    warnings += 1
    lines.push('⚠ seoBlock ausente')
  }

  for (const block of blocks) {
    if (!block._key) {
      errors += 1
      lines.push(`✗ bloque ${block._type} sin _key`)
    }
  }

  for (const field of LEGACY_ROOT_FIELDS) {
    if (cmsFirstActive) continue
    if (doc[field] != null && (Array.isArray(doc[field]) ? doc[field].length : true)) {
      warnings += 1
      lines.push(`⚠ campo legacy raíz: ${field}`)
    }
  }

  const showcaseAudit = auditHomeShowcaseBlocks(blocks)
  errors += showcaseAudit.errors
  warnings += showcaseAudit.warnings
  for (const line of showcaseAudit.lines) lines.push(line)

  const brandsAudit = auditHomeBrandsBlocks(blocks)
  errors += brandsAudit.errors
  warnings += brandsAudit.warnings
  for (const line of brandsAudit.lines) {
    if (!lines.includes(line)) lines.push(line)
  }

  const settings = await client.fetch(`*[_id == "siteSettings"][0]{ serviceCta{ title } }`)
  if (!settings?.serviceCta?.title) {
    warnings += 1
    lines.push('⚠ siteSettings.serviceCta ausente')
  } else {
    lines.push('✓ siteSettings.serviceCta')
  }

  for (const line of lines) console.info(line)
  console.info('\n── Resumen ──')
  console.info(`Passed: ${errors === 0 ? 'yes' : 'partial'}`)
  console.info(`Warnings: ${warnings}`)
  console.info(`Errors: ${errors}`)

  return { errors, warnings, passed: errors === 0 }
}

const isMain = process.argv[1]?.endsWith('audit-home.mjs')
if (isMain) {
  const result = await runAudit()
  if (result.errors > 0) process.exit(1)
}

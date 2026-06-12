/**

 * Auditoría SEO de serviceSubPage.

 * npm run audit:service-seo

 */

import {

  createAuditClient,

  SERVICE_SUB_PAGE_KEYS,

  getServiceLocalSeo,

  resolveSocialImageUrlAudit,

} from './lib/imageAuditShared.mjs'



function blockOfType(blocks, type) {

  return (blocks ?? []).find((b) => b._type === type)

}



export async function runAudit() {

  const client = createAuditClient()

  const docs = await client.fetch(`*[_type == "serviceSubPage" && !(_id in path("drafts.**"))]{

    pageKey, title,

    blocks[]{

      _type, title, description, canonicalPath, keywords, noindex,

      imageAlt,

      image{ alt, asset->{ url } },

      ogImage{ alt, asset->{ url } }

    }

  }`)

  const byKey = Object.fromEntries(docs.map((d) => [d.pageKey, d]))



  const titles = new Map()

  const descriptions = new Map()

  const canonicals = new Map()



  let totalErrors = 0

  let totalWarnings = 0



  console.info('\n══════════════════════════════════════')

  console.info('  Auditoría SEO — serviceSubPage')

  console.info('══════════════════════════════════════\n')



  for (const { value: pageKey, title: serviceTitle } of SERVICE_SUB_PAGE_KEYS) {

    const doc = byKey[pageKey]

    const errors = []

    const warnings = []

    const lines = []



    if (!doc) {

      errors.push('documento no encontrado')

      totalErrors += 1

      console.info(`SERVICE: ${serviceTitle}\n✗ documento no encontrado\n`)

      continue

    }



    const seo = blockOfType(doc.blocks, 'seoBlock')

    const hero = blockOfType(doc.blocks, 'heroBlock')

    const localSeo = getServiceLocalSeo(pageKey) ?? {}



    if (!seo) {

      errors.push('seoBlock ausente')

      lines.push('✗ seoBlock')

    } else {

      lines.push('✓ seoBlock')

    }



    const seoTitle = String(seo?.title ?? '').trim()

    const seoDescription = String(seo?.description ?? '').trim()

    const canonical = String(seo?.canonicalPath ?? localSeo.path ?? '').trim()



    if (!seoTitle) {

      errors.push('title ausente')

      lines.push('✗ title')

    } else {

      lines.push('✓ title')

      if (seoTitle.length > 60) warnings.push(`title > 60 chars (${seoTitle.length})`)

      const prev = titles.get(seoTitle) ?? []

      titles.set(seoTitle, [...prev, pageKey])

    }



    if (!seoDescription) {

      errors.push('description ausente')

      lines.push('✗ description')

    } else {

      lines.push('✓ description')

      if (seoDescription.length > 160) {

        warnings.push(`description > 160 chars (${seoDescription.length})`)

      }

      const prev = descriptions.get(seoDescription) ?? []

      descriptions.set(seoDescription, [...prev, pageKey])

    }



    if (!canonical) {

      errors.push('canonical ausente')

      lines.push('✗ canonical')

    } else {

      lines.push('✓ canonical')

      const prev = canonicals.get(canonical) ?? []

      canonicals.set(canonical, [...prev, pageKey])

    }



    const ogTitle = seoTitle || localSeo.title

    const ogDescription = seoDescription || localSeo.description

    const socialImage = resolveSocialImageUrlAudit({

      seoOgImageUrl: seo?.ogImage?.asset?.url ?? null,

      heroImageUrl: hero?.image?.asset?.url ?? null,

    })



    if (!ogTitle) errors.push('og:title no resoluble')

    else lines.push('✓ og:title')

    if (!ogDescription) errors.push('og:description no resoluble')

    else lines.push('✓ og:description')

    if (!socialImage) {

      errors.push('og:image no resoluble (seo/hero/SITE)')

      lines.push('✗ og:image')

    } else {

      lines.push('✓ og:image (runtime)')

    }



    if (!socialImage) {

      errors.push('twitter:image no resoluble')

      lines.push('✗ twitter:image')

    } else {

      lines.push('✓ twitter:image (runtime)')

    }



    totalErrors += errors.length

    totalWarnings += warnings.length



    console.info(`SERVICE: ${serviceTitle}`)

    for (const line of lines) console.info(line)

    for (const w of warnings) console.info(`  WARN: ${w}`)

    for (const e of errors) console.info(`  ERROR: ${e}`)

    console.info('')

  }



  for (const [value, keys] of titles.entries()) {

    if (keys.length > 1) {

      totalWarnings += 1

      console.info(`WARN: title duplicado "${value.slice(0, 40)}…" → ${keys.join(', ')}`)

    }

  }

  for (const [value, keys] of descriptions.entries()) {

    if (keys.length > 1) {

      totalWarnings += 1

      console.info(`WARN: description duplicada → ${keys.join(', ')}`)

    }

  }

  for (const [value, keys] of canonicals.entries()) {

    if (keys.length > 1) {

      totalErrors += 1

      console.info(`ERROR: canonical duplicado "${value}" → ${keys.join(', ')}`)

    }

  }



  console.info('── Resumen ──\n')

  console.info(`Pages audited: ${SERVICE_SUB_PAGE_KEYS.length}`)

  console.info(`Warnings: ${totalWarnings}`)

  console.info(`Errors: ${totalErrors}`)



  return { errors: totalErrors, warnings: totalWarnings, pages: SERVICE_SUB_PAGE_KEYS.length }

}



const isMain = process.argv[1]?.endsWith('audit-service-seo.mjs')

if (isMain) {

  const result = await runAudit()

  if (result.errors > 0) process.exit(1)

}



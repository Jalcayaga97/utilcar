/**
 * Repara homePage: hero alt, seoBlock, elimina espejos legacy no consumidos.
 * npm run repair:home-cms:dry
 * npm run repair:home-cms
 *
 * IMPORTANTE: preserva blocks[] completos (sin proyección parcial).
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const apply = process.argv.includes('--apply')
const dryRun = process.argv.includes('--dry') || !apply

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const seed = JSON.parse(
  readFileSync(join(WEB_ROOT, 'utilcar-studio/seed/minimal-content.json'), 'utf8'),
)

const HERO_ALT =
  seed.homePage?.hero?.imageAlt ??
  'Interior de van con banquetas y piso técnico instalado por Utilcar Conversiones'

const SEO_BLOCK = {
  _type: 'seoBlock',
  _key: 'seo-home',
  enabled: true,
  order: 99,
  title: 'Conversiones automotrices en Santiago',
  description:
    'Utilcar Conversiones: talleres móviles, ventanas para furgones, equipamiento escolar, banquetas y butacas. Fabricación e instalación en Santiago, Chile.',
  keywords:
    'conversiones automotrices Santiago, talleres móviles, equipamiento escolar, ventanas furgones, banquetas minibús',
  canonicalPath: '/',
  noindex: false,
}

const LEGACY_UNSET = ['highlights', 'portfolioPreview', 'ctaBanner']

const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const DOC_ID = 'homePage'

async function main() {
  const doc = await client.fetch(`*[_id == $id][0]`, { id: DOC_ID })
  if (!doc?.blocks?.length) {
    console.error('homePage sin blocks — ejecutá npm run migrate:home primero')
    process.exit(1)
  }

  const blocks = structuredClone(doc.blocks)
  const changes = []

  const heroIdx = blocks.findIndex((b) => b._type === 'heroBlock')
  if (heroIdx >= 0) {
    const hero = blocks[heroIdx]
    const hasAlt = String(hero.image?.alt ?? hero.imageAlt ?? '').trim()
    if (!hasAlt) {
      blocks[heroIdx] = {
        ...hero,
        imageAlt: HERO_ALT,
        image: hero.image ? { ...hero.image, alt: HERO_ALT } : hero.image,
      }
      changes.push('heroBlock.image.alt')
    }
  }

  let seoIdx = blocks.findIndex((b) => b._type === 'seoBlock')
  if (seoIdx < 0) {
    blocks.push({ ...SEO_BLOCK })
    changes.push('seoBlock (nuevo)')
  } else {
    const seo = blocks[seoIdx]
    const patched = { ...seo }
    if (!String(seo.title ?? '').trim()) {
      patched.title = SEO_BLOCK.title
      changes.push('seoBlock.title')
    }
    if (!String(seo.description ?? '').trim()) {
      patched.description = SEO_BLOCK.description
      changes.push('seoBlock.description')
    }
    if (!seo._key) patched._key = SEO_BLOCK._key
    blocks[seoIdx] = patched
  }

  const legacyPresent = LEGACY_UNSET.filter((f) => {
    const v = doc[f]
    return v != null && (Array.isArray(v) ? v.length > 0 : Object.keys(v ?? {}).length > 0)
  })

  console.info('\n[repair:home-cms]')
  console.info(`Blocks preservados: ${blocks.length}`)
  console.info(`Cambios: ${changes.length ? changes.join(', ') : '(ninguno)'}`)
  console.info(`Legacy unset: ${legacyPresent.length ? legacyPresent.join(', ') : '(ninguno)'}`)

  if (dryRun) {
    console.info('[dry] Sin escritura')
    return
  }

  await client.patch(DOC_ID).set({ blocks }).commit()
  if (legacyPresent.length) {
    await client.patch(DOC_ID).unset(legacyPresent).commit()
  }
  console.info('✓ homePage reparado')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

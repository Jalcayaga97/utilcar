/**
 * Sincroniza workPage CMS con el contenido canónico runtime (work.js).
 *
 * npm run sync:work-page-content -- --dry
 * npm run sync:work-page-content -- --apply
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import {
  WORK_PAGE_CANONICAL,
  WORK_PAGE_SEO,
} from './lib/workPageCanonicalContent.mjs'
import { SCHEMA_VERSION_VALUE } from '../utilcar-studio/schemas/content/fields/schemaVersion.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = join(__dirname, '..')

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const sanityEnv = loadSanityEnv({ requireToken: apply })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token,
  useCdn: false,
})

const WORK_PAGE_ID = 'workPage'
const HERO_IMAGE_FILE = 'src/assets/images/talleres/tr247.jpg'

const canonical = buildCanonicalContent()
const imageCache = new Map()

function blockKey(prefix, index) {
  return `${prefix}-${index}`
}

function isBlank(value) {
  if (value == null) return true
  if (typeof value === 'string') return !value.trim()
  if (Array.isArray(value)) return value.length === 0
  return false
}

function normalizeText(value) {
  return String(value ?? '').trim()
}

function arraysEqual(a, b) {
  const left = (a ?? []).map((v) => normalizeText(v))
  const right = (b ?? []).map((v) => normalizeText(v))
  if (left.length !== right.length) return false
  return left.every((v, i) => v === right[i])
}

function buildCanonicalContent() {
  return {
    page: {
      hero: { ...WORK_PAGE_CANONICAL.hero },
      intro: {
        eyebrow: WORK_PAGE_CANONICAL.intro.eyebrow,
        title: WORK_PAGE_CANONICAL.intro.title,
        paragraphs: [...WORK_PAGE_CANONICAL.intro.paragraphs],
      },
      projects: { ...WORK_PAGE_CANONICAL.projects },
      cta: { ...WORK_PAGE_CANONICAL.cta },
    },
    seo: { ...WORK_PAGE_SEO },
  }
}

function paragraphsToPortableText(paragraphs = []) {
  return paragraphs
    .filter(Boolean)
    .map((text, index) => ({
      _type: 'block',
      _key: blockKey('pt', index),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: blockKey('span', index),
          text: String(text),
          marks: [],
        },
      ],
    }))
}

function buildHeroBlock(hero, imageRef, order = 0) {
  return {
    _type: 'heroBlock',
    _key: blockKey('hero', order),
    enabled: true,
    order,
    eyebrow: hero.eyebrow ?? '',
    title: hero.title ?? '',
    subtitle: hero.subtitle ?? '',
    imageAlt: hero.imageAlt ?? hero.title ?? '',
    highlights: [],
    ...(imageRef ? { image: imageRef } : {}),
  }
}

function buildRichTextBlock(intro, order = 1) {
  return {
    _type: 'richTextBlock',
    _key: blockKey('richtext', order),
    enabled: true,
    order,
    eyebrow: intro.eyebrow ?? '',
    title: intro.title ?? '',
    body: paragraphsToPortableText(intro.paragraphs ?? []),
  }
}

function buildPortfolioMetaBlock(projects, order = 2) {
  return {
    _type: 'portfolioBlock',
    _key: blockKey('portfolio', order),
    enabled: true,
    order,
    eyebrow: projects.eyebrow ?? '',
    title: projects.title ?? '',
    description: projects.description ?? '',
    items: [],
    featuredProjects: [],
  }
}

function buildCtaBlock(cta, order = 3) {
  return {
    _type: 'ctaBlock',
    _key: blockKey('cta', order),
    enabled: true,
    order,
    title: cta.title ?? '',
    description: cta.description ?? '',
    primaryLabel: cta.primaryLabel ?? 'Solicitar cotización',
    primaryTo: cta.primaryTo ?? '/contacto',
  }
}

function buildSeoBlock(seo, order = 4) {
  return {
    _type: 'seoBlock',
    _key: blockKey('seo', order),
    enabled: true,
    order,
    title: seo.title ?? '',
    description: seo.description ?? '',
    canonicalPath: seo.canonicalPath ?? '/trabajos-realizados',
    noindex: false,
  }
}

function buildCanonicalBlocks(heroImageRef) {
  return [
    buildHeroBlock(canonical.page.hero, heroImageRef, 0),
    buildRichTextBlock(canonical.page.intro, 1),
    buildPortfolioMetaBlock(canonical.page.projects, 2),
    buildCtaBlock(canonical.page.cta, 3),
    buildSeoBlock(canonical.seo, 4),
  ]
}

async function uploadHeroImage() {
  if (imageCache.has(HERO_IMAGE_FILE)) return imageCache.get(HERO_IMAGE_FILE)
  const abs = join(WEB_ROOT, HERO_IMAGE_FILE)
  if (!existsSync(abs)) {
    console.warn(`⚠ imagen hero no encontrada: ${HERO_IMAGE_FILE}`)
    imageCache.set(HERO_IMAGE_FILE, null)
    return null
  }
  if (dryRun) {
    const placeholder = { _type: 'image', _dryRun: true }
    imageCache.set(HERO_IMAGE_FILE, placeholder)
    return placeholder
  }
  const asset = await client.assets.upload('image', createReadStream(abs), {
    filename: basename(abs),
  })
  const ref = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: canonical.page.hero.imageAlt,
  }
  imageCache.set(HERO_IMAGE_FILE, ref)
  return ref
}

function mergeObjectFields(current, target, pathPrefix, changes) {
  const result = { ...(current ?? {}) }
  for (const [key, targetValue] of Object.entries(target)) {
    const path = `${pathPrefix}.${key}`
    const currentValue = current?.[key]
    if (Array.isArray(targetValue)) {
      if (isBlank(currentValue) || !arraysEqual(currentValue, targetValue)) {
        changes.push({ path, from: currentValue, to: targetValue, action: isBlank(currentValue) ? 'fill' : 'sync' })
        result[key] = targetValue
      }
      continue
    }
    if (typeof targetValue === 'object' && targetValue !== null) {
      const nested = mergeObjectFields(currentValue, targetValue, path, changes)
      result[key] = nested
      continue
    }
    if (isBlank(currentValue) || normalizeText(currentValue) !== normalizeText(targetValue)) {
      changes.push({
        path,
        from: currentValue ?? '',
        to: targetValue,
        action: isBlank(currentValue) ? 'fill' : 'sync',
      })
      result[key] = targetValue
    }
  }
  return result
}

function findBlockIndex(blocks, type) {
  return (blocks ?? []).findIndex((b) => b?._type === type)
}

function blockNeedsUpdate(existing, target) {
  if (!existing) return true
  const checks = [
    ['eyebrow', target.eyebrow],
    ['title', target.title],
    ['subtitle', target.subtitle],
    ['description', target.description],
    ['imageAlt', target.imageAlt],
    ['buttonLabel', target.buttonLabel],
    ['primaryLabel', target.primaryLabel],
    ['primaryTo', target.primaryTo],
    ['canonicalPath', target.canonicalPath],
  ]
  for (const [field, expected] of checks) {
    if (expected == null) continue
    if (isBlank(existing[field]) || normalizeText(existing[field]) !== normalizeText(expected)) {
      return true
    }
  }
  if (target._type === 'richTextBlock') {
    const existingParagraphs = portableTextToParagraphs(existing.body)
    const targetParagraphs = portableTextToParagraphs(target.body)
    if (isBlank(existing.body) || !arraysEqual(existingParagraphs, targetParagraphs)) return true
  }
  if (target._type === 'heroBlock' && !existing.image?.asset?._ref && target.image?.asset?._ref) {
    return true
  }
  if (target._type === 'portfolioBlock') {
    const embedded = (existing.items ?? []).length + (existing.featuredProjects ?? []).length
    if (embedded > 0) return true
  }
  return false
}

function portableTextToParagraphs(body = []) {
  return (body ?? [])
    .filter((block) => block?._type === 'block')
    .map((block) =>
      (block.children ?? [])
        .map((child) => child?.text ?? '')
        .join('')
        .trim(),
    )
    .filter(Boolean)
}

function mergeBlocks(existingBlocks, targetBlocks, changes) {
  const blocks = [...(existingBlocks ?? [])]
  for (const target of targetBlocks) {
    const idx = findBlockIndex(blocks, target._type)
    if (idx < 0) {
      changes.push({ path: `blocks[+${target._type}]`, from: '—', to: target.title || target._type, action: 'create' })
      blocks.push(target)
      continue
    }
    const current = blocks[idx]
    if (!blockNeedsUpdate(current, target)) continue
    changes.push({
      path: `blocks[${target._type}]`,
      from: current.title || current._type,
      to: target.title || target._type,
      action: 'sync',
    })
    blocks[idx] = {
      ...current,
      ...target,
      _key: current._key ?? target._key,
      image: target.image?.asset?._ref ? target.image : current.image,
      items: target._type === 'portfolioBlock' ? [] : current.items,
      featuredProjects: target._type === 'portfolioBlock' ? [] : current.featuredProjects,
    }
  }
  return blocks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

function pad(value, width) {
  const text = String(value ?? '')
  return text.length >= width ? `${text.slice(0, width - 1)}…` : text.padEnd(width)
}

const heroImageRef = await uploadHeroImage()
const targetBlocks = buildCanonicalBlocks(heroImageRef?._dryRun ? undefined : heroImageRef)

const doc = await client.fetch(`*[_id == $id][0]`, { id: WORK_PAGE_ID })
if (!doc) {
  console.error('✗ workPage no encontrado en CMS')
  process.exit(1)
}

if (!doc.blocks?.length) {
  console.warn('⚠ workPage.blocks[] vacío — se crearán las 5 secciones editoriales canónicas')
}

const pageChanges = []
const blockChanges = []
const mergedBlocks = mergeBlocks(doc.blocks, targetBlocks, blockChanges)
const allChanges = [...blockChanges]

console.info('\n══════════════════════════════════════════════════════════')
console.info(`  SYNC workPage (blocks[]) ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info(`  ${sanityEnv.projectId} / ${sanityEnv.dataset}`)
console.info('══════════════════════════════════════════════════════════\n')

console.info('── Comparativa CMS ↔ Runtime (blocks[]) ──\n')
console.info(`${pad('Campo', 28)} ${pad('CMS actual', 36)} ${pad('Runtime', 36)} Fuente`)
console.info(`${'─'.repeat(28)} ${'─'.repeat(36)} ${'─'.repeat(36)} ${'─'.repeat(12)}`)

const heroBlock = doc.blocks?.[findBlockIndex(doc.blocks, 'heroBlock')]
const rows = [
  ['blocks.hero.eyebrow', heroBlock?.eyebrow, canonical.page.hero.eyebrow],
  ['blocks.hero.title', heroBlock?.title, canonical.page.hero.title],
  ['blocks.hero.subtitle', heroBlock?.subtitle, canonical.page.hero.subtitle],
  ['blocks.hero.imageAlt', heroBlock?.imageAlt, canonical.page.hero.imageAlt],
  ['blocks.hero.image', heroBlock?.image?.asset?._ref ? 'sí' : 'no', 'sí'],
  ['blocks.richTextBlock', findBlockIndex(doc.blocks, 'richTextBlock') >= 0 ? 'sí' : 'no', 'sí'],
  ['blocks.portfolioBlock', findBlockIndex(doc.blocks, 'portfolioBlock') >= 0 ? 'sí' : 'no', 'sí'],
  ['blocks.ctaBlock', findBlockIndex(doc.blocks, 'ctaBlock') >= 0 ? 'sí' : 'no', 'sí'],
  ['blocks.seoBlock', findBlockIndex(doc.blocks, 'seoBlock') >= 0 ? 'sí' : 'no', 'sí'],
]

for (const [field, cms, runtime] of rows) {
  const cmsText = Array.isArray(cms) || typeof cms === 'number' ? String(cms) : normalizeText(cms) || '(vacío)'
  const runText = Array.isArray(runtime) || typeof runtime === 'number' ? String(runtime) : normalizeText(runtime) || '(vacío)'
  console.info(`${pad(field, 28)} ${pad(cmsText, 36)} ${pad(runText, 36)} work.js`)
}

console.info(`\n── Cambios planificados: ${allChanges.length} ──\n`)
if (!allChanges.length) {
  console.info('  (ninguno — CMS ya sincronizado)\n')
} else {
  for (const change of allChanges) {
    console.info(`  [${change.action}] ${change.path}`)
  }
  console.info('')
}

if (dryRun) {
  console.info('Ejecutá: npm run sync:work-page-content -- --apply\n')
  process.exit(0)
}

await client
  .patch(WORK_PAGE_ID)
  .set({
    schemaVersion: doc.schemaVersion ?? SCHEMA_VERSION_VALUE,
    blocks: mergedBlocks,
  })
  .commit()

console.info(`✓ workPage actualizado — ${allChanges.length} cambio(s)\n`)

const after = await client.fetch(`*[_id == $id][0]{
  blocks[]{
    _type,
    title,
    eyebrow,
    subtitle,
    description,
    imageAlt,
    primaryLabel,
    primaryTo,
    image{ asset->{ _id, url } },
    body
  }
}`, {
  id: WORK_PAGE_ID,
})

const heroAfter = after.blocks?.[findBlockIndex(after.blocks, 'heroBlock')]
const introAfter = after.blocks?.[findBlockIndex(after.blocks, 'richTextBlock')]
const projectsAfter = after.blocks?.[findBlockIndex(after.blocks, 'portfolioBlock')]
const ctaAfter = after.blocks?.[findBlockIndex(after.blocks, 'ctaBlock')]

const checks = [
  heroAfter?.title,
  introAfter?.title,
  projectsAfter?.title,
  ctaAfter?.title,
  heroAfter?.image?.asset?._ref || heroAfter?.image?.asset?._id,
  findBlockIndex(after.blocks, 'heroBlock') >= 0,
  findBlockIndex(after.blocks, 'richTextBlock') >= 0,
  findBlockIndex(after.blocks, 'portfolioBlock') >= 0,
  findBlockIndex(after.blocks, 'ctaBlock') >= 0,
  findBlockIndex(after.blocks, 'seoBlock') >= 0,
]

if (checks.every(Boolean)) {
  console.info('✓ Validación CMS — Hero, Intro, Projects, CTA, SEO e imagen hero presentes\n')
} else {
  console.error('✗ Validación CMS incompleta\n')
  process.exit(1)
}

// Sincronizar draft si quedó vacío (Studio edita drafts.workPage, no published)
const draft = await client.fetch(`*[_id == "drafts.workPage"][0]{ _id, blocks }`)
const draftCount = draft?.blocks?.length ?? 0
if (draft && draftCount === 0 && mergedBlocks.length > 0) {
  const { _id, _rev, _createdAt, _updatedAt, ...pub } = await client.fetch(`*[_id == $id][0]`, {
    id: WORK_PAGE_ID,
  })
  await client.createOrReplace({ ...pub, _id: 'drafts.workPage', _type: 'workPage' })
  console.info('✓ drafts.workPage reparado desde published (blocks[] estaba vacío en draft)\n')
}

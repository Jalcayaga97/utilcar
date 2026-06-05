/**
 * Auditoría workPage — keys, duplicados, imágenes, referencias Home.
 * npm run audit:workpage
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const e = loadSanityEnv({ requireToken: false })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const ARRAY_PATHS = ['filters', 'portfolio', 'preview']

function auditArrayKeys(arr, path) {
  const issues = []
  if (!Array.isArray(arr)) return issues
  const keys = new Map()
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    if (!item?._key) {
      issues.push({ type: 'missingKeys', path, index: i, id: item?.id ?? null })
    } else if (keys.has(item._key)) {
      issues.push({
        type: 'duplicateKeys',
        path,
        index: i,
        _key: item._key,
        duplicateOf: keys.get(item._key),
      })
    } else {
      keys.set(item._key, i)
    }
  }
  return issues
}

function auditEmptyImages(arr, path) {
  const issues = []
  if (!Array.isArray(arr)) return issues
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    const hasImage =
      Boolean(item?.image?.asset?._ref) ||
      Boolean(item?.image?.asset?.url) ||
      Boolean(item?.imageUrl) ||
      item?.imageKey != null
    if (!hasImage && item?.title) {
      issues.push({ type: 'emptyImages', path, index: i, id: item?.id ?? null })
    }
  }
  return issues
}

async function auditInvalidHomeReferences() {
  const home = await client.fetch(`*[_id == "homePage"][0]{
    "featuredIds": blocks[portfolioBlock._type == "portfolioBlock" || _type == "galleryBlock"][0].featuredProjects[].projectId
  }`)
  const work = await client.fetch(`*[_id == "workPage"][0]{
    "previewIds": preview[].id,
    "portfolioIds": portfolio[].id
  }`)
  const known = new Set([
    ...(work?.previewIds ?? []).map(String),
    ...(work?.portfolioIds ?? []).map(String),
  ])
  const issues = []
  for (const id of home?.featuredIds ?? []) {
    if (!known.has(String(id))) {
      issues.push({ type: 'invalidReferences', projectId: id, context: 'homePage.featuredProjects' })
    }
  }
  return issues
}

const doc = await client.fetch(`*[_id == "workPage"][0]{
  filters[]{ _key, id, label },
  portfolio[]{ _key, id, title, image{ asset->{ _id, url } } },
  preview[]{ _key, id, title, imageKey, image{ asset->{ _id, url } } },
  blocks[]{ _type, items[]{ _key }, categories[]{ _key } },
  page{ projects[]{ _key } }
}`)

if (!doc) {
  console.error('✗ workPage no encontrado')
  process.exit(1)
}

let issues = []

for (const path of ARRAY_PATHS) {
  issues.push(...auditArrayKeys(doc[path], path))
  if (path === 'preview') {
    issues.push(...auditEmptyImages(doc[path], path))
  }
}

if (Array.isArray(doc.blocks)) {
  for (const block of doc.blocks) {
    issues.push(...auditArrayKeys(block.items, `blocks.${block._type}.items`))
    issues.push(...auditArrayKeys(block.categories, `blocks.${block._type}.categories`))
  }
}

if (Array.isArray(doc.page?.projects)) {
  issues.push(...auditArrayKeys(doc.page.projects, 'page.projects'))
}

issues.push(...(await auditInvalidHomeReferences()))

const grouped = {
  missingKeys: issues.filter((i) => i.type === 'missingKeys'),
  duplicateKeys: issues.filter((i) => i.type === 'duplicateKeys'),
  emptyImages: issues.filter((i) => i.type === 'emptyImages'),
  invalidReferences: issues.filter((i) => i.type === 'invalidReferences'),
}

console.info('\n══════════════════════════════════════')
console.info('  AUDITORÍA — workPage')
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════\n')

for (const [label, list] of Object.entries(grouped)) {
  console.info(`${label.padEnd(20)} ${list.length}`)
  for (const item of list.slice(0, 5)) {
    console.info(`  • ${JSON.stringify(item)}`)
  }
  if (list.length > 5) console.info(`  … +${list.length - 5} más`)
}

console.info(`\nIssues totales: ${issues.length}`)
process.exit(issues.length > 0 ? 1 : 0)

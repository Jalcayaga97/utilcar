/**
 * Repara company.socialLinks[] en siteSettings (published + draft):
 * - Asigna _key únicos a items sin clave
 * - Sincroniza instagramUrl / facebookUrl desde socialLinks si están vacíos
 *
 * npm run repair:site-settings-social-links:dry
 * npm run repair:site-settings-social-links
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const PUBLISHED_ID = 'siteSettings'
const DOCUMENT_IDS = [PUBLISHED_ID, `drafts.${PUBLISHED_ID}`]

const AUDIT_QUERY = `*[_id == $id][0]{
  _id,
  _rev,
  company{
    instagramUrl,
    facebookUrl,
    socialLinks[]{ _key, platform, url }
  }
}`

const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

function safeString(value) {
  if (value == null) return ''
  const s = String(value).trim()
  return s || ''
}

function slugifyPlatform(platform) {
  return safeString(platform)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24) || 'social'
}

function makeUniqueKey(prefix, usedKeys) {
  let key = `${prefix}-${Math.random().toString(36).slice(2, 10)}`
  while (usedKeys.has(key)) {
    key = `${prefix}-${Math.random().toString(36).slice(2, 10)}`
  }
  usedKeys.add(key)
  return key
}

function urlFromSocialLinks(links, platformName) {
  const match = (links ?? []).find(
    (item) => safeString(item?.platform).toLowerCase() === platformName.toLowerCase(),
  )
  return safeString(match?.url)
}

function isValidSocialItem(item) {
  return Boolean(safeString(item?.platform) || safeString(item?.url))
}

function auditSocialLinks(links) {
  const list = Array.isArray(links) ? links : []
  const items = list.map((item, index) => ({
    index,
    _key: item?._key ?? null,
    platform: safeString(item?.platform),
    url: safeString(item?.url),
    hasKey: Boolean(safeString(item?._key)),
    valid: isValidSocialItem(item),
  }))
  const missingKeys = items.filter((item) => item.valid && !item.hasKey)
  const orphans = items.filter((item) => !item.valid)
  const duplicateKeys = findDuplicateKeys(list)
  return { items, missingKeys, orphans, duplicateKeys, count: list.length }
}

function findDuplicateKeys(links) {
  const seen = new Map()
  const duplicates = []
  for (const item of links ?? []) {
    const key = safeString(item?._key)
    if (!key) continue
    if (seen.has(key)) duplicates.push(key)
    else seen.set(key, true)
  }
  return [...new Set(duplicates)]
}

function repairSocialLinks(links) {
  const usedKeys = new Set()
  const repaired = []

  for (const item of links ?? []) {
    if (!isValidSocialItem(item)) continue

    const platform = safeString(item.platform)
    const url = safeString(item.url)
    let key = safeString(item._key)

    if (!key || usedKeys.has(key)) {
      key = makeUniqueKey(slugifyPlatform(platform), usedKeys)
    } else {
      usedKeys.add(key)
    }

    repaired.push({ _key: key, platform, url })
  }

  return repaired
}

function syncSocialUrls(company, repairedLinks) {
  const patches = {}
  const instagramUrl = safeString(company?.instagramUrl)
  const facebookUrl = safeString(company?.facebookUrl)

  const igFromLinks = urlFromSocialLinks(repairedLinks, 'instagram')
  const fbFromLinks = urlFromSocialLinks(repairedLinks, 'facebook')

  if (!instagramUrl && igFromLinks) {
    patches.instagramUrl = igFromLinks
  }
  if (!facebookUrl && fbFromLinks) {
    patches.facebookUrl = fbFromLinks
  }

  return patches
}

function printAudit(label, doc) {
  console.info(`\n── ${label} ──`)
  if (!doc) {
    console.info('  documento: no existe')
    return null
  }

  const company = doc.company ?? {}
  const audit = auditSocialLinks(company.socialLinks)

  console.info(`  instagramUrl: ${safeString(company.instagramUrl) || '(vacío)'}`)
  console.info(`  facebookUrl: ${safeString(company.facebookUrl) || '(vacío)'}`)
  console.info(`  socialLinks[]: ${audit.count} item(s)`)

  for (const item of audit.items) {
    const keyStatus = item.hasKey ? item._key : 'SIN _key'
    const orphan = item.valid ? '' : ' [HUÉRFANO — sin platform/url]'
    console.info(`    [${item.index}] _key=${keyStatus} platform="${item.platform}" url="${item.url}"${orphan}`)
  }

  if (audit.missingKeys.length) {
    console.info(`  ⚠ items sin _key: ${audit.missingKeys.length}`)
  }
  if (audit.orphans.length) {
    console.info(`  ⚠ items huérfanos: ${audit.orphans.length}`)
  }
  if (audit.duplicateKeys.length) {
    console.info(`  ⚠ _key duplicados: ${audit.duplicateKeys.join(', ')}`)
  }

  return { doc, audit, company }
}

function printAfter(company, repairedLinks, urlPatches) {
  const audit = auditSocialLinks(repairedLinks)
  console.info(`  instagramUrl: ${safeString(urlPatches.instagramUrl ?? company?.instagramUrl) || '(vacío)'}`)
  console.info(`  facebookUrl: ${safeString(urlPatches.facebookUrl ?? company?.facebookUrl) || '(vacío)'}`)
  console.info(`  socialLinks[]: ${audit.count} item(s)`)
  for (const item of audit.items) {
    console.info(`    [${item.index}] _key=${item._key} platform="${item.platform}" url="${item.url}"`)
  }
  console.info(`  todos con _key: ${audit.missingKeys.length === 0 ? 'sí' : 'no'}`)
  console.info(`  huérfanos: ${audit.orphans.length}`)
}

console.info('\n══════════════════════════════════════')
console.info(`  REPAIR siteSettings.socialLinks ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════')

const before = {}
for (const id of DOCUMENT_IDS) {
  before[id] = await client.fetch(AUDIT_QUERY, { id })
  printAudit(`BEFORE ${id}`, before[id])
}

const publishedExists = Boolean(before[PUBLISHED_ID])
if (!publishedExists) {
  console.error('\n✗ siteSettings publicado no existe — abortando')
  process.exit(1)
}

const repairs = []

for (const id of DOCUMENT_IDS) {
  const doc = before[id]
  if (!doc) continue

  const company = doc.company ?? {}
  const audit = auditSocialLinks(company.socialLinks)
  const repairedLinks = repairSocialLinks(company.socialLinks)
  const urlPatches = syncSocialUrls(company, repairedLinks)

  const linksChanged =
    JSON.stringify(repairedLinks) !== JSON.stringify(company.socialLinks ?? [])
  const urlsChanged = Object.keys(urlPatches).length > 0
  const needsRepair =
    audit.missingKeys.length > 0 ||
    audit.orphans.length > 0 ||
    audit.duplicateKeys.length > 0 ||
    linksChanged ||
    urlsChanged

  repairs.push({ id, doc, company, repairedLinks, urlPatches, needsRepair })
}

console.info('\n── CAMBIOS PLANIFICADOS ──')
let anyChange = false
for (const repair of repairs) {
  if (!repair.needsRepair) {
    console.info(`  ${repair.id}: sin cambios`)
    continue
  }
  anyChange = true
  console.info(`  ${repair.id}:`)
  if (JSON.stringify(repair.repairedLinks) !== JSON.stringify(repair.company.socialLinks ?? [])) {
    console.info('    · socialLinks[] → reparar _key / eliminar huérfanos')
  }
  for (const [field, value] of Object.entries(repair.urlPatches)) {
    console.info(`    · company.${field} ← "${value}" (desde socialLinks)`)
  }
}

if (!anyChange) {
  console.info('  (ningún cambio necesario)')
}

if (dryRun) {
  console.info('\n[dry] Sin escritura en Sanity.')
  process.exit(0)
}

for (const repair of repairs) {
  if (!repair.needsRepair) continue

  const setPayload = {
    'company.socialLinks': repair.repairedLinks,
  }
  for (const [field, value] of Object.entries(repair.urlPatches)) {
    setPayload[`company.${field}`] = value
  }

  await client.patch(repair.id).set(setPayload).commit()
  console.info(`\n✓ patch aplicado: ${repair.id}`)
}

console.info('\n── AFTER (verificación live) ──')
for (const id of DOCUMENT_IDS) {
  const doc = await client.fetch(AUDIT_QUERY, { id })
  if (!doc) continue
  console.info(`\n── AFTER ${id} ──`)
  const repair = repairs.find((r) => r.id === id)
  printAfter(doc.company, doc.company?.socialLinks ?? [], repair?.urlPatches ?? {})
}

console.info('\n✓ repair:site-settings-social-links completado')

/**
 * Auditoría one-off: instagramUrl / facebookUrl en cadena CMS → Navbar
 * node scripts/audit-navbar-social.mjs
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { SITE_SETTINGS_QUERY } from '../src/lib/sanity/queries.js'

const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const e = loadSanityEnv({ requireToken: false })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  useCdn: false,
})

const raw = await client.fetch(SITE_SETTINGS_QUERY)
const fullCompany = await client.fetch('*[_id == "siteSettings"][0].company')

function safeString(value) {
  if (value == null) return ''
  const s = String(value).trim()
  return s || ''
}

function urlFromSocialLinks(links, platformName) {
  const match = (links ?? []).find(
    (item) => safeString(item?.platform).toLowerCase() === platformName.toLowerCase(),
  )
  return safeString(match?.url)
}

const socialLinks = (fullCompany?.socialLinks ?? []).map((item) => ({
  platform: safeString(item?.platform),
  url: safeString(item?.url),
}))

const resolverPreview = {
  instagramUrl:
    safeString(raw?.company?.instagramUrl) || urlFromSocialLinks(socialLinks, 'instagram'),
  facebookUrl:
    safeString(raw?.company?.facebookUrl) || urlFromSocialLinks(socialLinks, 'facebook'),
  whatsappNumber: raw?.company?.whatsappNumber ?? null,
}

const navbarSnippet = readFileSync(
  join(WEB_ROOT, 'src/components/layout/Navbar.jsx'),
  'utf8',
)

console.info('\n=== 1. SANITY CMS ===')
console.info(`Project: ${e.projectId} / Dataset: ${e.dataset}`)
console.info('instagramUrl (published):', JSON.stringify(raw?.company?.instagramUrl ?? null))
console.info('facebookUrl (published):', JSON.stringify(raw?.company?.facebookUrl ?? null))
console.info('socialLinks (published):', JSON.stringify(raw?.company?.socialLinks ?? null))

console.info('\n=== 2. QUERY PROJECTION (SITE_SETTINGS_QUERY) ===')
const queryMatch = readFileSync(join(WEB_ROOT, 'src/lib/sanity/queries.js'), 'utf8')
const hasIg = queryMatch.includes('instagramUrl,')
const hasFb = queryMatch.includes('facebookUrl,')
console.info('instagramUrl in query:', hasIg)
console.info('facebookUrl in query:', hasFb)

console.info('\n=== 3. RESOLVER PREVIEW ===')
console.info(JSON.stringify(resolverPreview, null, 2))

console.info('\n=== 4. NAVBAR RENDER CONDITIONS ===')
console.info('NavbarSocialLinks early return if !instagramUrl && !facebookUrl')
console.info('Header bar className on social:', navbarSnippet.includes('className="hidden sm:flex"'))
console.info('Drawer social className:', navbarSnippet.includes('className="sm:hidden"'))

console.info('\n=== 5. WOULD RENDER? ===')
const wouldShowSocial = Boolean(resolverPreview.instagramUrl || resolverPreview.facebookUrl)
console.info('Social buttons would render (data):', wouldShowSocial)
if (!wouldShowSocial) {
  console.info('CAUSA: instagramUrl y facebookUrl vacios en CMS y sin fallback en socialLinks')
}

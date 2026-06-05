/**
 * Auditoría runtime Home — Studio / Published / Draft / GROQ / Resolver / Frontend.
 * npm run audit:home-runtime
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  extractHomePageMetrics,
  fetchHomePagePair,
  createSyncClient,
} from './lib/homepageSyncUtils.mjs'
import {
  frontendExpectations,
  resolveRuntimeMetrics,
} from './lib/homeRuntimeAudit.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = join(__dirname, '..')

function readEnvFlag(name, fallback = 'false') {
  try {
    const raw = readFileSync(join(WEB_ROOT, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...rest] = trimmed.split('=')
      if (key.trim() === name) return rest.join('=').trim()
    }
  } catch {
    /* ignore */
  }
  return process.env[name] ?? fallback
}

const flags = {
  USE_BLOCK_RESOLVER: readEnvFlag('VITE_USE_BLOCK_RESOLVER') === 'true',
  USE_SPECIALTIES_V2: readEnvFlag('VITE_USE_SPECIALTIES_V2') === 'true',
  USE_SANITY: readEnvFlag('VITE_USE_SANITY') === 'true',
}

const { client } = createSyncClient({ requireToken: false })
const { published, draft } = await fetchHomePagePair(client)
const groqPage = published ?? draft

const pubM = extractHomePageMetrics(published ?? {})
const draftM = extractHomePageMetrics(draft ?? {})
const groqM = extractHomePageMetrics(groqPage ?? {})
const resolverM = resolveRuntimeMetrics(groqPage?.blocks ?? [])
const frontendM = frontendExpectations(resolverM, flags)

const SECTIONS = ['Hero', 'Services', 'Specialties', 'Why Utilcar', 'Portfolio', 'CTA']

function studioValue(section) {
  if (section === 'Hero') return draftM.blocksCount > 0 ? 'block' : '—'
  if (section === 'Services') return draftM.servicesItemsCount ?? '—'
  if (section === 'Specialties') return draftM.specialtiesCategoriesCount ?? '—'
  if (section === 'Why Utilcar') return draftM.whyUtilcarItemsCount ?? '—'
  if (section === 'Portfolio') return draftM.featuredProjectsCount ?? '—'
  if (section === 'CTA') return draft?.ctaBanner?.title ? 'ok' : '—'
  return '—'
}

function publishedValue(section) {
  if (section === 'Hero') return pubM.blocksCount > 0 ? 'block' : '—'
  if (section === 'Services') return pubM.servicesItemsCount ?? '—'
  if (section === 'Specialties') return pubM.specialtiesCategoriesCount ?? '—'
  if (section === 'Why Utilcar') return pubM.whyUtilcarItemsCount ?? '—'
  if (section === 'Portfolio') return pubM.featuredProjectsCount ?? '—'
  if (section === 'CTA') return published?.ctaBanner?.title ? 'ok' : '—'
  return '—'
}

function groqValue(section) {
  if (section === 'Hero') return groqM.blocksCount > 0 ? 'block' : '—'
  if (section === 'Services') return groqM.servicesItemsCount ?? '—'
  if (section === 'Specialties') return groqM.specialtiesCategoriesCount ?? '—'
  if (section === 'Why Utilcar') return groqM.whyUtilcarItemsCount ?? '—'
  if (section === 'Portfolio') return groqM.featuredProjectsCount ?? '—'
  if (section === 'CTA') return groqPage?.ctaBanner?.title ? 'ok' : '—'
  return '—'
}

function resolverValue(section) {
  if (section === 'Hero') return resolverM.heroActive ? 'active' : '—'
  if (section === 'Services') return resolverM.servicesCount || '—'
  if (section === 'Specialties') return resolverM.specialtiesCount || '—'
  if (section === 'Why Utilcar') return resolverM.whyCount || '—'
  if (section === 'Portfolio') return resolverM.featuredCount || 'auto-recent'
  if (section === 'CTA') return groqPage?.ctaBanner?.title ? 'ok' : '—'
  return '—'
}

function rowOk(section, studio, pub, groq, resolver, frontend) {
  if (section === 'CTA') return groq === 'ok' && frontend === 'cms-mirror'
  if (section === 'Hero') {
    return studio === pub && pub === groq && resolver === 'active' && frontend === 'cms'
  }
  const numeric = ['Services', 'Specialties', 'Why Utilcar', 'Portfolio']
  if (numeric.includes(section)) {
    return (
      studio === pub &&
      pub === groq &&
      String(resolver) === String(frontend) &&
      frontend !== 'legacy'
    )
  }
  return studio === pub && pub === groq
}

console.info('\n══════════════════════════════════════════════════════════════')
console.info('  AUDITORÍA RUNTIME — Home CMS-first')
console.info(
  `  Flags: BLOCK=${flags.USE_BLOCK_RESOLVER} SPECIALTIES_V2=${flags.USE_SPECIALTIES_V2} SANITY=${flags.USE_SANITY}`,
)
console.info('══════════════════════════════════════════════════════════════\n')

console.info(
  `${'Sección'.padEnd(16)} ${'Studio'.padEnd(10)} ${'Published'.padEnd(10)} ${'Draft'.padEnd(10)} ${'GROQ'.padEnd(10)} ${'Resolver'.padEnd(10)} ${'Frontend'.padEnd(12)} Estado`,
)
console.info('─'.repeat(88))

let failures = 0
for (const section of SECTIONS) {
  const studio = studioValue(section)
  const pub = publishedValue(section)
  const drf = studioValue(section)
  const groq = groqValue(section)
  const resolver = resolverValue(section)
  const frontend = frontendM[section]
  const ok = rowOk(section, studio, pub, groq, resolver, frontend)
  if (!ok) failures += 1
  console.info(
    `${section.padEnd(16)} ${String(studio).padEnd(10)} ${String(pub).padEnd(10)} ${String(drf).padEnd(10)} ${String(groq).padEnd(10)} ${String(resolver).padEnd(10)} ${String(frontend).padEnd(12)} ${ok ? 'OK' : 'FAIL'}`,
  )
}

console.info('\n── CMS Source Map (esperado 100% CMS con flags ON) ──')
const cmsSections = {
  Hero: flags.USE_BLOCK_RESOLVER && resolverM.heroActive ? 'CMS' : 'Legacy',
  Services:
    flags.USE_BLOCK_RESOLVER && resolverM.servicesCount > 0 ? 'CMS' : 'Legacy',
  Specialties:
    flags.USE_BLOCK_RESOLVER &&
    flags.USE_SPECIALTIES_V2 &&
    resolverM.specialtiesCount > 0
      ? 'CMS'
      : 'Legacy',
  'Why Utilcar':
    flags.USE_BLOCK_RESOLVER && resolverM.whyCount > 0 ? 'CMS' : 'Legacy',
  Portfolio:
    flags.USE_BLOCK_RESOLVER && resolverM.hasPortfolioBlock ? 'CMS' : 'Legacy',
  CTA: flags.USE_BLOCK_RESOLVER ? 'CMS' : 'Mixed',
}
for (const [name, source] of Object.entries(cmsSections)) {
  console.info(`  ${name.padEnd(16)} ${source}`)
}

const draftSync =
  pubM.servicesItemsCount === draftM.servicesItemsCount &&
  pubM.specialtiesCategoriesCount === draftM.specialtiesCategoriesCount &&
  pubM.whyUtilcarItemsCount === draftM.whyUtilcarItemsCount &&
  pubM.featuredProjectsCount === draftM.featuredProjectsCount

if (!draftSync) {
  console.info('\n⚠ Published ≠ Draft — npm run sync:homepage-draft')
  failures += 1
}

console.info(`\nIssues totales: ${failures}`)
process.exit(failures > 0 ? 1 : 0)

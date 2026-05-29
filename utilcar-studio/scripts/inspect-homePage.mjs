import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv(p) {
  if (!existsSync(p)) return {}
  const e = {}
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 0) continue
    e[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
  }
  return e
}

const env = { ...loadEnv(join(root, '.env')) }
const client = createClient({
  projectId: env.SANITY_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID,
  dataset: env.SANITY_DATASET || 'production',
  apiVersion: '2024-05-28',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
})

const doc = await client.fetch(`*[_id == "homePage"][0]`)
const specBlock = doc?.blocks?.find((b) => b._type === 'specialtiesBlock')

console.log(JSON.stringify({
  categoriesCount: specBlock?.categories?.length ?? 0,
  itemsCount: specBlock?.items?.length ?? 0,
  categories: specBlock?.categories?.map((c) => ({
    title: c.title,
    slug: c.slug?.current,
    featureGroups: c.features?.map((f) => ({ title: f.title, items: f.items?.length })),
    cta: c.cta ? { label: c.cta.label, to: c.cta.to } : null,
    brands: c.brands?.length ?? 0,
    gallery: c.gallery?.length ?? 0,
  })),
  itemsPreserved: specBlock?.items?.map((i) => i.title),
}, null, 2))

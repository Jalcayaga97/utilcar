/**
 * Reemplaza featuredProjects legacy (1,2,3) por referencias workProject.
 * npm run patch:home-work-refs
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const LEGACY_TO_PROJECT = {
  '1': '1',
  '2': '2',
  '3': '3',
}

const sanityEnv = loadSanityEnv({ requireToken: true })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token,
  useCdn: false,
})

const projects = await client.fetch(
  `*[_type == "workProject"]{ _id, "id": coalesce(projectId.current, projectId) }`,
)
const byId = new Map(projects.map((p) => [String(p.id), p._id]))

const home = await client.fetch(`*[_id == "homePage"][0]`)
if (!home?.blocks) {
  console.error('homePage sin blocks')
  process.exit(1)
}

const blocks = [...home.blocks]
const idx = blocks.findIndex((b) => b._type === 'portfolioBlock')
if (idx < 0) {
  console.error('sin portfolioBlock')
  process.exit(1)
}

const portfolio = { ...blocks[idx] }
const refs = (portfolio.featuredProjects ?? []).map((ref, i) => {
  const legacyId = String(ref?.projectId ?? '').trim()
  const targetId = LEGACY_TO_PROJECT[legacyId] ?? legacyId
  const docId = byId.get(targetId)
  if (!docId) {
    console.warn(`⚠ sin workProject para legacy ${legacyId}`)
    return ref
  }
  return {
    _key: ref._key || `featured-${i}`,
    _type: 'featuredProjectRef',
    project: { _type: 'reference', _ref: docId },
    projectId: legacyId,
  }
})

portfolio.featuredProjects = refs
blocks[idx] = portfolio

await client.patch('homePage').set({ blocks }).commit()

console.log('\n=== patch:home-work-refs OK ===\n')
for (const ref of refs) {
  console.log(`• ${ref.project?._ref} (legacy id: ${ref.projectId ?? '—'})`)
}

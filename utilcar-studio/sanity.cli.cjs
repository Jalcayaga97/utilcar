/** CLI Sanity (CommonJS — compatible con `type: module` del package.json). */
const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  process.env.VITE_SANITY_PROJECT_ID

const dataset =
  process.env.SANITY_STUDIO_DATASET ||
  process.env.SANITY_DATASET ||
  process.env.VITE_SANITY_DATASET ||
  'production'

if (!projectId?.trim()) {
  throw new Error(
    'sanity.cli.cjs: falta SANITY_STUDIO_PROJECT_ID (use loadSanityEnv / npm run sanity:doctor).',
  )
}

module.exports = {
  api: {
    projectId,
    dataset,
  },
}

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  process.env.VITE_SANITY_PROJECT_ID ||
  '1k8yld2r'

const dataset =
  process.env.SANITY_STUDIO_DATASET ||
  process.env.SANITY_DATASET ||
  process.env.VITE_SANITY_DATASET ||
  'production'

  module.exports = {
    api: {
      projectId: "1k8yld2r",
      dataset: "production",
    },
    studioHost: "utilcar",
  }
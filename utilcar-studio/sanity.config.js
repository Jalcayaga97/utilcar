import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas/index.js'
import { structure } from './structure.js'
import { formComponents } from './formComponents.jsx'

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.VITE_SANITY_PROJECT_ID ||
  '1k8yld2r'
  const dataset =
  process.env.SANITY_STUDIO_DATASET ||
  process.env.VITE_SANITY_DATASET ||
  'production'

if (!projectId?.trim()) {
  throw new Error(
    'Define SANITY_STUDIO_PROJECT_ID o VITE_SANITY_PROJECT_ID (ej. en utilcar-studio/.env)',
  )
}

export default defineConfig({
  name: 'utilcar',
  title: 'Utilcar CMS',
  projectId,
  dataset,
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
  form: {
    components: formComponents,
  },
})

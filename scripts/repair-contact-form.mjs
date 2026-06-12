/**
 * Completa labels del formulario contactPage (solo vacíos).
 * npm run repair:contact-form:dry
 * npm run repair:contact-form
 */
import { createClient } from '@sanity/client'
import { contactContent } from '../src/content/contact.js'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const apply = process.argv.includes('--apply')
const dryRun = process.argv.includes('--dry') || !apply

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const DEFAULT_FIELDS = contactContent.form.fields

function mergeFormFields(existing = {}) {
  const merged = { ...existing }
  const filled = []
  for (const [key, defaults] of Object.entries(DEFAULT_FIELDS)) {
    const current = merged[key] ?? {}
    const next = { ...defaults, ...current }
    if (!current.label && defaults.label) {
      filled.push(`${key}.label`)
    }
    if (!current.placeholder && defaults.placeholder) next.placeholder = defaults.placeholder
    if (current.required == null && defaults.required != null) next.required = defaults.required
    merged[key] = next
  }
  return { merged, filled }
}

const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const DOC_ID = 'contactPage'

async function main() {
  const doc = await client.fetch(`*[_id == $id][0]{ _id, form }`, { id: DOC_ID })
  if (!doc) {
    console.error('contactPage no encontrado')
    process.exit(1)
  }

  const { merged, filled } = mergeFormFields(doc.form?.fields ?? {})
  const nextForm = { ...doc.form, fields: merged }

  console.info('\n[repair:contact-form]')
  for (const key of Object.keys(DEFAULT_FIELDS)) {
    const label = merged[key]?.label ?? '(vacío)'
    console.info(`  ${key}: ${label}`)
  }

  if (!filled.length) {
    console.info('\n(sin cambios necesarios)')
    return
  }

  console.info(`\nCampos completados: ${filled.join(', ')}`)

  if (dryRun) {
    console.info('[dry] Sin escritura')
    return
  }

  await client.patch(DOC_ID).set({ form: nextForm }).commit()
  console.info('✓ form actualizado')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

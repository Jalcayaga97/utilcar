/**
 * Completa siteSettings.company (solo valores vacíos).
 * npm run repair:site-settings-company:dry
 * npm run repair:site-settings-company
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { SCHEMA_VERSION_VALUE } from '../utilcar-studio/schemas/content/fields/schemaVersion.js'

const apply = process.argv.includes('--apply')
const dryRun = process.argv.includes('--dry') || !apply

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const COMPANY_DEFAULTS = {
  legalName: 'Utilcar Ltda.',
  phone: '+56 9 4286 8395',
  secondaryPhone: '+56 2 0000 0000',
  whatsappNumber: '56942868395',
  primaryEmail: 'contacto@utilcar.cl',
  secondaryEmail: 'borisjara@utilcar.cl',
  addressStreet: 'Antonio Ebner 1551',
  addressCity: 'Quinta Normal, Santiago',
  openingHours: ['Lunes a viernes 08:30–18:00', 'Sábado 09:00–13:00'],
  mapsEmbedQuery: 'Antonio+Ebner+1551,+Quinta+Normal,+Santiago,+Chile',
  socialLinks: [{ _key: 'whatsapp', platform: 'WhatsApp', url: 'https://wa.me/56942868395' }],
}

const FIELD_KEYS = Object.keys(COMPANY_DEFAULTS)

function isEmpty(value) {
  if (value == null) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'string') return !value.trim()
  return false
}

function mergeCompany(existing = {}) {
  const merged = { ...existing }
  const filled = []
  for (const key of FIELD_KEYS) {
    if (isEmpty(merged[key])) {
      merged[key] = COMPANY_DEFAULTS[key]
      filled.push(key)
    }
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

const DOC_ID = 'siteSettings'

async function main() {
  const existing = await client.fetch(`*[_id == $id][0]{ _id, company, serviceCta }`, { id: DOC_ID })

  console.info('\n[repair:site-settings-company]\n')

  if (!existing) {
    console.info('── BEFORE: documento no existe ──')
    if (dryRun) {
      console.info('[dry] Crearía siteSettings con company completo')
      return
    }
    await client.create({
      _id: DOC_ID,
      _type: 'siteSettings',
      schemaVersion: SCHEMA_VERSION_VALUE,
      company: COMPANY_DEFAULTS,
      serviceCta: {
        eyebrow: 'Contacto',
        title: 'Cotice su proyecto con Utilcar',
        description: 'Fabricación e instalación de conversiones automotrices en Santiago.',
        primaryButtonLabel: 'Contactar',
        primaryButtonUrl: '/contacto',
      },
    })
    console.info('✓ siteSettings creado')
    return
  }

  console.info('── BEFORE ──')
  for (const key of FIELD_KEYS) {
    const val = existing.company?.[key]
    const status = isEmpty(val) ? 'VACÍO' : 'OK'
    console.info(`  ${key}: ${status}`)
  }

  const { merged, filled } = mergeCompany(existing.company ?? {})

  console.info('\n── CAMBIOS ──')
  if (!filled.length) {
    console.info('  (ningún campo vacío — sin cambios)')
  } else {
    for (const key of filled) console.info(`  + ${key}`)
  }

  if (dryRun) {
    console.info('\n[dry] Sin escritura en Sanity.')
    return
  }

  await client.patch(DOC_ID).set({ company: merged }).commit()

  console.info('\n── AFTER ──')
  for (const key of FIELD_KEYS) {
    console.info(`  ${key}: OK`)
  }
  console.info('\n✓ company actualizado')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

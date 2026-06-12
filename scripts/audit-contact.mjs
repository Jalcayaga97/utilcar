/**
 * Auditoría global Contacto CMS + siteSettings.company.
 * npm run audit:contact
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAuditClient } from './lib/imageAuditShared.mjs'

const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LEGACY_CONTACT_FIELDS = ['hero', 'intro', 'faq', 'faqItems', 'cta']

const CONTACT_QUERY = `*[_id == "contactPage"][0]{
  _id,
  blocks[]{ _type, _key, title, description, eyebrow },
  form{
    heading,
    fields{ nombre, empresa, mail, telefono, servicio, consulta },
    submit, success, error
  },
  hero, intro, faq, faqItems, cta
}`

const COMPANY_QUERY = `*[_id == "siteSettings"][0]{
  contactEmail,
  company{
    legalName, phone, secondaryPhone, whatsappNumber,
    primaryEmail, secondaryEmail,
    addressStreet, addressCity, openingHours,
    mapsEmbedQuery,
    socialLinks[]{ platform, url }
  }
}`

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b._type === type)
}

function sourceUsesCompanyInfo(filePath) {
  const src = readFileSync(join(WEB_ROOT, filePath), 'utf8')
  return src.includes('useCompanyInfo')
}

export async function runAudit() {
  const client = createAuditClient()
  const doc = await client.fetch(CONTACT_QUERY)
  const settings = await client.fetch(COMPANY_QUERY)

  let errors = 0
  let warnings = 0
  const lines = []

  console.info('\n══════════════════════════════════════')
  console.info('  Auditoría global — Contacto')
  console.info('══════════════════════════════════════\n')

  if (!doc) {
    console.error('✗ contactPage no encontrado')
    process.exit(1)
  }
  lines.push('✓ documento publicado')

  const blocks = doc.blocks ?? []
  const requiredBlocks = ['heroBlock', 'richTextBlock', 'faqBlock', 'ctaBlock', 'seoBlock']
  for (const type of requiredBlocks) {
    if (!blockOfType(blocks, type)) {
      errors += 1
      lines.push(`✗ ${type} ausente`)
    } else {
      lines.push(`✓ ${type}`)
    }
  }

  if (!doc.form?.heading) {
    errors += 1
    lines.push('✗ form.heading ausente')
  } else {
    lines.push('✓ form configurado')
  }

  const formFields = doc.form?.fields ?? {}
  for (const key of ['nombre', 'mail', 'consulta']) {
    if (!formFields[key]?.label) {
      warnings += 1
      lines.push(`⚠ form.fields.${key} sin label`)
    }
  }

  lines.push('✓ servicios del formulario derivados de SERVICE_LINKS (runtime)')

  const company = settings?.company ?? {}
  const companyChecks = [
    ['legalName', company.legalName],
    ['phone', company.phone],
    ['primaryEmail', company.primaryEmail],
    ['whatsappNumber', company.whatsappNumber],
    ['addressStreet', company.addressStreet],
    ['addressCity', company.addressCity],
    ['openingHours', company.openingHours],
    ['mapsEmbedQuery', company.mapsEmbedQuery],
  ]
  for (const [label, value] of companyChecks) {
    if (!value) {
      errors += 1
      lines.push(`✗ company.${label}`)
    } else {
      lines.push(`✓ company.${label}`)
    }
  }

  if (!settings?.contactEmail) {
    errors += 1
    lines.push('✗ siteSettings.contactEmail')
  } else {
    lines.push('✓ siteSettings.contactEmail')
  }

  for (const field of LEGACY_CONTACT_FIELDS) {
    if (doc[field] != null && (Array.isArray(doc[field]) ? doc[field].length : true)) {
      warnings += 1
      lines.push(`⚠ campo legacy: ${field}`)
    }
  }

  for (const block of blocks) {
    if (!block._key) {
      errors += 1
      lines.push(`✗ bloque ${block._type} sin _key`)
    }
  }

  const consumers = [
    'src/pages/Contacto.jsx',
    'src/components/layout/Footer.jsx',
    'src/components/seo/StructuredData.jsx',
  ]
  for (const file of consumers) {
    if (sourceUsesCompanyInfo(file)) {
      lines.push(`✓ ${file} → useCompanyInfo()`)
    } else {
      warnings += 1
      lines.push(`⚠ ${file} sin useCompanyInfo()`)
    }
  }

  for (const line of lines) console.info(line)
  console.info('\n── Resumen ──')
  console.info(`Passed: ${errors === 0 ? 'yes' : 'partial'}`)
  console.info(`Warnings: ${warnings}`)
  console.info(`Errors: ${errors}`)

  return { errors, warnings, passed: errors === 0 }
}

const isMain = process.argv[1]?.endsWith('audit-contact.mjs')
if (isMain) {
  const result = await runAudit()
  if (result.errors > 0) process.exit(1)
}

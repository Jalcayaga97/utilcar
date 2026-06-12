/**
 * Prueba POST /api/contact (dev middleware o Vercel).
 * npm run test:contact-email
 */
import { loadEnv } from 'vite'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAuditClient } from './lib/imageAuditShared.mjs'
import { handleContactPost } from '../api/lib/contactHandler.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = loadEnv('development', ROOT, '')
for (const [key, value] of Object.entries(env)) {
  if (process.env[key] == null) process.env[key] = value
}

const TEST_PAYLOAD = {
  nombre: 'Test Utilcar',
  empresa: '',
  mail: 'julioignaciorodriguez97@gmail.com',
  telefono: '999999999',
  servicio: 'Proyecto personalizado',
  consulta: 'Prueba auditoría correo',
  to: 'julioignaciorodriguez97@gmail.com',
  submittedAt: new Date().toISOString(),
}

const client = createAuditClient()
const settings = await client.fetch(
  `*[_id == "siteSettings"][0]{ contactEmail, company { primaryEmail } }`,
)

console.info('── CMS destino ──')
console.info(JSON.stringify(settings, null, 2))

console.info('\n── Handler directo ──')
const result = await handleContactPost(TEST_PAYLOAD)
console.info(`status: ${result.status}`)
console.info(`body: ${JSON.stringify(result.body)}`)

if (!process.env.RESEND_API_KEY) {
  console.info('\n⚠ RESEND_API_KEY no configurada — no se puede confirmar recepción de correo.')
  process.exit(result.status === 500 && result.body?.error === 'missing_resend_api_key' ? 0 : 1)
}

if (result.status === 200 && result.body?.ok) {
  console.info('\n✓ Correo enviado via Resend')
  console.info(`  id: ${result.body.id}`)
  process.exit(0)
}

process.exit(1)

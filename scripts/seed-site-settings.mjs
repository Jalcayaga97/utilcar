/**
 * Crea siteSettings con CTA global desde serviceCtaDefaults.
 * npm run seed:site-settings
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { serviceCtaDefaults } from '../src/content/services.js'
import { SITE } from '../src/constants/site.js'
import { ENV } from '../src/constants/env.js'
import { SITE_SETTINGS_DOCUMENT_ID } from '../utilcar-studio/schemas/content/siteSettings.js'
import { SCHEMA_VERSION_VALUE } from '../utilcar-studio/schemas/content/fields/schemaVersion.js'

const sanityEnv = loadSanityEnv({ requireToken: true })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token,
  useCdn: false,
})

const existing = await client.getDocument(SITE_SETTINGS_DOCUMENT_ID)

const companyPayload = {
  legalName: SITE.legalName,
  phone: SITE.phoneDisplay,
  secondaryPhone: '',
  whatsappNumber: ENV.whatsappNumber,
  primaryEmail: SITE.email || ENV.contactEmail,
  secondaryEmail: SITE.emails?.[1] ?? '',
  addressStreet: SITE.addressStreet,
  addressCity: SITE.addressCity,
  openingHours: ['Lunes a viernes', 'Horario comercial'],
  mapsEmbedQuery: SITE.mapsQuery,
  socialLinks: [{ platform: 'WhatsApp', url: SITE.whatsappUrl }],
}

if (existing?.serviceCta?.title && existing?.company?.primaryEmail) {
  console.info(`✓ siteSettings ya existe (${SITE_SETTINGS_DOCUMENT_ID})`)
  process.exit(0)
}

await client.createOrReplace({
  _id: SITE_SETTINGS_DOCUMENT_ID,
  _type: 'siteSettings',
  schemaVersion: SCHEMA_VERSION_VALUE,
  company: existing?.company?.primaryEmail ? existing.company : companyPayload,
  serviceCta: existing?.serviceCta?.title
    ? existing.serviceCta
    : {
        eyebrow: 'Contacto',
        title: serviceCtaDefaults.title,
        description: serviceCtaDefaults.description,
        primaryButtonLabel: serviceCtaDefaults.primaryLabel,
        primaryButtonUrl: serviceCtaDefaults.primaryTo,
        secondaryButtonLabel: '',
        secondaryButtonUrl: '',
      },
})

console.info(`+ siteSettings OK — company + serviceCta (${SITE_SETTINGS_DOCUMENT_ID})`)

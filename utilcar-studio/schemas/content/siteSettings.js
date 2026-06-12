import { schemaVersionField } from './fields/schemaVersion.js'

export const SITE_SETTINGS_DOCUMENT_ID = 'siteSettings'

/** CTA reutilizable en páginas de servicio (fallback cuando la página no define ctaBlock). */
const socialLinkType = {
  type: 'object',
  fields: [
    { name: 'platform', title: 'Plataforma', type: 'string' },
    { name: 'url', title: 'URL', type: 'url' },
  ],
}

/** Datos corporativos globales (teléfono, dirección, mapa, etc.). */
export const companyObject = {
  name: 'company',
  title: 'Datos de la empresa',
  type: 'object',
  fields: [
    { name: 'legalName', title: 'Razón social', type: 'string' },
    { name: 'phone', title: 'Teléfono principal', type: 'string' },
    { name: 'secondaryPhone', title: 'Teléfono secundario', type: 'string' },
    {
      name: 'whatsappNumber',
      title: 'WhatsApp (solo dígitos, ej. 56942868395)',
      type: 'string',
    },
    { name: 'primaryEmail', title: 'Email principal', type: 'string' },
    { name: 'secondaryEmail', title: 'Email secundario', type: 'string' },
    { name: 'addressStreet', title: 'Calle y número', type: 'string' },
    { name: 'addressCity', title: 'Comuna / ciudad', type: 'string' },
    {
      name: 'openingHours',
      title: 'Horario (líneas visibles)',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'mapsEmbedQuery',
      title: 'Query Google Maps (embed)',
      type: 'string',
      description: 'Ej. Antonio+Ebner+1551,+Quinta+Normal,+Santiago,+Chile',
    },
    {
      name: 'socialLinks',
      title: 'Redes sociales',
      type: 'array',
      of: [socialLinkType],
      description: 'Legacy — preferir instagramUrl y facebookUrl.',
    },
    {
      name: 'instagramUrl',
      title: 'Instagram — URL',
      type: 'url',
      description: 'Enlace al perfil de Instagram (header y SEO).',
    },
    {
      name: 'facebookUrl',
      title: 'Facebook — URL',
      type: 'url',
      description: 'Enlace al perfil de Facebook (header y SEO).',
    },
  ],
}

export const serviceCtaObject = {
  name: 'serviceCta',
  title: 'CTA de servicios',
  type: 'object',
  fields: [
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título', type: 'string' },
    { name: 'description', title: 'Descripción', type: 'text', rows: 3 },
    {
      name: 'primaryButtonLabel',
      title: 'Botón principal — texto',
      type: 'string',
    },
    {
      name: 'primaryButtonUrl',
      title: 'Botón principal — enlace',
      type: 'string',
      description: 'Ej. /contacto',
    },
    {
      name: 'secondaryButtonLabel',
      title: 'Botón secundario — texto',
      type: 'string',
    },
    {
      name: 'secondaryButtonUrl',
      title: 'Botón secundario — enlace',
      type: 'string',
    },
  ],
}

export const siteSettings = {
  name: 'siteSettings',
  title: 'Configuración del sitio',
  type: 'document',
  fields: [
    schemaVersionField,
    {
      name: 'company',
      title: 'Datos corporativos',
      type: 'company',
      description: 'Teléfono, emails, dirección, horarios y mapa — usados en Contacto, Footer y SEO.',
    },
    {
      name: 'serviceCta',
      title: 'CTA global — páginas de servicio',
      type: 'serviceCta',
      description:
        'Texto del banner inferior compartido. Las páginas con ctaBlock propio lo reemplazan.',
    },
    {
      name: 'contactEmail',
      title: 'Correo del formulario de contacto',
      type: 'string',
      description: 'Correo que recibirá las consultas enviadas desde el formulario de contacto.',
      initialValue: 'julioignaciorodriguez97@gmail.com',
      validation: (Rule) => Rule.email(),
    },
  ],
  preview: {
    select: { ctaTitle: 'serviceCta.title', companyPhone: 'company.phone' },
    prepare({ ctaTitle, companyPhone }) {
      const parts = []
      if (companyPhone) parts.push(`Contacto: ${companyPhone}`)
      if (ctaTitle) parts.push(`CTA: ${ctaTitle}`)
      return {
        title: 'Configuración del sitio',
        subtitle: parts.join(' · ') || 'Datos corporativos y CTA global',
      }
    },
  },
}

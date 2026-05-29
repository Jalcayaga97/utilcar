import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'

export const ctaBlock = {
  name: 'ctaBlock',
  title: 'Banner CTA',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  fields: [
    ...blockMetaFields(),
    { name: 'title', title: 'Título', type: 'string' },
    { name: 'description', title: 'Descripción', type: 'text', rows: 3 },
    {
      name: 'buttonLabel',
      title: 'Texto del botón',
      description: 'Etiqueta principal del CTA (publicada en el sitio).',
      type: 'string',
    },
    {
      name: 'buttonLink',
      title: 'Enlace del botón',
      description: 'Ruta interna, ej. /contacto',
      type: 'string',
    },
    {
      name: 'buttonText',
      title: 'Texto alternativo del botón',
      description: 'Opcional. Respaldo si no hay etiqueta principal.',
      type: 'string',
    },
  ],
  preview: {
    select: { title: 'title', label: 'buttonLabel', enabled: 'enabled' },
    prepare({ title, label, enabled }) {
      return {
        title: title || 'Banner CTA',
        subtitle: `${label || 'Sin botón'} · ${enabled === false ? 'Oculto' : 'Visible'}`,
      }
    },
  },
}

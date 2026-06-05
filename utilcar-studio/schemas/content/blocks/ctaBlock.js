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
      name: 'primaryLabel',
      title: 'Texto botón principal',
      type: 'string',
      hidden: ({ document }) => document?._type !== 'workPage',
      description: 'Solo Página Trabajos. En Home y servicios los botones vienen de siteSettings.',
    },
    {
      name: 'primaryTo',
      title: 'Ruta botón principal',
      type: 'string',
      hidden: ({ document }) => document?._type !== 'workPage',
      description: 'Ej. /contacto',
    },
    {
      name: 'buttonLabel',
      title: '[Legacy] Texto del botón',
      type: 'string',
      hidden: true,
      readOnly: true,
    },
    {
      name: 'buttonLink',
      title: '[Legacy] Enlace del botón',
      type: 'string',
      hidden: true,
      readOnly: true,
    },
    {
      name: 'buttonText',
      title: '[Legacy] Texto alternativo del botón',
      type: 'string',
      hidden: true,
      readOnly: true,
    },
  ],
  preview: {
    select: { title: 'title', enabled: 'enabled' },
    prepare({ title, enabled }) {
      return {
        title: title || 'Banner CTA',
        subtitle: `Botones: siteSettings.serviceCta · ${enabled === false ? 'Oculto' : 'Visible'}`,
      }
    },
  },
}

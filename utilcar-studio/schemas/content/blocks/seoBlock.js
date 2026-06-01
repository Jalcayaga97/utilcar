import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'

export const seoBlock = {
  name: 'seoBlock',
  title: 'SEO y metadatos',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  fields: [
    ...blockMetaFields(),
    {
      name: 'title',
      title: 'Título SEO',
      type: 'string',
      description: 'Override del título de página (≤60 caracteres recomendado).',
      validation: (Rule) => Rule.max(80),
    },
    {
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: '≤160 caracteres recomendado para Google.',
      validation: (Rule) => Rule.max(320),
    },
    { name: 'keywords', title: 'Keywords', type: 'string' },
    {
      name: 'canonicalPath',
      title: 'Ruta canonical',
      type: 'string',
      description: 'Ej. /trabajos-realizados — vacío = default del sitio.',
    },
    {
      name: 'ogImage',
      title: 'Imagen Open Graph',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt' }],
    },
    { name: 'noindex', title: 'No indexar', type: 'boolean', initialValue: false },
  ],
  preview: {
    select: { title: 'title', description: 'description' },
    prepare({ title, description }) {
      return {
        title: title || 'SEO',
        subtitle: description ? description.slice(0, 60) : 'Sin description',
      }
    },
  },
}

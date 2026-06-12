import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'

export const brandCarouselBlock = {
  name: 'brandCarouselBlock',
  title: 'Marcas que confían',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  fields: [
    ...blockMetaFields(),
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título de sección', type: 'string' },
    { name: 'description', title: 'Descripción', type: 'text', rows: 2 },
    {
      name: 'brands',
      title: 'Marcas',
      type: 'array',
      of: [{ type: 'brandCarouselBlockItem' }],
      options: { sortable: true, layout: 'grid' },
      validation: (Rule) =>
        Rule.min(1).warning('Agregue al menos una marca para mostrar el carrusel'),
    },
  ],
  preview: {
    select: { title: 'title', count: 'brands', enabled: 'enabled' },
    prepare({ title, count, enabled }) {
      const n = Array.isArray(count) ? count.length : 0
      return {
        title: title || 'Marcas que confían',
        subtitle: `${n} marca${n === 1 ? '' : 's'} · ${enabled === false ? 'Oculto' : 'Visible'}`,
      }
    },
  },
}

import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'

export const showcaseCarouselBlock = {
  name: 'showcaseCarouselBlock',
  title: 'Carrusel destacado',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  fields: [
    ...blockMetaFields(),
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título de sección', type: 'string' },
    { name: 'description', title: 'Descripción', type: 'text', rows: 2 },
    {
      name: 'images',
      title: 'Imágenes',
      type: 'array',
      of: [{ type: 'showcaseCarouselBlockItem' }],
      options: { sortable: true, layout: 'grid' },
      validation: (Rule) => Rule.min(1).warning('Agregue al menos una imagen para mostrar el carrusel'),
    },
  ],
  preview: {
    select: { title: 'title', count: 'images', enabled: 'enabled' },
    prepare({ title, count, enabled }) {
      const n = Array.isArray(count) ? count.length : 0
      return {
        title: title || 'Carrusel destacado',
        subtitle: `${n} imagen${n === 1 ? '' : 'es'} · ${enabled === false ? 'Oculto' : 'Visible'}`,
      }
    },
  },
}

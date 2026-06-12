import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'

export const featureGridBlock = {
  name: 'featureGridBlock',
  title: 'Grilla de características',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  fields: [
    ...blockMetaFields(),
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título de sección', type: 'string' },
    { name: 'description', title: 'Descripción', type: 'text', rows: 2 },
    {
      name: 'items',
      title: 'Ítems',
      type: 'array',
      of: [{ type: 'whyUsBlockItem' }],
      options: { sortable: true, layout: 'grid' },
    },
  ],
  preview: {
    select: { title: 'title', count: 'items', enabled: 'enabled' },
    prepare({ title, count, enabled }) {
      const n = Array.isArray(count) ? count.length : 0
      return {
        title: title || 'Grilla de características',
        subtitle: `${n} ítem${n === 1 ? '' : 's'} · ${enabled === false ? 'Oculto' : 'Visible'}`,
      }
    },
  },
}

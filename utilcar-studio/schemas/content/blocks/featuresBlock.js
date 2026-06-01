import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'

export const featuresBlock = {
  name: 'featuresBlock',
  title: 'Características / specs',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  fields: [
    ...blockMetaFields(),
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título', type: 'string' },
    { name: 'description', title: 'Descripción', type: 'text', rows: 2 },
    {
      name: 'groups',
      title: 'Grupos',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'featureGroup',
          fields: [
            { name: 'title', title: 'Título del grupo', type: 'string' },
            {
              name: 'items',
              title: 'Ítems',
              type: 'array',
              of: [{ type: 'string' }],
            },
          ],
          preview: {
            select: { title: 'title', items: 'items' },
            prepare({ title, items }) {
              const n = Array.isArray(items) ? items.length : 0
              return { title: title || 'Grupo', subtitle: `${n} ítems` }
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: { title: 'title', groups: 'groups' },
    prepare({ title, groups }) {
      const n = Array.isArray(groups) ? groups.length : 0
      return { title: title || 'Características', subtitle: `${n} grupos` }
    },
  },
}

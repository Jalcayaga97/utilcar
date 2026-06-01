import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'

export const richTextBlock = {
  name: 'richTextBlock',
  title: 'Texto enriquecido',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  fields: [
    ...blockMetaFields(),
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título', type: 'string' },
    {
      name: 'body',
      title: 'Contenido',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
  preview: {
    select: { title: 'title', enabled: 'enabled' },
    prepare({ title, enabled }) {
      return {
        title: title || 'Texto',
        subtitle: enabled === false ? 'Oculto' : 'Visible',
      }
    },
  },
}

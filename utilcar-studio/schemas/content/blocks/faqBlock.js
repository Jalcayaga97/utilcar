import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'

export const faqBlock = {
  name: 'faqBlock',
  title: 'Preguntas frecuentes',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  fields: [
    ...blockMetaFields(),
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título', type: 'string' },
    { name: 'description', title: 'Descripción', type: 'text', rows: 2 },
    {
      name: 'items',
      title: 'Preguntas',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            { name: 'id', title: 'ID', type: 'string' },
            { name: 'question', title: 'Pregunta', type: 'string' },
            { name: 'answer', title: 'Respuesta', type: 'text', rows: 3 },
          ],
          preview: {
            select: { title: 'question', subtitle: 'answer' },
          },
        },
      ],
    },
  ],
  preview: {
    select: { title: 'title', count: 'items' },
    prepare({ title, count }) {
      const n = Array.isArray(count) ? count.length : 0
      return { title: title || 'FAQ', subtitle: `${n} preguntas` }
    },
  },
}

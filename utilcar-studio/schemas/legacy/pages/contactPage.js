import { schemaVersionField } from '../../content/fields/schemaVersion.js'
import { pageBlocksField } from '../../content/blocks/pageBlocks.js'

const formFieldType = {
  type: 'object',
  fields: [
    { name: 'label', type: 'string' },
    { name: 'placeholder', type: 'string' },
    { name: 'required', type: 'boolean' },
  ],
}

export const contactPage = {
  name: 'contactPage',
  title: 'Página de contacto',
  type: 'document',
  fields: [
    schemaVersionField,
    pageBlocksField(),
    {
      name: 'hero',
      type: 'object',
      fields: [
        { name: 'eyebrow', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'text' },
        { name: 'imageAlt', type: 'string' },
      ],
    },
    {
      name: 'intro',
      type: 'object',
      fields: [{ name: 'formHint', type: 'string' }],
    },
    {
      name: 'faq',
      type: 'object',
      fields: [
        { name: 'eyebrow', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'text' },
      ],
    },
    {
      name: 'faqItems',
      title: 'Preguntas frecuentes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'question', type: 'string' },
            { name: 'answer', type: 'text' },
          ],
        },
      ],
      validation: (Rule) => Rule.min(1),
    },
    {
      name: 'servicios',
      title: 'Opciones formulario servicio',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.min(1),
    },
    {
      name: 'form',
      title: 'Formulario (etiquetas)',
      type: 'object',
      fields: [
        { name: 'heading', type: 'string' },
        {
          name: 'fields',
          type: 'object',
          fields: [
            { name: 'nombre', ...formFieldType },
            { name: 'empresa', ...formFieldType },
            { name: 'mail', ...formFieldType },
            { name: 'telefono', ...formFieldType },
            { name: 'fax', ...formFieldType },
            { name: 'servicio', ...formFieldType },
            { name: 'consulta', ...formFieldType },
          ],
        },
        {
          name: 'submit',
          type: 'object',
          fields: [
            { name: 'idle', type: 'string' },
            { name: 'loading', type: 'string' },
          ],
        },
        {
          name: 'success',
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'message', type: 'text' },
            { name: 'resetLabel', type: 'string' },
          ],
        },
        { name: 'error', type: 'string' },
      ],
    },
  ],
}

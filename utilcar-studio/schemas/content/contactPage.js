import { schemaVersionField } from './fields/schemaVersion.js'
import { contactPageBlocksField } from './blocks/pageBlocks.js'

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
    contactPageBlocksField(),
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
    {
      name: 'servicios',
      title: 'Opciones formulario — servicio',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.min(1),
    },
  ],
}

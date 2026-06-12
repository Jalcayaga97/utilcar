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

const contactDetailsCardFields = [
  {
    name: 'enabled',
    title: 'Visible',
    type: 'boolean',
    initialValue: true,
    description: 'Oculta esta card solo en la página Contacto.',
  },
  { name: 'title', title: 'Título de la card', type: 'string' },
]

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
      name: 'details',
      title: 'Datos de contacto (sección lateral)',
      type: 'object',
      description:
        'Títulos y visibilidad de las cards. Teléfono, correos, dirección y horarios se editan en Configuración del sitio.',
      fields: [
        { name: 'title', title: 'Título de sección', type: 'string' },
        { name: 'description', title: 'Descripción', type: 'text', rows: 2 },
        {
          name: 'cards',
          title: 'Cards',
          type: 'object',
          fields: [
            {
              name: 'phone',
              title: 'Teléfono',
              type: 'object',
              fields: contactDetailsCardFields,
            },
            {
              name: 'email',
              title: 'Correos',
              type: 'object',
              fields: contactDetailsCardFields,
            },
            {
              name: 'address',
              title: 'Dirección',
              type: 'object',
              fields: contactDetailsCardFields,
            },
            {
              name: 'hours',
              title: 'Horario',
              type: 'object',
              fields: contactDetailsCardFields,
            },
          ],
        },
      ],
    },
  ],
}

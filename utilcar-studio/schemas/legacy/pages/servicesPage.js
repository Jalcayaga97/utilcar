import { schemaVersionField } from '../../content/fields/schemaVersion.js'

export const servicesPage = {
  name: 'servicesPage',
  title: 'Página de servicios',
  type: 'document',
  fields: [
    schemaVersionField,
    {
      name: 'serviceLinks',
      title: 'Enlaces servicios',
      type: 'array',
      of: [{ type: 'navLink' }],
      validation: (Rule) => Rule.min(1),
    },
    {
      name: 'mainNavLinks',
      title: 'Navegación principal',
      type: 'array',
      of: [{ type: 'navLink' }],
      validation: (Rule) => Rule.min(1),
    },
    {
      name: 'services',
      title: 'Servicios',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'title', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'description', type: 'text' },
            { name: 'path', type: 'string' },
            { name: 'imageAlt', type: 'string' },
          ],
        },
      ],
      validation: (Rule) => Rule.min(1),
    },
    {
      name: 'highlights',
      title: 'Destacados',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'description', type: 'text' },
          ],
        },
      ],
      validation: (Rule) => Rule.min(1),
    },
  ],
}

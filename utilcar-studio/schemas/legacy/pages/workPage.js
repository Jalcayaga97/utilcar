import { schemaVersionField } from '../../content/fields/schemaVersion.js'
import { pageBlocksField } from '../../content/blocks/pageBlocks.js'

export const workPage = {
  name: 'workPage',
  title: 'Página de trabajos',
  type: 'document',
  fields: [
    schemaVersionField,
    pageBlocksField(),
    {
      name: 'page',
      title: 'Contenido página',
      type: 'object',
      fields: [
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
          fields: [
            { name: 'eyebrow', type: 'string' },
            { name: 'title', type: 'string' },
            { name: 'paragraphs', type: 'array', of: [{ type: 'text' }] },
          ],
        },
        {
          name: 'projects',
          type: 'object',
          fields: [
            { name: 'eyebrow', type: 'string' },
            { name: 'title', type: 'string' },
            { name: 'description', type: 'text' },
          ],
        },
        {
          name: 'cta',
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'description', type: 'text' },
            { name: 'primaryLabel', type: 'string' },
            { name: 'primaryTo', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'filters',
      title: 'Filtros',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'string' },
            { name: 'label', type: 'string' },
          ],
        },
      ],
      validation: (Rule) => Rule.min(1),
    },
    {
      name: 'portfolio',
      title: 'Portfolio',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'title', type: 'string' },
            { name: 'category', type: 'string' },
            { name: 'categoryId', type: 'string' },
            { name: 'description', type: 'text' },
            { name: 'imageAlt', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'preview',
      title: 'Vista previa home',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'string' },
            { name: 'title', type: 'string' },
            { name: 'category', type: 'string' },
            { name: 'description', type: 'text' },
            { name: 'imageAlt', type: 'string' },
            { name: 'imageKey', type: 'number' },
          ],
        },
      ],
    },
    {
      name: 'ui',
      title: 'Textos UI',
      type: 'object',
      fields: [
        { name: 'emptyMessage', type: 'string' },
        { name: 'loadMoreLabel', type: 'string' },
        { name: 'pageSize', type: 'number' },
        { name: 'filterAriaLabel', type: 'string' },
      ],
    },
  ],
}

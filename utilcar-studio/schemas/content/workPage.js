import { schemaVersionField } from './fields/schemaVersion.js'
import { legacyMirrorReadOnly } from '../governance/legacyMirror.js'
import { pageBlocksField } from './blocks/pageBlocks.js'
import { WorkPageBlocksCountDebugInput } from '../presentation/components/WorkPageBlocksCountDebugInput.jsx'

export const workPage = {
  name: 'workPage',
  title: 'Página de trabajos',
  type: 'document',
  fields: [
    schemaVersionField,
    {
      name: 'blocksCountDebug',
      title: '[Debug] blocks.length (formulario Studio)',
      type: 'string',
      readOnly: true,
      components: { input: WorkPageBlocksCountDebugInput },
    },
    pageBlocksField({
      title: 'Secciones de la página',
      description:
        'Hero, Intro, Projects, CTA y SEO — mismo Page Builder que páginas de servicio. Tarjetas en colección Proyectos.',
    }),
    {
      name: 'page',
      title: 'Contenido página (mirror legacy)',
      type: 'object',
      readOnly: legacyMirrorReadOnly,
      hidden: true,
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
      title: 'Filtros (mirror legacy)',
      type: 'array',
      readOnly: legacyMirrorReadOnly,
      hidden: true,
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'string' },
            { name: 'label', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'portfolio',
      title: 'Portfolio (mirror legacy)',
      type: 'array',
      readOnly: legacyMirrorReadOnly,
      hidden: true,
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'string' },
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
      title: 'Vista previa home (mirror legacy)',
      type: 'array',
      readOnly: legacyMirrorReadOnly,
      hidden: true,
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
        { name: 'emptyMessage', type: 'string', title: 'Mensaje sin resultados' },
        { name: 'loadMoreLabel', type: 'string', title: 'Texto cargar más' },
        { name: 'pageSize', type: 'number', title: 'Proyectos por página' },
        { name: 'filterAriaLabel', type: 'string', title: 'Etiqueta ARIA filtros' },
      ],
    },
  ],
  preview: {
    select: { blocks: 'blocks' },
    prepare({ blocks }) {
      const count = Array.isArray(blocks) ? blocks.length : 0
      return {
        title: 'Página Trabajos',
        subtitle: count ? `${count} bloque${count === 1 ? '' : 's'}` : 'Sin bloques',
      }
    },
  },
}

import { PORTFOLIO_FIELDSETS, EDITORIAL_COPY } from '../../presentation/editorial.js'
import { PortfolioBlockEditorialInput } from '../../presentation/components/PortfolioBlockEditorialInput.jsx'
import { PortfolioBlockItemEditorialInput } from '../../presentation/components/PortfolioBlockItemEditorialInput.jsx'

export const portfolioBlock = {
  name: 'portfolioBlock',
  title: 'Portfolio',
  type: 'object',
  fieldsets: PORTFOLIO_FIELDSETS,
  components: {
    input: PortfolioBlockEditorialInput,
  },
  fields: [
    {
      name: 'enabled',
      title: 'Visible en el sitio',
      type: 'boolean',
      fieldset: 'advanced',
      initialValue: true,
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number',
      fieldset: 'advanced',
      hidden: true,
      initialValue: 0,
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      fieldset: 'content',
      description: 'Etiqueta superior pequeña (ej. Portfolio).',
    },
    {
      name: 'title',
      title: 'Título de sección',
      type: 'string',
      fieldset: 'content',
      description: 'Titular visible en el Home (ej. Trabajos recientes).',
    },
    {
      name: 'description',
      title: 'Descripción de sección',
      type: 'text',
      fieldset: 'content',
      rows: 3,
    },
    {
      name: 'ctaLabel',
      title: 'Texto botón ver todos',
      type: 'string',
      fieldset: 'settings',
    },
    {
      name: 'ctaTo',
      title: 'Ruta botón ver todos',
      type: 'string',
      fieldset: 'settings',
      description: 'Ej. /trabajos-realizados',
    },
    {
      name: 'previewCount',
      title: 'Cantidad en vista previa',
      type: 'number',
      fieldset: 'settings',
      initialValue: 3,
      validation: (Rule) => Rule.min(1).max(12),
      description: 'Cuántas tarjetas mostrar en el Home.',
    },
    {
      name: 'items',
      title: 'Proyectos destacados',
      type: 'array',
      fieldset: 'projects',
      of: [{ type: 'portfolioBlockItem' }],
      options: {
        sortable: true,
        layout: 'grid',
      },
      components: {
        item: PortfolioBlockItemEditorialInput,
      },
    },
  ],
  preview: {
    select: { title: 'title', count: 'items', enabled: 'enabled', media: 'items.0.image' },
    prepare({ title, count, enabled, media }) {
      const n = Array.isArray(count) ? count.length : 0
      return {
        title: title || 'Portfolio',
        subtitle: `${n} proyecto${n === 1 ? '' : 's'} · ${enabled === false ? 'Oculto' : 'Visible'}`,
        media,
      }
    },
  },
}

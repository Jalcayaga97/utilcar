import { PORTFOLIO_FIELDSETS } from '../../presentation/editorial.js'
import { PortfolioBlockEditorialInput } from '../../presentation/components/PortfolioBlockEditorialInput.jsx'
import { PortfolioBlockItemEditorialInput } from '../../presentation/components/PortfolioBlockItemEditorialInput.jsx'

/** Solo Home usa ctaLabel / ctaTo / previewCount y fieldset Configuración. */
function isHomePortfolioDocument(document) {
  return document?._type === 'homePage'
}

/** Trabajos y servicios: solo metadata (eyebrow, title, description). */
function isMetadataOnlyPortfolioDocument(document) {
  return document?._type === 'workPage' || document?._type === 'serviceSubPage'
}

const PORTFOLIO_BLOCK_FIELDSETS = PORTFOLIO_FIELDSETS.map((fieldset) => {
  if (fieldset.name === 'settings') {
    return {
      ...fieldset,
      hidden: ({ document }) => !isHomePortfolioDocument(document),
    }
  }
  if (fieldset.name === 'projects') {
    return {
      ...fieldset,
      title: 'Proyectos',
      hidden: ({ document }) => isMetadataOnlyPortfolioDocument(document),
    }
  }
  return fieldset
})

export const portfolioBlock = {
  name: 'portfolioBlock',
  title: 'Portfolio',
  type: 'object',
  fieldsets: PORTFOLIO_BLOCK_FIELDSETS,
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
      description: ({ document }) =>
        isHomePortfolioDocument(document)
          ? 'Titular visible en el Home (ej. Trabajos recientes).'
          : 'Titular de la sección de proyectos en la página.',
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
      hidden: ({ document }) => !isHomePortfolioDocument(document),
      description: 'Solo aplica en el Home.',
    },
    {
      name: 'ctaTo',
      title: 'Ruta botón ver todos',
      type: 'string',
      fieldset: 'settings',
      hidden: ({ document }) => !isHomePortfolioDocument(document),
      description: 'Ej. /trabajos-realizados',
    },
    {
      name: 'previewCount',
      title: 'Cantidad en vista previa',
      type: 'number',
      fieldset: 'settings',
      hidden: ({ document }) => !isHomePortfolioDocument(document),
      initialValue: 3,
      validation: (Rule) => Rule.min(1).max(12),
      description: 'Cuántas tarjetas mostrar. Con selección manual, se toman los primeros N del orden editorial.',
    },
    {
      name: 'selectedProjects',
      title: 'Proyectos para mostrar en Home',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'workProject' }] }],
      fieldset: 'projects',
      options: { sortable: true },
      hidden: ({ document }) => !isHomePortfolioDocument(document),
      description:
        'Orden editorial. Si está vacío, se muestran proyectos con Destacado o Mostrar en Home en el catálogo.',
    },
    {
      name: 'featuredProjects',
      title: 'Proyectos destacados (referencia)',
      type: 'array',
      fieldset: 'projects',
      of: [{ type: 'featuredProjectRef' }],
      options: { sortable: true },
      hidden: ({ document }) => isMetadataOnlyPortfolioDocument(document) || isHomePortfolioDocument(document),
      description:
        'Legacy — use Destacado / Mostrar en Home en cada Proyecto del catálogo CMS.',
    },
    {
      name: 'items',
      title: 'Proyectos destacados',
      type: 'array',
      fieldset: 'projects',
      of: [{ type: 'portfolioBlockItem' }],
      hidden: ({ document }) =>
        isHomePortfolioDocument(document) ||
        isMetadataOnlyPortfolioDocument(document),
      description:
        'En servicios y Home use proyectos workProject. Los ítems embebidos quedan como legacy.',
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
    select: { title: 'title', selected: 'selectedProjects', count: 'items', enabled: 'enabled' },
    prepare({ title, selected, count, enabled }) {
      const selectedN = Array.isArray(selected) ? selected.length : 0
      const embeddedN = Array.isArray(count) ? count.length : 0
      const parts = []
      if (selectedN) parts.push(`${selectedN} seleccionados`)
      if (embeddedN) parts.push(`${embeddedN} embebidos`)
      return {
        title: title || 'Portfolio',
        subtitle: `${parts.join(' · ') || 'auto (flags)'} · ${enabled === false ? 'Oculto' : 'Visible'}`,
      }
    },
  },
}

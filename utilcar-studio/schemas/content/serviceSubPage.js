import { schemaVersionField } from './fields/schemaVersion.js'
import { pageBlocksField } from './blocks/pageBlocks.js'
import { serviceTab } from './objects/serviceTab.js'

export const SERVICE_SUB_PAGE_KEYS = [
  { value: 'talleres-moviles', title: 'Talleres móviles' },
  { value: 'ventanas-lunetas', title: 'Ventanas y lunetas' },
  { value: 'equipamiento-escolar', title: 'Equipamiento escolar' },
  { value: 'banquetas', title: 'Banquetas' },
  { value: 'butacas', title: 'Butacas' },
  { value: 'accesorios', title: 'Accesorios' },
]

export const SERVICE_SUB_PAGE_TAB_KEYS = ['ventanas-lunetas', 'banquetas', 'accesorios']

export function serviceSubPageDocumentId(pageKey) {
  return `serviceSubPage-${pageKey}`
}

function pageKeyIs(parent, ...keys) {
  const pageKey = parent?.pageKey
  return keys.includes(pageKey)
}

export const serviceSubPage = {
  name: 'serviceSubPage',
  title: 'Página de servicio',
  type: 'document',
  fields: [
    schemaVersionField,
    {
      name: 'pageKey',
      title: 'Página',
      type: 'string',
      readOnly: true,
      options: {
        list: SERVICE_SUB_PAGE_KEYS,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'title',
      title: 'Título interno',
      type: 'string',
      description: 'Solo para identificar el documento en Studio.',
    },
    pageBlocksField({
      description:
        'Hero, texto intro, características, galería, CTA y SEO. Use bloques existentes — no campos técnicos.',
    }),
    {
      name: 'tabsSection',
      title: 'Sección pestañas (cabecera)',
      type: 'object',
      description: 'Ventanas, Banquetas o Accesorios — títulos de la zona de tabs.',
      hidden: ({ document }) => !pageKeyIs(document, ...SERVICE_SUB_PAGE_TAB_KEYS),
      fields: [
        { name: 'eyebrow', type: 'string', title: 'Eyebrow' },
        { name: 'title', type: 'string', title: 'Título' },
        { name: 'description', type: 'text', title: 'Descripción', rows: 2 },
      ],
    },
    {
      name: 'tabs',
      title: 'Pestañas (marcas / categorías)',
      type: 'array',
      of: [{ type: 'serviceTab' }],
      options: { sortable: true },
      hidden: ({ document }) => !pageKeyIs(document, ...SERVICE_SUB_PAGE_TAB_KEYS),
    },
    {
      name: 'introExtras',
      title: 'Contenido técnico (Ventanas)',
      type: 'object',
      description: 'Proceso templado y especificaciones bajo el intro — solo Ventanas y lunetas.',
      hidden: ({ document }) => document?.pageKey !== 'ventanas-lunetas',
      fields: [
        {
          name: 'procesoTemplado',
          type: 'object',
          title: 'Proceso templado',
          fields: [
            { name: 'title', type: 'string', title: 'Título' },
            { name: 'text', type: 'text', title: 'Texto', rows: 4 },
          ],
        },
        {
          name: 'especificaciones',
          title: 'Especificaciones',
          type: 'array',
          of: [{ type: 'string' }],
        },
      ],
    },
  ],
  preview: {
    select: { title: 'title', pageKey: 'pageKey', blocks: 'blocks' },
    prepare({ title, pageKey, blocks }) {
      const label =
        SERVICE_SUB_PAGE_KEYS.find((k) => k.value === pageKey)?.title ?? pageKey ?? 'Servicio'
      const count = Array.isArray(blocks) ? blocks.length : 0
      return {
        title: title || label,
        subtitle: `${count} bloque${count === 1 ? '' : 's'}`,
      }
    },
  },
}

export { serviceTab }

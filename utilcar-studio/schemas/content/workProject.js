import { schemaVersionField } from './fields/schemaVersion.js'
import { SERVICE_CATEGORY_OPTIONS } from './serviceCategories.js'
import { ProjectIdSlugInput } from '../presentation/components/ProjectIdSlugInput.jsx'
import {
  PROJECT_ID_FORMAT_HINT,
  PROJECT_ID_PREFIX_BY_CATEGORY,
  PROJECT_ID_REGEX,
  parseProjectIdCode,
} from '../../../src/lib/cms/constants/projectIdCodes.js'

function normalizeDocumentId(document) {
  return String(document?._id ?? '')
    .replace(/^drafts\./, '')
    .trim()
}

/** Proyecto único — fuente editorial para Trabajos, Home y páginas de servicio. */
export const workProject = {
  name: 'workProject',
  title: 'Proyecto',
  type: 'document',
  fields: [
    schemaVersionField,
    {
      name: 'serviceCategory',
      title: 'Categoría de servicio',
      type: 'string',
      options: { list: SERVICE_CATEGORY_OPTIONS, layout: 'dropdown' },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'projectId',
      title: 'ID del proyecto',
      type: 'slug',
      readOnly: true,
      options: { maxLength: 8 },
      components: {
        input: ProjectIdSlugInput,
      },
      description:
        'Código oficial de negocio (ej. TM-001). Lo asigna el sistema al elegir o cambiar la categoría.',
      validation: (Rule) =>
        Rule.required().custom(async (slug, context) => {
          const current = String(slug?.current ?? '').trim()
          if (!current) return 'ID del proyecto requerido'
          if (!PROJECT_ID_REGEX.test(current)) {
            return PROJECT_ID_FORMAT_HINT
          }

          const { document, getClient } = context
          const parsed = parseProjectIdCode(current)
          const expectedPrefix = PROJECT_ID_PREFIX_BY_CATEGORY[document?.serviceCategory]
          if (expectedPrefix && parsed?.prefix !== expectedPrefix) {
            return `El prefijo debe ser ${expectedPrefix} para la categoría seleccionada.`
          }

          const client = getClient({ apiVersion: '2024-05-28' })
          const docId = normalizeDocumentId(document)
          const duplicateCount = await client.fetch(
            `count(*[_type == "workProject" && projectId.current == $id && !(_id in [$docId, $draftId])])`,
            {
              id: current,
              docId,
              draftId: docId ? `drafts.${docId}` : '',
            },
          )
          if (duplicateCount > 0) return `ID duplicado: ${current}`

          return true
        }),
    },
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Imagen principal',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value?.asset?._ref && !value?.asset?._id) return 'Imagen requerida'
          return true
        }),
    },
    {
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 4,
    },
    {
      name: 'client',
      title: 'Cliente',
      type: 'string',
    },
    {
      name: 'vehicle',
      title: 'Vehículo',
      type: 'string',
    },
    {
      name: 'gallery',
      title: 'Galería',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Imagen',
              type: 'image',
              options: { hotspot: true },
            },
            { name: 'alt', title: 'Alt', type: 'string' },
            { name: 'caption', title: 'Pie', type: 'string' },
          ],
          preview: {
            select: { media: 'image', title: 'caption' },
            prepare({ media, title }) {
              return { title: title || 'Imagen', media }
            },
          },
        },
      ],
    },
    {
      name: 'featured',
      title: 'Destacado',
      type: 'boolean',
      initialValue: false,
      description: 'Visible en la vista previa del Home (Trabajos recientes).',
    },
    {
      name: 'homeVisible',
      title: 'Mostrar en Home',
      type: 'boolean',
      initialValue: false,
      description:
        'Alternativa editorial a Destacado — incluye el proyecto en Trabajos recientes del Home.',
    },
    {
      name: 'visible',
      title: 'Visible',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number',
      initialValue: 0,
    },
  ],
  orderings: [
    {
      title: 'Orden editorial',
      name: 'orderAsc',
      by: [
        { field: 'order', direction: 'asc' },
        { field: '_createdAt', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      code: 'projectId.current',
      category: 'serviceCategory',
      media: 'image',
      visible: 'visible',
      featured: 'featured',
      homeVisible: 'homeVisible',
    },
    prepare({ title, code, category, media, visible, featured, homeVisible }) {
      const parts = [code || 'Sin ID', category || 'Sin categoría']
      if (featured) parts.push('Destacado')
      if (homeVisible) parts.push('Home')
      if (visible === false) parts.push('Oculto')
      return {
        title: title || 'Proyecto',
        subtitle: parts.join(' · '),
        media,
      }
    },
  },
}

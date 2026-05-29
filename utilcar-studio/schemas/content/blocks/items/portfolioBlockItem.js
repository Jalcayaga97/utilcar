import {
  PORTFOLIO_ITEM_FIELDSETS,
  EDITORIAL_COPY,
} from '../../../presentation/editorial.js'
import {
  portfolioCategoryWarning,
  portfolioDescriptionLengthWarning,
  portfolioItemImageWarning,
} from '../../../presentation/editorialValidators.js'

export const portfolioBlockItem = {
  name: 'portfolioBlockItem',
  title: 'Proyecto',
  type: 'object',
  fieldsets: PORTFOLIO_ITEM_FIELDSETS,
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      fieldset: 'content',
      validation: (Rule) => Rule.required(),
      description: 'Nombre del proyecto. Mantén títulos compactos para la grilla.',
    },
    {
      name: 'subtitle',
      title: 'Categoría',
      type: 'string',
      fieldset: 'content',
      validation: portfolioCategoryWarning,
      description: EDITORIAL_COPY.portfolio.categoryHint,
    },
    {
      name: 'description',
      title: 'Descripción',
      type: 'text',
      fieldset: 'content',
      rows: 3,
      validation: portfolioDescriptionLengthWarning,
    },
    {
      name: 'client',
      title: 'Cliente',
      type: 'string',
      fieldset: 'content',
    },
    {
      name: 'vehicle',
      title: 'Vehículo',
      type: 'string',
      fieldset: 'content',
      description: 'Modelo o tipo de vehículo del proyecto.',
    },
    {
      name: 'status',
      title: 'Estado',
      type: 'string',
      fieldset: 'options',
      options: {
        list: [
          { title: 'Completado', value: 'completed' },
          { title: 'En progreso', value: 'inProgress' },
          { title: 'Concepto', value: 'concept' },
        ],
        layout: 'radio',
      },
      initialValue: 'completed',
    },
    {
      name: 'tags',
      title: 'Etiquetas',
      type: 'array',
      fieldset: 'options',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    },
    {
      name: 'image',
      title: 'Imagen principal',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      validation: portfolioItemImageWarning,
    },
    {
      name: 'gallery',
      title: 'Galería adicional (opcional)',
      type: 'array',
      fieldset: 'media',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { layout: 'grid' },
      description: EDITORIAL_COPY.portfolio.galleryHint,
    },
    {
      name: 'featured',
      title: 'Destacado',
      type: 'boolean',
      fieldset: 'options',
      initialValue: false,
      description: EDITORIAL_COPY.portfolio.featuredHint,
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      description: 'description',
      media: 'image',
      featured: 'featured',
      status: 'status',
      client: 'client',
    },
    prepare({ title, subtitle, description, media, featured, status, client }) {
      const badge = subtitle || 'Sin categoría'
      const meta = [client, status].filter(Boolean).join(' · ')
      const descPreview = description ? ` — ${String(description).slice(0, 40)}…` : ''
      return {
        title: title || 'Proyecto',
        subtitle: `${badge}${meta ? ` · ${meta}` : ''}${descPreview}`,
        media,
      }
    },
  },
}

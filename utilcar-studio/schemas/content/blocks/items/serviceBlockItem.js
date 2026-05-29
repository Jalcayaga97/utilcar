import { SERVICE_ITEM_FIELDSETS, EDITORIAL_COPY, LUCIDE_ICON_OPTIONS } from '../../../presentation/editorial.js'
import { missingImageAsset } from '../../../presentation/editorialValidators.js'

export const serviceBlockItem = {
  name: 'serviceBlockItem',
  title: 'Servicio',
  type: 'object',
  fieldsets: SERVICE_ITEM_FIELDSETS,
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      fieldset: 'content',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Descripción',
      type: 'text',
      fieldset: 'content',
      rows: 3,
    },
    {
      name: 'icon',
      title: 'Icono',
      type: 'string',
      fieldset: 'content',
      options: { list: LUCIDE_ICON_OPTIONS, layout: 'dropdown' },
      description: 'Icono Lucide opcional para la tarjeta.',
    },
    {
      name: 'image',
      title: 'Imagen',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!missingImageAsset(value)) {
            return 'Sin imagen: la tarjeta usará solo icono o placeholder.'
          }
          return true
        }).warning(),
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
      name: 'link',
      title: 'Enlace',
      type: 'navLink',
      fieldset: 'options',
    },
    {
      name: 'featured',
      title: 'Destacado',
      type: 'boolean',
      fieldset: 'options',
      initialValue: false,
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'description', media: 'image', icon: 'icon', featured: 'featured' },
    prepare({ title, subtitle, media, icon, featured }) {
      const parts = [icon ? `icon: ${icon}` : 'Sin icono']
      if (featured) parts.push('destacado')
      return {
        title: title || 'Servicio',
        subtitle: subtitle?.slice(0, 60) || parts.join(' · '),
        media,
      }
    },
  },
}

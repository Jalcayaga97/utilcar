import { WHY_US_ITEM_FIELDSETS, LUCIDE_ICON_OPTIONS } from '../../../presentation/editorial.js'

export const whyUsBlockItem = {
  name: 'whyUsBlockItem',
  title: 'Motivo',
  type: 'object',
  fieldsets: WHY_US_ITEM_FIELDSETS,
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
      rows: 4,
    },
    {
      name: 'icon',
      title: 'Icono',
      type: 'string',
      fieldset: 'content',
      options: { list: LUCIDE_ICON_OPTIONS, layout: 'dropdown' },
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
    select: { title: 'title', subtitle: 'description', icon: 'icon', featured: 'featured' },
    prepare({ title, subtitle, icon, featured }) {
      const parts = [icon ? icon : 'benefit']
      if (featured) parts.push('destacado')
      return {
        title: title || 'Motivo',
        subtitle: subtitle?.slice(0, 60) || parts.join(' · '),
      }
    },
  },
}

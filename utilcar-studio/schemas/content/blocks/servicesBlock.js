import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'
import { ServicesBlockEditorialInput } from '../../presentation/components/ServicesBlockEditorialInput.jsx'
import { ServiceBlockItemEditorialInput } from '../../presentation/components/ServiceBlockItemEditorialInput.jsx'

export const servicesBlock = {
  name: 'servicesBlock',
  title: 'Servicios',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  components: {
    input: ServicesBlockEditorialInput,
  },
  fields: [
    ...blockMetaFields(),
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título de sección', type: 'string' },
    { name: 'description', title: 'Descripción de sección', type: 'text' },
    { name: 'cardLinkLabel', title: 'Texto enlace tarjeta', type: 'string' },
    {
      name: 'items',
      title: 'Servicios',
      type: 'array',
      of: [{ type: 'serviceBlockItem' }],
      options: { sortable: true, layout: 'grid' },
      components: {
        item: ServiceBlockItemEditorialInput,
      },
    },
  ],
  preview: {
    select: { title: 'title', count: 'items', enabled: 'enabled', media: 'items.0.image' },
    prepare({ title, count, enabled, media }) {
      const n = Array.isArray(count) ? count.length : 0
      return {
        title: title || 'Servicios',
        subtitle: `${n} ítem${n === 1 ? '' : 's'} · ${enabled === false ? 'Oculto' : 'Visible'}`,
        media,
      }
    },
  },
}

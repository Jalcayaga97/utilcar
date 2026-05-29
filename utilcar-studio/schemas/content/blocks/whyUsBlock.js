import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'
import { WhyUsBlockEditorialInput } from '../../presentation/components/WhyUsBlockEditorialInput.jsx'
import { WhyUsBlockItemEditorialInput } from '../../presentation/components/WhyUsBlockItemEditorialInput.jsx'

export const whyUsBlock = {
  name: 'whyUsBlock',
  title: 'Por qué Utilcar',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  components: {
    input: WhyUsBlockEditorialInput,
  },
  fields: [
    ...blockMetaFields(),
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título de sección', type: 'string' },
    {
      name: 'items',
      title: 'Motivos',
      type: 'array',
      of: [{ type: 'whyUsBlockItem' }],
      options: { sortable: true, layout: 'grid' },
      components: {
        item: WhyUsBlockItemEditorialInput,
      },
    },
  ],
  preview: {
    select: { title: 'title', count: 'items', enabled: 'enabled' },
    prepare({ title, count, enabled }) {
      const n = Array.isArray(count) ? count.length : 0
      return {
        title: title || 'Por qué Utilcar',
        subtitle: `${n} ítem${n === 1 ? '' : 's'} · ${enabled === false ? 'Oculto' : 'Visible'}`,
      }
    },
  },
}

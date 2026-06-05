import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'
import { WhyUsBlockEditorialInput } from '../../presentation/components/WhyUsBlockEditorialInput.jsx'
import { WhyUsBlockItemEditorialInput } from '../../presentation/components/WhyUsBlockItemEditorialInput.jsx'

/** Por qué Utilcar — bloque editorial Home (alias semántico de whyUsBlock). */
export const whyUtilcarBlock = {
  name: 'whyUtilcarBlock',
  title: 'Por qué Utilcar',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  components: {
    input: WhyUsBlockEditorialInput,
  },
  fields: [
    ...blockMetaFields(),
    {
      name: 'sectionEyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Etiqueta superior de la sección.',
    },
    {
      name: 'sectionTitle',
      title: 'Título de sección',
      type: 'string',
    },
    {
      name: 'sectionDescription',
      title: 'Descripción de sección',
      type: 'text',
      rows: 3,
    },
    {
      name: 'eyebrow',
      title: '[Legacy] Eyebrow',
      type: 'string',
      hidden: true,
      readOnly: true,
    },
    {
      name: 'title',
      title: '[Legacy] Título',
      type: 'string',
      hidden: true,
      readOnly: true,
    },
    {
      name: 'description',
      title: '[Legacy] Descripción',
      type: 'text',
      hidden: true,
      readOnly: true,
    },
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
    select: { title: 'sectionTitle', count: 'items', enabled: 'enabled' },
    prepare({ title, count, enabled }) {
      const n = Array.isArray(count) ? count.length : 0
      return {
        title: title || 'Por qué Utilcar',
        subtitle: `${n} ítem${n === 1 ? '' : 's'} · ${enabled === false ? 'Oculto' : 'Visible'}`,
      }
    },
  },
}

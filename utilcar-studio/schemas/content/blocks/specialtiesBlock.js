import { EDITORIAL_HINTS } from '../../presentation/editorial.js'
import { advancedSectionHidden } from '../../governance/studioAdmin.js'
import { specialtiesNewArrayRules } from '../../governance/validators.js'
import { specialtyCategoriesArrayRules } from '../../governance/specialtiesValidators.js'
import { blockMetaFields, BLOCK_META_FIELDSET } from './blockBase.js'
import { SpecialtiesBlockEditorialInput } from '../../presentation/components/SpecialtiesBlockEditorialInput.jsx'

export const specialtiesBlock = {
  name: 'specialtiesBlock',
  title: 'Especialidades',
  type: 'object',
  fieldsets: [BLOCK_META_FIELDSET],
  components: {
    input: SpecialtiesBlockEditorialInput,
  },
  fields: [
    ...blockMetaFields(),
    { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
    { name: 'title', title: 'Título de sección', type: 'string' },
    { name: 'description', title: 'Descripción', type: 'text' },
    {
      name: 'itemEyebrowPrefix',
      title: 'Prefijo eyebrow por ítem',
      type: 'string',
      description: 'Ej. "Especialidad" — legacy compat.',
      hidden: advancedSectionHidden,
    },
    {
      name: 'categories',
      title: 'Categorías',
      description: [
        EDITORIAL_HINTS.specialtiesSection,
        EDITORIAL_HINTS.specialtiesCreate,
        EDITORIAL_HINTS.specialtiesOrder,
      ].join(' '),
      type: 'array',
      of: [{ type: 'specialtyCategory' }],
      options: { sortable: true },
      validation: (Rule) => specialtyCategoriesArrayRules(Rule),
    },
    {
      name: 'items',
      title: 'Especialidades (legacy)',
      description: '[DEPRECATED] Usar categories[]. Solo visible para administradores.',
      type: 'array',
      of: [{ type: 'specialty' }],
      options: { sortable: true },
      hidden: advancedSectionHidden,
      validation: (Rule) => specialtiesNewArrayRules(Rule),
    },
  ],
  preview: {
    select: { title: 'title', categories: 'categories', items: 'items', enabled: 'enabled' },
    prepare({ title, categories, items, enabled }) {
      const catCount = Array.isArray(categories) ? categories.length : 0
      const itemCount = Array.isArray(items) ? items.length : 0
      const n = catCount || itemCount
      return {
        title: title || 'Especialidades',
        subtitle: `${n} categoría${n === 1 ? '' : 's'} · ${enabled === false ? 'Oculto' : 'Visible'}`,
      }
    },
  },
}

import { GOVERNANCE_MESSAGES } from '../governance/constants.js'
import { isBrandSlugLocked } from '../governance/validators.js'

export const brand = {
  name: 'brand',
  title: 'Marca',
  type: 'document',
  fields: [
    { name: 'name', title: 'Nombre', type: 'string', validation: (Rule) => Rule.required() },
    {
      name: 'slug',
      title: 'Identificador URL',
      type: 'slug',
      hidden: true,
      description: GOVERNANCE_MESSAGES.brandSlugLocked,
      options: { source: 'name', maxLength: 96 },
      readOnly: ({ document, value }) => isBrandSlugLocked(document, value),
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    },
    { name: 'description', title: 'Descripción', type: 'text', rows: 4 },
  ],
  preview: {
    select: { title: 'name', media: 'logo' },
  },
}

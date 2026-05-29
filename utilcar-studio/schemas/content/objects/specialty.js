import { EDITORIAL_HINTS, SPECIALTY_FIELDSETS } from '../../presentation/editorial.js'
import {
  specialtyDescriptionRules,
  specialtyFeaturesRules,
  specialtyImageRules,
  specialtyTitleRules,
} from '../../governance/validators.js'
import { SpecialtyObjectInput } from '../../presentation/components/SpecialtyObjectInput.jsx'
import { pageBlock } from '../../legacy/objects/pageBlock.js'

export const specialty = {
  name: 'specialty',
  title: 'Especialidad',
  type: 'object',
  fieldsets: SPECIALTY_FIELDSETS,
  components: {
    input: SpecialtyObjectInput,
  },
  fields: [
    {
      name: 'blockMeta',
      title: 'Metadatos internos',
      type: 'pageBlock',
      hidden: true,
      initialValue: { blockType: 'specialty' },
    },
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      fieldset: 'hero',
      description: EDITORIAL_HINTS.specialtyItem,
      validation: (Rule) => specialtyTitleRules(Rule),
    },
    {
      name: 'subtitle',
      title: 'Subtítulo',
      type: 'string',
      fieldset: 'hero',
    },
    {
      name: 'description',
      title: 'Descripción',
      type: 'text',
      fieldset: 'content',
      rows: 5,
      validation: (Rule) => specialtyDescriptionRules(Rule),
    },
    {
      name: 'features',
      title: 'Características',
      description: 'Lista de puntos destacados (máximo 6).',
      type: 'array',
      fieldset: 'content',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      validation: (Rule) => specialtyFeaturesRules(Rule),
    },
    {
      name: 'image',
      title: 'Imagen',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      validation: (Rule) => specialtyImageRules(Rule),
    },
    {
      name: 'buttonText',
      title: 'Texto del botón',
      type: 'string',
      fieldset: 'cta',
    },
    {
      name: 'buttonLink',
      title: 'Enlace del botón',
      description: 'Ruta interna, ej. /ventanas-lunetas',
      type: 'string',
      fieldset: 'cta',
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'subtitle', media: 'image' },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Nueva especialidad',
        subtitle: subtitle || 'Sin subtítulo',
        media,
      }
    },
  },
}

import { SPECIALTY_CATEGORY_FIELDSETS, EDITORIAL_COPY } from '../../presentation/editorial.js'
import {
  specialtyCategoryHeroWarning,
  specialtyCategoryTitleRules,
} from '../../governance/specialtiesValidators.js'
import { SpecialtyCategoryEditorialInput } from '../../presentation/components/SpecialtyCategoryEditorialInput.jsx'
import { advancedSectionHidden } from '../../governance/studioAdmin.js'

/** Sección editorial del Home — no es una página de servicio independiente. */
export const specialtyCategory = {
  name: 'specialtyCategory',
  title: 'Especialidad',
  type: 'object',
  fieldsets: SPECIALTY_CATEGORY_FIELDSETS,
  components: {
    input: SpecialtyCategoryEditorialInput,
  },
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      fieldset: 'hero',
      validation: specialtyCategoryTitleRules,
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
      fieldset: 'hero',
      rows: 5,
    },
    {
      name: 'slug',
      title: 'Identificador URL',
      type: 'slug',
      fieldset: 'hero',
      options: { source: 'title', maxLength: 96 },
      hidden: advancedSectionHidden,
      description: '[DEPRECATED] Solo administración. No afecta el render del Home.',
    },
    {
      name: 'heroImage',
      title: 'Imagen',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      validation: specialtyCategoryHeroWarning,
    },
    {
      name: 'heroImageAlt',
      title: 'Texto alternativo (alt)',
      type: 'string',
      fieldset: 'media',
    },
    {
      name: 'features',
      title: 'Especificaciones',
      type: 'array',
      fieldset: 'features',
      of: [{ type: 'specialtyFeature' }],
      options: { sortable: true },
      description: EDITORIAL_COPY.specialties.featuresHint,
    },
    {
      name: 'cta',
      title: 'CTA',
      type: 'specialtyCta',
      fieldset: 'cta',
    },
    {
      name: 'featured',
      title: 'Destacada',
      type: 'boolean',
      fieldset: 'options',
      initialValue: false,
    },
    {
      name: 'enabled',
      title: 'Visible',
      type: 'boolean',
      fieldset: 'options',
      initialValue: true,
    },
    {
      name: 'gallery',
      title: '[DEPRECATED] Galería',
      type: 'array',
      fieldset: 'gallery',
      of: [{ type: 'specialtyGalleryItem' }],
      hidden: true,
      description: 'Dato legacy conservado. No se edita desde Studio.',
    },
    {
      name: 'brands',
      title: '[DEPRECATED] Marcas',
      type: 'array',
      fieldset: 'brands',
      of: [{ type: 'specialtyBrand' }],
      hidden: true,
      description: 'Dato legacy de páginas de servicio. Conservado en dataset.',
    },
    {
      name: 'layoutConfig',
      title: '[DEPRECATED] Configuración de layout',
      type: 'specialtyLayoutConfig',
      fieldset: 'advanced',
      hidden: true,
      description: 'Dato legacy. No afecta el Home.',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'heroImage',
      enabled: 'enabled',
      featured: 'featured',
    },
    prepare({ title, subtitle, media, enabled, featured }) {
      const parts = [subtitle || 'Especialidad Home']
      if (enabled === false) parts.push('Oculta')
      if (featured) parts.push('Destacada')
      return {
        title: title || 'Nueva especialidad',
        subtitle: parts.join(' · '),
        media,
      }
    },
  },
}

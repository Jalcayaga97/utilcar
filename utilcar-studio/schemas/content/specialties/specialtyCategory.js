import { SPECIALTY_CATEGORY_FIELDSETS, EDITORIAL_COPY } from '../../presentation/editorial.js'
import {
  specialtyCategoryHeroWarning,
  specialtyCategoryTitleRules,
  specialtyCategoryGalleryWarning,
  specialtyBrandsArrayRules,
} from '../../governance/specialtiesValidators.js'
import { SpecialtyCategoryEditorialInput } from '../../presentation/components/SpecialtyCategoryEditorialInput.jsx'
import { advancedSectionHidden } from '../../governance/studioAdmin.js'

/** Categoría principal del bloque Especialidades (tab / sección Home). */
export const specialtyCategory = {
  name: 'specialtyCategory',
  title: 'Categoría',
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
      name: 'slug',
      title: 'Identificador URL',
      type: 'slug',
      fieldset: 'hero',
      options: { source: 'title', maxLength: 96 },
      hidden: advancedSectionHidden,
    },
    {
      name: 'description',
      title: 'Descripción',
      type: 'text',
      fieldset: 'content',
      rows: 5,
    },
    {
      name: 'heroImage',
      title: 'Imagen principal',
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
      name: 'gallery',
      title: 'Galería',
      type: 'array',
      fieldset: 'gallery',
      of: [{ type: 'specialtyGalleryItem' }],
      options: { layout: 'grid', sortable: true },
      validation: specialtyCategoryGalleryWarning,
      description: EDITORIAL_COPY.specialties.categoryGalleryHint,
    },
    {
      name: 'features',
      title: 'Características',
      type: 'array',
      fieldset: 'features',
      of: [{ type: 'specialtyFeature' }],
      options: { sortable: true },
      description: EDITORIAL_COPY.specialties.featuresHint,
    },
    {
      name: 'cta',
      title: 'CTA principal',
      type: 'specialtyCta',
      fieldset: 'cta',
    },
    {
      name: 'brands',
      title: 'Marcas',
      type: 'array',
      fieldset: 'brands',
      of: [{ type: 'specialtyBrand' }],
      options: { sortable: true },
      validation: specialtyBrandsArrayRules,
      description: EDITORIAL_COPY.specialties.brandsHint,
    },
    {
      name: 'layoutConfig',
      title: 'Configuración de layout',
      type: 'specialtyLayoutConfig',
      fieldset: 'advanced',
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'heroImage',
      brandCount: 'brands',
      enabled: 'enabled',
      featured: 'featured',
    },
    prepare({ title, subtitle, media, brandCount, enabled, featured }) {
      const brands = Array.isArray(brandCount) ? brandCount.length : 0
      const parts = [subtitle || (brands ? `${brands} marca${brands === 1 ? '' : 's'}` : 'Sin marcas')]
      if (enabled === false) parts.push('Oculta')
      if (featured) parts.push('Destacada')
      return {
        title: title || 'Nueva categoría',
        subtitle: parts.join(' · '),
        media,
      }
    },
  },
}

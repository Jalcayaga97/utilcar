import { SPECIALTY_BRAND_FIELDSETS, EDITORIAL_COPY } from '../../presentation/editorial.js'
import {
  specialtyBrandFeaturesWarning,
  specialtyBrandGalleryWarning,
} from '../../governance/specialtiesValidators.js'
import { SpecialtyBrandEditorialInput } from '../../presentation/components/SpecialtyBrandEditorialInput.jsx'

/** Marca asociada a una categoría (tabs Toyota, Peugeot, etc.). */
export const specialtyBrand = {
  name: 'specialtyBrand',
  title: 'Marca',
  type: 'object',
  fieldsets: SPECIALTY_BRAND_FIELDSETS,
  components: {
    input: SpecialtyBrandEditorialInput,
  },
  fields: [
    {
      name: 'brandRef',
      title: 'Marca global (referencia)',
      type: 'reference',
      to: [{ type: 'brand' }],
      fieldset: 'identity',
      description: 'Opcional. Reutiliza logo y nombre del catálogo de Marcas.',
    },
    {
      name: 'title',
      title: 'Nombre visible',
      type: 'string',
      fieldset: 'identity',
      description: 'Override si no hay referencia o para personalizar el tab.',
    },
    {
      name: 'subtitle',
      title: 'Subtítulo',
      type: 'string',
      fieldset: 'identity',
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      description: 'Override del logo de la marca referenciada.',
    },
    {
      name: 'heroImage',
      title: 'Imagen principal',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
    },
    {
      name: 'galleries',
      title: 'Galería',
      type: 'array',
      fieldset: 'gallery',
      of: [{ type: 'specialtyGalleryItem' }],
      options: { layout: 'grid', sortable: true },
      validation: specialtyBrandGalleryWarning,
      description: EDITORIAL_COPY.specialties.brandGalleryHint,
    },
    {
      name: 'features',
      title: 'Características',
      type: 'array',
      fieldset: 'features',
      of: [{ type: 'specialtyFeature' }],
      options: { sortable: true },
      validation: specialtyBrandFeaturesWarning,
    },
    {
      name: 'cta',
      title: 'CTA',
      type: 'specialtyCta',
      fieldset: 'cta',
    },
    {
      name: 'featured',
      title: 'Destacada en tabs',
      type: 'boolean',
      fieldset: 'options',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'logo',
      hero: 'heroImage',
      brandName: 'brandRef.name',
      featured: 'featured',
      galleryCount: 'galleries',
    },
    prepare({ title, subtitle, media, hero, brandName, featured, galleryCount }) {
      const n = Array.isArray(galleryCount) ? galleryCount.length : 0
      const parts = [subtitle || `${n} foto${n === 1 ? '' : 's'}`]
      if (featured) parts.push('destacada')
      return {
        title: title || brandName || 'Marca',
        subtitle: parts.join(' · '),
        media: media || hero,
      }
    },
  },
}

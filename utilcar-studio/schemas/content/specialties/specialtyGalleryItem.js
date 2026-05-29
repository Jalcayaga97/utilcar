import { specialtyGalleryItemAltWarning } from '../../governance/specialtiesValidators.js'

/** Ítem de galería del dominio specialties. */
export const specialtyGalleryItem = {
  name: 'specialtyGalleryItem',
  title: 'Imagen de galería',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value?.asset?._ref && !value?.asset?._id) {
            return 'Imagen requerida para publicar en galería.'
          }
          return true
        }).warning(),
    },
    {
      name: 'alt',
      title: 'Texto alternativo (alt)',
      type: 'string',
      validation: specialtyGalleryItemAltWarning,
    },
    {
      name: 'role',
      title: 'Rol',
      type: 'string',
      options: {
        list: [
          { title: 'Hero', value: 'hero' },
          { title: 'Galería', value: 'gallery' },
          { title: 'Miniatura', value: 'thumbnail' },
          { title: 'Antes / después', value: 'beforeAfter' },
        ],
        layout: 'radio',
      },
      initialValue: 'gallery',
    },
    {
      name: 'caption',
      title: 'Pie de foto',
      type: 'string',
    },
    {
      name: 'featured',
      title: 'Destacada',
      type: 'boolean',
      initialValue: false,
    },
  ],
  preview: {
    select: { caption: 'caption', alt: 'alt', media: 'image', role: 'role', featured: 'featured' },
    prepare({ caption, alt, media, role, featured }) {
      const label = caption || alt || 'Imagen'
      const parts = [role || 'gallery']
      if (featured) parts.push('destacada')
      return { title: label, subtitle: parts.join(' · '), media }
    },
  },
}

export const showcaseCarouselBlockItem = {
  name: 'showcaseCarouselBlockItem',
  title: 'Imagen destacada',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required().error('Imagen requerida'),
    },
    {
      name: 'alt',
      title: 'Texto alternativo (alt)',
      type: 'string',
      validation: (Rule) => Rule.required().error('Alt obligatorio para accesibilidad y SEO'),
    },
    { name: 'title', title: 'Título (opcional)', type: 'string' },
    { name: 'caption', title: 'Pie de foto (opcional)', type: 'string' },
  ],
  preview: {
    select: { title: 'title', caption: 'caption', alt: 'alt', media: 'image' },
    prepare({ title, caption, alt, media }) {
      return {
        title: title || caption || alt || 'Imagen',
        subtitle: alt ? `alt: ${alt.slice(0, 48)}` : 'Sin alt',
        media,
      }
    },
  },
}

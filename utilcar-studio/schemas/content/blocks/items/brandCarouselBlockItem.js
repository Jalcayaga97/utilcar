export const brandCarouselBlockItem = {
  name: 'brandCarouselBlockItem',
  title: 'Marca',
  type: 'object',
  fields: [
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required().error('Logo requerido'),
    },
    {
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (Rule) => Rule.required().error('Nombre requerido'),
    },
    {
      name: 'website',
      title: 'Sitio web (opcional)',
      type: 'url',
    },
    {
      name: 'active',
      title: 'Activa',
      type: 'boolean',
      initialValue: true,
      description: 'Desmarque para ocultar la marca sin eliminarla.',
    },
  ],
  preview: {
    select: { title: 'name', media: 'logo', active: 'active' },
    prepare({ title, media, active }) {
      return {
        title: title || 'Marca',
        subtitle: active === false ? 'Oculta' : 'Visible',
        media,
      }
    },
  },
}

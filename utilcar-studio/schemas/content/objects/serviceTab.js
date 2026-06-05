/** Tab editorial — marcas (Ventanas) o categorías (Banquetas, Accesorios). */
export const serviceTab = {
  name: 'serviceTab',
  title: 'Pestaña',
  type: 'object',
  fields: [
    { name: 'id', title: 'ID', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'name', title: 'Nombre', type: 'string', validation: (Rule) => Rule.required() },
    {
      name: 'description',
      title: 'Descripción breve',
      type: 'text',
      rows: 2,
      description: 'Resumen visible bajo el nombre de la pestaña.',
    },
    {
      name: 'models',
      title: 'Modelos',
      type: 'array',
      of: [{ type: 'string' }],
    },
    { name: 'subtitle', title: 'Subtítulo', type: 'string' },
    {
      name: 'intro',
      title: 'Intro',
      type: 'array',
      of: [{ type: 'text', rows: 3 }],
    },
    {
      name: 'sections',
      title: 'Bloques de especificaciones',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'specGroup',
          fields: [
            { name: 'title', title: 'Título', type: 'string' },
            {
              name: 'items',
              title: 'Ítems',
              type: 'array',
              of: [{ type: 'string' }],
            },
          ],
          preview: {
            select: { title: 'title', items: 'items' },
            prepare({ title, items }) {
              return { title: title || 'Grupo', subtitle: `${items?.length ?? 0} ítems` }
            },
          },
        },
      ],
    },
    {
      name: 'gallery',
      title: 'Galería',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Imagen',
              type: 'image',
              options: { hotspot: true },
            },
            { name: 'alt', title: 'Alt', type: 'string' },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
          preview: {
            select: { title: 'caption', media: 'image' },
          },
        },
      ],
    },
    {
      name: 'extra',
      title: 'Bloque extra (opcional)',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'Título' },
        { name: 'lead', type: 'text', title: 'Lead', rows: 3 },
        {
          name: 'brands',
          title: 'Marcas (lista)',
          type: 'array',
          of: [{ type: 'string' }],
        },
        { name: 'closing', type: 'text', title: 'Cierre', rows: 2 },
      ],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'id', media: 'gallery.0.image' },
    prepare({ title, subtitle }) {
      return { title: title || 'Pestaña', subtitle }
    },
  },
}

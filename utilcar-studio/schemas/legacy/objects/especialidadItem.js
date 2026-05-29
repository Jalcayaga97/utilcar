/** Legacy — solo lectura; oculto al editor. */
export const especialidadItem = {
  name: 'especialidadItem',
  title: 'Especialidad legacy',
  type: 'object',
  fields: [
    { name: 'id', title: 'ID', type: 'string', hidden: true, readOnly: true },
    { name: 'title', title: 'Título', type: 'string', readOnly: true },
    { name: 'subtitle', title: 'Subtítulo', type: 'string', readOnly: true },
    { name: 'intro', title: 'Introducción', type: 'text', readOnly: true },
    {
      name: 'specGroups',
      title: 'Especificaciones',
      type: 'array',
      readOnly: true,
      hidden: true,
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'items', type: 'array', of: [{ type: 'string' }] },
          ],
        },
      ],
    },
    {
      name: 'cta',
      title: 'Botón',
      type: 'object',
      readOnly: true,
      fields: [
        { name: 'label', title: 'Texto', type: 'string' },
        { name: 'path', title: 'Enlace', type: 'string' },
      ],
    },
    { name: 'imageAlt', title: 'Descripción de imagen', type: 'string', readOnly: true },
  ],
  preview: {
    select: { title: 'title', subtitle: 'subtitle' },
    prepare({ title, subtitle }) {
      return { title: title || 'Especialidad legacy', subtitle }
    },
  },
}

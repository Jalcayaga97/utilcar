/** Grupo de características / especificaciones — reemplaza specGroups legacy. */
export const specialtyFeature = {
  name: 'specialtyFeature',
  title: 'Grupo de características',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Título del grupo',
      type: 'string',
      description: 'Ej. Especificaciones, Compatibilidad, Opciones de equipamiento.',
    },
    {
      name: 'items',
      title: 'Ítems',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    },
    {
      name: 'kind',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          { title: 'Especificación técnica', value: 'spec' },
          { title: 'Beneficio', value: 'benefit' },
          { title: 'Cumplimiento normativo', value: 'compliance' },
        ],
        layout: 'radio',
      },
      initialValue: 'spec',
      hidden: true,
    },
  ],
  preview: {
    select: { title: 'title', items: 'items' },
    prepare({ title, items }) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: title || 'Grupo de características',
        subtitle: count ? `${count} ítem${count === 1 ? '' : 's'}` : 'Sin ítems',
      }
    },
  },
}

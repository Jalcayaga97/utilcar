export const featuredProjectRef = {
  name: 'featuredProjectRef',
  title: 'Proyecto destacado',
  type: 'object',
  fields: [
    {
      name: 'project',
      title: 'Proyecto',
      type: 'reference',
      to: [{ type: 'workProject' }],
      description: 'Proyecto desde Trabajos realizados (workProject). Preferido.',
    },
    {
      name: 'projectId',
      title: 'ID del proyecto (legacy)',
      type: 'string',
      description:
        'Respaldo textual. Debe coincidir con workProject.projectId (ej. TM-001). La referencia _ref es la fuente principal.',
    },
  ],
  validation: (Rule) =>
    Rule.custom((value) => {
      if (value?.project?._ref) return true
      if (String(value?.projectId ?? '').trim()) return true
      return 'Seleccione un proyecto o indique un ID legacy'
    }),
  preview: {
    select: { title: 'project.title', projectId: 'projectId', category: 'project.serviceCategory' },
    prepare({ title, projectId, category }) {
      return {
        title: title || (projectId ? `Proyecto ${projectId}` : 'Sin proyecto'),
        subtitle: category || '',
      }
    },
  },
}

export const link = {
  name: 'navLink',
  title: 'Enlace',
  type: 'object',
  fields: [
    { name: 'label', title: 'Etiqueta', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'path', title: 'Ruta', type: 'string', validation: (Rule) => Rule.required() },
  ],
}

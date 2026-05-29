import { advancedSectionHidden } from '../../governance/studioAdmin.js'

/** Configuración de layout futuro — visible solo admin. */
export const specialtyLayoutConfig = {
  name: 'specialtyLayoutConfig',
  title: 'Layout',
  type: 'object',
  fields: [
    {
      name: 'variant',
      title: 'Variante',
      type: 'string',
      options: {
        list: [
          { title: 'Alternado', value: 'alternating' },
          { title: 'Tabs por marca', value: 'tabs' },
          { title: 'Apilado', value: 'stacked' },
          { title: 'Grilla de marcas', value: 'brandGrid' },
        ],
      },
      initialValue: 'alternating',
    },
    {
      name: 'showBrandTabs',
      title: 'Mostrar tabs por marca',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'imagePosition',
      title: 'Posición de imagen',
      type: 'string',
      options: {
        list: [
          { title: 'Alternar izq/der', value: 'alternate' },
          { title: 'Izquierda', value: 'left' },
          { title: 'Derecha', value: 'right' },
          { title: 'Fondo', value: 'background' },
        ],
      },
      initialValue: 'alternate',
    },
    {
      name: 'columns',
      title: 'Columnas galería',
      type: 'number',
      initialValue: 3,
      validation: (Rule) => Rule.min(2).max(4),
    },
    {
      name: 'dense',
      title: 'Modo compacto',
      type: 'boolean',
      initialValue: false,
    },
  ],
  options: {
    collapsible: true,
    collapsed: true,
  },
  hidden: advancedSectionHidden,
}

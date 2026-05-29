import { specialtyCtaWarning } from '../../governance/specialtiesValidators.js'

/** CTA del dominio specialties — alineado con editorialCta / contrato frontend. */
export const specialtyCta = {
  name: 'specialtyCta',
  title: 'Botón / enlace',
  type: 'object',
  fields: [
    {
      name: 'label',
      title: 'Texto del botón',
      type: 'string',
      description: 'Texto visible del enlace o botón.',
    },
    {
      name: 'to',
      title: 'Ruta (path)',
      type: 'string',
      description: 'Ruta interna. Ejemplo: /ventanas-lunetas',
    },
    {
      name: 'ariaLabel',
      title: 'Etiqueta accesibilidad',
      type: 'string',
    },
    {
      name: 'styleVariant',
      title: 'Estilo visual',
      type: 'string',
      options: {
        list: [
          { title: 'Primario', value: 'primary' },
          { title: 'Secundario', value: 'secondary' },
          { title: 'Outline', value: 'outline' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    },
  ],
  validation: (Rule) => specialtyCtaWarning(Rule),
  preview: {
    select: { label: 'label', to: 'to', styleVariant: 'styleVariant' },
    prepare({ label, to, styleVariant }) {
      const parts = [label || 'Sin texto', to ? `→ ${to}` : 'Sin ruta']
      if (styleVariant && styleVariant !== 'primary') parts.push(`(${styleVariant})`)
      return { title: parts.join(' · ') }
    },
  },
}

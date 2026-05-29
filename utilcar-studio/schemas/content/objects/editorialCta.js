import { heroPrimaryCtaWarning, heroSecondaryCtaWarning } from '../../presentation/editorialValidators.js'

/** CTA editorial — compatible con contrato frontend (label, to, ariaLabel). */
export const editorialCta = {
  name: 'editorialCta',
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
      description: 'Ruta interna del sitio. Ejemplo: /contacto',
    },
    {
      name: 'ariaLabel',
      title: 'Etiqueta accesibilidad',
      type: 'string',
      description: 'Opcional. Describe la acción para lectores de pantalla.',
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
      description: 'Reservado para futuras variantes visuales en el sitio.',
    },
  ],
  preview: {
    select: { label: 'label', to: 'to', styleVariant: 'styleVariant' },
    prepare({ label, to, styleVariant }) {
      const parts = [label || 'Sin texto', to ? `→ ${to}` : 'Sin ruta']
      if (styleVariant && styleVariant !== 'primary') parts.push(`(${styleVariant})`)
      return { title: parts.join(' · ') }
    },
  },
}

/** Validación warning reutilizable según rol del CTA. */
export function editorialCtaValidation(Rule, { role = 'primary' } = {}) {
  return role === 'secondary' ? heroSecondaryCtaWarning(Rule) : heroPrimaryCtaWarning(Rule)
}

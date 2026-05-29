import { HERO_FIELDSETS, EDITORIAL_COPY } from '../../presentation/editorial.js'
import { HeroBlockEditorialInput } from '../../presentation/components/HeroBlockEditorialInput.jsx'
import {
  heroImageWarning,
  heroPrimaryCtaWarning,
  heroSecondaryCtaWarning,
  heroTitleLengthWarning,
} from '../../presentation/editorialValidators.js'

export const heroBlock = {
  name: 'heroBlock',
  title: 'Portada (Hero)',
  type: 'object',
  fieldsets: HERO_FIELDSETS,
  components: {
    input: HeroBlockEditorialInput,
  },
  fields: [
    {
      name: 'enabled',
      title: 'Visible en el sitio',
      type: 'boolean',
      fieldset: 'advanced',
      initialValue: true,
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number',
      fieldset: 'advanced',
      hidden: true,
      initialValue: 0,
    },
    {
      name: 'title',
      title: 'Título principal',
      type: 'string',
      fieldset: 'content',
      validation: (Rule) => [Rule.required(), heroTitleLengthWarning(Rule)],
      description: 'Titular H1 del Home. Sé directo y orientado a conversión.',
    },
    {
      name: 'subtitle',
      title: 'Subtítulo',
      type: 'text',
      fieldset: 'content',
      rows: 3,
      description: 'Complementa el titular con el alcance de servicios o propuesta.',
    },
    {
      name: 'highlights',
      title: 'Destacados',
      type: 'array',
      fieldset: 'content',
      of: [{ type: 'string' }],
      options: { layout: 'tags', sortable: true },
      description: EDITORIAL_COPY.hero.highlightsHint,
    },
    {
      name: 'primaryCta',
      title: 'CTA primario',
      type: 'editorialCta',
      fieldset: 'ctas',
      validation: heroPrimaryCtaWarning,
      description: 'Botón principal junto a WhatsApp. Ej: Solicitar cotización → /contacto',
    },
    {
      name: 'secondaryLink',
      title: 'CTA secundario (texto)',
      type: 'editorialCta',
      fieldset: 'ctas',
      validation: heroSecondaryCtaWarning,
      description: 'Enlace textual bajo los botones. Ej: Ver trabajos realizados → /trabajos-realizados',
    },
    {
      name: 'image',
      title: 'Imagen hero',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      validation: heroImageWarning,
      description: 'Imagen principal de la portada. Recomendado 16:10 o similar.',
    },
    {
      name: 'mobileImage',
      title: 'Imagen mobile (opcional)',
      type: 'image',
      fieldset: 'media',
      options: { hotspot: true },
      description: 'Override para pantallas pequeñas. Si vacío, usa imagen hero.',
    },
    {
      name: 'imageAlt',
      title: 'Texto alternativo (alt)',
      type: 'string',
      fieldset: 'media',
      description: EDITORIAL_COPY.hero.imageAltHint,
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'image',
      enabled: 'enabled',
      primaryLabel: 'primaryCta.label',
    },
    prepare({ title, subtitle, media, enabled, primaryLabel }) {
      const parts = []
      if (subtitle) parts.push(String(subtitle).slice(0, 48))
      if (primaryLabel) parts.push(`CTA: ${primaryLabel}`)
      if (enabled === false) parts.push('Oculto')
      return {
        title: title || 'Portada (Hero)',
        subtitle: parts.join(' · ') || 'Visible',
        media,
      }
    },
  },
}

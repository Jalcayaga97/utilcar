/**
 * Contrato canónico Home — debe coincidir con HomeContentSchema (Zod).
 * Source of truth estructural para /content y Sanity.
 * Sanity Studio: campo `schemaVersion` (ver SCHEMA_VERSION en validate.js).
 */
export const HomeContentContract = {
  hero: {
    title: '',
    subtitle: '',
    highlights: [],
    secondaryLink: { label: '', to: '', ariaLabel: '' },
    imageAlt: '',
  },
  services: {
    eyebrow: '',
    title: '',
    description: '',
    cardLinkLabel: '',
  },
  especialidades: {
    eyebrow: '',
    title: '',
    description: '',
    itemEyebrowPrefix: '',
  },
  highlights: {
    eyebrow: '',
    title: '',
  },
  portfolioPreview: {
    eyebrow: '',
    title: '',
    description: '',
    ctaLabel: '',
    ctaTo: '',
    previewCount: 1,
  },
  ctaBanner: {
    title: '',
    description: '',
    primaryLabel: '',
    primaryTo: '',
  },
}

export const EspecialidadContract = {
  id: '',
  title: '',
  subtitle: '',
  intro: '',
  specGroups: [{ title: '', items: [] }],
  cta: { label: '', path: '' },
  image: null,
  imageAlt: '',
}

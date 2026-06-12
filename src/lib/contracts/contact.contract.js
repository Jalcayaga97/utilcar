/**
 * Contrato canónico Contacto — debe coincidir con ContactContentSchema (Zod).
 */
export const ContactContentContract = {
  hero: { eyebrow: '', title: '', subtitle: '', imageAlt: '' },
  intro: { formHint: '', paragraphs: [] },
  details: {
    title: '',
    description: '',
    cards: {
      phone: { enabled: true, title: '' },
      email: { enabled: true, title: '' },
      address: { enabled: true, title: '' },
      hours: { enabled: true, title: '' },
    },
  },
  cta: { title: '', description: '', primaryLabel: '', primaryTo: '' },
  map: { eyebrow: '', title: '', iframeTitle: '' },
  faq: { eyebrow: '', title: '', description: '' },
  form: {
    heading: '',
    fields: {},
    submit: { idle: '', loading: '' },
    success: { title: '', message: '', resetLabel: '' },
    error: '',
  },
  servicios: [],
  faqItems: [],
}

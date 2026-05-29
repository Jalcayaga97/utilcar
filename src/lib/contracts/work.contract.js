/**
 * Contrato canónico Trabajos — debe coincidir con WorkContentSchema (Zod).
 */
export const WorkContentContract = {
  page: {
    hero: { eyebrow: '', title: '', subtitle: '', imageAlt: '' },
    intro: { eyebrow: '', title: '', paragraphs: [] },
    projects: { eyebrow: '', title: '', description: '' },
    cta: { title: '', description: '' },
  },
  filters: [],
  portfolio: [],
  preview: [],
  ui: {
    emptyMessage: '',
    loadMoreLabel: '',
    pageSize: 12,
    filterAriaLabel: '',
  },
}

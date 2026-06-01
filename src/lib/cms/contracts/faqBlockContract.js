function sanitizeString(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export function faqItemContract(raw = {}, context = {}) {
  const index = context.index ?? 0
  return {
    id: sanitizeString(raw.id) || `faq-${index + 1}`,
    question: sanitizeString(raw.question),
    answer: sanitizeString(raw.answer),
  }
}

export function faqSectionContract(raw = {}) {
  return {
    enabled: raw.enabled !== false,
    eyebrow: sanitizeString(raw.eyebrow),
    title: sanitizeString(raw.title),
    description: sanitizeString(raw.description),
    items: (raw.items ?? []).map((item, index) => faqItemContract(item, { index })),
    warnings: [],
    source: 'cms',
  }
}

export function normalizeFaqBlock(raw) {
  return faqSectionContract(raw)
}

export function validateFaqSection(section) {
  const warnings = []
  if (!section.title && !section.items?.length) {
    warnings.push('faq-empty')
  }
  for (const item of section.items ?? []) {
    if (!item.question) warnings.push(`faq-item-missing-question:${item.id}`)
  }
  return { valid: warnings.length === 0 || section.items.length > 0, warnings }
}

export function mapFaqBlockToContract(raw) {
  const section = normalizeFaqBlock(raw)
  const { valid, warnings } = validateFaqSection(section)
  section.warnings = warnings
  return { section: valid ? section : section.items.length ? section : null, warnings, validItems: section.items }
}

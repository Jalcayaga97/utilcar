function sanitizeString(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export function featureGroupContract(raw = {}, context = {}) {
  const index = context.index ?? 0
  return {
    id: sanitizeString(raw._key) || `group-${index + 1}`,
    title: sanitizeString(raw.title) || 'Características',
    items: (raw.items ?? []).map((item) => sanitizeString(item)).filter(Boolean),
  }
}

export function featuresSectionContract(raw = {}) {
  return {
    enabled: raw.enabled !== false,
    eyebrow: sanitizeString(raw.eyebrow),
    title: sanitizeString(raw.title),
    description: sanitizeString(raw.description),
    groups: (raw.groups ?? []).map((g, index) => featureGroupContract(g, { index })),
    warnings: [],
    source: 'cms',
  }
}

export function normalizeFeaturesBlock(raw) {
  return featuresSectionContract(raw)
}

export function validateFeaturesSection(section) {
  const warnings = []
  if (!section.groups?.length) warnings.push('features-no-groups')
  return { valid: section.groups?.length > 0, warnings }
}

export function mapFeaturesBlockToContract(raw) {
  const section = normalizeFeaturesBlock(raw)
  const { valid, warnings } = validateFeaturesSection(section)
  section.warnings = warnings
  return { section: valid ? section : null, warnings, validGroups: section.groups }
}

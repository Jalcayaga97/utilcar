export function featureGridSectionContract(block) {
  if (!block) return null
  return {
    eyebrow: block.eyebrow ?? '',
    title: block.title ?? '',
    description: block.description ?? '',
    items: Array.isArray(block.items) ? block.items : [],
  }
}

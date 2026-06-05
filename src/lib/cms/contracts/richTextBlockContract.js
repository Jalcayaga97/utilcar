function blockToPlainText(block) {
  if (!block) return ''
  if (block._type !== 'block' || !Array.isArray(block.children)) return ''
  return block.children.map((child) => child?.text ?? '').join('')
}

/** Portable Text (Sanity) → párrafos planos para el frontend actual. */
export function portableTextToParagraphs(body = []) {
  if (!Array.isArray(body)) return []
  return body
    .map((block) => blockToPlainText(block).trim())
    .filter(Boolean)
}

export function richTextSectionContract(raw = {}) {
  return {
    enabled: raw.enabled !== false,
    eyebrow: raw.eyebrow ?? '',
    title: raw.title ?? '',
    paragraphs: portableTextToParagraphs(raw.body),
    source: 'cms',
  }
}

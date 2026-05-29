const PORTFOLIO_TYPES = new Set(['portfolioBlock', 'galleryBlock'])

export function normalizeBlock(block) {
  if (!block?._type) return block
  if (block._type === 'galleryBlock') {
    return { ...block, _type: 'portfolioBlock' }
  }
  return block
}

export function orderedBlocks(blocks) {
  return [...(blocks ?? [])]
    .map(normalizeBlock)
    .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
}

export function findBlock(blocks, type) {
  return orderedBlocks(blocks).find((b) => b?._type === type && b?.enabled !== false)
}

export function findPortfolioBlock(blocks) {
  return orderedBlocks(blocks).find(
    (b) => PORTFOLIO_TYPES.has(b?._type) && b?.enabled !== false,
  )
}

export function isEmptyField(value) {
  return (
    value == null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

export function missingBlockWarning(blockType) {
  return {
    block: blockType,
    field: '_type',
    message: `Bloque ${blockType} no presente en blocks[]`,
  }
}

export function missingFieldWarning(blockType, field) {
  return {
    block: blockType,
    field,
    message: `Campo faltante o vacío en bloque ${blockType}.${field}`,
  }
}

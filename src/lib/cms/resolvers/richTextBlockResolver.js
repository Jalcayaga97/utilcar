import { findBlock } from './blockUtils'
import { richTextSectionContract } from '@/lib/cms/contracts/richTextBlockContract'
import { logServiceRichTextAudit } from '@/lib/cms/servicePageAuditLog'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'richTextBlock'

export function findRichTextBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

export function buildRichTextSection(block) {
  if (!block) return null
  const section = richTextSectionContract(block)
  const hasEyebrow = Boolean(String(section.eyebrow ?? '').trim())
  const hasTitle = Boolean(String(section.title ?? '').trim())
  const hasParagraphs = (section.paragraphs ?? []).some((p) => String(p).trim())
  if (!hasEyebrow && !hasTitle && !hasParagraphs) return null
  logServiceRichTextAudit({
    hasBody: Boolean(block?.body?.length),
    bodyBlocks: block?.body?.length ?? 0,
    paragraphsCount: section.paragraphs.length,
  })
  logResolverDomain('richText', { paragraphCount: section.paragraphs.length })
  return section
}

export function collectRichTextWarnings(blocks) {
  const block = findRichTextBlock(blocks)
  if (!block) return []
  if (!block.title && !block.body?.length) return [`${BLOCK_TYPE}:empty`]
  return []
}

export function getActiveRichTextSection(extensions) {
  const section = extensions?.richTextSection
  if (!section) return null
  const hasEyebrow = Boolean(String(section.eyebrow ?? '').trim())
  const hasTitle = Boolean(String(section.title ?? '').trim())
  const hasParagraphs = (section.paragraphs ?? []).some((p) => String(p).trim())
  if (!hasEyebrow && !hasTitle && !hasParagraphs) return null
  return section
}

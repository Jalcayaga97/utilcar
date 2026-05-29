import { Badge, Box, Flex, Text } from '@sanity/ui'

/** Badge compacto para previews editoriales (CTA, estado, rol). */
export function EditorialPreviewBadge({ label, tone = 'primary', icon }) {
  if (!label) return null
  return (
    <Badge tone={tone} fontSize={0} padding={2}>
      {icon ? `${icon} ` : ''}
      {label}
    </Badge>
  )
}

export function EditorialPreviewBadgeRow({ children }) {
  return (
    <Flex gap={2} wrap="wrap" marginTop={2}>
      {children}
    </Flex>
  )
}

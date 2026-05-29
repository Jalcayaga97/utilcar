import { Box, Flex, Text } from '@sanity/ui'
import { EditorialPreviewBadge, EditorialPreviewBadgeRow } from './EditorialPreviewBadge.jsx'

/** Preview compacto de CTA editorial. */
export function EditorialCtaEditor({ cta, hint, children }) {
  const label = String(cta?.label ?? '').trim()
  const path = String(cta?.to ?? cta?.path ?? '').trim()
  const hasCta = Boolean(label || path)

  return (
    <Box>
      {hasCta ? (
        <Box marginBottom={3} padding={3} radius={2} border>
          <Text size={0} weight="semibold" muted>
            Vista previa CTA
          </Text>
          <EditorialPreviewBadgeRow>
            {label ? <EditorialPreviewBadge label={label} tone="primary" /> : null}
            {path ? <EditorialPreviewBadge label={path} tone="default" /> : null}
            {cta?.styleVariant && cta.styleVariant !== 'primary' ? (
              <EditorialPreviewBadge label={cta.styleVariant} tone="caution" />
            ) : null}
          </EditorialPreviewBadgeRow>
        </Box>
      ) : null}
      {hint ? (
        <Flex marginBottom={3}>
          <Text size={0} muted>
            {hint}
          </Text>
        </Flex>
      ) : null}
      {children}
    </Box>
  )
}

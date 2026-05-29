import { Box, Flex, Text } from '@sanity/ui'

/** Tarjeta compacta de imagen con placeholder editorial. */
export function EditorialImageCard({ title, subtitle, hasImage, badge, children }) {
  return (
    <Box padding={3} radius={2} border marginBottom={3}>
      <Flex align="flex-start" gap={3}>
        <Box
          style={{
            width: 72,
            height: 52,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
            background: hasImage
              ? 'var(--card-badge-primary-bg-color, #e8f0fe)'
              : 'var(--card-muted-bg-color, #eee)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--card-border-color, #e4e5e9)',
          }}
        >
          <Text size={0} muted>
            {hasImage ? 'IMG' : 'Sin img'}
          </Text>
        </Box>
        <Box flex={1} style={{ minWidth: 0 }}>
          <Text weight="semibold" size={1}>
            {title || 'Sin título'}
          </Text>
          {subtitle ? (
            <Text size={0} muted>
              {subtitle}
            </Text>
          ) : null}
          {badge ? (
            <Box marginTop={2}>
              <Text size={0}>{badge}</Text>
            </Box>
          ) : null}
        </Box>
      </Flex>
      {children ? <Box marginTop={3}>{children}</Box> : null}
    </Box>
  )
}

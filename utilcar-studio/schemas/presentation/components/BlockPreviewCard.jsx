import { Badge, Box, Flex, Text } from '@sanity/ui'

export function BlockPreviewCard({
  title,
  subtitle,
  badge,
  featured,
  hasImage,
  children,
  compact = false,
}) {
  return (
    <Box
      marginBottom={compact ? 2 : 3}
      padding={3}
      radius={2}
      border
      style={{
        background: featured ? 'var(--card-badge-positive-bg-color, #f3faf4)' : undefined,
      }}
    >
      <Flex align="flex-start" gap={3} marginBottom={children ? 3 : 0}>
        <Box
          style={{
            width: 56,
            height: 40,
            borderRadius: 6,
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
            {hasImage ? 'IMG' : '—'}
          </Text>
        </Box>
        <Flex direction="column" gap={2} flex={1} style={{ minWidth: 0 }}>
          <Flex align="center" gap={2} wrap="wrap">
            <Text weight="semibold" size={1}>
              {title || 'Sin título'}
            </Text>
            {badge ? (
              <Badge tone="primary" fontSize={0}>
                {badge}
              </Badge>
            ) : (
              <Badge tone="caution" fontSize={0}>
                Sin categoría
              </Badge>
            )}
            {featured ? (
              <Badge tone="positive" fontSize={0}>
                Destacado
              </Badge>
            ) : null}
          </Flex>
          {subtitle ? (
            <Text size={0} muted>
              {subtitle.length > 72 ? `${subtitle.slice(0, 72)}…` : subtitle}
            </Text>
          ) : null}
        </Flex>
      </Flex>
      {children}
    </Box>
  )
}

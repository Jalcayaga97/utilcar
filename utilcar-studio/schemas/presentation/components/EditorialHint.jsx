import { Box, Flex, Text } from '@sanity/ui'

export function EditorialHint({ children, title = 'Tip editorial' }) {
  if (!children) return null

  return (
    <Box
      padding={3}
      radius={2}
      marginBottom={3}
      style={{
        background: 'var(--card-badge-caution-bg-color, #eef6ff)',
        border: '1px solid var(--card-focus-ring-color, #c8daf8)',
      }}
    >
      <Flex direction="column" gap={2}>
        <Text size={0} weight="semibold">
          {title}
        </Text>
        <Text size={1}>{children}</Text>
      </Flex>
    </Box>
  )
}

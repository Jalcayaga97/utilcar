import { Box, Flex, Text } from '@sanity/ui'

export function EditorialWarning({ children, title = 'Revisar' }) {
  if (!children) return null

  return (
    <Box
      padding={3}
      radius={2}
      marginBottom={3}
      tone="caution"
      border
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

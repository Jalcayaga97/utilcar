import { Box, Text } from '@sanity/ui'

export function EditorialSectionHeader({ title, description, eyebrow }) {
  return (
    <Box
      padding={3}
      radius={2}
      marginBottom={3}
      style={{
        background: 'var(--card-muted-bg-color, #f6f6f8)',
        border: '1px solid var(--card-border-color, #e4e5e9)',
      }}
    >
      {eyebrow ? (
        <Text size={0} weight="semibold" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {eyebrow}
        </Text>
      ) : null}
      <Text size={2} weight="semibold">
        {title}
      </Text>
      {description ? (
        <Box marginTop={2}>
          <Text size={1} muted>
            {description}
          </Text>
        </Box>
      ) : null}
    </Box>
  )
}

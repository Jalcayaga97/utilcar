import { Badge, Card, Flex, Text } from '@sanity/ui'

const TONES = {
  positive: 'positive',
  caution: 'caution',
  critical: 'critical',
  transparent: 'transparent',
}

/** Banner editorial reutilizable en vistas del Page Builder. */
export function PageBuilderBanner({ title, description, tone = 'positive', badge }) {
  return (
    <Card padding={3} radius={2} tone={TONES[tone] ?? 'default'} border>
      <Flex align="flex-start" gap={3} direction="column">
        <Flex align="center" gap={2} wrap="wrap">
          {badge ? (
            <Badge fontSize={0} tone={tone === 'caution' ? 'caution' : 'positive'}>
              {badge}
            </Badge>
          ) : null}
          <Text size={1} weight="semibold">
            {title}
          </Text>
        </Flex>
        {description ? (
          <Text muted size={1}>
            {description}
          </Text>
        ) : null}
      </Flex>
    </Card>
  )
}

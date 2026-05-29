import { Stack, Text } from '@sanity/ui'
import { EditorialHint } from './EditorialHint.jsx'
import { EditorialSectionHeader } from './EditorialSectionHeader.jsx'
import { EDITORIAL_COPY } from '../editorial.js'

export function PortfolioBlockEditorialInput(props) {
  const itemCount = Array.isArray(props.value?.items) ? props.value.items.length : 0

  return (
    <Stack space={3}>
      <EditorialSectionHeader
        eyebrow="Page Builder"
        title="Trabajos recientes (Portfolio)"
        description={EDITORIAL_COPY.portfolio.sectionDescription}
      />
      <EditorialHint title="Proyectos">
        {EDITORIAL_COPY.portfolio.itemsHint.replace('{count}', String(itemCount))}
      </EditorialHint>
      {props.renderDefault(props)}
      <Text size={0} muted>
        {EDITORIAL_COPY.portfolio.reorderHint}
      </Text>
    </Stack>
  )
}

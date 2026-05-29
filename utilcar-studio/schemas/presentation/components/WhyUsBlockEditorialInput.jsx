import { Stack } from '@sanity/ui'
import { EditorialSectionHeader } from './EditorialSectionHeader.jsx'
import { EDITORIAL_COPY } from '../editorial.js'

export function WhyUsBlockEditorialInput(props) {
  return (
    <Stack space={3}>
      <EditorialSectionHeader
        eyebrow="Page Builder"
        title="Por qué Utilcar"
        description={EDITORIAL_COPY.whyUs.sectionDescription}
      />
      {props.renderDefault(props)}
    </Stack>
  )
}

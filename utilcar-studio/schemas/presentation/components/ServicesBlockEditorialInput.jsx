import { Stack } from '@sanity/ui'
import { EditorialSectionHeader } from './EditorialSectionHeader.jsx'
import { EDITORIAL_COPY } from '../editorial.js'

export function ServicesBlockEditorialInput(props) {
  const count = props.value?.items?.length ?? 0

  return (
    <Stack space={3}>
      <EditorialSectionHeader
        eyebrow="Page Builder"
        title="Servicios"
        description={EDITORIAL_COPY.services.sectionDescription}
      />
      {count ? (
        <EditorialSectionHeader
          title={`${count} servicio${count === 1 ? '' : 's'}`}
          description={EDITORIAL_COPY.services.itemHint}
        />
      ) : null}
      {props.renderDefault(props)}
    </Stack>
  )
}

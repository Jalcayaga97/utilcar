import { Stack } from '@sanity/ui'
import { EditorialSectionHeader } from './EditorialSectionHeader.jsx'
import { EDITORIAL_HINTS } from '../editorial.js'

/** Header editorial del bloque specialties en Page Builder. */
export function SpecialtiesBlockEditorialInput(props) {
  return (
    <Stack space={3}>
      <EditorialSectionHeader
        eyebrow="Page Builder"
        title="Especialidades"
        description={[EDITORIAL_HINTS.specialtiesSection, EDITORIAL_HINTS.specialtiesOrder].join(' ')}
      />
      {props.renderDefault(props)}
    </Stack>
  )
}

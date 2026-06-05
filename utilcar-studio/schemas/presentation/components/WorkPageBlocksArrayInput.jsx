/** @deprecated workPage usa workPageBlocksField() — render default como serviceSubPage. */
import { Stack } from '@sanity/ui'
import { EditorialSectionHeader } from './EditorialSectionHeader.jsx'

export function WorkPageBlocksArrayInput(props) {
  return (
    <Stack space={3}>
      <EditorialSectionHeader
        eyebrow="Página Trabajos"
        title="Secciones editoriales"
        description="Mismo modelo que las páginas de servicio: cada bloque controla una sección visible en /trabajos-realizados."
      />
      {props.renderDefault(props)}
    </Stack>
  )
}

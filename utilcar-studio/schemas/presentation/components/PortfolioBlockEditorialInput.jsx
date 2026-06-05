import { Stack, Text } from '@sanity/ui'
import { useFormValue } from 'sanity'
import { EditorialHint } from './EditorialHint.jsx'
import { EditorialSectionHeader } from './EditorialSectionHeader.jsx'
import { EDITORIAL_COPY } from '../editorial.js'

function isMetadataOnlyPortfolio(docType) {
  return docType === 'workPage' || docType === 'serviceSubPage'
}

export function PortfolioBlockEditorialInput(props) {
  const docType = useFormValue(['_type'])
  const isMetadataOnly = isMetadataOnlyPortfolio(docType)
  const isHome = docType === 'homePage'
  const itemCount = Array.isArray(props.value?.items) ? props.value.items.length : 0
  const selectedCount = Array.isArray(props.value?.selectedProjects)
    ? props.value.selectedProjects.length
    : 0

  const sectionTitle = isMetadataOnly
    ? 'Projects (metadata)'
    : 'Trabajos recientes (Portfolio)'

  const sectionDescription = isMetadataOnly
    ? 'Solo eyebrow, título y descripción. Las tarjetas vienen del catálogo Proyectos (workProject).'
    : EDITORIAL_COPY.portfolio.sectionDescription

  return (
    <Stack space={3}>
      <EditorialSectionHeader
        eyebrow="Page Builder"
        title={sectionTitle}
        description={sectionDescription}
      />
      {isHome ? (
        <EditorialHint title="Selección editorial">
          Elija proyectos en «Proyectos para mostrar en Home» (orden = orden en el sitio). Si la lista
          está vacía, se usan automáticamente los marcados como Destacado o Mostrar en Home. Cantidad
          vista previa limita cuántos se muestran ({selectedCount} seleccionados).
        </EditorialHint>
      ) : null}
      {!isMetadataOnly && !isHome ? (
        <EditorialHint title="Proyectos">
          {EDITORIAL_COPY.portfolio.itemsHint.replace('{count}', String(itemCount))}
        </EditorialHint>
      ) : null}
      {isMetadataOnly ? (
        <EditorialHint title="Catálogo CMS">
          Edite los proyectos en Trabajos → Proyectos. Esta sección no almacena tarjetas.
        </EditorialHint>
      ) : null}
      {props.renderDefault(props)}
      {isHome ? (
        <Text size={0} muted>
          {EDITORIAL_COPY.portfolio.reorderHint}
        </Text>
      ) : null}
    </Stack>
  )
}

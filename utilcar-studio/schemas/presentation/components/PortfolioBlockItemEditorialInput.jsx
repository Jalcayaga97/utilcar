import { Stack } from '@sanity/ui'
import { BlockPreviewCard } from './BlockPreviewCard.jsx'
import { missingImageAsset } from '../editorialValidators.js'
import { PORTFOLIO_DESCRIPTION_MAX } from '../editorialValidators.js'
import { EditorialWarning } from './EditorialWarning.jsx'

export function PortfolioBlockItemEditorialInput(props) {
  const value = props.value ?? {}
  const missingCategory = !String(value.subtitle ?? '').trim()
  const missingImage = !missingImageAsset(value.image)
  const longDescription = String(value.description ?? '').trim().length > PORTFOLIO_DESCRIPTION_MAX

  return (
    <Stack space={2}>
      <BlockPreviewCard
        compact
        title={value.title}
        subtitle={value.description}
        badge={value.subtitle}
        featured={Boolean(value.featured)}
        hasImage={!missingImage}
      />
      {missingCategory ? (
        <EditorialWarning title="Categoría">Agrega una categoría en el subtítulo (ej. Talleres móviles).</EditorialWarning>
      ) : null}
      {missingImage ? (
        <EditorialWarning title="Imagen">Sube una imagen para la tarjeta del proyecto.</EditorialWarning>
      ) : null}
      {longDescription ? (
        <EditorialWarning title="Descripción larga">
          Acorta la descripción para mejor lectura en la grilla del Home.
        </EditorialWarning>
      ) : null}
      {props.renderDefault(props)}
    </Stack>
  )
}

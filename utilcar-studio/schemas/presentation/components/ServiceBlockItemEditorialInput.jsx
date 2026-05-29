import { BlockPreviewCard } from './BlockPreviewCard.jsx'
import { missingImageAsset } from '../editorialValidators.js'

/** Tarjeta compacta de servicio en el array items[]. */
export function ServiceBlockItemEditorialInput(props) {
  const value = props.value ?? {}

  return (
    <BlockPreviewCard
      title={value.title}
      subtitle={value.description}
      badge={value.icon || undefined}
      featured={value.featured}
      hasImage={missingImageAsset(value.image)}
    >
      {props.renderDefault(props)}
    </BlockPreviewCard>
  )
}

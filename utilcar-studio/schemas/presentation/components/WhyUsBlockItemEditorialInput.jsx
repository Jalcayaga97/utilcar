import { BlockPreviewCard } from './BlockPreviewCard.jsx'

/** Preview compacta tipo benefit card. */
export function WhyUsBlockItemEditorialInput(props) {
  const value = props.value ?? {}

  return (
    <BlockPreviewCard
      title={value.title}
      subtitle={value.description}
      badge={value.icon || 'benefit'}
      featured={value.featured}
      hasImage={false}
      compact
    >
      {props.renderDefault(props)}
    </BlockPreviewCard>
  )
}

import { Stack } from '@sanity/ui'
import { EditorialHint } from './EditorialHint.jsx'
import { EditorialSectionHeader } from './EditorialSectionHeader.jsx'
import { EditorialWarning } from './EditorialWarning.jsx'
import { EditorialPreviewBadge, EditorialPreviewBadgeRow } from './editorial/index.js'
import { EditorialImageCard } from './editorial/EditorialImageCard.jsx'
import { EDITORIAL_COPY } from '../editorial.js'
import { missingImageAsset } from '../editorialValidators.js'

export function HeroBlockEditorialInput(props) {
  const value = props.value ?? {}
  const missingImage = !missingImageAsset(value.image)
  const emptyPrimaryCta =
    !String(value.primaryCta?.label ?? '').trim() && !String(value.primaryCta?.to ?? '').trim()
  const longTitle = String(value.title ?? '').trim().length > 80

  return (
    <Stack space={3}>
      <EditorialSectionHeader
        eyebrow="Page Builder"
        title="Portada (Hero)"
        description={EDITORIAL_COPY.hero.sectionDescription}
      />
      <EditorialImageCard
        title={value.title || 'Hero'}
        subtitle={value.subtitle?.slice(0, 60)}
        hasImage={!missingImage}
        badge={value.primaryCta?.label ? `CTA: ${value.primaryCta.label}` : undefined}
      />
      <EditorialPreviewBadgeRow>
        {value.primaryCta?.label ? (
          <EditorialPreviewBadge label={value.primaryCta.label} tone="primary" />
        ) : null}
        {value.secondaryLink?.label ? (
          <EditorialPreviewBadge label={value.secondaryLink.label} tone="default" />
        ) : null}
        {value.highlights?.length ? (
          <EditorialPreviewBadge label={`${value.highlights.length} destacados`} tone="positive" />
        ) : null}
      </EditorialPreviewBadgeRow>
      <EditorialHint title="Guía rápida">{EDITORIAL_COPY.hero.contentHint}</EditorialHint>
      {missingImage ? (
        <EditorialWarning title="Imagen recomendada">
          {EDITORIAL_COPY.hero.missingImageWarning}
        </EditorialWarning>
      ) : null}
      {emptyPrimaryCta ? (
        <EditorialWarning title="CTA primario">{EDITORIAL_COPY.hero.emptyPrimaryCtaWarning}</EditorialWarning>
      ) : null}
      {longTitle ? (
        <EditorialWarning title="Título largo">
          El titular supera 80 caracteres. Considera acortarlo para mejor legibilidad en mobile.
        </EditorialWarning>
      ) : null}
      {props.renderDefault(props)}
    </Stack>
  )
}

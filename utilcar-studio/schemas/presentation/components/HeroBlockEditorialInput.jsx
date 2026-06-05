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
  const hasImage = missingImageAsset(value.image)
  const longTitle = String(value.title ?? '').trim().length > 80
  const textLink = value.textLinkLabel ?? value.secondaryLink?.label

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
        hasImage={hasImage}
        badge={textLink ? `Enlace: ${textLink}` : 'Botones: CTA global'}
      />
      <EditorialPreviewBadgeRow>
        <EditorialPreviewBadge label="CTA global (siteSettings)" tone="primary" />
        {textLink ? <EditorialPreviewBadge label={textLink} tone="default" /> : null}
        {value.highlights?.length ? (
          <EditorialPreviewBadge label={`${value.highlights.length} destacados`} tone="positive" />
        ) : null}
      </EditorialPreviewBadgeRow>
      <EditorialHint title="Guía rápida">{EDITORIAL_COPY.hero.contentHint}</EditorialHint>
      {!hasImage ? (
        <EditorialWarning title="Imagen requerida">
          {EDITORIAL_COPY.hero.missingImageWarning}
        </EditorialWarning>
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

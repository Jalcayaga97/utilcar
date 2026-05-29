import { Stack } from '@sanity/ui'
import { EditorialSectionHeader } from './EditorialSectionHeader.jsx'
import { EditorialWarning } from './EditorialWarning.jsx'
import { EditorialGalleryGrid, EditorialFeatureList, EditorialCtaEditor } from './editorial/index.js'
import { EDITORIAL_COPY } from '../editorial.js'
import { hasImageAsset } from '../../governance/specialtiesValidators.js'

export function SpecialtyCategoryEditorialInput(props) {
  const value = props.value ?? {}
  const missingHero = !hasImageAsset(value.heroImage)
  const emptyCta =
    !String(value.cta?.label ?? '').trim() && !String(value.cta?.to ?? '').trim()
  const brandCount = Array.isArray(value.brands) ? value.brands.length : 0

  return (
    <Stack space={3}>
      <EditorialSectionHeader
        eyebrow="Especialidad"
        title={value.title || 'Nueva categoría'}
        description={EDITORIAL_COPY.specialties.sectionDescription}
      />
      {missingHero ? (
        <EditorialWarning title="Imagen principal">
          Recomendado: sube heroImage para la vista alternada en Home.
        </EditorialWarning>
      ) : null}
      {emptyCta ? (
        <EditorialWarning title="CTA">Sin CTA: la categoría no tendrá botón de acción.</EditorialWarning>
      ) : null}
      {brandCount ? (
        <EditorialWarning title="Marcas">
          {brandCount} marca{brandCount === 1 ? '' : 's'} — el sitio mostrará tabs por marca cuando el frontend migre.
        </EditorialWarning>
      ) : null}
      {props.renderDefault({
        ...props,
        renderField: (fieldProps) => {
          if (fieldProps.name === 'gallery') {
            return (
              <EditorialGalleryGrid hint={EDITORIAL_COPY.specialties.categoryGalleryHint}>
                {fieldProps.renderDefault(fieldProps)}
              </EditorialGalleryGrid>
            )
          }
          if (fieldProps.name === 'features') {
            return (
              <EditorialFeatureList hint={EDITORIAL_COPY.specialties.featuresHint}>
                {fieldProps.renderDefault(fieldProps)}
              </EditorialFeatureList>
            )
          }
          if (fieldProps.name === 'cta') {
            return (
              <EditorialCtaEditor cta={value.cta} hint="CTA principal de la categoría.">
                {fieldProps.renderDefault(fieldProps)}
              </EditorialCtaEditor>
            )
          }
          return fieldProps.renderDefault(fieldProps)
        },
      })}
    </Stack>
  )
}

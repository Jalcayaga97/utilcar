import { Stack } from '@sanity/ui'
import { EditorialSectionHeader } from './EditorialSectionHeader.jsx'
import { EditorialWarning } from './EditorialWarning.jsx'
import { EditorialFeatureList, EditorialCtaEditor } from './editorial/index.js'
import { EDITORIAL_COPY } from '../editorial.js'
import { hasImageAsset } from '../../governance/specialtiesValidators.js'

/**
 * Sanity v3: renderField recibe FieldProps sin renderDefault; el input ya viene en children.
 */
function renderFieldContent(fieldProps) {
  return fieldProps.children ?? null
}

export function SpecialtyCategoryEditorialInput(props) {
  const value = props.value ?? {}
  const missingHero = !hasImageAsset(value.heroImage)
  const emptyCta =
    !String(value.cta?.label ?? '').trim() && !String(value.cta?.to ?? '').trim()

  return (
    <Stack space={3}>
      <EditorialSectionHeader
        eyebrow="Especialidad"
        title={value.title || 'Nueva especialidad'}
        description={EDITORIAL_COPY.specialties.categoryDescription}
      />
      {missingHero ? (
        <EditorialWarning title="Imagen">
          Subí la imagen principal: es lo que muestra el Home en esta sección.
        </EditorialWarning>
      ) : null}
      {emptyCta ? (
        <EditorialWarning title="CTA">
          Sin CTA: esta especialidad no tendrá botón de acción en el Home.
        </EditorialWarning>
      ) : null}
      {props.renderDefault({
        ...props,
        renderField: (fieldProps) => {
          const field = renderFieldContent(fieldProps)
          if (fieldProps.name === 'features') {
            return (
              <EditorialFeatureList hint={EDITORIAL_COPY.specialties.featuresHint}>
                {field}
              </EditorialFeatureList>
            )
          }
          if (fieldProps.name === 'cta') {
            return (
              <EditorialCtaEditor cta={value.cta} hint="Enlace o botón al pie de la sección en el Home.">
                {field}
              </EditorialCtaEditor>
            )
          }
          return field
        },
      })}
    </Stack>
  )
}

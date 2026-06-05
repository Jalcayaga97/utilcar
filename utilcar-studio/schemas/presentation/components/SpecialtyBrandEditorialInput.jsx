import { Stack } from '@sanity/ui'
import { EditorialSectionHeader } from './EditorialSectionHeader.jsx'
import { EditorialGalleryGrid, EditorialFeatureList, EditorialCtaEditor } from './editorial/index.js'
import { EDITORIAL_COPY } from '../editorial.js'

function renderFieldContent(fieldProps) {
  return fieldProps.children ?? null
}

export function SpecialtyBrandEditorialInput(props) {
  const value = props.value ?? {}

  return (
    <Stack space={3}>
      <EditorialSectionHeader
        eyebrow="Marca"
        title={value.title || 'Nueva marca'}
        description="Tab de marca dentro de la categoría. Galería, specs y CTA propios."
      />
      {props.renderDefault({
        ...props,
        renderField: (fieldProps) => {
          const field = renderFieldContent(fieldProps)
          if (fieldProps.name === 'galleries') {
            return (
              <EditorialGalleryGrid hint={EDITORIAL_COPY.specialties.brandGalleryHint}>
                {field}
              </EditorialGalleryGrid>
            )
          }
          if (fieldProps.name === 'features') {
            return (
              <EditorialFeatureList hint="Specs técnicas o compatibilidad por marca.">
                {field}
              </EditorialFeatureList>
            )
          }
          if (fieldProps.name === 'cta') {
            return (
              <EditorialCtaEditor cta={value.cta}>
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

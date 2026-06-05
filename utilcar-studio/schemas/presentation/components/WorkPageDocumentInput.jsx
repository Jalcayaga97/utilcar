/** @deprecated workPage usa workPageBlocksField() — render default como serviceSubPage. */
import { Stack, Text } from '@sanity/ui'

export function WorkPageDocumentInput(props) {
  return (
    <Stack space={4}>
      <Text size={1} muted>
        Edite Hero, Intro, Projects, CTA y SEO en las secciones siguientes. Las tarjetas de proyectos
        provienen de la colección Proyectos (workProject).
      </Text>
      {props.renderDefault(props)}
    </Stack>
  )
}

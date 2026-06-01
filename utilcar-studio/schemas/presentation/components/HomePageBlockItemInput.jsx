import { Badge, Box, Button, Card, Flex, Switch, Text } from '@sanity/ui'
import { PAGE_BUILDER_COPY } from '../pageBuilderCopy.js'
import { PatchEvent, set, insert } from 'sanity'
import { BLOCK_TYPE_LABELS } from '../../content/blocks/blockBase.js'

/** Tarjeta de bloque en el builder: tipo, visibilidad y editor en modal. */
export function HomePageBlockItemInput(props) {
  const blockType = props.value?._type
  const label = BLOCK_TYPE_LABELS[blockType] ?? blockType ?? 'Bloque'
  const enabled = props.value?.enabled !== false

  const toggleEnabled = (next) => {
    const path = props.path ?? []
    props.onChange(PatchEvent.from([set(next, [...path, 'enabled'])]))
  }

  const duplicateBlock = () => {
    if (!props.value) return
    const { _key, ...rest } = props.value
    props.onChange(PatchEvent.from([insert([rest], 'after', props.path)]))
  }

  return (
    <Card border marginBottom={3} radius={2} tone={enabled ? 'default' : 'transparent'}>
      <Box padding={3}>
        <Flex align="center" gap={3} marginBottom={3}>
          <Switch checked={enabled} onChange={(event) => toggleEnabled(event.currentTarget.checked)} />
          <Flex align="center" gap={2} flex={1}>
            <Text weight="semibold" size={1}>
              {label}
            </Text>
            <Badge tone={enabled ? 'positive' : 'caution'} fontSize={0}>
              {enabled ? 'Visible' : 'Oculto'}
            </Badge>
            <Badge tone="primary" fontSize={0}>
              {PAGE_BUILDER_COPY.syncedFromBlocks}
            </Badge>
          </Flex>
          <Button
            fontSize={1}
            mode="ghost"
            text={PAGE_BUILDER_COPY.duplicateBlock}
            onClick={duplicateBlock}
          />
        </Flex>
        {props.renderDefault(props)}
      </Box>
    </Card>
  )
}

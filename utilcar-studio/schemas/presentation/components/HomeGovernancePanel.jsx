import { useCallback, useState } from 'react'
import { useFormValue } from 'sanity'
import { Button, Card, Code, Flex, Label, Stack, Text } from '@sanity/ui'
import { ChevronDownIcon, ChevronUpIcon } from '@sanity/icons'
import { SCHEMA_VERSION_VALUE } from '../../content/fields/schemaVersion.js'

export function HomeGovernancePanel() {
  const [open, setOpen] = useState(false)
  const schemaVersion = useFormValue(['schemaVersion'])
  const createdAt = useFormValue(['_createdAt'])
  const updatedAt = useFormValue(['_updatedAt'])

  const toggle = useCallback(() => setOpen((v) => !v), [])

  return (
    <Card padding={3} radius={2} tone="transparent" border>
      <Flex align="center" justify="space-between">
        <Text size={1} weight="semibold">
          Metadata del documento (admin)
        </Text>
        <Button
          icon={open ? ChevronUpIcon : ChevronDownIcon}
          mode="bleed"
          onClick={toggle}
          title={open ? 'Ocultar' : 'Mostrar'}
        />
      </Flex>
      {open ? (
        <Stack space={3} marginTop={3}>
          <Stack space={2}>
            <Label size={0}>schemaVersion</Label>
            <Code size={1}>{schemaVersion ?? SCHEMA_VERSION_VALUE}</Code>
          </Stack>
          <Stack space={2}>
            <Label size={0}>createdAt</Label>
            <Code size={1}>{createdAt ? new Date(createdAt).toLocaleString('es-CL') : '—'}</Code>
          </Stack>
          <Stack space={2}>
            <Label size={0}>updatedAt</Label>
            <Code size={1}>{updatedAt ? new Date(updatedAt).toLocaleString('es-CL') : '—'}</Code>
          </Stack>
        </Stack>
      ) : null}
    </Card>
  )
}

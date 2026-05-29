import { useCallback, useState } from 'react'
import { useFormValue } from 'sanity'
import { Box, Button, Card, Code, Flex, Label, Stack, Text } from '@sanity/ui'
import { ChevronDownIcon, ChevronUpIcon } from '@sanity/icons'
import { resolveCanonicalId } from '../../governance/identity.js'

export function SpecialtyGovernancePanel() {
  const [open, setOpen] = useState(false)
  const title = useFormValue(['title'])
  const blockMeta = useFormValue(['blockMeta'])
  const canonicalId = resolveCanonicalId({ title, blockMeta })
  const blockKey = blockMeta?.blockKey ?? '—'

  const toggle = useCallback(() => setOpen((v) => !v), [])

  return (
    <Card padding={3} radius={2} tone="transparent" border>
      <Flex align="center" justify="space-between">
        <Text size={1} weight="semibold">
          Metadata técnica (admin)
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
            <Label size={0}>blockKey</Label>
            <Code size={1}>{blockKey || '— (auto)'}</Code>
          </Stack>
          <Stack space={2}>
            <Label size={0}>canonicalId</Label>
            <Code size={1}>{canonicalId || '—'}</Code>
          </Stack>
          <Box>
            <Text size={0} muted>
              Solo lectura — calculado en runtime del sitio.
            </Text>
          </Box>
        </Stack>
      ) : null}
    </Card>
  )
}

import { Stack, Text, Card, Code } from '@sanity/ui'
import { useFormValue } from 'sanity'

/** Muestra blocks.length del documento activo en Studio (draft o published). */
export function WorkPageBlocksCountDebugInput() {
  const blocks = useFormValue(['blocks'])
  const docId = useFormValue(['_id'])
  const count = Array.isArray(blocks) ? blocks.length : blocks == null ? 'null' : typeof blocks
  const types = Array.isArray(blocks)
    ? blocks.map((b) => b?._type ?? '?').join(', ')
    : '—'

  return (
    <Card padding={3} radius={2} tone={count === 0 || count === 'null' ? 'caution' : 'positive'}>
      <Stack space={2}>
        <Text size={1} weight="semibold">
          [Debug] Documento activo: <Code>{String(docId ?? '—')}</Code>
        </Text>
        <Text size={2}>
          blocks.length = <Code>{String(count)}</Code>
        </Text>
        <Text size={1} muted>
          Tipos: {types || '(vacío)'}
        </Text>
        {(count === 0 || count === 'null') && (
          <Text size={1} style={{ color: 'var(--card-badge-caution-fg-color)' }}>
            Si published tiene bloques pero aquí muestra 0/null → el draft está vacío. Ejecutá: npm run
            repair:workpage-draft
          </Text>
        )}
      </Stack>
    </Card>
  )
}

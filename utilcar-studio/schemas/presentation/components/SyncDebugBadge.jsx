import { useCurrentUser } from 'sanity'
import { Badge, Card, Code, Stack, Text } from '@sanity/ui'
import { isStudioAdmin } from '../../governance/studioAdmin.js'
import {
  formatSyncSourceLabel,
  getLastHomePageSyncEvent,
} from '../../governance/homePageSyncLog.js'

function isDev() {
  return typeof import.meta !== 'undefined' && import.meta.env?.DEV
}

/** Último evento de sync (solo admin + desarrollo). */
export function SyncDebugBadge() {
  const user = useCurrentUser()
  if (!isDev() || !isStudioAdmin(user)) return null

  const last = getLastHomePageSyncEvent()
  if (!last) return null

  return (
    <Card padding={3} radius={2} tone="transparent" border>
      <Stack space={2}>
        <Text size={1} weight="semibold">
          Sync debug (admin)
        </Text>
        <Badge fontSize={0} tone="primary">
          {formatSyncSourceLabel(last.source)}
        </Badge>
        {last.fieldsSynced?.length ? (
          <Code size={1}>{last.fieldsSynced.join(', ')}</Code>
        ) : null}
        <Text muted size={0}>
          {last.at}
        </Text>
      </Stack>
    </Card>
  )
}

import { Box, Stack } from '@sanity/ui'
import { LEGACY_FLAT_FIELDS, LEGACY_FIELD_LABELS, PAGE_BUILDER_COPY } from '../pageBuilderCopy.js'
import { hasBlocksSourceOfTruth } from '../../governance/homePageSync.js'
import { PageBuilderBanner } from './PageBuilderBanner.jsx'
import { SyncDebugBadge } from './SyncDebugBadge.jsx'

/** Advanced Mode: espejos planos deprecated (solo lectura si blocks activo). */
export function HomePageLegacyFormInput(props) {
  const blocksActive = hasBlocksSourceOfTruth(props.value)
  const mirrorReadOnly = blocksActive

  const legacyMembers =
    props.members?.filter(
      (member) => member.kind === 'field' && LEGACY_FLAT_FIELDS.includes(member.name),
    ) ?? []

  return (
    <Box paddingX={4} paddingTop={4} paddingBottom={9}>
      <Stack space={4}>
        <PageBuilderBanner
          tone="caution"
          badge={PAGE_BUILDER_COPY.legacyMirror}
          title={PAGE_BUILDER_COPY.legacyModeTitle}
          description={PAGE_BUILDER_COPY.legacyModeDescription}
        />
        <PageBuilderBanner
          tone="transparent"
          title={PAGE_BUILDER_COPY.migrationRoadmap}
          description="Ver docs/CMS_CONVERGENCE.md y docs/FRONTEND_MIGRATION.md"
        />
        {blocksActive ? (
          <PageBuilderBanner
            tone="critical"
            badge={PAGE_BUILDER_COPY.legacyMirror}
            title="Legacy read-only mirror"
            description={`${PAGE_BUILDER_COPY.syncedFromBlocks}. source: blocks → legacy mirror. No hay escritura dual.`}
          />
        ) : (
          <PageBuilderBanner
            tone="caution"
            title="Bootstrap"
            description={PAGE_BUILDER_COPY.legacyBootstrapHint}
          />
        )}
        <SyncDebugBadge />
        <Stack space={5}>
          {legacyMembers.map((member) => (
            <Stack key={member.name} space={3}>
              <PageBuilderBanner
                tone="caution"
                badge={PAGE_BUILDER_COPY.legacyMirror}
                title={LEGACY_FIELD_LABELS[member.name] ?? member.name}
                description={
                  mirrorReadOnly
                    ? `${PAGE_BUILDER_COPY.legacyMirror} · ${PAGE_BUILDER_COPY.syncedFromBlocks}`
                    : PAGE_BUILDER_COPY.legacyBootstrapHint
                }
              />
              {props.renderDefault({
                ...props,
                readOnly: mirrorReadOnly,
                members: [member],
              })}
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

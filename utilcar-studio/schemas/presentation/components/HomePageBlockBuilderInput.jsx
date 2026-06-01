import { Box, Card, Heading, Stack, Text } from '@sanity/ui'
import { useFormValue } from 'sanity'
import { useCurrentUser } from 'sanity'
import { isStudioAdmin } from '../../governance/studioAdmin.js'
import { PAGE_BUILDER_COPY } from '../pageBuilderCopy.js'
import { PageBuilderBanner } from './PageBuilderBanner.jsx'
import { SyncDebugBadge } from './SyncDebugBadge.jsx'

/** Page Builder: blocks[] fuente única; campos planos = sync pasivo. */
export function HomePageBlockBuilderInput(props) {
  const user = useCurrentUser()
  const isAdmin = isStudioAdmin(user)
  const blocksMember = props.members?.find((member) => member.name === 'blocks')
  const blocks = useFormValue(['blocks'])
  const isEmpty = !Array.isArray(blocks) || blocks.length === 0

  return (
    <Box paddingX={4} paddingTop={4} paddingBottom={9}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading as="h2" size={2}>
            Page Builder — Inicio
          </Heading>
          {isEmpty ? (
            <Card padding={4} radius={2} tone="transparent" border>
              <Stack space={3}>
                <Text weight="semibold">{PAGE_BUILDER_COPY.emptyBlocksTitle}</Text>
                <Text size={1} muted>
                  {PAGE_BUILDER_COPY.emptyBlocksDescription}
                </Text>
              </Stack>
            </Card>
          ) : null}
          <PageBuilderBanner
            tone="positive"
            badge={PAGE_BUILDER_COPY.builderControlled}
            title={PAGE_BUILDER_COPY.builderControlled}
            description={PAGE_BUILDER_COPY.sourceOfTruth}
          />
          {isAdmin ? (
            <PageBuilderBanner
              tone="transparent"
              title="Convergencia CMS"
              description={PAGE_BUILDER_COPY.migrationRoadmap}
            />
          ) : null}
        </Stack>
        {props.renderDefault({
          ...props,
          members: blocksMember ? [blocksMember] : [],
        })}
        {isAdmin ? <SyncDebugBadge /> : null}
      </Stack>
    </Box>
  )
}

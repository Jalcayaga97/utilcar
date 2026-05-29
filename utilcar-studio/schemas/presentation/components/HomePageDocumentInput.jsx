import { useCurrentUser } from 'sanity'
import { Stack } from '@sanity/ui'
import { isStudioAdmin } from '../../governance/studioAdmin.js'
import { HomeGovernancePanel } from './HomeGovernancePanel.jsx'

export function HomePageDocumentInput(props) {
  const user = useCurrentUser()

  return (
    <Stack space={4}>
      {props.renderDefault(props)}
      {isStudioAdmin(user) ? <HomeGovernancePanel /> : null}
    </Stack>
  )
}

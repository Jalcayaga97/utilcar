import { useCurrentUser } from 'sanity'
import { Stack } from '@sanity/ui'
import { isStudioAdmin } from '../../governance/studioAdmin.js'
import { SpecialtyGovernancePanel } from './SpecialtyGovernancePanel.jsx'

export function SpecialtyObjectInput(props) {
  const user = useCurrentUser()

  return (
    <Stack space={4}>
      {props.renderDefault(props)}
      {isStudioAdmin(user) ? <SpecialtyGovernancePanel /> : null}
    </Stack>
  )
}

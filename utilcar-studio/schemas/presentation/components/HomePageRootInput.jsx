import { useEffect, useRef, useState } from 'react'
import { useCurrentUser } from 'sanity'
import { Stack } from '@sanity/ui'
import { isStudioAdmin } from '../../governance/studioAdmin.js'
import { patchesForHomePageReconcile } from '../../governance/homePageSync.js'
import { PatchEvent } from 'sanity'
import { useHomePageReconcile } from '../hooks/useHomePageReconcile.js'
import { HomePageBlockBuilderInput } from './HomePageBlockBuilderInput.jsx'
import { HomePageLegacyFormInput } from './HomePageLegacyFormInput.jsx'
import { HomePageEditModeBar } from './HomePageEditModeBar.jsx'
import {
  HOME_EDIT_MODE_BUILDER,
  HOME_EDIT_MODE_LEGACY,
} from '../studioNavigation.js'

/** Enruta homePage: Page Builder (default) o legacy admin. */
export function HomePageRootInput(props) {
  const user = useCurrentUser()
  const isAdmin = isStudioAdmin(user)
  const [editMode, setEditMode] = useState(HOME_EDIT_MODE_BUILDER)
  const migratedRef = useRef(false)

  const handleChange = useHomePageReconcile(props.value, props.onChange)

  useEffect(() => {
    if (migratedRef.current) return
    if (editMode === HOME_EDIT_MODE_LEGACY) return
    if (props.value?.blocks?.length) {
      migratedRef.current = true
      return
    }
    migratedRef.current = true
    const { patches } = patchesForHomePageReconcile(props.value, props.value ?? {})
    if (patches.length) {
      props.onChange(PatchEvent.from(patches))
    }
  }, [editMode, props.onChange, props.value])

  const routedProps = { ...props, onChange: handleChange }

  const legacyMode = isAdmin && editMode === HOME_EDIT_MODE_LEGACY

  return (
    <Stack space={4}>
      <HomePageEditModeBar
        isAdmin={isAdmin}
        mode={editMode}
        onModeChange={setEditMode}
      />
      {legacyMode ? (
        <HomePageLegacyFormInput {...routedProps} />
      ) : (
        <HomePageBlockBuilderInput {...routedProps} />
      )}
    </Stack>
  )
}

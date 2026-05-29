import { useCallback } from 'react'
import { Button, Card, Flex, Tab, TabList } from '@sanity/ui'
import { PAGE_BUILDER_COPY } from '../pageBuilderCopy.js'
import {
  HOME_EDIT_MODE_BUILDER,
  HOME_EDIT_MODE_LEGACY,
} from '../studioNavigation.js'

/** Selector de modo: Page Builder (default) vs Legacy (solo admin). */
export function HomePageEditModeBar({ mode, onModeChange, isAdmin }) {
  const setBuilder = useCallback(() => onModeChange(HOME_EDIT_MODE_BUILDER), [onModeChange])
  const setLegacy = useCallback(() => onModeChange(HOME_EDIT_MODE_LEGACY), [onModeChange])

  if (!isAdmin) {
    return null
  }

  return (
    <Card padding={3} radius={2} border tone="transparent">
      <Flex align="center" gap={3} wrap="wrap">
        <TabList space={2}>
          <Tab
            aria-selected={mode === HOME_EDIT_MODE_BUILDER}
            id="home-edit-builder"
            label={PAGE_BUILDER_COPY.modeBuilder}
            onClick={setBuilder}
            selected={mode === HOME_EDIT_MODE_BUILDER}
          />
          <Tab
            aria-selected={mode === HOME_EDIT_MODE_LEGACY}
            id="home-edit-legacy"
            label={PAGE_BUILDER_COPY.modeLegacy}
            onClick={setLegacy}
            selected={mode === HOME_EDIT_MODE_LEGACY}
          />
        </TabList>
        {mode === HOME_EDIT_MODE_LEGACY ? (
          <Button mode="bleed" text="Volver a Page Builder" onClick={setBuilder} tone="primary" />
        ) : null}
      </Flex>
    </Card>
  )
}

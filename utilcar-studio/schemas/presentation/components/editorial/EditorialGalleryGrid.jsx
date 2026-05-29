import { Box, Text } from '@sanity/ui'
import { EditorialHint } from '../EditorialHint.jsx'

/** Hint para arrays de galería con layout grid. */
export function EditorialGalleryGrid({ hint, children }) {
  return (
    <Box>
      {hint ? (
        <Box marginBottom={3}>
          <EditorialHint title="Galería">{hint}</EditorialHint>
        </Box>
      ) : null}
      {children}
    </Box>
  )
}

import { Box } from '@sanity/ui'
import { EditorialHint } from '../EditorialHint.jsx'

/** Wrapper para listas de características / spec groups. */
export function EditorialFeatureList({ hint, children }) {
  return (
    <Box>
      {hint ? (
        <Box marginBottom={3}>
          <EditorialHint title="Características">{hint}</EditorialHint>
        </Box>
      ) : null}
      {children}
    </Box>
  )
}

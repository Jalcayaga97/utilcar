import { Stack } from '@sanity/ui'

/** Contenedor del array blocks — reorder y modal por bloque vía schema options. */
export function HomePageBlocksArrayInput(props) {
  return <Stack space={3}>{props.renderDefault(props)}</Stack>
}

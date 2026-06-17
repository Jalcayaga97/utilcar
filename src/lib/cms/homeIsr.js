/** Equivalente ISR para Vite SPA — intervalo de revalidación (segundos). */
export const HOME_ISR_REVALIDATE_SECONDS = 60

export const HOME_ISR_PUBLIC_PATH = '/cms/home-isr.json'

/**
 * @param {{ generatedAt?: string, revalidate?: number }} snapshot
 */
export function isHomeIsrSnapshotFresh(snapshot) {
  if (!snapshot?.generatedAt) return false
  const ageMs = Date.now() - Date.parse(snapshot.generatedAt)
  const ttlMs = (snapshot.revalidate ?? HOME_ISR_REVALIDATE_SECONDS) * 1000
  return Number.isFinite(ageMs) && ageMs < ttlMs
}

export function PageLoader() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center py-20"
      role="status"
      aria-live="polite"
      aria-label="Cargando página"
    >
      <div className="h-8 w-8 animate-pulse rounded-full border-2 border-border border-t-ink" />
    </div>
  )
}

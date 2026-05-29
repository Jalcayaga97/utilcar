import { PageMeta } from '@/components/seo/PageMeta'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <>
      <PageMeta page="not-found" />
      <Container className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-subtle">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Página no encontrada</h1>
        <p className="mt-3 max-w-md text-ink-muted">
          La página que busca no existe o fue movida.
        </p>
        <Button to="/" className="mt-8" variant="primary">
          Volver al inicio
        </Button>
      </Container>
    </>
  )
}

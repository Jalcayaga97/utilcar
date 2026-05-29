import { Container } from '@/components/ui/Container'
import { CtaButtonGroup } from '@/components/sections/CtaButtonGroup'

export function ServiceCtaDark({
  title = 'Solicite una solución personalizada para su operación',
  description = 'Nuestro equipo técnico releva su vehículo, define el layout interior y propone materiales y terminaciones según su uso en terreno.',
  primaryLabel = 'Solicitar cotización',
  primaryTo = '/contacto',
  showWhatsApp = true,
}) {
  return (
    <section className="border-t border-ink/10 bg-accent py-section-sm lg:py-section">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80">{description}</p>
          <CtaButtonGroup
            variant="dark"
            primaryLabel={primaryLabel}
            primaryTo={primaryTo}
            showWhatsApp={showWhatsApp}
            className="mt-10"
          />
        </div>
      </Container>
    </section>
  )
}

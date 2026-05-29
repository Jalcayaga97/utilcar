import { Container } from '@/components/ui/Container'
import { CtaButtonGroup } from '@/components/sections/CtaButtonGroup'
import { useServiceCtaDefaults } from '@/hooks/useCms'

export function ServiceCtaDark({
  title,
  description,
  primaryLabel,
  primaryTo,
  showWhatsApp = true,
}) {
  const defaults = useServiceCtaDefaults()

  return (
    <section className="border-t border-ink/10 bg-accent py-section-sm lg:py-section">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title ?? defaults.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            {description ?? defaults.description}
          </p>
          <CtaButtonGroup
            variant="dark"
            primaryLabel={primaryLabel ?? defaults.primaryLabel}
            primaryTo={primaryTo ?? defaults.primaryTo}
            showWhatsApp={showWhatsApp}
            className="mt-10"
          />
        </div>
      </Container>
    </section>
  )
}

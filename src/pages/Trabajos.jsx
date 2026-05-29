import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { TrabajosPortfolio } from '@/components/sections/TrabajosPortfolio'
import { Section, SectionHeader } from '@/components/ui/Section'
import {
  TRABAJOS_PAGE_HERO,
  TRABAJOS_PORTFOLIO_INTRO,
} from '@/data/trabajosPortfolio'

const ease = [0.25, 0.1, 0.25, 1]

export default function Trabajos() {
  const { title, paragraphs } = TRABAJOS_PORTFOLIO_INTRO

  return (
    <>
      <PageMeta page="trabajos-realizados" />

      <ServicePageHero
        eyebrow="Portfolio"
        title="Trabajos Realizados"
        subtitle="Proyectos y conversiones desarrolladas por Utilcar Conversiones para transporte, equipamiento y vehículos especiales."
        image={TRABAJOS_PAGE_HERO}
        imageAlt="Conversión de vehículo utilitario realizada por Utilcar Conversiones"
      />

      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mx-auto max-w-3xl"
        >
          <SectionHeader eyebrow="Experiencia" title={title} className="mb-8" />
          <div className="space-y-5">
            {paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-base leading-relaxed text-ink-muted sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      </Section>

      <Section className="bg-white">
        <SectionHeader
          eyebrow="Proyectos"
          title="Registro de trabajos"
          description="Filtra por línea de servicio y amplía cada proyecto para ver el detalle de la conversión."
          align="center"
          className="mx-auto max-w-2xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mt-12"
        >
          <TrabajosPortfolio />
        </motion.div>
      </Section>

      <ServiceCtaDark
        title="¿Necesitas una conversión personalizada?"
        description="Desarrollamos soluciones para transporte, equipamiento y trabajo en terreno según los requerimientos de cada cliente."
      />
    </>
  )
}

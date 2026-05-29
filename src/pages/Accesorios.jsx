import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { AccesoriosCategoryPanel } from '@/components/sections/AccesoriosCategoryPanel'
import { Section, SectionHeader } from '@/components/ui/Section'
import { IMAGES } from '@/assets/images'
import { ACCESORIOS_PAGE_INTRO } from '@/data/accesorios'

const ease = [0.25, 0.1, 0.25, 1]

export default function Accesorios() {
  const { title, paragraphs } = ACCESORIOS_PAGE_INTRO

  return (
    <>
      <PageMeta page="accesorios" />

      <ServicePageHero
        eyebrow="Servicios"
        title="Accesorios"
        subtitle="Accesorios diseñados para mejorar la comodidad, seguridad y funcionalidad de cada vehículo."
        image={IMAGES.accesorios.hero}
        imageAlt="Cabeceras y accesorios Utilcar para equipamiento de vehículos"
      />

      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mx-auto max-w-3xl"
        >
          <SectionHeader
            eyebrow="Complementos"
            title={title}
            className="mb-8"
          />
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
          eyebrow="Catálogo técnico"
          title="Líneas de accesorios"
          description="Seleccione una categoría para ver especificaciones, registro visual y detalle de cada producto."
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
          <AccesoriosCategoryPanel />
        </motion.div>
      </Section>

      <ServiceCtaDark
        title="Consulte accesorios para su equipamiento"
        description="Asesoramos en cabeceras, apoya brazos, balizas y señalética escolar según su vehículo y normativa. Fabricación e instalación en taller Utilcar."
      />
    </>
  )
}

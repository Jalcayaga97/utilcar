import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { BanquetasCategoryPanel } from '@/components/sections/BanquetasCategoryPanel'
import { Section, SectionHeader } from '@/components/ui/Section'
import { IMAGES } from '@/assets/images'

const ease = [0.25, 0.1, 0.25, 1]

export default function Banquetas() {
  return (
    <>
      <PageMeta page="banquetas" />

      <ServicePageHero
        eyebrow="Servicios"
        title="Banquetas"
        subtitle="Fabricación de banquetas y equipamiento para transporte de personal, minibuses y vehículos escolares."
        image={IMAGES.banquetas.hero}
        imageAlt="Banquetas fabricadas por Utilcar para minibuses y transporte de pasajeros"
      />

      <Section>
        <SectionHeader
          eyebrow="Líneas de producto"
          title="Banquetas por aplicación"
          description="Tres líneas de fabricación con especificaciones técnicas, opciones de equipamiento y registro visual de trabajos reales."
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
          <BanquetasCategoryPanel />
        </motion.div>
      </Section>

      <ServiceCtaDark
        title="Solicite banquetas a medida para su flota"
        description="Definimos la línea de producto, distribución de plazas, tapizados y anclajes según su vehículo y normativa. Fabricación e instalación en taller Utilcar."
      />
    </>
  )
}

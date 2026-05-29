import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { ServicePageHero } from '@/components/sections/ServicePageHero'
import { ServiceCtaDark } from '@/components/sections/ServiceCtaDark'
import { BanquetasCategoryPanel } from '@/components/sections/BanquetasCategoryPanel'
import { Section, SectionHeader } from '@/components/ui/Section'
import { IMAGES } from '@/assets/images'
import { useBanquetasContent } from '@/hooks/useCms'

const ease = [0.25, 0.1, 0.25, 1]

export default function Banquetas() {
  const { hero, categories, cta } = useBanquetasContent()
  return (
    <>
      <PageMeta page="banquetas" />

      <ServicePageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        image={IMAGES.banquetas.hero}
        imageAlt={hero.imageAlt}
      />

      <Section>
        <SectionHeader
          eyebrow={categories.eyebrow}
          title={categories.title}
          description={categories.description}
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

      <ServiceCtaDark title={cta.title} description={cta.description} />
    </>
  )
}

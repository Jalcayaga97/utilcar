import { motion } from 'framer-motion'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { Card, CardIcon } from '@/components/ui/Card'
import { WorkCardImage } from '@/components/ui/WorkCardImage'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Grid } from '@/components/ui/Grid'
import { Hero } from '@/components/sections/Hero'
import { MainServices } from '@/components/sections/MainServices'
import { EspecialidadesUtilcar } from '@/components/sections/EspecialidadesUtilcar'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { HIGHLIGHTS } from '@/data/services'
import { TRABAJOS } from '@/data/trabajos'

export default function Home() {
  return (
    <>
      <PageMeta page="home" />

      <Hero />

      <MainServices />

      <EspecialidadesUtilcar />

      <Section>
        <SectionHeader
          eyebrow="Por qué Utilcar"
          title="Ingeniería, fabricación e instalación"
          align="center"
        />
        <Grid cols={3}>
          {HIGHLIGHTS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="text-center">
                <CardIcon icon={item.icon} className="mx-auto" />
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </Grid>
      </Section>

      <Section>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Portfolio"
            title="Trabajos recientes"
            description="Proyectos entregados para flotas escolares, corporativas y técnicas."
            className="mb-0"
          />
          <Button to="/trabajos-realizados" variant="outline" className="shrink-0">
            Ver todos
          </Button>
        </div>
        <Grid cols={3} className="mt-10">
          {TRABAJOS.slice(0, 3).map((trabajo) => (
            <Card key={trabajo.id} hover className="flex h-full flex-col">
              <WorkCardImage
                imageKey={trabajo.imageKey}
                alt={trabajo.imageAlt}
                className="mb-4"
              />
              <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
                {trabajo.category}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-ink">{trabajo.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{trabajo.description}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      <CtaBanner />
    </>
  )
}

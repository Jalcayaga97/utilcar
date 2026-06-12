/**
 * Contenido Sobre Nosotros — mock CMS local.
 */
import { Bus, Truck, Wrench } from 'lucide-react'
import { serviceCtaDefaults } from '@/content/services'

export const aboutContent = {
  hero: {
    eyebrow: 'Utilcar',
    title: 'Sobre Nosotros',
    subtitle:
      'Más de dos décadas fabricando e instalando soluciones de conversión y equipamiento automotriz en Santiago.',
    imageAlt: 'Taller Utilcar — conversiones y equipamiento automotriz, Santiago',
  },
  historia: {
    eyebrow: 'Nuestra historia',
    title: 'Ingeniería y fabricación con foco en el transporte',
    paragraphs: [
      'Utilcar Conversiones nació como un taller especializado en modificaciones de vehículos comerciales y de transporte de pasajeros. Con el tiempo ampliamos nuestra capacidad productiva para ofrecer soluciones integrales: talleres móviles, ventanas y lunetas, equipamiento escolar, banquetas, butacas y accesorios.',
      'Hoy trabajamos con empresas, flotas, talleres y fabricantes que requieren terminaciones profesionales, cumplimiento normativo y acompañamiento técnico en cada etapa del proyecto.',
      'Nuestro taller en Quinta Normal, Santiago, concentra diseño, fabricación e instalación con control de calidad en cada entrega.',
    ],
  },
  features: {
    eyebrow: 'Qué hacemos',
    title: 'Soluciones para cada operación',
    description:
      'Desarrollamos conversiones y equipamiento a medida según marca, modelo y uso operativo de su flota.',
    items: [
      {
        title: 'Ingeniería propia',
        description: 'Diseño y fabricación con control de calidad en cada etapa del proceso.',
        icon: Bus,
      },
      {
        title: 'A medida por vehículo',
        description: 'Soluciones adaptadas a marca, modelo y uso operativo de su flota.',
        icon: Truck,
      },
      {
        title: 'Instalación certificada',
        description: 'Taller especializado con protocolos de montaje y terminación premium.',
        icon: Wrench,
      },
    ],
  },
  cta: {
    ...serviceCtaDefaults,
    title: 'Conversemos sobre su próximo proyecto',
    description:
      'Nuestro equipo técnico releva su vehículo y propone materiales, layout y plazos según su operación.',
  },
}

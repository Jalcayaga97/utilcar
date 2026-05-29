/**
 * Portfolio de trabajos — imágenes reales por línea de servicio Utilcar.
 */

import tallerHero from '@/assets/images/talleres/tr143.jpg'
import tallerTr247 from '@/assets/images/talleres/tr247.jpg'
import tallerTr11 from '@/assets/images/talleres/tr11.jpg'
import tallerTr12 from '@/assets/images/talleres/tr12.jpg'
import tallerTr9 from '@/assets/images/talleres/tr9.jpg'

import ventana1 from '@/assets/images/ventanas/vent1.jpg'
import ventana2 from '@/assets/images/ventanas/vent2.jpg'
import ventana3 from '@/assets/images/ventanas/vent3.jpg'
import marcaToyota from '@/assets/images/ventanas/marcas/toyota/toyota.jpg'
import marcaPeugeot from '@/assets/images/ventanas/marcas/peugeot/peugeot.jfif'
import marcaRenault from '@/assets/images/ventanas/marcas/renault/renault.jpg'
import marcaFiat from '@/assets/images/ventanas/marcas/fiat/fiat.jpg'
import marcaCitroen1 from '@/assets/images/ventanas/marcas/citroen/citroen-1.jfif'
import marcaChevrolet1 from '@/assets/images/ventanas/marcas/chevrolet/chev1.jpg'

import escolar1 from '@/assets/images/escolar/ee350.jpg'
import escolar2 from '@/assets/images/escolar/ee351.jfif'
import escolar3 from '@/assets/images/escolar/ee352.jpg'

import banquetaTraslado1 from '@/assets/images/banquetas/traslado/banq_tras_pers.jpg'
import banquetaTraslado2 from '@/assets/images/banquetas/traslado/banq_tras_pers2.jpg'
import banquetaAdulto1 from '@/assets/images/banquetas/adultos/IMG_0118.jfif'
import banquetaEscolar1 from '@/assets/images/banquetas/escolares/banq_esc.jpg'
import banquetaEscolar2 from '@/assets/images/banquetas/escolares/banq_esc1.jpg'

import butaca1 from '@/assets/images/butacas/IMG_0148.jfif'
import butaca2 from '@/assets/images/butacas/IMG_0149.jfif'
import butaca3 from '@/assets/images/butacas/IMG_0150.jfif'

import accCabeceras from '@/assets/images/accesorios/cabeceras/cabeceras.jpg'
import accApoyaBrazos from '@/assets/images/accesorios/apoya-brazos/apoya_brazos.jpg'
import accBaliza from '@/assets/images/accesorios/balizas/baliza.jpg'
import accDistintivo from '@/assets/images/accesorios/distintivo-escolar/esc.jpg'

import trabajoTaller from '@/assets/images/trabajos/taller-hiace.jpg'
import trabajoVentanas from '@/assets/images/trabajos/ventanas-master.jpg'
import trabajoMinibus from '@/assets/images/trabajos/minibus-boxer.jpg'

export const TRABAJOS_PAGE_HERO = tallerTr247

export const TRABAJOS_PORTFOLIO_INTRO = {
  title: 'Experiencia en conversiones automotrices',
  paragraphs: [
    'En Utilcar desarrollamos proyectos de conversión y equipamiento a medida para transporte de pasajeros, flotas escolares, trabajo en terreno y vehículos especiales.',
    'Cada trabajo refleja fabricación propia, terminaciones profesionales y soluciones adaptadas a los requerimientos técnicos de cada cliente.',
  ],
}

export const TRABAJOS_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'talleres-moviles', label: 'Talleres móviles' },
  { id: 'ventanas-lunetas', label: 'Ventanas y lunetas' },
  { id: 'equipamiento-escolar', label: 'Equipamiento escolar' },
  { id: 'banquetas', label: 'Banquetas' },
  { id: 'butacas', label: 'Butacas' },
  { id: 'accesorios', label: 'Accesorios' },
]

const item = (id, title, category, categoryId, image, description, imageAlt) => ({
  id,
  title,
  category,
  categoryId,
  image,
  description,
  imageAlt:
    imageAlt ??
    `${title} — ${category}, conversión automotriz Utilcar Conversiones, Santiago`,
})

/** Portfolio ordenado por línea de servicio, sin duplicar archivos visualmente redundantes. */
export const TRABAJOS_PORTFOLIO = [
  item(
    'taller-tr143',
    'Taller móvil equipado en terreno',
    'Talleres móviles',
    'talleres-moviles',
    tallerHero,
    'Conversión de utilitario con mobiliario técnico, revestimiento interior y organización modular.',
  ),
  item(
    'taller-tr247',
    'Interior de unidad móvil técnica',
    'Talleres móviles',
    'talleres-moviles',
    tallerTr247,
    'Habitáculo adaptado para operación y almacenamiento de herramientas.',
  ),
  item(
    'taller-hiace',
    'Taller móvil Toyota Hiace',
    'Talleres móviles',
    'talleres-moviles',
    trabajoTaller,
    'Equipamiento interior con electricidad y terminaciones para servicio en ruta.',
  ),
  item(
    'taller-tr11',
    'Furgón adaptado a taller móvil',
    'Talleres móviles',
    'talleres-moviles',
    tallerTr11,
    'Distribución interior y revestimientos para trabajo técnico.',
  ),
  item(
    'taller-tr12',
    'Compartimientos interiores modulares',
    'Talleres móviles',
    'talleres-moviles',
    tallerTr12,
    'Optimización de espacios para operación en terreno.',
  ),
  item(
    'taller-tr9',
    'Revestimiento interior utilitario',
    'Talleres móviles',
    'talleres-moviles',
    tallerTr9,
    'Terminaciones resistentes para uso intensivo.',
  ),
  item(
    'vent-master',
    'Kit ventanas Renault Master',
    'Ventanas y lunetas',
    'ventanas-lunetas',
    trabajoVentanas,
    'Ventiletes y luneta con terminación sellada profesional.',
  ),
  item(
    'vent-1',
    'Ventanas laterales en utilitario',
    'Ventanas y lunetas',
    'ventanas-lunetas',
    ventana1,
    'Instalación con marco de aluminio electropintado.',
  ),
  item(
    'vent-2',
    'Ventanas corredizas de aluminio',
    'Ventanas y lunetas',
    'ventanas-lunetas',
    ventana2,
    'Vidrios templados y terminación industrial.',
  ),
  item(
    'vent-3',
    'Luneta y ventiletes traseros',
    'Ventanas y lunetas',
    'ventanas-lunetas',
    ventana3,
    'Cierre perimetral y acabado en taller Utilcar.',
  ),
  item(
    'vent-toyota',
    'Equipamiento ventanas Toyota',
    'Ventanas y lunetas',
    'ventanas-lunetas',
    marcaToyota,
    'Conversión según carrocería y modelo.',
  ),
  item(
    'vent-peugeot',
    'Ventanas Peugeot Boxer',
    'Ventanas y lunetas',
    'ventanas-lunetas',
    marcaPeugeot,
    'Ventiletes y luneta para chasis utilitario.',
  ),
  item(
    'vent-renault',
    'Kit ventanas Renault',
    'Ventanas y lunetas',
    'ventanas-lunetas',
    marcaRenault,
    'Instalación con sellado profesional.',
  ),
  item(
    'vent-fiat',
    'Ventanas Fiat Ducato',
    'Ventanas y lunetas',
    'ventanas-lunetas',
    marcaFiat,
    'Compatibilidad con batalla y configuración del vehículo.',
  ),
  item(
    'vent-citroen',
    'Ventanas Citroën Jumper',
    'Ventanas y lunetas',
    'ventanas-lunetas',
    marcaCitroen1,
    'Terminaciones en aluminio electropintado.',
  ),
  item(
    'vent-chevrolet',
    'Equipamiento Chevrolet',
    'Ventanas y lunetas',
    'ventanas-lunetas',
    marcaChevrolet1,
    'Ventanas y equipamiento integral en habitáculo.',
  ),
  item(
    'esc-350',
    'Equipamiento escolar en bus',
    'Equipamiento escolar',
    'equipamiento-escolar',
    escolar1,
    'Butacas homologadas y distribución para transporte escolar.',
  ),
  item(
    'esc-351',
    'Interior escolar terminado',
    'Equipamiento escolar',
    'equipamiento-escolar',
    escolar2,
    'Señalética, asientos y terminaciones interiores.',
  ),
  item(
    'esc-352',
    'Conversión transporte escolar',
    'Equipamiento escolar',
    'equipamiento-escolar',
    escolar3,
    'Instalación conforme a requerimientos de operación.',
  ),
  item(
    'banq-traslado',
    'Banquetas traslado de personal',
    'Banquetas',
    'banquetas',
    banquetaTraslado1,
    'Fabricación en tubo reforzado con tapizado técnico.',
  ),
  item(
    'banq-traslado-2',
    'Minibús con banquetas corporativas',
    'Banquetas',
    'banquetas',
    banquetaTraslado2,
    'Distribución interior y pasillo homologado.',
  ),
  item(
    'banq-boxer',
    'Peugeot Boxer con banquetas',
    'Banquetas',
    'banquetas',
    trabajoMinibus,
    'Configuración 2+1 con terminaciones profesionales.',
  ),
  item(
    'banq-adulto',
    'Banquetas adultos',
    'Banquetas',
    'banquetas',
    banquetaAdulto1,
    'Estructura MIG y suspensión con resortes inox.',
  ),
  item(
    'banq-esc-1',
    'Banquetas línea escolar',
    'Banquetas',
    'banquetas',
    banquetaEscolar1,
    'Espuma alta densidad y cinturones de dos puntas.',
  ),
  item(
    'banq-esc-2',
    'Equipamiento escolar en banqueta',
    'Banquetas',
    'banquetas',
    banquetaEscolar2,
    'Tapiz vinil técnico y patas electropintadas.',
  ),
  item(
    'but-1',
    'Butacas a medida — tapizado',
    'Butacas',
    'butacas',
    butaca1,
    'Fabricación con matrices propias y terminación premium.',
  ),
  item(
    'but-2',
    'Detalle de costuras y acabado',
    'Butacas',
    'butacas',
    butaca2,
    'Tapizados técnicos y control de calidad en taller.',
  ),
  item(
    'but-3',
    'Butacas personalizadas',
    'Butacas',
    'butacas',
    butaca3,
    'Configuración según ergonomía y uso del vehículo.',
  ),
  item(
    'acc-cab',
    'Cabeceras de seguridad',
    'Accesorios',
    'accesorios',
    accCabeceras,
    'Poliuretano inyectado y tapiz a elección.',
  ),
  item(
    'acc-brazos',
    'Apoya brazos articulado',
    'Accesorios',
    'accesorios',
    accApoyaBrazos,
    'Confort en viajes prolongados con sistema abatible.',
  ),
  item(
    'acc-baliza',
    'Baliza escolar 12 V',
    'Accesorios',
    'accesorios',
    accBaliza,
    'Señalización preventiva imantada color amarillo.',
  ),
  item(
    'acc-distintivo',
    'Distintivo escolar reglamentario',
    'Accesorios',
    'accesorios',
    accDistintivo,
    'Letrero «Escolares» con fijación temporal normativa.',
  ),
]

/**
 * Imágenes oficiales Utilcar (origen: Desktop/imagenes)
 * Para agregar más: copiar a la carpeta correspondiente e importar aquí.
 */

import hero from './hero.jpg'

import talleres from './services/talleres.jpg'
import ventanas from './services/ventanas.jpg'
import escolar from './services/escolar.jpg'
import banquetas from './services/banquetas.jpg'
import butacas from './services/butacas.jfif'
import accesorios from './services/accesorios.jpg'

import trabajoEscolar from './trabajos/escolar-mercedes.jpg'
import trabajoTaller from './trabajos/taller-hiace.jpg'
import trabajoVentanas from './trabajos/ventanas-master.jpg'
import trabajoMinibus from './trabajos/minibus-boxer.jpg'
import trabajoDucato from './trabajos/ducato-corporativo.jpg'
import trabajoHyundai from './trabajos/hyundai-h350.jfif'

import ventana1 from './ventanas/vent1.jpg'
import ventana2 from './ventanas/vent2.jpg'
import ventana3 from './ventanas/vent3.jpg'
import ventanaHero from './ventanas/vent3.jpg'
import marcaToyota from './ventanas/marcas/toyota/toyota.jpg'
import marcaPeugeot from './ventanas/marcas/peugeot/peugeot.jfif'
import marcaRenault from './ventanas/marcas/renault/renault.jpg'
import marcaSuzuki from './ventanas/marcas/suzuki/suzuki.jpg'
import marcaFiat from './ventanas/marcas/fiat/fiat.jpg'
import marcaCitroen1 from './ventanas/marcas/citroen/citroen-1.jfif'
import marcaCitroen2 from './ventanas/marcas/citroen/citroen-2.jfif'
import marcaChevrolet1 from './ventanas/marcas/chevrolet/chev1.jpg'
import marcaChevrolet2 from './ventanas/marcas/chevrolet/chev2.jpg'
import marcaChevrolet3 from './ventanas/marcas/chevrolet/chev3.jpg'

function ventanasMarcaAlt(brandName, index, total) {
  const base = `Ventanas laterales corredizas para furgón ${brandName}`
  if (total <= 1) {
    return `${base} — instalación y terminación Utilcar Conversiones`
  }
  return `${base} — registro de proyecto ${index + 1} de ${total}`
}

function banquetaAlt(categoryName, index, total) {
  const base = `Banquetas para minibús — ${categoryName}`
  if (total <= 1) {
    return `${base} — fabricación e instalación Utilcar, Santiago`
  }
  return `${base} — vista ${index + 1} de ${total}`
}

const tapiceriaCategoriasGalerias = {
  'cambio-tapiz': [],
  'reparacion-tapiceria': [],
  'personalizacion-interior': [],
}

const butacasCategoriasGalerias = {
  camiones: [
    { src: butaca1, alt: 'Butacas para camiones — tapizado y terminaciones Utilcar' },
    { src: butaca2, alt: 'Butacas para camiones — detalle de costuras y acabados' },
  ],
  furgones: [
    { src: butaca3, alt: 'Butacas para furgones — estructura y confort' },
    { src: butaca1, alt: 'Butacas para furgones — fabricación a medida Utilcar' },
  ],
}

const banquetasCategoriasGalerias = {
  escolares: [
    { src: banquetaEscolar1, alt: banquetaAlt('Banquetas escolares', 0, 3) },
    { src: banquetaEscolar2, alt: banquetaAlt('Banquetas escolares', 1, 3) },
    { src: banquetaEscolar3, alt: banquetaAlt('Banquetas escolares', 2, 3) },
  ],
  furgones: [
    { src: banquetaTraslado1, alt: banquetaAlt('Banquetas para furgones', 0, 3) },
    { src: banquetaTraslado2, alt: banquetaAlt('Banquetas para furgones', 1, 3) },
    { src: banquetaTraslado3, alt: banquetaAlt('Banquetas para furgones', 2, 3) },
  ],
  camiones: [
    { src: banquetaAdulto1, alt: banquetaAlt('Banquetas para camiones', 0, 2) },
    { src: banquetaAdulto2, alt: banquetaAlt('Banquetas para camiones', 1, 2) },
  ],
}

function accesorioAlt(name) {
  return `Accesorio para conversión vehicular — ${name}, Utilcar Santiago`
}

const accesoriosCategoriasGalerias = {
  cabeceras: [{ src: accCabeceras, alt: accesorioAlt('cabeceras, confort y seguridad cervical') }],
  'apoya-brazos': [
    { src: accApoyaBrazos, alt: accesorioAlt('apoya brazos, ergonomía y tapizado') },
  ],
  balizas: [{ src: accBaliza, alt: accesorioAlt('baliza amarilla 12 V, señalización preventiva') }],
  'distintivo-escolar': [
    { src: accDistintivo, alt: accesorioAlt('distintivo escolar reglamentario') },
  ],
}

const ventanasMarcasGalerias = {
  toyota: [{ src: marcaToyota, alt: ventanasMarcaAlt('Toyota', 0, 1) }],
  peugeot: [{ src: marcaPeugeot, alt: ventanasMarcaAlt('Peugeot', 0, 1) }],
  renault: [{ src: marcaRenault, alt: ventanasMarcaAlt('Renault', 0, 1) }],
  suzuki: [{ src: marcaSuzuki, alt: ventanasMarcaAlt('Suzuki', 0, 1) }],
  fiat: [{ src: marcaFiat, alt: ventanasMarcaAlt('Fiat', 0, 1) }],
  citroen: [
    { src: marcaCitroen1, alt: ventanasMarcaAlt('Citroën', 0, 2) },
    { src: marcaCitroen2, alt: ventanasMarcaAlt('Citroën', 1, 2) },
  ],
  chevrolet: [
    { src: marcaChevrolet1, alt: ventanasMarcaAlt('Chevrolet', 0, 3) },
    { src: marcaChevrolet2, alt: ventanasMarcaAlt('Chevrolet', 1, 3) },
    { src: marcaChevrolet3, alt: ventanasMarcaAlt('Chevrolet', 2, 3) },
  ],
}

import banquetaAdulto1 from './banquetas/adultos/IMG_0118.jfif'
import banquetaAdulto2 from './banquetas/adultos/IMG_0120.jfif'
import banquetaTraslado1 from './banquetas/traslado/banq_tras_pers.jpg'
import banquetaTraslado2 from './banquetas/traslado/banq_tras_pers2.jpg'
import banquetaTraslado3 from './banquetas/traslado/banq_tras_pers3.jpg'
import banquetaEscolar1 from './banquetas/escolares/banq_esc.jpg'
import banquetaEscolar2 from './banquetas/escolares/banq_esc1.jpg'
import banquetaEscolar3 from './banquetas/escolares/banq_esc2.jpg'

import accCabeceras from './accesorios/cabeceras/cabeceras.jpg'
import accApoyaBrazos from './accesorios/apoya-brazos/apoya_brazos.jpg'
import accBaliza from './accesorios/balizas/baliza.jpg'
import accDistintivo from './accesorios/distintivo-escolar/esc.jpg'

import butaca1 from './butacas/IMG_0148.jfif'
import butaca2 from './butacas/IMG_0149.jfif'
import butaca3 from './butacas/IMG_0150.jfif'

import escolarHero from './escolar/ee350.jpg'
import escolar1 from './escolar/ee350.jpg'
import escolar2 from './escolar/ee351.jfif'
import escolar3 from './escolar/ee352.jpg'

import tallerHero from './talleres/tr143.jpg'
import tallerTr247 from './talleres/tr247.jpg'
import tallerTr11 from './talleres/tr11.jpg'
import tallerTr12 from './talleres/tr12.jpg'
import tallerTr9 from './talleres/tr9.jpg'

export const IMAGES = {
  hero,
  services: {
    talleres,
    ventanas,
    escolar,
    banquetas,
    butacas,
    accesorios,
    'proteccion-cabina': butacas,
    'cambio-pisos': banquetas,
    reclinaciones: butacas,
    fundas: banquetas,
    literas: banquetas,
    tapiceria: butacas,
  },
  trabajos: {
    1: trabajoEscolar,
    2: trabajoTaller,
    3: trabajoVentanas,
    4: trabajoMinibus,
    5: trabajoDucato,
    6: trabajoHyundai,
  },
  ventanas: {
    hero: ventanaHero,
    gallery: [
      {
        src: ventana1,
        alt: 'Ventanas laterales corredizas instaladas en furgón utilitario — Utilcar',
      },
      {
        src: ventana2,
        alt: 'Ventanas corredizas con marco de aluminio electropintado y vidrio templado',
      },
      {
        src: ventana3,
        alt: 'Luneta trasera y ventiletes con terminación sellada profesional',
      },
    ],
    marcasGalerias: ventanasMarcasGalerias,
  },
  ventanasGallery: [ventana1, ventana2, ventana3],
  banquetas: {
    hero: banquetas,
    categoriasGalerias: banquetasCategoriasGalerias,
  },
  butacas: {
    hero: butaca1,
    categoriasGalerias: butacasCategoriasGalerias,
    gallery: [
      {
        src: butaca1,
        alt: 'Butacas Utilcar — tapizado, terminaciones y calidad de fabricación',
      },
      {
        src: butaca2,
        alt: 'Butacas a medida — detalle de costuras, tapiz y acabados premium',
      },
      {
        src: butaca3,
        alt: 'Butacas personalizadas — estructura, confort y terminación profesional',
      },
    ],
  },
  accesorios: {
    hero: accCabeceras,
    categoriasGalerias: accesoriosCategoriasGalerias,
  },
  tapiceria: {
    hero: butacas,
    categoriasGalerias: tapiceriaCategoriasGalerias,
  },
  proteccionCabina: { hero: butacas, categoriasGalerias: {} },
  cambioPisos: { hero: banquetas, categoriasGalerias: {} },
  reclinaciones: { hero: butacas, categoriasGalerias: {} },
  fundas: { hero: banquetas, categoriasGalerias: {} },
  literas: { hero: banquetas, categoriasGalerias: {} },
  escolar: {
    hero: escolarHero,
    gallery: [
      {
        src: escolar1,
        alt: 'Equipamiento escolar Utilcar — interior de bus con butacas homologadas',
      },
      {
        src: escolar2,
        alt: 'Conversión escolar — distribución de asientos y terminaciones interiores',
      },
      {
        src: escolar3,
        alt: 'Transporte escolar — instalación y señalética reglamentaria',
      },
    ],
  },
  talleres: {
    hero: tallerHero,
    gallery: [
      { src: tallerHero, alt: 'Taller móvil equipado para trabajo en terreno' },
      { src: tallerTr247, alt: 'Interior de vehículo adaptado como taller móvil' },
      { src: tallerTr11, alt: 'Conversión de furgón para servicio técnico móvil' },
      { src: tallerTr12, alt: 'Unidad móvil con compartimientos interiores' },
      { src: tallerTr9, alt: 'Vehículo utilitario con revestimiento interior' },
    ],
  },
}

export function getServiceImage(serviceId) {
  return IMAGES.services[serviceId] ?? null
}

export function getTrabajoImage(trabajoId) {
  return IMAGES.trabajos[trabajoId] ?? null
}

export function getVentanasMarcaGallery(brandId) {
  return IMAGES.ventanas.marcasGalerias[brandId] ?? []
}

export function getBanquetasCategoryGallery(categoryId) {
  return IMAGES.banquetas.categoriasGalerias[categoryId] ?? []
}

export function getTapiceriaCategoryGallery(categoryId) {
  return IMAGES.tapiceria.categoriasGalerias[categoryId] ?? []
}

export function getButacasCategoryGallery(categoryId) {
  return IMAGES.butacas.categoriasGalerias[categoryId] ?? []
}

export function getAccesoriosCategoryGallery(categoryId) {
  return IMAGES.accesorios.categoriasGalerias[categoryId] ?? []
}

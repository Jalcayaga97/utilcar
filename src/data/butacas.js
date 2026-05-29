/**
 * Contenido Butacas — fabricación a medida Utilcar.
 */

const section = (title, items) => ({ title, items })

export const BUTACAS_INTRO = {
  title: 'Fabricación personalizada',
  paragraphs: [
    'Fabricamos butacas a la medida y según la exigencia de cada cliente, con el más alto estándar de calidad. Contamos con matrices propias de fabricación, lo que nos permite entregar exactamente lo que cada proyecto requiere.',
    'Calidad y precio acordes al mercado.',
    'Así nos hemos propuesto un servicio diferenciado de óptima calidad: eficiencia, rapidez, puntualidad y terminaciones que facilitan al máximo el trabajo y el tiempo dedicado por el cliente.',
  ],
}

export const BUTACAS_SECTIONS = [
  section('Fabricación a medida', [
    'Diseño y producción según requerimientos del cliente y del vehículo.',
    'Matrices propias que permiten configuraciones exactas por proyecto.',
    'Butacas para transporte de pasajeros, vehículos especiales y aplicaciones personalizadas.',
    'Instalación en riel o directamente al piso según carrocería.',
    'Asesoramiento técnico en distribución y ergonomía del habitáculo.',
  ]),
  section('Calidad de materiales', [
    'Estructura metálica reforzada con tratamiento anticorrosivo.',
    'Espuma de alta densidad en asiento y respaldo para confort en viajes prolongados.',
    'Tapizados técnicos resistentes al desgaste y de fácil mantenimiento.',
    'Componentes seleccionados para uso intensivo en flota.',
  ]),
  section('Terminaciones', [
    'Costuras y acabados de tapicería con control de detalle en taller.',
    'Tapizados premium antimanchas y terminaciones uniformes.',
    'Soporte lumbar y ergonomía orientada al confort del pasajero.',
    'Acabados alineados al estándar visual del proyecto.',
  ]),
  section('Personalización', [
    'Mecanismos reclinables opcionales con ajuste suave y duradero.',
    'Colores y combinaciones de tapiz según identidad del cliente.',
    'Portavasos, mesas abatibles y accesorios integrados a pedido.',
    'Cinturones de tres puntos y anclajes homologados según normativa.',
    'Configuraciones para viajes ejecutivos, turismo y transporte especializado.',
  ]),
  section('Compromiso de servicio', [
    'Eficiencia y rapidez en fabricación e instalación.',
    'Puntualidad en plazos acordados con el cliente.',
    'Calidad consistente en cada entrega.',
    'Mantenimiento simplificado de tapizados y mecanismos.',
    'Acompañamiento desde el relevamiento hasta la entrega en taller.',
  ]),
]

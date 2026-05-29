import {
  Bus,
  GraduationCap,
  LayoutGrid,
  Sofa,
  Truck,
  Wrench,
  AppWindow,
} from 'lucide-react'

export const SERVICES = [
  {
    id: 'talleres',
    title: 'Talleres móviles',
    imageAlt:
      'Taller móvil en furgón — mobiliario técnico y conversión para trabajo en terreno, Santiago',
    description:
      'Unidades equipadas para servicio técnico en ruta, con mobiliario, electricidad y seguridad certificada.',
    path: '/talleres-moviles',
    icon: Wrench,
  },
  {
    id: 'ventanas',
    title: 'Ventanas y Lunetas',
    imageAlt:
      'Ventanas laterales corredizas instaladas en furgón — lunetas y ventiletes Utilcar',
    description:
      'Ventiletes y lunetas a medida por marca y modelo, con terminaciones industriales y sellado profesional.',
    path: '/ventanas-lunetas',
    icon: AppWindow,
  },
  {
    id: 'escolar',
    title: 'Equipamiento Escolar',
    imageAlt:
      'Equipamiento escolar en bus — butacas homologadas y conversión para transporte de pasajeros',
    description:
      'Conversiones para transporte escolar con normativas de seguridad, asientos y accesorios homologados.',
    path: '/equipamiento-escolar',
    icon: GraduationCap,
  },
  {
    id: 'banquetas',
    title: 'Banquetas',
    imageAlt:
      'Banquetas para minibús instaladas en vehículo de transporte de pasajeros',
    description:
      'Banquetas modulares para vans y minibuses, tapizados técnicos y anclajes reforzados.',
    path: '/banquetas',
    icon: Sofa,
  },
  {
    id: 'butacas',
    title: 'Butacas',
    imageAlt: 'Butacas ergonómicas a medida para flota corporativa y transporte especializado',
    description:
      'Butacas ergonómicas para flotas corporativas y turismo, con opciones reclinables y cinturones.',
    path: '/butacas',
    icon: LayoutGrid,
  },
  {
    id: 'accesorios',
    title: 'Accesorios',
    imageAlt:
      'Accesorios para conversión vehicular — cabeceras, señalización y complementos de seguridad',
    description:
      'Portaequipaje, divisores, pisos, iluminación LED y complementos para conversiones integrales.',
    path: '/accesorios',
    icon: Truck,
  },
]

export const HIGHLIGHTS = [
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
]

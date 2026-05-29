/**
 * Contenido Contacto — mock CMS local (preparado para Sanity).
 */

const CONTACTO_SERVICIOS = [
  'Talleres móviles',
  'Ventanas y lunetas',
  'Equipamiento escolar',
  'Banquetas',
  'Butacas',
  'Accesorios',
  'Proyecto personalizado',
]

const CONTACTO_FAQ = [
  {
    id: 'personalizado',
    question: '¿Realizan proyectos personalizados?',
    answer:
      'Sí. Desarrollamos conversiones y equipamiento según el vehículo, la normativa aplicable y los requerimientos de cada cliente. Relevamos el proyecto en taller y proponemos una solución técnica a medida.',
  },
  {
    id: 'empresas',
    question: '¿Trabajan con empresas?',
    answer:
      'Atendemos empresas, flotas, talleres y fabricantes que requieren equipamiento escolar, ventanas, banquetas, butacas, accesorios o talleres móviles con terminaciones profesionales.',
  },
  {
    id: 'region',
    question: '¿Atienden fuera de Santiago?',
    answer:
      'Nuestro taller está en Quinta Normal, Santiago. Para proyectos fuera de la región, conversemos previamente sobre logística, plazos y alcance de la instalación.',
  },
  {
    id: 'cotizar',
    question: '¿Qué información necesito para cotizar?',
    answer:
      'Indique marca y modelo del vehículo, tipo de conversión o equipamiento, cantidad de unidades si aplica, y cualquier requerimiento normativo. Con eso nuestro equipo técnico puede orientarle con mayor precisión.',
  },
]


export const contactContent = {
  hero: {
    eyebrow: 'Utilcar',
    title: 'Contacto',
    subtitle: 'Conversemos sobre su proyecto, conversión o equipamiento automotriz.',
    imageAlt: 'Taller Utilcar Conversiones — conversiones y equipamiento automotriz',
  },
  intro: {
    formHint:
      'Si lo prefiere, puede escribirnos mediante el formulario en línea y le responderemos a la brevedad.',
  },
  details: {
    title: 'Datos de contacto',
    description:
      'Atención personalizada para conversiones automotrices, equipamiento escolar, talleres móviles y proyectos especiales.',
    cards: {
      phone: 'Teléfono',
      email: 'Correos',
      address: 'Dirección',
      hours: {
        title: 'Horario',
        lines: ['Lunes a viernes', 'Horario comercial'],
      },
    },
  },
  cta: {
    title: '¿Necesita atención directa?',
    description:
      'Complete el formulario o escríbanos por WhatsApp. Conversemos sobre su conversión o equipamiento.',
    primaryLabel: 'Ir al formulario',
    primaryTo: '#formulario',
  },
  map: {
    eyebrow: 'Ubicación',
    title: 'Visítenos en taller',
    iframeTitle: 'Ubicación Utilcar Conversiones en Google Maps',
  },
  faq: {
    eyebrow: 'Consultas frecuentes',
    title: 'Preguntas habituales',
    description: 'Respuestas breves antes de solicitar su cotización.',
  },
  form: {
    heading: 'Ingrese los datos y nos contactaremos a la brevedad',
    fields: {
      nombre: { label: 'Nombre', placeholder: 'Su nombre', required: true },
      empresa: { label: 'Empresa', placeholder: 'Opcional' },
      mail: { label: 'Mail', placeholder: 'correo@empresa.cl', required: true },
      telefono: { label: 'Teléfono', placeholder: '+56 9 ...' },
      fax: { label: 'Fax', placeholder: 'Opcional' },
      servicio: { label: 'Servicio de interés', placeholder: 'Seleccionar servicio...' },
      consulta: {
        label: 'Consulta',
        placeholder: 'Describa su vehículo, necesidad de conversión o equipamiento...',
        required: true,
      },
    },
    submit: { idle: 'Enviar consulta', loading: 'Enviando...' },
    success: {
      title: 'Consulta enviada',
      message:
        'Gracias por contactarnos. Revisaremos su mensaje y le responderemos a la brevedad.',
      resetLabel: 'Enviar otra consulta',
    },
    error:
      'No pudimos enviar su consulta en este momento. Intente nuevamente o contáctenos por teléfono o WhatsApp.',
  },
  servicios: CONTACTO_SERVICIOS,
  faqItems: CONTACTO_FAQ,
}

export { CONTACTO_SERVICIOS, CONTACTO_FAQ }

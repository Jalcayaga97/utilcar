/**
 * Contenido técnico Equipamiento Escolar — basado en utilcar.cl y especificaciones de taller.
 */

const section = (title, items) => ({ title, items })

export const ESCOLAR_INTRO = {
  title: 'Transformación de vehículos escolares',
  paragraphs: [
    'Contamos con experiencia en la transformación de vehículos y equipamiento para transporte escolar. Marcas reconocidas del mercado confían en nuestro taller para el equipamiento de sus unidades.',
    'Desarrollamos cada proyecto con foco en seguridad operativa, cumplimiento normativo, durabilidad de materiales, funcionalidad del habitáculo y terminaciones profesionales — desde la distribución interior hasta la señalética reglamentaria.',
  ],
}

export const ESCOLAR_SECTIONS = [
  section('Equipamiento escolar', [
    'Butacas y banquetas para transporte de pasajeros escolares.',
    'Espuma de poliuretano de alta densidad: 6 cm en asiento y 4 cm en respaldo.',
    'Cabecera regulable opcional según configuración.',
    'Tapiz lateral en vinil liso y cubiertas en vinil técnico Bronco Benz.',
    'Patas en perfil rectangular 50×30 electropintado.',
    'Instalación profesional en taller especializado Utilcar.',
  ]),
  section('Seguridad', [
    'Cinturones de seguridad de dos puntas en todas las plazas homologadas.',
    'Letrero reglamentario de tres caras.',
    'Sistema de balizas para transporte escolar.',
    'Salidas de emergencia señalizadas.',
    'Cumplimiento de reglamentos del Ministerio de Transporte.',
  ]),
  section('Interior y terminaciones', [
    'Revestimientos interiores resistentes y de fácil sanitización.',
    'Forrado de costados y cielo según proyecto.',
    'Pisos técnicos antideslizantes en zona de tránsito.',
    'Iluminación interior LED perimetral opcional.',
    'Terminaciones en cantos y uniones.',
  ]),
  section('Configuración del vehículo', [
    'Distribución interior con pasillo central homologado.',
    'Layouts 2+1, 3+0 y personalizados según batalla y modelo.',
    'Integración de ventanas y lunetas al equipamiento.',
    'Optimización de capacidad sin comprometer accesos.',
    'Materiales seleccionados para alto tránsito y larga vida útil.',
  ]),
  section('Opcionales', [
    'Malla de seguridad en ventanas.',
    'Portavasos y mesas abatibles.',
    'Climatización posterior.',
    'Documentación de apoyo para habilitación del vehículo.',
    'Señalética y accesorios de identificación escolar adicionales.',
  ]),
]

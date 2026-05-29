/**
 * Contenido técnico Accesorios — basado en utilcar.cl/accesorios.html
 */

const section = (title, items) => ({ title, items })

export const ACCESORIOS_PAGE_INTRO = {
  title: 'Accesorios complementarios',
  paragraphs: [
    'Utilcar fabrica e instala accesorios que complementan el equipamiento del vehículo, mejorando confort, seguridad, ergonomía, señalización y funcionalidad en cada proyecto.',
    'Cada línea se desarrolla con materiales y terminaciones acordes al uso del habitáculo, con instalación profesional en taller.',
  ],
}

export const ACCESORIOS_CATEGORIES = [
  {
    id: 'cabeceras',
    name: 'Cabeceras',
    intro: [
      'Las cabeceras constituyen un accesorio esencial para prevenir molestias cervicales producidas por accidentes.',
      'Están fabricadas en estructura metálica, cubiertas en poliuretano inyectado y disponibles en diversas telas o viniles.',
    ],
    sections: [
      section('Seguridad y confort', [
        'Apoyo cervical que reduce el riesgo de lesiones en siniestros.',
        'Diseño orientado al confort del pasajero en viajes prolongados.',
        'Integración con el respaldo según configuración del asiento.',
      ]),
      section('Terminaciones', [
        'Poliuretano inyectado con acabado uniforme.',
        'Tapiz en tela o vinil según requerimiento del proyecto.',
        'Fabricación y terminación en taller Utilcar.',
      ]),
      section('Ergonomía', [
        'Altura y posición acordes al tipo de butaca o banqueta.',
        'Opciones de regulación según modelo de asiento.',
        'Asesoramiento técnico para selección del accesorio adecuado.',
      ]),
    ],
  },
  {
    id: 'apoya-brazos',
    name: 'Apoya Brazos',
    intro: [
      'Fabricado en estructura metálica recubierta en poliuretano inyectado.',
      'El tapiz puede ser en tela, vinil o cuero. Posee un sistema de articulación para guardarlo o levantarlo cuando se requiera.',
      'Su función principal es el descanso del brazo en viajes largos.',
    ],
    sections: [
      section('Comodidad y ergonomía', [
        'Descanso del brazo en viajes prolongados.',
        'Integración discreta al lateral del asiento.',
        'Mejora la ergonomía del puesto del pasajero.',
      ]),
      section('Materiales y tapiz', [
        'Estructura metálica con recubrimiento en poliuretano inyectado.',
        'Tapiz a elección: tela, vinil o cuero.',
        'Terminaciones resistentes al uso diario.',
      ]),
      section('Funcionalidad', [
        'Sistema de articulación para bajar o levantar el apoya brazos.',
        'Permite liberar espacio cuando no se utiliza.',
        'Instalación según modelo de butaca o banqueta.',
      ]),
    ],
  },
  {
    id: 'balizas',
    name: 'Balizas',
    intro: [
      'Baliza de color amarillo estereoscópica imantada, 12 volt.',
      'Elemento de señalización preventiva para transporte escolar y aplicaciones que requieren alta visibilidad en ruta.',
    ],
    sections: [
      section('Señalización preventiva', [
        'Mayor visibilidad del vehículo en operación escolar.',
        'Uso en conjunto con señalética reglamentaria del habitáculo.',
        'Apoyo a la seguridad vial en rutas de transporte de pasajeros.',
      ]),
      section('Especificación', [
        'Color amarillo estereoscópico.',
        'Fijación imantada.',
        'Alimentación 12 volt.',
      ]),
      section('Funcionalidad', [
        'Instalación y retiro ágil según necesidad operativa.',
        'Complemento para flotas de transporte escolar.',
        'Asesoramiento en ubicación y uso reglamentario.',
      ]),
    ],
  },
  {
    id: 'distintivo-escolar',
    name: 'Distintivo Escolar',
    intro: [
      'Señalética reglamentaria para transporte escolar. En cada cara se insertará la palabra «Escolares», con letras de 12 cm de alto y 4 cm de ancho.',
      'El fondo del letrero deberá ser de color amarillo y las letras de color negro, reflectantes o iluminadas, a objeto de permitir su óptima visualización. Queda prohibido insertar en él cualquier otra leyenda o figura.',
      'El letrero deberá ir apoyado sobre su base e instalarse mediante elementos que permitan su fijación temporal, para usarse cuando se transporten escolares.',
    ],
    sections: [
      section('Normativa y uso', [
        'Letrero destinado al transporte de escolares según reglamentación vigente.',
        'Prohibido insertar otras leyendas o figuras en el distintivo.',
        'Uso con fijación temporal cuando el vehículo presta servicio escolar.',
      ]),
      section('Dimensiones y colores', [
        'Palabra «Escolares» en cada cara del letrero.',
        'Letras de 12 cm de alto y 4 cm de ancho.',
        'Fondo amarillo y letras negras reflectantes o iluminadas.',
      ]),
      section('Reflectancia e instalación', [
        'Alta visibilidad diurna y nocturna.',
        'Apoyado sobre base con sistema de fijación temporal.',
        'Instalación y retiro según operación del vehículo.',
      ]),
    ],
  },
]

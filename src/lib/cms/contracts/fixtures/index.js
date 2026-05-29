/**
 * Fixtures draft del dominio specialties — validación contractual offline.
 */
export { ventanasBlockFixture, ventanasCategoryFixture } from './ventanas.fixture.js'
export {
  busesEscolaresBlockFixture,
  busesEscolaresCategoryFixture,
} from './busesEscolares.fixture.js'
export { banquetasBlockFixture, banquetasCategoryFixture } from './banquetas.fixture.js'

import { mapSpecialtiesBlockToContract } from '../specialtiesContract.js'
import { ventanasBlockFixture } from './ventanas.fixture.js'
import { busesEscolaresBlockFixture } from './busesEscolares.fixture.js'
import { banquetasBlockFixture } from './banquetas.fixture.js'

/** Ejecuta mapSpecialtiesBlockToContract sobre los 3 fixtures de ejemplo. */
export function runSpecialtiesContractFixtures() {
  return {
    ventanas: mapSpecialtiesBlockToContract(ventanasBlockFixture),
    busesEscolares: mapSpecialtiesBlockToContract(busesEscolaresBlockFixture),
    banquetas: mapSpecialtiesBlockToContract(banquetasBlockFixture),
  }
}

import { ComparativoTerritorialResultado } from '../entities/comparativo-territorial.entity';
import { RankingCandidato } from '../entities/ranking-candidato.entity';
import { RankingPartido } from '../entities/ranking-partido.entity';
import { ResumenCorporacion } from '../entities/resumen-corporacion.entity';
import { ResumenElectoral } from '../entities/resumen-electoral.entity';
import { VotosPorDepartamento } from '../entities/votos-departamento.entity';
import { VotosPorMunicipio } from '../entities/votos-municipio.entity';
import { VotosPorPuesto } from '../entities/votos-puesto.entity';
import { FiltroComparativoTerritorial } from '../value-objects/filtro-comparativo-territorial.vo';
import { FiltroElectoral } from '../value-objects/filtro-electoral.vo';

export const ELECTORAL_REPOSITORY = Symbol('ELECTORAL_REPOSITORY');

export interface ElectoralRepositoryPort {
  obtenerResumen(filtro: FiltroElectoral): Promise<ResumenElectoral>;

  obtenerVotosPorDepartamento(filtro: FiltroElectoral): Promise<VotosPorDepartamento[]>;

  obtenerVotosPorMunicipio(filtro: FiltroElectoral): Promise<VotosPorMunicipio[]>;

  obtenerVotosPorPuesto(filtro: FiltroElectoral): Promise<VotosPorPuesto[]>;

  obtenerRankingPartidos(filtro: FiltroElectoral, limite: number): Promise<RankingPartido[]>;

  obtenerRankingCandidatos(filtro: FiltroElectoral, limite: number): Promise<RankingCandidato[]>;

  obtenerResumenPorCorporacion(filtro: FiltroElectoral): Promise<ResumenCorporacion[]>;

  compararTerritorial(
    filtro: FiltroComparativoTerritorial,
  ): Promise<ComparativoTerritorialResultado>;
}

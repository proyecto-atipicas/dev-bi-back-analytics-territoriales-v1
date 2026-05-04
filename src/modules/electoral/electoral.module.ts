import { Module } from '@nestjs/common';
import { CompararCandidatosUseCase } from './application/use-cases/comparar-candidatos.use-case';
import { CompararCorporacionesUseCase } from './application/use-cases/comparar-corporaciones.use-case';
import { ObtenerRankingCandidatosUseCase } from './application/use-cases/obtener-ranking-candidatos.use-case';
import { ObtenerRankingPartidosUseCase } from './application/use-cases/obtener-ranking-partidos.use-case';
import { ObtenerResumenPorCorporacionUseCase } from './application/use-cases/obtener-resumen-por-corporacion.use-case';
import { ObtenerResumenUseCase } from './application/use-cases/obtener-resumen.use-case';
import { ObtenerVotosPorDepartamentoUseCase } from './application/use-cases/obtener-votos-por-departamento.use-case';
import { ObtenerVotosPorMunicipioUseCase } from './application/use-cases/obtener-votos-por-municipio.use-case';
import { ELECTORAL_REPOSITORY } from './domain/ports/electoral.repository.port';
import { ElectoralController } from './infrastructure/http/electoral.controller';
import { PostgresElectoralRepository } from './infrastructure/persistence/postgres-electoral.repository';

@Module({
  controllers: [ElectoralController],
  providers: [
    ObtenerResumenUseCase,
    ObtenerVotosPorDepartamentoUseCase,
    ObtenerVotosPorMunicipioUseCase,
    ObtenerRankingPartidosUseCase,
    ObtenerRankingCandidatosUseCase,
    ObtenerResumenPorCorporacionUseCase,
    CompararCorporacionesUseCase,
    CompararCandidatosUseCase,
    {
      provide: ELECTORAL_REPOSITORY,
      useClass: PostgresElectoralRepository,
    },
  ],
  exports: [
    ObtenerResumenUseCase,
    ObtenerVotosPorDepartamentoUseCase,
    ObtenerRankingPartidosUseCase,
    ObtenerResumenPorCorporacionUseCase,
  ],
})
export class ElectoralModule {}

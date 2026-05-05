import { Module } from '@nestjs/common';
import { ListarCriteriosUseCase } from './application/use-cases/listar-criterios.use-case';
import { ListarDimensionesUseCase } from './application/use-cases/listar-dimensiones.use-case';
import { ListarReferenciasUseCase } from './application/use-cases/listar-referencias.use-case';
import { ListarResumenDimensionesUseCase } from './application/use-cases/listar-resumen-dimensiones.use-case';
import { ObtenerKpisPoblacionalUseCase } from './application/use-cases/obtener-kpis-poblacional.use-case';
import { ObtenerRadarPoblacionalUseCase } from './application/use-cases/obtener-radar-poblacional.use-case';
import { ObtenerSeriePoblacionalUseCase } from './application/use-cases/obtener-serie-poblacional.use-case';
import { POBLACIONAL_REPOSITORY } from './domain/ports/poblacional.repository.port';
import { PoblacionalController } from './infrastructure/http/poblacional.controller';
import { PostgresPoblacionalRepository } from './infrastructure/persistence/postgres-poblacional.repository';

@Module({
  controllers: [PoblacionalController],
  providers: [
    ListarDimensionesUseCase,
    ListarResumenDimensionesUseCase,
    ListarReferenciasUseCase,
    ListarCriteriosUseCase,
    ObtenerKpisPoblacionalUseCase,
    ObtenerSeriePoblacionalUseCase,
    ObtenerRadarPoblacionalUseCase,
    {
      provide: POBLACIONAL_REPOSITORY,
      useClass: PostgresPoblacionalRepository,
    },
  ],
  exports: [ObtenerKpisPoblacionalUseCase],
})
export class PoblacionalModule {}

import { Module } from '@nestjs/common';
import { ListarDepartamentosUseCase } from './application/use-cases/listar-departamentos.use-case';
import { ListarMunicipiosUseCase } from './application/use-cases/listar-municipios.use-case';
import { ListarPuestosUseCase } from './application/use-cases/listar-puestos.use-case';
import { GEO_REPOSITORY } from './domain/ports/geo.repository.port';
import { GeoController } from './infrastructure/http/geo.controller';
import { PostgresGeoRepository } from './infrastructure/persistence/postgres-geo.repository';

@Module({
  controllers: [GeoController],
  providers: [
    ListarDepartamentosUseCase,
    ListarMunicipiosUseCase,
    ListarPuestosUseCase,
    {
      provide: GEO_REPOSITORY,
      useClass: PostgresGeoRepository,
    },
  ],
  exports: [
    ListarDepartamentosUseCase,
    ListarMunicipiosUseCase,
    ListarPuestosUseCase,
  ],
})
export class GeoModule {}

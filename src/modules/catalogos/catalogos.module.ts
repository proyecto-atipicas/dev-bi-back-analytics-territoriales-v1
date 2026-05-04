import { Module } from '@nestjs/common';
import { ListarCandidatosUseCase } from './application/use-cases/listar-candidatos.use-case';
import { ListarCorporacionesUseCase } from './application/use-cases/listar-corporaciones.use-case';
import { ListarPartidosUseCase } from './application/use-cases/listar-partidos.use-case';
import { CATALOGOS_REPOSITORY } from './domain/ports/catalogos.repository.port';
import { CatalogosController } from './infrastructure/http/catalogos.controller';
import { PostgresCatalogosRepository } from './infrastructure/persistence/postgres-catalogos.repository';

@Module({
  controllers: [CatalogosController],
  providers: [
    ListarCorporacionesUseCase,
    ListarPartidosUseCase,
    ListarCandidatosUseCase,
    {
      provide: CATALOGOS_REPOSITORY,
      useClass: PostgresCatalogosRepository,
    },
  ],
  exports: [
    ListarCorporacionesUseCase,
    ListarPartidosUseCase,
    ListarCandidatosUseCase,
  ],
})
export class CatalogosModule {}

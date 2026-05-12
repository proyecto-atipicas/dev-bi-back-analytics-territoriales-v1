import { Module } from '@nestjs/common';
import { ListarFuentesUseCase } from './application/use-cases/listar-fuentes.use-case';
import { ListarNombresFuenteUseCase } from './application/use-cases/listar-nombres-fuente.use-case';
import { ListarTipificacionesUseCase } from './application/use-cases/listar-tipificaciones.use-case';
import { FUENTES_REPOSITORY } from './domain/ports/fuentes.repository.port';
import { FuentesController } from './infrastructure/http/fuentes.controller';
import { PostgresFuentesRepository } from './infrastructure/persistence/postgres-fuentes.repository';

@Module({
  controllers: [FuentesController],
  providers: [
    ListarFuentesUseCase,
    ListarTipificacionesUseCase,
    ListarNombresFuenteUseCase,
    {
      provide: FUENTES_REPOSITORY,
      useClass: PostgresFuentesRepository,
    },
  ],
  exports: [ListarFuentesUseCase, ListarTipificacionesUseCase, ListarNombresFuenteUseCase],
})
export class FuentesModule {}

import { Module } from '@nestjs/common';
import { ListarDimensionesUseCase } from './application/use-cases/listar-categorias.use-case';
import { ListarFuentesPublicacionesUseCase } from './application/use-cases/listar-fuentes-publicaciones.use-case';
import { ListarNivelesGeograficosUseCase } from './application/use-cases/listar-niveles-geograficos.use-case';
import { ListarReferenciasUseCase } from './application/use-cases/listar-referencias.use-case';
import { ObtenerKpisSocioeconomicosUseCase } from './application/use-cases/obtener-kpis.use-case';
import { ObtenerPorDepartamentoSocioeconomicoUseCase } from './application/use-cases/obtener-por-departamento.use-case';
import { ObtenerResumenDepartamentoUseCase } from './application/use-cases/obtener-resumen-departamento.use-case';
import { ObtenerSerieHistoricaUseCase } from './application/use-cases/obtener-serie-historica.use-case';
import { SOCIOECONOMICO_REPOSITORY } from './domain/ports/socioeconomico.repository.port';
import { SocioeconomicoController } from './infrastructure/http/socioeconomico.controller';
import { PostgresSocioeconomicoRepository } from './infrastructure/persistence/postgres-socioeconomico.repository';

@Module({
  controllers: [SocioeconomicoController],
  providers: [
    ListarDimensionesUseCase,
    ListarFuentesPublicacionesUseCase,
    ListarReferenciasUseCase,
    ListarNivelesGeograficosUseCase,
    ObtenerKpisSocioeconomicosUseCase,
    ObtenerSerieHistoricaUseCase,
    ObtenerPorDepartamentoSocioeconomicoUseCase,
    ObtenerResumenDepartamentoUseCase,
    {
      provide: SOCIOECONOMICO_REPOSITORY,
      useClass: PostgresSocioeconomicoRepository,
    },
  ],
  exports: [ObtenerKpisSocioeconomicosUseCase],
})
export class SocioeconomicoModule {}

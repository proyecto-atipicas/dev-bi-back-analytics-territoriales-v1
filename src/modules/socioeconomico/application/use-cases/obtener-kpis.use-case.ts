import { Inject, Injectable } from '@nestjs/common';
import { KpiSocioeconomico } from '../../domain/entities/kpi-socioeconomico.entity';
import {
  FiltroSocioeconomico,
  SOCIOECONOMICO_REPOSITORY,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';

@Injectable()
export class ObtenerKpisSocioeconomicosUseCase {
  constructor(
    @Inject(SOCIOECONOMICO_REPOSITORY) private readonly repository: SocioeconomicoRepositoryPort,
  ) {}

  execute(filtro: FiltroSocioeconomico): Promise<KpiSocioeconomico[]> {
    return this.repository.obtenerKpis(filtro);
  }
}

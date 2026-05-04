import { Inject, Injectable } from '@nestjs/common';
import { KpiPoblacional } from '../../domain/entities/kpi-poblacional.entity';
import {
  FiltroPoblacional,
  POBLACIONAL_REPOSITORY,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

@Injectable()
export class ObtenerKpisPoblacionalUseCase {
  constructor(
    @Inject(POBLACIONAL_REPOSITORY) private readonly repository: PoblacionalRepositoryPort,
  ) {}

  execute(filtro: FiltroPoblacional): Promise<KpiPoblacional[]> {
    return this.repository.obtenerKpis(filtro);
  }
}

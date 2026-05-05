import { Inject, Injectable } from '@nestjs/common';
import { RadarPoblacionalPunto } from '../../domain/entities/radar-poblacional-punto.entity';
import {
  FiltroPoblacional,
  POBLACIONAL_REPOSITORY,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

@Injectable()
export class ObtenerRadarPoblacionalUseCase {
  constructor(
    @Inject(POBLACIONAL_REPOSITORY) private readonly repository: PoblacionalRepositoryPort,
  ) {}

  execute(filtro: FiltroPoblacional): Promise<RadarPoblacionalPunto[]> {
    return this.repository.obtenerRadarUltimoPeriodo(filtro);
  }
}

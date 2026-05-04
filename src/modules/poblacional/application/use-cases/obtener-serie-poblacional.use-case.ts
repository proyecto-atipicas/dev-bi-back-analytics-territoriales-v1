import { Inject, Injectable } from '@nestjs/common';
import { SeriePoblacionalPunto } from '../../domain/entities/serie-poblacional-punto.entity';
import {
  FiltroPoblacional,
  POBLACIONAL_REPOSITORY,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

@Injectable()
export class ObtenerSeriePoblacionalUseCase {
  constructor(
    @Inject(POBLACIONAL_REPOSITORY) private readonly repository: PoblacionalRepositoryPort,
  ) {}

  execute(filtro: FiltroPoblacional): Promise<SeriePoblacionalPunto[]> {
    return this.repository.obtenerSerieHistorica(filtro);
  }
}

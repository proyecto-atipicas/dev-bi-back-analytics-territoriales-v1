import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import {
  FiltroPoblacional,
  POBLACIONAL_REPOSITORY,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarCriteriosUseCase {
  constructor(
    @Inject(POBLACIONAL_REPOSITORY) private readonly repository: PoblacionalRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(filtro: FiltroPoblacional): Promise<string[]> {
    // Sólo dimension/fuente/referencia influyen en la lista de criterios disponibles.
    const key = `poblacional:criterios:${filtro.dimension ?? '*'}:${filtro.fuente ?? '*'}:${filtro.referencia ?? '*'}`;
    return this.cache.getOrSet(key, TTL_MS, () => this.repository.listarCriterios(filtro));
  }
}

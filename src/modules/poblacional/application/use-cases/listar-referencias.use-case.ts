import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import {
  POBLACIONAL_REPOSITORY,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarReferenciasUseCase {
  constructor(
    @Inject(POBLACIONAL_REPOSITORY) private readonly repository: PoblacionalRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(dimension?: string | null, fuente?: string | null): Promise<string[]> {
    const dim = dimension ?? null;
    const f = fuente ?? null;
    const key = `poblacional:referencias:${dim ?? '*'}:${f ?? '*'}`;
    return this.cache.getOrSet(key, TTL_MS, () => this.repository.listarReferencias(dim, f));
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import {
  POBLACIONAL_REPOSITORY,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarDimensionesUseCase {
  constructor(
    @Inject(POBLACIONAL_REPOSITORY) private readonly repository: PoblacionalRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(): Promise<string[]> {
    return this.cache.getOrSet('poblacional:dimensiones', TTL_MS, () =>
      this.repository.listarDimensiones(),
    );
  }
}

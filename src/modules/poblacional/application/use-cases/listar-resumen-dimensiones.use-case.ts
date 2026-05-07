import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import { ResumenDimension } from '../../domain/entities/resumen-dimension.entity';
import {
  POBLACIONAL_REPOSITORY,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarResumenDimensionesUseCase {
  constructor(
    @Inject(POBLACIONAL_REPOSITORY) private readonly repository: PoblacionalRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(): Promise<ResumenDimension[]> {
    return this.cache.getOrSet('poblacional:resumen-dimensiones', TTL_MS, () =>
      this.repository.listarResumenDimensiones(),
    );
  }
}

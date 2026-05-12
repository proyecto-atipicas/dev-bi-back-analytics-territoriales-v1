import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import {
  FUENTES_REPOSITORY,
  FuentesRepositoryPort,
} from '../../domain/ports/fuentes.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarNombresFuenteUseCase {
  constructor(
    @Inject(FUENTES_REPOSITORY) private readonly repository: FuentesRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(): Promise<string[]> {
    return this.cache.getOrSet('fuentes:nombres', TTL_MS, () =>
      this.repository.listarNombresFuente(),
    );
  }
}

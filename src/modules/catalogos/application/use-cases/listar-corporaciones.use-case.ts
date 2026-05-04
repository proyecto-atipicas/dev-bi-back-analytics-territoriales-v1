import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import { Corporacion } from '../../domain/entities/corporacion.entity';
import {
  CATALOGOS_REPOSITORY,
  CatalogosRepositoryPort,
} from '../../domain/ports/catalogos.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarCorporacionesUseCase {
  constructor(
    @Inject(CATALOGOS_REPOSITORY) private readonly repository: CatalogosRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(): Promise<Corporacion[]> {
    return this.cache.getOrSet('catalogos:corporaciones', TTL_MS, () =>
      this.repository.listarCorporaciones(),
    );
  }
}

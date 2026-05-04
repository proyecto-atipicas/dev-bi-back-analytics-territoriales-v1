import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import { Departamento } from '../../domain/entities/departamento.entity';
import { GEO_REPOSITORY, GeoRepositoryPort } from '../../domain/ports/geo.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarDepartamentosUseCase {
  constructor(
    @Inject(GEO_REPOSITORY) private readonly repository: GeoRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(): Promise<Departamento[]> {
    return this.cache.getOrSet('geo:departamentos', TTL_MS, () =>
      this.repository.listarDepartamentos(),
    );
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import { Partido } from '../../domain/entities/partido.entity';
import {
  CATALOGOS_REPOSITORY,
  CatalogosRepositoryPort,
  ListarPartidosFiltros,
} from '../../domain/ports/catalogos.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarPartidosUseCase {
  constructor(
    @Inject(CATALOGOS_REPOSITORY) private readonly repository: CatalogosRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(filtros: ListarPartidosFiltros = {}): Promise<Partido[]> {
    const key = `catalogos:partidos:${filtros.codigoCorporacion ?? '*'}`;
    return this.cache.getOrSet(key, TTL_MS, () =>
      this.repository.listarPartidos(filtros),
    );
  }
}

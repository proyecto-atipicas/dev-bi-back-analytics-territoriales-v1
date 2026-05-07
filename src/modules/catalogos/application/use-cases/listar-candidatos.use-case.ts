import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import { Candidato } from '../../domain/entities/candidato.entity';
import {
  CATALOGOS_REPOSITORY,
  CatalogosRepositoryPort,
  ListarCandidatosFiltros,
} from '../../domain/ports/catalogos.repository.port';

const LIMITE_DEFAULT = 200;
const LIMITE_MAX = 1000;
const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarCandidatosUseCase {
  constructor(
    @Inject(CATALOGOS_REPOSITORY) private readonly repository: CatalogosRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(filtros: ListarCandidatosFiltros = {}): Promise<Candidato[]> {
    const limite = Math.min(filtros.limite ?? LIMITE_DEFAULT, LIMITE_MAX);
    const key = `catalogos:candidatos:${filtros.codigoCorporacion ?? '*'}:${filtros.codigoPartido ?? '*'}:${limite}`;
    return this.cache.getOrSet(key, TTL_MS, () =>
      this.repository.listarCandidatos({ ...filtros, limite }),
    );
  }
}

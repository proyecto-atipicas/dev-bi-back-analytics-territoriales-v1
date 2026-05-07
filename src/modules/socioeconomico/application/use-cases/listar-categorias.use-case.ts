import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import {
  SOCIOECONOMICO_REPOSITORY,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';
import { FuenteSocioeconomica } from '../../domain/value-objects/fuente-socioeconomica.vo';

const TTL_MS = 10 * 60 * 1000;

/**
 * Antes `ListarCategoriasUseCase` (campo `categoria` → `dimension`).
 * Mantiene el archivo por compatibilidad de path.
 */
@Injectable()
export class ListarDimensionesUseCase {
  constructor(
    @Inject(SOCIOECONOMICO_REPOSITORY) private readonly repository: SocioeconomicoRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(fuente: FuenteSocioeconomica, fuentePublicacion?: string | null): Promise<string[]> {
    const fp = fuentePublicacion ?? null;
    const key = `socio:dimensiones:${fuente}:${fp ?? '*'}`;
    return this.cache.getOrSet(key, TTL_MS, () => this.repository.listarDimensiones(fuente, fp));
  }
}

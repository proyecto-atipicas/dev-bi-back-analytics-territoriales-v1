import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import {
  FiltroSocioeconomico,
  SOCIOECONOMICO_REPOSITORY,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarReferenciasUseCase {
  constructor(
    @Inject(SOCIOECONOMICO_REPOSITORY)
    private readonly repository: SocioeconomicoRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(filtro: FiltroSocioeconomico): Promise<string[]> {
    // Sólo fuente + fuentePublicacion + dimension afectan la lista de referencias.
    const key = `socio:referencias:${filtro.fuente}:${filtro.fuentePublicacion ?? '*'}:${filtro.dimension ?? '*'}`;
    return this.cache.getOrSet(key, TTL_MS, () => this.repository.listarReferencias(filtro));
  }
}

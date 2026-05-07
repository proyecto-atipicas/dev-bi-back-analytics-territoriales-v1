import { Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import {
  SOCIOECONOMICO_REPOSITORY,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarFuentesPublicacionesUseCase {
  constructor(
    @Inject(SOCIOECONOMICO_REPOSITORY) private readonly repository: SocioeconomicoRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(): Promise<string[]> {
    return this.cache.getOrSet('socio:fuentes-publicaciones', TTL_MS, () =>
      this.repository.listarFuentesPublicaciones(),
    );
  }
}

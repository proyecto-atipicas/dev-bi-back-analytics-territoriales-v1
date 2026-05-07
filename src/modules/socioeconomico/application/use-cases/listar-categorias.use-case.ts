import { Inject, Injectable } from '@nestjs/common';
import {
  SOCIOECONOMICO_REPOSITORY,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';
import { FuenteSocioeconomica } from '../../domain/value-objects/fuente-socioeconomica.vo';

/**
 * Antes `ListarCategoriasUseCase` (campo `categoria` → `dimension`).
 * Mantiene el archivo por compatibilidad de path.
 */
@Injectable()
export class ListarDimensionesUseCase {
  constructor(
    @Inject(SOCIOECONOMICO_REPOSITORY) private readonly repository: SocioeconomicoRepositoryPort,
  ) {}

  execute(fuente: FuenteSocioeconomica, fuentePublicacion?: string | null): Promise<string[]> {
    return this.repository.listarDimensiones(fuente, fuentePublicacion ?? null);
  }
}

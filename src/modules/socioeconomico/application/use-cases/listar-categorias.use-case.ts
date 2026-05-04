import { Inject, Injectable } from '@nestjs/common';
import {
  SOCIOECONOMICO_REPOSITORY,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';
import { FuenteSocioeconomica } from '../../domain/value-objects/fuente-socioeconomica.vo';

@Injectable()
export class ListarCategoriasUseCase {
  constructor(
    @Inject(SOCIOECONOMICO_REPOSITORY) private readonly repository: SocioeconomicoRepositoryPort,
  ) {}

  execute(
    fuente: FuenteSocioeconomica,
    fuentePublicacion?: string | null,
  ): Promise<string[]> {
    return this.repository.listarCategorias(fuente, fuentePublicacion ?? null);
  }
}

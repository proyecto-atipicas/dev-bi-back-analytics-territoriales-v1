import { Inject, Injectable } from '@nestjs/common';
import {
  SOCIOECONOMICO_REPOSITORY,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';

@Injectable()
export class ListarFuentesPublicacionesUseCase {
  constructor(
    @Inject(SOCIOECONOMICO_REPOSITORY) private readonly repository: SocioeconomicoRepositoryPort,
  ) {}

  execute(): Promise<string[]> {
    return this.repository.listarFuentesPublicaciones();
  }
}

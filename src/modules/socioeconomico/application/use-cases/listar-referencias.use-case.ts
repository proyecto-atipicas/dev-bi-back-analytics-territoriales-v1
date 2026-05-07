import { Inject, Injectable } from '@nestjs/common';
import {
  FiltroSocioeconomico,
  SOCIOECONOMICO_REPOSITORY,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';

@Injectable()
export class ListarReferenciasUseCase {
  constructor(
    @Inject(SOCIOECONOMICO_REPOSITORY)
    private readonly repository: SocioeconomicoRepositoryPort,
  ) {}

  execute(filtro: FiltroSocioeconomico): Promise<string[]> {
    return this.repository.listarReferencias(filtro);
  }
}

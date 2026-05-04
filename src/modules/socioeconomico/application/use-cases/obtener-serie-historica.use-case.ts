import { Inject, Injectable } from '@nestjs/common';
import { SerieHistoricaPunto } from '../../domain/entities/serie-historica-punto.entity';
import {
  FiltroSocioeconomico,
  SOCIOECONOMICO_REPOSITORY,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';

@Injectable()
export class ObtenerSerieHistoricaUseCase {
  constructor(
    @Inject(SOCIOECONOMICO_REPOSITORY) private readonly repository: SocioeconomicoRepositoryPort,
  ) {}

  execute(filtro: FiltroSocioeconomico): Promise<SerieHistoricaPunto[]> {
    return this.repository.obtenerSerieHistorica(filtro);
  }
}

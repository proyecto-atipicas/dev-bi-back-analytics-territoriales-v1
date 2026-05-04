import { Inject, Injectable } from '@nestjs/common';
import { IndicadorPorDepartamento } from '../../domain/entities/indicador-departamento.entity';
import {
  FiltroSocioeconomico,
  SOCIOECONOMICO_REPOSITORY,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';

@Injectable()
export class ObtenerPorDepartamentoSocioeconomicoUseCase {
  constructor(
    @Inject(SOCIOECONOMICO_REPOSITORY) private readonly repository: SocioeconomicoRepositoryPort,
  ) {}

  execute(filtro: FiltroSocioeconomico): Promise<IndicadorPorDepartamento[]> {
    return this.repository.obtenerPorDepartamento(filtro);
  }
}

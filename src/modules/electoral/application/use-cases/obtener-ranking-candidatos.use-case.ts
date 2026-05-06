import { Inject, Injectable } from '@nestjs/common';
import { RankingCandidato } from '../../domain/entities/ranking-candidato.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroElectoral } from '../../domain/value-objects/filtro-electoral.vo';

const LIMITE_DEFAULT = 50;
const LIMITE_MAX = 500;

@Injectable()
export class ObtenerRankingCandidatosUseCase {
  constructor(@Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort) {}

  execute(filtro: FiltroElectoral, limite = LIMITE_DEFAULT): Promise<RankingCandidato[]> {
    const lim = Math.min(Math.max(limite, 1), LIMITE_MAX);
    return this.repository.obtenerRankingCandidatos(filtro, lim);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { RankingPartido } from '../../domain/entities/ranking-partido.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroElectoral } from '../../domain/value-objects/filtro-electoral.vo';

const LIMITE_DEFAULT = 20;
const LIMITE_MAX = 200;

@Injectable()
export class ObtenerRankingPartidosUseCase {
  constructor(@Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort) {}

  execute(filtro: FiltroElectoral, limite = LIMITE_DEFAULT): Promise<RankingPartido[]> {
    const lim = Math.min(Math.max(limite, 1), LIMITE_MAX);
    return this.repository.obtenerRankingPartidos(filtro, lim);
  }
}

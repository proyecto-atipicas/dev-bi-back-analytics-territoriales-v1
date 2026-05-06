import { Inject, Injectable } from '@nestjs/common';
import { VotosPorDepartamento } from '../../domain/entities/votos-departamento.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroElectoral } from '../../domain/value-objects/filtro-electoral.vo';

@Injectable()
export class ObtenerVotosPorDepartamentoUseCase {
  constructor(@Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort) {}

  execute(filtro: FiltroElectoral): Promise<VotosPorDepartamento[]> {
    return this.repository.obtenerVotosPorDepartamento(filtro);
  }
}

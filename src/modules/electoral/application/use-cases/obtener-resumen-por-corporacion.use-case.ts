import { Inject, Injectable } from '@nestjs/common';
import { ResumenCorporacion } from '../../domain/entities/resumen-corporacion.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroElectoral } from '../../domain/value-objects/filtro-electoral.vo';

@Injectable()
export class ObtenerResumenPorCorporacionUseCase {
  constructor(@Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort) {}

  execute(filtro: FiltroElectoral): Promise<ResumenCorporacion[]> {
    return this.repository.obtenerResumenPorCorporacion(filtro);
  }
}

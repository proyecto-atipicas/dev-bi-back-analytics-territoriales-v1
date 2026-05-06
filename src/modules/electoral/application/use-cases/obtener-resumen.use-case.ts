import { Inject, Injectable } from '@nestjs/common';
import { ResumenElectoral } from '../../domain/entities/resumen-electoral.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroElectoral } from '../../domain/value-objects/filtro-electoral.vo';

@Injectable()
export class ObtenerResumenUseCase {
  constructor(@Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort) {}

  execute(filtro: FiltroElectoral): Promise<ResumenElectoral> {
    return this.repository.obtenerResumen(filtro);
  }
}

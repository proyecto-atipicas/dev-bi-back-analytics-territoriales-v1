import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { VotosPorPuesto } from '../../domain/entities/votos-puesto.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroElectoral } from '../../domain/value-objects/filtro-electoral.vo';

@Injectable()
export class ObtenerVotosPorPuestoUseCase {
  constructor(@Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort) {}

  execute(filtro: FiltroElectoral): Promise<VotosPorPuesto[]> {
    if (!filtro.codigoDepartamento || !filtro.codigoMunicipio) {
      throw new BadRequestException(
        'Para consultar votos por puesto se requieren codigoDepartamento y codigoMunicipio',
      );
    }
    return this.repository.obtenerVotosPorPuesto(filtro);
  }
}

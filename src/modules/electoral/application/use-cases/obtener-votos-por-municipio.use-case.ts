import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { VotosPorMunicipio } from '../../domain/entities/votos-municipio.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroElectoral } from '../../domain/value-objects/filtro-electoral.vo';

@Injectable()
export class ObtenerVotosPorMunicipioUseCase {
  constructor(
    @Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort,
  ) {}

  execute(filtro: FiltroElectoral): Promise<VotosPorMunicipio[]> {
    if (!filtro.codigoDepartamento) {
      throw new BadRequestException(
        'Para consultar votos por municipio se requiere codigoDepartamento',
      );
    }
    return this.repository.obtenerVotosPorMunicipio(filtro);
  }
}

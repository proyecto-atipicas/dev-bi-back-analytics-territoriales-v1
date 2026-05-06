import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ComparativoTerritorialResultado } from '../../domain/entities/comparativo-territorial.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroComparativoTerritorial } from '../../domain/value-objects/filtro-comparativo-territorial.vo';

@Injectable()
export class CompararTerritorialUseCase {
  constructor(@Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort) {}

  execute(filtro: FiltroComparativoTerritorial): Promise<ComparativoTerritorialResultado> {
    if (!filtro.codigoCorporacion) {
      throw new BadRequestException('codigoCorporacion es obligatorio');
    }
    if (!filtro.codigoA || !filtro.codigoB) {
      throw new BadRequestException('codigoA y codigoB son obligatorios');
    }
    if (filtro.tipo !== 'partido' && filtro.tipo !== 'candidato') {
      throw new BadRequestException('tipo debe ser "partido" o "candidato"');
    }
    if (filtro.codigoMunicipio && !filtro.codigoDepartamento) {
      throw new BadRequestException('codigoMunicipio requiere codigoDepartamento');
    }

    if (filtro.tipo === 'candidato') {
      // codigo_candidato se reinicia por partido — la clave única es la
      // tupla (codigo_candidato, codigo_partido). Sin partido, mezclaríamos
      // votos de candidatos homónimos en partidos distintos.
      if (!filtro.codigoPartidoA || !filtro.codigoPartidoB) {
        throw new BadRequestException(
          'codigoPartidoA y codigoPartidoB son obligatorios cuando tipo=candidato',
        );
      }
      if (filtro.codigoA === filtro.codigoB && filtro.codigoPartidoA === filtro.codigoPartidoB) {
        throw new BadRequestException(
          'No se puede comparar el mismo candidato consigo mismo (codigo + codigoPartido idénticos)',
        );
      }
    } else {
      if (filtro.codigoA === filtro.codigoB) {
        throw new BadRequestException('codigoA y codigoB no pueden ser iguales');
      }
    }

    return this.repository.compararTerritorial(filtro);
  }
}

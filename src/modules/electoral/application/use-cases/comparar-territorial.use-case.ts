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
    if (!filtro.codigoCorporacionA || !filtro.codigoCorporacionB) {
      throw new BadRequestException('codigoCorporacionA y codigoCorporacionB son obligatorios');
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

    // Cuando las corporaciones difieren, A y B viven en elecciones distintas:
    // incluso un mismo código/partido es una comparación válida (ej. el mismo
    // candidato en dos procesos). Sólo bloqueamos el "consigo mismo" cuando
    // todo coincide dentro de la misma corporación.
    const mismaCorporacion = filtro.codigoCorporacionA === filtro.codigoCorporacionB;

    if (filtro.tipo === 'candidato') {
      // codigo_candidato se reinicia por partido — la clave única es la
      // tupla (codigo_candidato, codigo_partido). Sin partido, mezclaríamos
      // votos de candidatos homónimos en partidos distintos.
      if (!filtro.codigoPartidoA || !filtro.codigoPartidoB) {
        throw new BadRequestException(
          'codigoPartidoA y codigoPartidoB son obligatorios cuando tipo=candidato',
        );
      }
      if (
        mismaCorporacion &&
        filtro.codigoA === filtro.codigoB &&
        filtro.codigoPartidoA === filtro.codigoPartidoB
      ) {
        throw new BadRequestException(
          'No se puede comparar el mismo candidato consigo mismo (corporación + codigo + codigoPartido idénticos)',
        );
      }
    } else {
      if (mismaCorporacion && filtro.codigoA === filtro.codigoB) {
        throw new BadRequestException(
          'codigoA y codigoB no pueden ser iguales dentro de la misma corporación',
        );
      }
    }

    return this.repository.compararTerritorial(filtro);
  }
}

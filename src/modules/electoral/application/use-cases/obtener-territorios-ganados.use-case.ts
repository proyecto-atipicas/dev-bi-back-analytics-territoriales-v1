import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { TerritoriosGanadosResultado } from '../../domain/entities/territorios-ganados.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroTerritoriosGanados } from '../../domain/value-objects/filtro-territorios-ganados.vo';

@Injectable()
export class ObtenerTerritoriosGanadosUseCase {
  constructor(@Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort) {}

  execute(filtro: FiltroTerritoriosGanados): Promise<TerritoriosGanadosResultado> {
    if (!filtro.codigoCorporacion) {
      throw new BadRequestException('codigoCorporacion es obligatorio');
    }
    if (!filtro.codigo) {
      throw new BadRequestException('codigo es obligatorio');
    }
    if (filtro.tipo !== 'partido' && filtro.tipo !== 'candidato') {
      throw new BadRequestException('tipo debe ser "partido" o "candidato"');
    }
    if (filtro.nivel !== 'departamento' && filtro.nivel !== 'municipio') {
      throw new BadRequestException('nivel debe ser "departamento" o "municipio"');
    }
    if (filtro.tipo === 'candidato' && !filtro.codigoPartido) {
      // codigo_candidato se reinicia por partido — sin codigoPartido no podemos
      // desambiguar la identidad del candidato.
      throw new BadRequestException('codigoPartido es obligatorio cuando tipo=candidato');
    }

    return this.repository.obtenerTerritoriosGanados(filtro);
  }
}

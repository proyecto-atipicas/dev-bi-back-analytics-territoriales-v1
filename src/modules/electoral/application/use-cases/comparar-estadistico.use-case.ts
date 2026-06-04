import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ComparativoEstadisticoResultado } from '../../domain/entities/comparativo-estadistico.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroComparativoEstadistico } from '../../domain/value-objects/filtro-comparativo-estadistico.vo';

/** Máximo de candidatos comparables a la vez (legibilidad + costo de query). */
const MAX_CANDIDATOS = 12;

@Injectable()
export class CompararEstadisticoUseCase {
  constructor(@Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort) {}

  execute(filtro: FiltroComparativoEstadistico): Promise<ComparativoEstadisticoResultado> {
    const candidatos = filtro.candidatos ?? [];

    if (candidatos.length < 2) {
      throw new BadRequestException(
        'El comparativo estadístico requiere al menos 2 candidatos seleccionados.',
      );
    }
    if (candidatos.length > MAX_CANDIDATOS) {
      throw new BadRequestException(
        `No se pueden comparar más de ${MAX_CANDIDATOS} candidatos a la vez.`,
      );
    }
    for (const c of candidatos) {
      if (!c.codigoCorporacion || !c.codigo) {
        throw new BadRequestException('Cada candidato requiere codigoCorporacion y codigo.');
      }
    }
    // Las claves deben ser únicas — un mismo candidato no puede ir dos veces.
    const claves = new Set(candidatos.map((c) => c.key));
    if (claves.size !== candidatos.length) {
      throw new BadRequestException('Hay candidatos duplicados en la selección.');
    }

    return this.repository.compararEstadistico(filtro);
  }
}

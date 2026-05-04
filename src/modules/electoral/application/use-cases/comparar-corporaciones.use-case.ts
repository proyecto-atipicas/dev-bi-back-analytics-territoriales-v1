import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ComparativoCorporacion } from '../../domain/entities/comparativo-corporacion.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroComparativoCorporacion } from '../../domain/value-objects/filtro-comparativo.vo';

const MIN_ITEMS = 2;
const MAX_ITEMS = 8;

@Injectable()
export class CompararCorporacionesUseCase {
  constructor(
    @Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort,
  ) {}

  execute(filtro: FiltroComparativoCorporacion): Promise<ComparativoCorporacion[]> {
    const codigos = Array.from(new Set(filtro.codigosCorporacion ?? []))
      .map((c) => c?.trim())
      .filter((c): c is string => !!c);

    if (codigos.length < MIN_ITEMS) {
      throw new BadRequestException(
        `Se requieren al menos ${MIN_ITEMS} corporaciones para comparar`,
      );
    }
    if (codigos.length > MAX_ITEMS) {
      throw new BadRequestException(
        `Máximo ${MAX_ITEMS} corporaciones por comparativo`,
      );
    }

    return this.repository.compararCorporaciones(
      new FiltroComparativoCorporacion(
        codigos,
        filtro.codigoDepartamento,
        filtro.codigoMunicipio,
      ),
    );
  }
}

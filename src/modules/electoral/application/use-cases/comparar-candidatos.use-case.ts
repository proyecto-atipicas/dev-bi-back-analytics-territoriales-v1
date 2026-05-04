import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ComparativoCandidato } from '../../domain/entities/comparativo-candidato.entity';
import {
  ELECTORAL_REPOSITORY,
  ElectoralRepositoryPort,
} from '../../domain/ports/electoral.repository.port';
import { FiltroComparativoCandidato } from '../../domain/value-objects/filtro-comparativo.vo';

const MIN_ITEMS = 2;
const MAX_ITEMS = 12;

@Injectable()
export class CompararCandidatosUseCase {
  constructor(
    @Inject(ELECTORAL_REPOSITORY) private readonly repository: ElectoralRepositoryPort,
  ) {}

  execute(filtro: FiltroComparativoCandidato): Promise<ComparativoCandidato[]> {
    const codigos = Array.from(new Set(filtro.codigosCandidato ?? []))
      .map((c) => c?.trim())
      .filter((c): c is string => !!c);

    if (codigos.length < MIN_ITEMS) {
      throw new BadRequestException(
        `Se requieren al menos ${MIN_ITEMS} candidatos para comparar`,
      );
    }
    if (codigos.length > MAX_ITEMS) {
      throw new BadRequestException(
        `Máximo ${MAX_ITEMS} candidatos por comparativo`,
      );
    }

    return this.repository.compararCandidatos(
      new FiltroComparativoCandidato(
        codigos,
        filtro.codigoDepartamento,
        filtro.codigoMunicipio,
      ),
    );
  }
}

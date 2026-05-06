import { Inject, Injectable } from '@nestjs/common';
import { Candidato } from '../../domain/entities/candidato.entity';
import {
  CATALOGOS_REPOSITORY,
  CatalogosRepositoryPort,
  ListarCandidatosFiltros,
} from '../../domain/ports/catalogos.repository.port';

const LIMITE_DEFAULT = 200;
const LIMITE_MAX = 1000;

@Injectable()
export class ListarCandidatosUseCase {
  constructor(@Inject(CATALOGOS_REPOSITORY) private readonly repository: CatalogosRepositoryPort) {}

  execute(filtros: ListarCandidatosFiltros = {}): Promise<Candidato[]> {
    const limite = Math.min(filtros.limite ?? LIMITE_DEFAULT, LIMITE_MAX);
    return this.repository.listarCandidatos({ ...filtros, limite });
  }
}

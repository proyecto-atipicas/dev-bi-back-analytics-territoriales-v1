import { Inject, Injectable } from '@nestjs/common';
import {
  FiltroPoblacional,
  POBLACIONAL_REPOSITORY,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

@Injectable()
export class ListarCriteriosUseCase {
  constructor(
    @Inject(POBLACIONAL_REPOSITORY) private readonly repository: PoblacionalRepositoryPort,
  ) {}

  execute(filtro: FiltroPoblacional): Promise<string[]> {
    return this.repository.listarCriterios(filtro);
  }
}

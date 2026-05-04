import { Inject, Injectable } from '@nestjs/common';
import {
  POBLACIONAL_REPOSITORY,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

@Injectable()
export class ListarDimensionesUseCase {
  constructor(
    @Inject(POBLACIONAL_REPOSITORY) private readonly repository: PoblacionalRepositoryPort,
  ) {}

  execute(): Promise<string[]> {
    return this.repository.listarDimensiones();
  }
}

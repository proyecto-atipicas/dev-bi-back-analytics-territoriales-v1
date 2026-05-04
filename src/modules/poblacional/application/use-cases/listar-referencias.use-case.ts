import { Inject, Injectable } from '@nestjs/common';
import {
  POBLACIONAL_REPOSITORY,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

@Injectable()
export class ListarReferenciasUseCase {
  constructor(
    @Inject(POBLACIONAL_REPOSITORY) private readonly repository: PoblacionalRepositoryPort,
  ) {}

  execute(dimension?: string | null, fuente?: string | null): Promise<string[]> {
    return this.repository.listarReferencias(dimension ?? null, fuente ?? null);
  }
}

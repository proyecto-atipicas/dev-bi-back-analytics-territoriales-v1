import { Inject, Injectable } from '@nestjs/common';
import { ResumenDimension } from '../../domain/entities/resumen-dimension.entity';
import {
  POBLACIONAL_REPOSITORY,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

@Injectable()
export class ListarResumenDimensionesUseCase {
  constructor(
    @Inject(POBLACIONAL_REPOSITORY) private readonly repository: PoblacionalRepositoryPort,
  ) {}

  execute(): Promise<ResumenDimension[]> {
    return this.repository.listarResumenDimensiones();
  }
}

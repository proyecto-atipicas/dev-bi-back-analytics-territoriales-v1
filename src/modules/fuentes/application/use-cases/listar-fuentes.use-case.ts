import { Inject, Injectable } from '@nestjs/common';
import { Fuente } from '../../domain/entities/fuente.entity';
import {
  FiltroFuentes,
  FUENTES_REPOSITORY,
  FuentesRepositoryPort,
} from '../../domain/ports/fuentes.repository.port';

@Injectable()
export class ListarFuentesUseCase {
  constructor(@Inject(FUENTES_REPOSITORY) private readonly repository: FuentesRepositoryPort) {}

  execute(filtro: FiltroFuentes): Promise<Fuente[]> {
    return this.repository.listar(filtro);
  }
}

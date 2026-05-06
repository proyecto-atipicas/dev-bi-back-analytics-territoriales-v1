import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ResumenDepartamentoCategoria } from '../../domain/entities/resumen-departamento-categoria.entity';
import {
  FiltroSocioeconomico,
  SOCIOECONOMICO_REPOSITORY,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';

@Injectable()
export class ObtenerResumenDepartamentoUseCase {
  constructor(
    @Inject(SOCIOECONOMICO_REPOSITORY)
    private readonly repository: SocioeconomicoRepositoryPort,
  ) {}

  execute(filtro: FiltroSocioeconomico): Promise<ResumenDepartamentoCategoria[]> {
    if (!filtro.codigoDepartamento) {
      throw new BadRequestException(
        'codigoDepartamento es obligatorio para el resumen por departamento',
      );
    }
    return this.repository.obtenerResumenDepartamento(filtro);
  }
}

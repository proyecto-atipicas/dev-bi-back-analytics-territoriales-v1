import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Municipio } from '../../domain/entities/municipio.entity';
import { GEO_REPOSITORY, GeoRepositoryPort } from '../../domain/ports/geo.repository.port';

@Injectable()
export class ListarMunicipiosUseCase {
  constructor(@Inject(GEO_REPOSITORY) private readonly repository: GeoRepositoryPort) {}

  execute(codigoDepartamento: string): Promise<Municipio[]> {
    if (!codigoDepartamento || codigoDepartamento.trim() === '') {
      throw new BadRequestException('codigoDepartamento es requerido');
    }
    return this.repository.listarMunicipios(codigoDepartamento.trim());
  }
}

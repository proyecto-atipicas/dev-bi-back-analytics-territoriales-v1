import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Puesto } from '../../domain/entities/puesto.entity';
import { GEO_REPOSITORY, GeoRepositoryPort } from '../../domain/ports/geo.repository.port';

@Injectable()
export class ListarPuestosUseCase {
  constructor(
    @Inject(GEO_REPOSITORY) private readonly repository: GeoRepositoryPort,
  ) {}

  execute(codigoDepartamento: string, codigoMunicipio: string): Promise<Puesto[]> {
    if (!codigoDepartamento || codigoDepartamento.trim() === '') {
      throw new BadRequestException('codigoDepartamento es requerido');
    }
    if (!codigoMunicipio || codigoMunicipio.trim() === '') {
      throw new BadRequestException('codigoMunicipio es requerido');
    }
    return this.repository.listarPuestos(codigoDepartamento.trim(), codigoMunicipio.trim());
  }
}

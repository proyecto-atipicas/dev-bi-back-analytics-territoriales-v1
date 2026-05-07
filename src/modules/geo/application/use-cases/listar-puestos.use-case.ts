import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import { Puesto } from '../../domain/entities/puesto.entity';
import { GEO_REPOSITORY, GeoRepositoryPort } from '../../domain/ports/geo.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarPuestosUseCase {
  constructor(
    @Inject(GEO_REPOSITORY) private readonly repository: GeoRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(codigoDepartamento: string, codigoMunicipio: string): Promise<Puesto[]> {
    if (!codigoDepartamento || codigoDepartamento.trim() === '') {
      throw new BadRequestException('codigoDepartamento es requerido');
    }
    if (!codigoMunicipio || codigoMunicipio.trim() === '') {
      throw new BadRequestException('codigoMunicipio es requerido');
    }
    const dep = codigoDepartamento.trim();
    const mun = codigoMunicipio.trim();
    return this.cache.getOrSet(`geo:puestos:${dep}:${mun}`, TTL_MS, () =>
      this.repository.listarPuestos(dep, mun),
    );
  }
}

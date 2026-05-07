import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { TtlCacheService } from '../../../../shared/cache/ttl-cache.service';
import { Municipio } from '../../domain/entities/municipio.entity';
import { GEO_REPOSITORY, GeoRepositoryPort } from '../../domain/ports/geo.repository.port';

const TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ListarMunicipiosUseCase {
  constructor(
    @Inject(GEO_REPOSITORY) private readonly repository: GeoRepositoryPort,
    private readonly cache: TtlCacheService,
  ) {}

  execute(codigoDepartamento: string): Promise<Municipio[]> {
    if (!codigoDepartamento || codigoDepartamento.trim() === '') {
      throw new BadRequestException('codigoDepartamento es requerido');
    }
    const codigo = codigoDepartamento.trim();
    return this.cache.getOrSet(`geo:municipios:${codigo}`, TTL_MS, () =>
      this.repository.listarMunicipios(codigo),
    );
  }
}

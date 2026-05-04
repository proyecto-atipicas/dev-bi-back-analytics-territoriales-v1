import { Inject, Injectable } from '@nestjs/common';
import { DatabasePort } from '../../../../shared/database/database.port';
import { DATABASE_PORT } from '../../../../shared/database/database.tokens';
import { Departamento } from '../../domain/entities/departamento.entity';
import { Municipio } from '../../domain/entities/municipio.entity';
import { Puesto } from '../../domain/entities/puesto.entity';
import { GeoRepositoryPort } from '../../domain/ports/geo.repository.port';

interface DepartamentoRow {
  codigo_departamento: string;
  nombre_departamento: string;
}

interface MunicipioRow {
  codigo_municipio: string;
  nombre_municipio: string;
  codigo_departamento: string;
}

interface PuestoRow {
  codigo_puesto: string;
  nombre_puesto: string;
  codigo_municipio: string;
  codigo_zona: string | null;
}

@Injectable()
export class PostgresGeoRepository implements GeoRepositoryPort {
  constructor(@Inject(DATABASE_PORT) private readonly db: DatabasePort) {}

  async listarDepartamentos(): Promise<Departamento[]> {
    const rows = await this.db.query<DepartamentoRow>(
      `SELECT DISTINCT codigo_departamento, nombre_departamento
       FROM dim_divipole
       WHERE codigo_departamento IS NOT NULL
         AND nombre_departamento IS NOT NULL
       ORDER BY nombre_departamento ASC`,
    );
    return rows.map((r) => new Departamento(r.codigo_departamento, r.nombre_departamento));
  }

  async listarMunicipios(codigoDepartamento: string): Promise<Municipio[]> {
    const rows = await this.db.query<MunicipioRow>(
      `SELECT DISTINCT codigo_municipio, nombre_municipio, codigo_departamento
       FROM dim_divipole
       WHERE codigo_departamento = $1
         AND codigo_municipio IS NOT NULL
         AND nombre_municipio IS NOT NULL
       ORDER BY nombre_municipio ASC`,
      [codigoDepartamento],
    );
    return rows.map(
      (r) => new Municipio(r.codigo_municipio, r.nombre_municipio, r.codigo_departamento),
    );
  }

  async listarPuestos(codigoDepartamento: string, codigoMunicipio: string): Promise<Puesto[]> {
    const rows = await this.db.query<PuestoRow>(
      `SELECT DISTINCT codigo_puesto, nombre_puesto, codigo_municipio, codigo_zona
       FROM dim_divipole
       WHERE codigo_departamento = $1
         AND codigo_municipio = $2
         AND codigo_puesto IS NOT NULL
         AND nombre_puesto IS NOT NULL
       ORDER BY nombre_puesto ASC`,
      [codigoDepartamento, codigoMunicipio],
    );
    return rows.map(
      (r) => new Puesto(r.codigo_puesto, r.nombre_puesto, r.codigo_municipio, r.codigo_zona),
    );
  }
}

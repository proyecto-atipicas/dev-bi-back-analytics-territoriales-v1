import { Inject, Injectable } from '@nestjs/common';
import { DatabasePort } from '../../../../shared/database/database.port';
import { DATABASE_PORT } from '../../../../shared/database/database.tokens';
import { Candidato } from '../../domain/entities/candidato.entity';
import { Corporacion } from '../../domain/entities/corporacion.entity';
import { Partido } from '../../domain/entities/partido.entity';
import {
  CatalogosRepositoryPort,
  ListarCandidatosFiltros,
  ListarPartidosFiltros,
} from '../../domain/ports/catalogos.repository.port';

interface CorporacionRow {
  codigo_corporacion: string;
  nombre_corporacion: string;
}

interface PartidoRow {
  codigo_partido: string;
  nombre_partido: string;
}

interface CandidatoRow {
  codigo_candidato: string;
  nombre_candidato: string;
  codigo_partido: string | null;
  codigo_corporacion: string | null;
  nombre_partido: string | null;
}

@Injectable()
export class PostgresCatalogosRepository implements CatalogosRepositoryPort {
  constructor(@Inject(DATABASE_PORT) private readonly db: DatabasePort) {}

  async listarCorporaciones(): Promise<Corporacion[]> {
    const rows = await this.db.query<CorporacionRow>(
      `SELECT DISTINCT codigo_corporacion, nombre_corporacion
       FROM data_election
       WHERE codigo_corporacion IS NOT NULL
         AND nombre_corporacion IS NOT NULL
       ORDER BY nombre_corporacion ASC`,
    );
    return rows.map((r) => new Corporacion(r.codigo_corporacion, r.nombre_corporacion));
  }

  async listarPartidos(filtros: ListarPartidosFiltros): Promise<Partido[]> {
    const params: unknown[] = [];
    const conds: string[] = ['codigo_partido IS NOT NULL', 'nombre_partido IS NOT NULL'];
    if (filtros.codigoCorporacion) {
      params.push(filtros.codigoCorporacion);
      conds.push(`codigo_corporacion = $${params.length}`);
    }
    const rows = await this.db.query<PartidoRow>(
      `SELECT DISTINCT codigo_partido, nombre_partido
       FROM data_election
       WHERE ${conds.join(' AND ')}
       ORDER BY nombre_partido ASC`,
      params,
    );
    return rows.map((r) => new Partido(r.codigo_partido, r.nombre_partido));
  }

  async listarCandidatos(filtros: ListarCandidatosFiltros): Promise<Candidato[]> {
    const params: unknown[] = [];
    const conds: string[] = ['codigo_candidato IS NOT NULL', 'nombre_candidato IS NOT NULL'];
    if (filtros.codigoCorporacion) {
      params.push(filtros.codigoCorporacion);
      conds.push(`codigo_corporacion = $${params.length}`);
    }
    if (filtros.codigoPartido) {
      params.push(filtros.codigoPartido);
      conds.push(`codigo_partido = $${params.length}`);
    }
    params.push(filtros.limite ?? 200);
    const limiteIdx = params.length;

    const rows = await this.db.query<CandidatoRow>(
      `SELECT DISTINCT codigo_candidato, nombre_candidato, codigo_partido, codigo_corporacion, nombre_partido
       FROM data_election
       WHERE ${conds.join(' AND ')}
       ORDER BY nombre_candidato ASC
       LIMIT $${limiteIdx}`,
      params,
    );
    return rows.map(
      (r) =>
        new Candidato(
          r.codigo_candidato,
          r.nombre_candidato,
          r.codigo_partido,
          r.codigo_corporacion,
          r.nombre_partido,
        ),
    );
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { DatabasePort } from '../../../../shared/database/database.port';
import { DATABASE_PORT } from '../../../../shared/database/database.tokens';
import { ComparativoCandidato } from '../../domain/entities/comparativo-candidato.entity';
import { ComparativoCorporacion } from '../../domain/entities/comparativo-corporacion.entity';
import { RankingCandidato } from '../../domain/entities/ranking-candidato.entity';
import { RankingPartido } from '../../domain/entities/ranking-partido.entity';
import { ResumenCorporacion } from '../../domain/entities/resumen-corporacion.entity';
import { ResumenElectoral } from '../../domain/entities/resumen-electoral.entity';
import { VotosPorDepartamento } from '../../domain/entities/votos-departamento.entity';
import { VotosPorMunicipio } from '../../domain/entities/votos-municipio.entity';
import { VotosPorPuesto } from '../../domain/entities/votos-puesto.entity';
import { ElectoralRepositoryPort } from '../../domain/ports/electoral.repository.port';
import {
  FiltroComparativoCandidato,
  FiltroComparativoCorporacion,
} from '../../domain/value-objects/filtro-comparativo.vo';
import { FiltroElectoral } from '../../domain/value-objects/filtro-electoral.vo';
import { buildFiltroElectoralSql } from './filtro-electoral.sql';

interface ResumenRow {
  total_votos: string | null;
  total_candidatos: string | null;
  total_partidos: string | null;
  total_corporaciones: string | null;
  total_departamentos: string | null;
  total_municipios: string | null;
}

interface VotosDepartamentoRow {
  codigo_departamento: string;
  nombre_departamento: string;
  total_votos: string | null;
}

interface VotosMunicipioRow {
  codigo_departamento: string;
  codigo_municipio: string;
  nombre_municipio: string;
  total_votos: string | null;
}

interface VotosPuestoRow {
  codigo_departamento: string;
  codigo_municipio: string;
  codigo_puesto: string;
  nombre_puesto: string;
  total_votos: string | null;
}

interface RankingPartidoRow {
  codigo_partido: string;
  nombre_partido: string;
  total_votos: string | null;
  total_candidatos: string | null;
}

interface RankingCandidatoRow {
  codigo_candidato: string;
  nombre_candidato: string;
  codigo_partido: string | null;
  nombre_partido: string | null;
  total_votos: string | null;
}

interface ResumenCorporacionRow {
  codigo_corporacion: string;
  nombre_corporacion: string;
  total_votos: string | null;
  total_candidatos: string | null;
  total_partidos: string | null;
  total_general: string | null;
}

interface ComparativoCorporacionRow {
  codigo_corporacion: string;
  nombre_corporacion: string;
  total_votos: string | null;
  total_candidatos: string | null;
  total_partidos: string | null;
  total_general: string | null;
}

interface ComparativoCandidatoRow {
  codigo_candidato: string;
  nombre_candidato: string;
  codigo_partido: string | null;
  nombre_partido: string | null;
  codigo_corporacion: string | null;
  nombre_corporacion: string | null;
  total_votos: string | null;
  total_general: string | null;
}

const toInt = (v: string | null | undefined): number => (v == null ? 0 : parseInt(v, 10));
const toNum = (v: string | null | undefined): number => (v == null ? 0 : Number(v));

@Injectable()
export class PostgresElectoralRepository implements ElectoralRepositoryPort {
  constructor(@Inject(DATABASE_PORT) private readonly db: DatabasePort) {}

  async obtenerResumen(filtro: FiltroElectoral): Promise<ResumenElectoral> {
    const { whereClause, params } = buildFiltroElectoralSql(filtro);
    const sql = `
      SELECT
        COALESCE(SUM(total_votos), 0)            AS total_votos,
        COUNT(DISTINCT codigo_candidato)         AS total_candidatos,
        COUNT(DISTINCT codigo_partido)           AS total_partidos,
        COUNT(DISTINCT codigo_corporacion)       AS total_corporaciones,
        COUNT(DISTINCT codigo_departamento)      AS total_departamentos,
        COUNT(DISTINCT codigo_municipio)         AS total_municipios
      FROM data_election
      WHERE ${whereClause}
    `;
    const row = await this.db.queryOne<ResumenRow>(sql, params);
    return new ResumenElectoral(
      toNum(row?.total_votos ?? null),
      toInt(row?.total_candidatos ?? null),
      toInt(row?.total_partidos ?? null),
      toInt(row?.total_corporaciones ?? null),
      toInt(row?.total_departamentos ?? null),
      toInt(row?.total_municipios ?? null),
    );
  }

  async obtenerVotosPorDepartamento(filtro: FiltroElectoral): Promise<VotosPorDepartamento[]> {
    const { whereClause, params } = buildFiltroElectoralSql(filtro, 'e');
    const sql = `
      WITH dep AS (
        SELECT codigo_departamento, MAX(nombre_departamento) AS nombre_departamento
        FROM dim_divipole
        WHERE codigo_departamento IS NOT NULL
        GROUP BY codigo_departamento
      )
      SELECT
        e.codigo_departamento,
        COALESCE(dep.nombre_departamento, e.codigo_departamento) AS nombre_departamento,
        COALESCE(SUM(e.total_votos), 0) AS total_votos
      FROM data_election e
      LEFT JOIN dep ON dep.codigo_departamento = e.codigo_departamento
      WHERE ${whereClause}
      GROUP BY e.codigo_departamento, dep.nombre_departamento
      ORDER BY total_votos DESC
    `;
    const rows = await this.db.query<VotosDepartamentoRow>(sql, params);
    return rows.map(
      (r) =>
        new VotosPorDepartamento(r.codigo_departamento, r.nombre_departamento, toNum(r.total_votos)),
    );
  }

  async obtenerVotosPorMunicipio(filtro: FiltroElectoral): Promise<VotosPorMunicipio[]> {
    const { whereClause, params } = buildFiltroElectoralSql(filtro, 'e');
    const sql = `
      WITH mun AS (
        SELECT codigo_departamento, codigo_municipio, MAX(nombre_municipio) AS nombre_municipio
        FROM dim_divipole
        WHERE codigo_municipio IS NOT NULL
        GROUP BY codigo_departamento, codigo_municipio
      )
      SELECT
        e.codigo_departamento,
        e.codigo_municipio,
        COALESCE(mun.nombre_municipio, e.codigo_municipio) AS nombre_municipio,
        COALESCE(SUM(e.total_votos), 0) AS total_votos
      FROM data_election e
      LEFT JOIN mun
        ON mun.codigo_departamento = e.codigo_departamento
       AND mun.codigo_municipio    = e.codigo_municipio
      WHERE ${whereClause}
      GROUP BY e.codigo_departamento, e.codigo_municipio, mun.nombre_municipio
      ORDER BY total_votos DESC
    `;
    const rows = await this.db.query<VotosMunicipioRow>(sql, params);
    return rows.map(
      (r) =>
        new VotosPorMunicipio(
          r.codigo_departamento,
          r.codigo_municipio,
          r.nombre_municipio,
          toNum(r.total_votos),
        ),
    );
  }

  async obtenerVotosPorPuesto(filtro: FiltroElectoral): Promise<VotosPorPuesto[]> {
    const { whereClause, params } = buildFiltroElectoralSql(filtro, 'e');
    const sql = `
      WITH puesto AS (
        SELECT
          codigo_departamento,
          codigo_municipio,
          codigo_puesto,
          MAX(nombre_puesto) AS nombre_puesto
        FROM dim_divipole
        WHERE codigo_puesto IS NOT NULL
        GROUP BY codigo_departamento, codigo_municipio, codigo_puesto
      )
      SELECT
        e.codigo_departamento,
        e.codigo_municipio,
        e.codigo_puesto,
        COALESCE(puesto.nombre_puesto, e.codigo_puesto) AS nombre_puesto,
        COALESCE(SUM(e.total_votos), 0) AS total_votos
      FROM data_election e
      LEFT JOIN puesto
        ON puesto.codigo_departamento = e.codigo_departamento
       AND puesto.codigo_municipio    = e.codigo_municipio
       AND puesto.codigo_puesto       = e.codigo_puesto
      WHERE ${whereClause}
        AND e.codigo_puesto IS NOT NULL
      GROUP BY e.codigo_departamento, e.codigo_municipio, e.codigo_puesto, puesto.nombre_puesto
      ORDER BY total_votos DESC
    `;
    const rows = await this.db.query<VotosPuestoRow>(sql, params);
    return rows.map(
      (r) =>
        new VotosPorPuesto(
          r.codigo_departamento,
          r.codigo_municipio,
          r.codigo_puesto,
          r.nombre_puesto,
          toNum(r.total_votos),
        ),
    );
  }

  async obtenerRankingPartidos(
    filtro: FiltroElectoral,
    limite: number,
  ): Promise<RankingPartido[]> {
    const { whereClause, params } = buildFiltroElectoralSql(filtro);
    params.push(limite);
    const limiteIdx = params.length;

    const sql = `
      SELECT
        codigo_partido,
        MAX(nombre_partido) AS nombre_partido,
        COALESCE(SUM(total_votos), 0)    AS total_votos,
        COUNT(DISTINCT codigo_candidato) AS total_candidatos
      FROM data_election
      WHERE ${whereClause}
        AND codigo_partido IS NOT NULL
      GROUP BY codigo_partido
      ORDER BY total_votos DESC
      LIMIT $${limiteIdx}
    `;
    const rows = await this.db.query<RankingPartidoRow>(sql, params);
    return rows.map(
      (r) =>
        new RankingPartido(
          r.codigo_partido,
          r.nombre_partido,
          toNum(r.total_votos),
          toInt(r.total_candidatos),
        ),
    );
  }

  async obtenerRankingCandidatos(
    filtro: FiltroElectoral,
    limite: number,
  ): Promise<RankingCandidato[]> {
    const { whereClause, params } = buildFiltroElectoralSql(filtro);
    params.push(limite);
    const limiteIdx = params.length;

    const sql = `
      SELECT
        codigo_candidato,
        MAX(nombre_candidato) AS nombre_candidato,
        codigo_partido,
        MAX(nombre_partido)   AS nombre_partido,
        COALESCE(SUM(total_votos), 0) AS total_votos
      FROM data_election
      WHERE ${whereClause}
        AND codigo_candidato IS NOT NULL
      GROUP BY codigo_candidato, codigo_partido
      ORDER BY total_votos DESC
      LIMIT $${limiteIdx}
    `;
    const rows = await this.db.query<RankingCandidatoRow>(sql, params);
    return rows.map(
      (r) =>
        new RankingCandidato(
          r.codigo_candidato,
          r.nombre_candidato,
          r.codigo_partido,
          r.nombre_partido,
          toNum(r.total_votos),
        ),
    );
  }

  async compararCorporaciones(
    filtro: FiltroComparativoCorporacion,
  ): Promise<ComparativoCorporacion[]> {
    const params: unknown[] = [];
    const placeholders = filtro.codigosCorporacion.map((c) => {
      params.push(c);
      return `$${params.length}`;
    });

    const conds: string[] = [`codigo_corporacion IN (${placeholders.join(', ')})`];

    if (filtro.codigoDepartamento) {
      params.push(filtro.codigoDepartamento);
      conds.push(`codigo_departamento = $${params.length}`);
    }
    if (filtro.codigoMunicipio) {
      params.push(filtro.codigoMunicipio);
      conds.push(`codigo_municipio = $${params.length}`);
    }

    const sql = `
      SELECT
        codigo_corporacion,
        MAX(nombre_corporacion) AS nombre_corporacion,
        COALESCE(SUM(total_votos), 0)    AS total_votos,
        COUNT(DISTINCT codigo_candidato) AS total_candidatos,
        COUNT(DISTINCT codigo_partido)   AS total_partidos,
        SUM(COALESCE(SUM(total_votos), 0)) OVER () AS total_general
      FROM data_election
      WHERE ${conds.join(' AND ')}
      GROUP BY codigo_corporacion
      ORDER BY total_votos DESC
    `;

    const rows = await this.db.query<ComparativoCorporacionRow>(sql, params);
    return rows.map((r) => {
      const totalGeneral = toNum(r.total_general);
      const totalVotos = toNum(r.total_votos);
      const participacionPct = totalGeneral > 0 ? (totalVotos / totalGeneral) * 100 : 0;
      return new ComparativoCorporacion(
        r.codigo_corporacion,
        r.nombre_corporacion,
        totalVotos,
        toInt(r.total_candidatos),
        toInt(r.total_partidos),
        Number(participacionPct.toFixed(2)),
      );
    });
  }

  async compararCandidatos(
    filtro: FiltroComparativoCandidato,
  ): Promise<ComparativoCandidato[]> {
    const params: unknown[] = [];
    const placeholders = filtro.codigosCandidato.map((c) => {
      params.push(c);
      return `$${params.length}`;
    });

    const conds: string[] = [`codigo_candidato IN (${placeholders.join(', ')})`];

    if (filtro.codigoDepartamento) {
      params.push(filtro.codigoDepartamento);
      conds.push(`codigo_departamento = $${params.length}`);
    }
    if (filtro.codigoMunicipio) {
      params.push(filtro.codigoMunicipio);
      conds.push(`codigo_municipio = $${params.length}`);
    }

    const sql = `
      SELECT
        codigo_candidato,
        MAX(nombre_candidato)   AS nombre_candidato,
        codigo_partido,
        MAX(nombre_partido)     AS nombre_partido,
        codigo_corporacion,
        MAX(nombre_corporacion) AS nombre_corporacion,
        COALESCE(SUM(total_votos), 0) AS total_votos,
        SUM(COALESCE(SUM(total_votos), 0)) OVER () AS total_general
      FROM data_election
      WHERE ${conds.join(' AND ')}
      GROUP BY codigo_candidato, codigo_partido, codigo_corporacion
      ORDER BY total_votos DESC
    `;

    const rows = await this.db.query<ComparativoCandidatoRow>(sql, params);
    return rows.map((r) => {
      const totalGeneral = toNum(r.total_general);
      const totalVotos = toNum(r.total_votos);
      const participacionPct = totalGeneral > 0 ? (totalVotos / totalGeneral) * 100 : 0;
      return new ComparativoCandidato(
        r.codigo_candidato,
        r.nombre_candidato,
        r.codigo_partido,
        r.nombre_partido,
        r.codigo_corporacion,
        r.nombre_corporacion,
        totalVotos,
        Number(participacionPct.toFixed(2)),
      );
    });
  }

  async obtenerResumenPorCorporacion(filtro: FiltroElectoral): Promise<ResumenCorporacion[]> {
    const { whereClause, params } = buildFiltroElectoralSql(filtro);
    // Una sola pasada por la tabla: agrupamos y obtenemos el total general con SUM() OVER ().
    const sql = `
      SELECT
        codigo_corporacion,
        MAX(nombre_corporacion) AS nombre_corporacion,
        COALESCE(SUM(total_votos), 0)    AS total_votos,
        COUNT(DISTINCT codigo_candidato) AS total_candidatos,
        COUNT(DISTINCT codigo_partido)   AS total_partidos,
        SUM(COALESCE(SUM(total_votos), 0)) OVER () AS total_general
      FROM data_election
      WHERE ${whereClause}
        AND codigo_corporacion IS NOT NULL
      GROUP BY codigo_corporacion
      ORDER BY total_votos DESC
    `;
    const rows = await this.db.query<ResumenCorporacionRow>(sql, params);
    return rows.map((r) => {
      const totalGeneral = toNum(r.total_general);
      const totalVotos = toNum(r.total_votos);
      const participacionPct = totalGeneral > 0 ? (totalVotos / totalGeneral) * 100 : 0;
      return new ResumenCorporacion(
        r.codigo_corporacion,
        r.nombre_corporacion,
        totalVotos,
        toInt(r.total_candidatos),
        toInt(r.total_partidos),
        Number(participacionPct.toFixed(2)),
      );
    });
  }
}

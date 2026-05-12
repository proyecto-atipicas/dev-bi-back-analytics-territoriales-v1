import { Inject, Injectable } from '@nestjs/common';
import { DatabasePort } from '../../../../shared/database/database.port';
import { DATABASE_PORT } from '../../../../shared/database/database.tokens';
import { IndicadorPorDepartamento } from '../../domain/entities/indicador-departamento.entity';
import { KpiSocioeconomico } from '../../domain/entities/kpi-socioeconomico.entity';
import { ResumenDepartamentoDimension } from '../../domain/entities/resumen-departamento-categoria.entity';
import { SerieHistoricaPunto } from '../../domain/entities/serie-historica-punto.entity';
import {
  FiltroSocioeconomico,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';

interface DimensionRow {
  dimension: string;
}

interface KpiRow {
  dimension: string;
  promedio: string | null;
  minimo: string | null;
  maximo: string | null;
  cantidad: string | null;
  periodo_min: string | null;
  periodo_max: string | null;
}

interface SerieRow {
  periodo: number | null;
  dimension: string | null;
  valor: string | null;
}

interface PorDepartamentoRow {
  codigo_departamento: string;
  departamento: string | null;
  nivel_riesgo: string | null;
  valor: string | null;
  periodo: number | null;
  dimension: string | null;
  serie_estadistica: string | null;
  nivel_geografico: string | null;
  referencia: string | null;
  observacion: string | null;
}

interface ResumenDepartamentoRow {
  codigo_departamento: string;
  departamento: string | null;
  dimension: string;
  valor: string | null;
  nivel_riesgo: string | null;
  periodo: number;
  posicion: string | null;
  total_departamentos: string | null;
  promedio_nacional: string | null;
  valor_periodo_anterior: string | null;
  periodo_anterior: number | null;
}

const TABLA = 'data_publicaciones';

const toNum = (v: string | null | undefined): number => (v == null ? 0 : Number(v));
const toIntN = (v: string | null | undefined): number | null =>
  v == null ? null : parseInt(v, 10);

@Injectable()
export class PostgresSocioeconomicoRepository implements SocioeconomicoRepositoryPort {
  constructor(@Inject(DATABASE_PORT) private readonly db: DatabasePort) {}

  async listarDimensiones(fuentePublicacion: string | null = null): Promise<string[]> {
    const params: unknown[] = [];
    let where = `dimension IS NOT NULL`;
    if (fuentePublicacion) {
      params.push(fuentePublicacion);
      where += ` AND fuente = $${params.length}`;
    }
    const rows = await this.db.query<DimensionRow>(
      `SELECT DISTINCT dimension AS dimension
       FROM ${TABLA}
       WHERE ${where}
       ORDER BY dimension ASC`,
      params,
    );
    return rows.map((r) => r.dimension);
  }

  async listarFuentesPublicaciones(): Promise<string[]> {
    const rows = await this.db.query<{ fuente: string }>(
      `SELECT DISTINCT fuente
       FROM ${TABLA}
       WHERE fuente IS NOT NULL
       ORDER BY fuente ASC`,
    );
    return rows.map((r) => r.fuente);
  }

  async listarReferencias(filtro: FiltroSocioeconomico): Promise<string[]> {
    const conds: string[] = [`referencia IS NOT NULL`];
    const params: unknown[] = [];
    let idx = 1;

    if (filtro.dimension) {
      params.push(filtro.dimension);
      conds.push(`dimension = $${idx++}`);
    }
    if (filtro.fuentePublicacion) {
      params.push(filtro.fuentePublicacion);
      conds.push(`fuente = $${idx++}`);
    }

    const rows = await this.db.query<{ referencia: string }>(
      `SELECT DISTINCT referencia
       FROM ${TABLA}
       WHERE ${conds.join(' AND ')}
       ORDER BY referencia ASC`,
      params,
    );
    return rows.map((r) => r.referencia);
  }

  async listarNivelesGeograficos(filtro: FiltroSocioeconomico): Promise<string[]> {
    const conds: string[] = [`nivel_geografico IS NOT NULL`];
    const params: unknown[] = [];
    let idx = 1;

    if (filtro.dimension) {
      params.push(filtro.dimension);
      conds.push(`dimension = $${idx++}`);
    }
    if (filtro.referencia) {
      params.push(filtro.referencia);
      conds.push(`referencia = $${idx++}`);
    }
    if (filtro.fuentePublicacion) {
      params.push(filtro.fuentePublicacion);
      conds.push(`fuente = $${idx++}`);
    }

    const rows = await this.db.query<{ nivel_geografico: string }>(
      `SELECT DISTINCT nivel_geografico
       FROM ${TABLA}
       WHERE ${conds.join(' AND ')}
       ORDER BY nivel_geografico ASC`,
      params,
    );
    return rows.map((r) => r.nivel_geografico);
  }

  async obtenerKpis(filtro: FiltroSocioeconomico): Promise<KpiSocioeconomico[]> {
    const { whereClause, params } = this.buildWhere(filtro);

    const sql = `
      SELECT
        dimension,
        AVG(valor)   AS promedio,
        MIN(valor)   AS minimo,
        MAX(valor)   AS maximo,
        COUNT(*)     AS cantidad,
        MIN(periodo) AS periodo_min,
        MAX(periodo) AS periodo_max
      FROM ${TABLA}
      WHERE ${whereClause}
        AND dimension IS NOT NULL
      GROUP BY dimension
      ORDER BY dimension ASC
    `;
    const rows = await this.db.query<KpiRow>(sql, params);
    return rows.map(
      (r) =>
        new KpiSocioeconomico(
          r.dimension,
          Number(toNum(r.promedio).toFixed(2)),
          toNum(r.minimo),
          toNum(r.maximo),
          parseInt(r.cantidad ?? '0', 10),
          toIntN(r.periodo_min),
          toIntN(r.periodo_max),
        ),
    );
  }

  async obtenerSerieHistorica(filtro: FiltroSocioeconomico): Promise<SerieHistoricaPunto[]> {
    const { whereClause, params } = this.buildWhere(filtro);

    const sql = `
      SELECT periodo,
             dimension,
             AVG(valor) AS valor
      FROM ${TABLA}
      WHERE ${whereClause}
        AND periodo IS NOT NULL
      GROUP BY periodo, dimension
      ORDER BY periodo ASC, dimension ASC
    `;
    const rows = await this.db.query<SerieRow>(sql, params);
    return rows
      .filter((r) => r.periodo != null)
      .map(
        (r) =>
          new SerieHistoricaPunto(
            r.periodo as number,
            r.dimension,
            Number(toNum(r.valor).toFixed(2)),
          ),
      );
  }

  async obtenerPorDepartamento(filtro: FiltroSocioeconomico): Promise<IndicadorPorDepartamento[]> {
    // El WHERE base se construye sin filtro de período; el período se aplica
    // dentro del CTE para poder calcular MAX(periodo) sobre el resto de filtros.
    const conds: string[] = ['codigo_departamento IS NOT NULL'];
    const params: unknown[] = [];
    let idx = 1;

    if (filtro.codigoDepartamento) {
      // Las tablas guardan códigos sin padding ('1' en vez de '01').
      params.push(filtro.codigoDepartamento);
      conds.push(`LPAD(codigo_departamento, 2, '0') = LPAD($${idx++}, 2, '0')`);
    }
    if (filtro.dimension) {
      params.push(filtro.dimension);
      conds.push(`dimension = $${idx++}`);
    }
    if (filtro.referencia) {
      params.push(filtro.referencia);
      conds.push(`referencia = $${idx++}`);
    }
    if (filtro.nivelGeografico) {
      params.push(filtro.nivelGeografico);
      conds.push(`nivel_geografico = $${idx++}`);
    }
    if (filtro.fuentePublicacion) {
      params.push(filtro.fuentePublicacion);
      conds.push(`fuente = $${idx++}`);
    }

    let periodoFilter: string;
    if (filtro.periodo != null) {
      params.push(filtro.periodo);
      periodoFilter = `periodo = $${idx++}`;
    } else {
      periodoFilter = `periodo = (SELECT MAX(periodo) FROM filtered)`;
    }

    const sql = `
      WITH filtered AS (
        SELECT
          LPAD(codigo_departamento, 2, '0') AS codigo_departamento,
          departamento,
          nivel_riesgo,
          valor,
          periodo,
          dimension,
          serie_estadistica,
          nivel_geografico,
          referencia,
          observacion
        FROM ${TABLA}
        WHERE ${conds.join(' AND ')}
      )
      SELECT codigo_departamento, departamento, nivel_riesgo, valor, periodo, dimension,
             serie_estadistica, nivel_geografico, referencia, observacion
      FROM filtered
      WHERE ${periodoFilter}
      ORDER BY valor DESC NULLS LAST
    `;

    const rows = await this.db.query<PorDepartamentoRow>(sql, params);
    return rows
      .filter((r) => r.periodo != null)
      .map(
        (r) =>
          new IndicadorPorDepartamento(
            r.codigo_departamento,
            r.departamento ?? r.codigo_departamento,
            r.nivel_riesgo,
            toNum(r.valor),
            r.periodo as number,
            r.dimension,
            r.serie_estadistica,
            r.nivel_geografico,
            r.referencia,
            r.observacion,
          ),
      );
  }

  async obtenerResumenDepartamento(
    filtro: FiltroSocioeconomico,
  ): Promise<ResumenDepartamentoDimension[]> {
    if (!filtro.codigoDepartamento) {
      return [];
    }

    // El depto va siempre en $1 (LPAD para manejar códigos sin padding).
    const params: unknown[] = [filtro.codigoDepartamento];
    let idx = 2;

    let baseFuenteCond = '';
    if (filtro.fuentePublicacion) {
      params.push(filtro.fuentePublicacion);
      baseFuenteCond += `AND fuente = $${idx++}`;
    }
    if (filtro.referencia) {
      params.push(filtro.referencia);
      baseFuenteCond += ` AND referencia = $${idx++}`;
    }
    if (filtro.nivelGeografico) {
      params.push(filtro.nivelGeografico);
      baseFuenteCond += ` AND nivel_geografico = $${idx++}`;
    }

    // Estrategia:
    //  1) `base`: tabla normalizada con código de depto LPAD'd y filtros estables.
    //  2) `ult_periodo_dim`: último período disponible por dimensión.
    //  3) `ultimos`: registros del último período por dimensión.
    //  4) `ranked`: añade RANK + AVG + COUNT como window functions sobre la dimensión.
    //  5) `periodo_prev` + `prev_vals`: valor del período inmediatamente anterior para el depto.
    const sql = `
      WITH base AS (
        SELECT
          LPAD(codigo_departamento, 2, '0') AS codigo_departamento,
          departamento,
          dimension,
          nivel_riesgo,
          valor,
          periodo
        FROM ${TABLA}
        WHERE codigo_departamento IS NOT NULL
          AND dimension IS NOT NULL
          AND valor IS NOT NULL
          AND periodo IS NOT NULL
          ${baseFuenteCond}
      ),
      ult_periodo_dim AS (
        SELECT dimension, MAX(periodo) AS max_periodo
        FROM base
        GROUP BY dimension
      ),
      ultimos AS (
        SELECT b.*
        FROM base b
        JOIN ult_periodo_dim u
          ON u.dimension = b.dimension AND b.periodo = u.max_periodo
      ),
      ranked AS (
        SELECT
          codigo_departamento,
          departamento,
          dimension,
          nivel_riesgo,
          valor,
          periodo,
          RANK() OVER (PARTITION BY dimension ORDER BY valor DESC) AS posicion,
          COUNT(*) OVER (PARTITION BY dimension) AS total_departamentos,
          AVG(valor) OVER (PARTITION BY dimension) AS promedio_nacional
        FROM ultimos
      ),
      periodo_prev AS (
        SELECT b.dimension, MAX(b.periodo) AS prev_periodo
        FROM base b
        JOIN ult_periodo_dim u ON u.dimension = b.dimension
        WHERE b.codigo_departamento = LPAD($1, 2, '0')
          AND b.periodo < u.max_periodo
        GROUP BY b.dimension
      ),
      prev_vals AS (
        SELECT b.dimension, b.valor AS valor_periodo_anterior, b.periodo AS periodo_anterior
        FROM base b
        JOIN periodo_prev p ON p.dimension = b.dimension AND b.periodo = p.prev_periodo
        WHERE b.codigo_departamento = LPAD($1, 2, '0')
      )
      SELECT
        r.codigo_departamento,
        r.departamento,
        r.dimension,
        r.valor,
        r.nivel_riesgo,
        r.periodo,
        r.posicion,
        r.total_departamentos,
        r.promedio_nacional,
        pv.valor_periodo_anterior,
        pv.periodo_anterior
      FROM ranked r
      LEFT JOIN prev_vals pv ON pv.dimension = r.dimension
      WHERE r.codigo_departamento = LPAD($1, 2, '0')
      ORDER BY r.dimension ASC
    `;

    const rows = await this.db.query<ResumenDepartamentoRow>(sql, params);
    return rows.map(
      (r) =>
        new ResumenDepartamentoDimension(
          r.codigo_departamento,
          r.departamento ?? r.codigo_departamento,
          r.dimension,
          toNum(r.valor),
          r.nivel_riesgo,
          r.periodo,
          parseInt(r.posicion ?? '0', 10),
          parseInt(r.total_departamentos ?? '0', 10),
          Number(toNum(r.promedio_nacional).toFixed(2)),
          r.valor_periodo_anterior == null
            ? null
            : Number(toNum(r.valor_periodo_anterior).toFixed(2)),
          r.periodo_anterior,
        ),
    );
  }

  private buildWhere(filtro: FiltroSocioeconomico): {
    whereClause: string;
    params: unknown[];
  } {
    const conds: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filtro.codigoDepartamento) {
      // Compensamos códigos sin padding en data_publicaciones ('1' vs '01').
      params.push(filtro.codigoDepartamento);
      conds.push(`LPAD(codigo_departamento, 2, '0') = LPAD($${idx++}, 2, '0')`);
    }
    if (filtro.dimension) {
      params.push(filtro.dimension);
      conds.push(`dimension = $${idx++}`);
    }
    if (filtro.periodo != null) {
      params.push(filtro.periodo);
      conds.push(`periodo = $${idx++}`);
    }
    if (filtro.referencia) {
      params.push(filtro.referencia);
      conds.push(`referencia = $${idx++}`);
    }
    if (filtro.nivelGeografico) {
      params.push(filtro.nivelGeografico);
      conds.push(`nivel_geografico = $${idx++}`);
    }
    if (filtro.fuentePublicacion) {
      params.push(filtro.fuentePublicacion);
      conds.push(`fuente = $${idx++}`);
    }

    return {
      whereClause: conds.length ? conds.join(' AND ') : '1=1',
      params,
    };
  }
}

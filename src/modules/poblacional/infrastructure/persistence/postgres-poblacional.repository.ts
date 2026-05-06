import { Inject, Injectable } from '@nestjs/common';
import { DatabasePort } from '../../../../shared/database/database.port';
import { DATABASE_PORT } from '../../../../shared/database/database.tokens';
import { KpiPoblacional } from '../../domain/entities/kpi-poblacional.entity';
import { RadarPoblacionalPunto } from '../../domain/entities/radar-poblacional-punto.entity';
import {
  FuenteConReferencias,
  ResumenDimension,
} from '../../domain/entities/resumen-dimension.entity';
import { SeriePoblacionalPunto } from '../../domain/entities/serie-poblacional-punto.entity';
import {
  FiltroPoblacional,
  PoblacionalRepositoryPort,
} from '../../domain/ports/poblacional.repository.port';

interface DimensionRow {
  dimension: string;
}

interface ReferenciaRow {
  referencia: string;
}

interface CriterioRow {
  criterio: string;
}

interface ResumenDimensionRow {
  dimension: string;
  fuente: string | null;
  cantidad_referencias: string | null;
}

interface KpiRow {
  dimension: string;
  referencia: string | null;
  promedio: string | null;
  minimo: string | null;
  maximo: string | null;
  cantidad: string | null;
}

interface SerieRow {
  anio: number | null;
  mes: number | null;
  dimension: string | null;
  criterio: string | null;
  valor: string | null;
}

interface RadarRow {
  criterio: string | null;
  valor: string | null;
  anio: number | null;
  mes: number | null;
}

const toNum = (v: string | null | undefined): number => (v == null ? 0 : Number(v));

@Injectable()
export class PostgresPoblacionalRepository implements PoblacionalRepositoryPort {
  constructor(@Inject(DATABASE_PORT) private readonly db: DatabasePort) {}

  async listarDimensiones(): Promise<string[]> {
    const rows = await this.db.query<DimensionRow>(
      `SELECT DISTINCT dimension
       FROM data_encuestas
       WHERE dimension IS NOT NULL
       ORDER BY dimension ASC`,
    );
    return rows.map((r) => r.dimension);
  }

  async listarReferencias(
    dimension: string | null,
    fuente: string | null = null,
  ): Promise<string[]> {
    const params: unknown[] = [];
    let where = 'referencia IS NOT NULL';
    if (dimension) {
      params.push(dimension);
      where += ` AND dimension = $${params.length}`;
    }
    if (fuente) {
      params.push(fuente);
      where += ` AND fuente = $${params.length}`;
    }
    const rows = await this.db.query<ReferenciaRow>(
      `SELECT DISTINCT referencia
       FROM data_encuestas
       WHERE ${where}
       ORDER BY referencia ASC`,
      params,
    );
    return rows.map((r) => r.referencia);
  }

  async listarCriterios(filtro: FiltroPoblacional): Promise<string[]> {
    const conds: string[] = ['criterio IS NOT NULL'];
    const params: unknown[] = [];
    let idx = 1;

    if (filtro.dimension) {
      params.push(filtro.dimension);
      conds.push(`dimension = $${idx++}`);
    }
    if (filtro.fuente) {
      params.push(filtro.fuente);
      conds.push(`fuente = $${idx++}`);
    }
    if (filtro.referencia) {
      params.push(filtro.referencia);
      conds.push(`referencia = $${idx++}`);
    }

    const rows = await this.db.query<CriterioRow>(
      `SELECT DISTINCT criterio
       FROM data_encuestas
       WHERE ${conds.join(' AND ')}
       ORDER BY criterio ASC`,
      params,
    );
    return rows.map((r) => r.criterio);
  }

  async listarResumenDimensiones(): Promise<ResumenDimension[]> {
    const rows = await this.db.query<ResumenDimensionRow>(
      `SELECT dimension, fuente, COUNT(DISTINCT referencia) AS cantidad_referencias
       FROM data_encuestas
       WHERE dimension IS NOT NULL
         AND referencia IS NOT NULL
       GROUP BY dimension, fuente
       ORDER BY dimension ASC, fuente ASC NULLS LAST`,
    );

    const porDimension = new Map<string, FuenteConReferencias[]>();
    for (const r of rows) {
      const lista = porDimension.get(r.dimension) ?? [];
      lista.push(
        new FuenteConReferencias(
          r.fuente ?? 'Sin fuente',
          parseInt(r.cantidad_referencias ?? '0', 10),
        ),
      );
      porDimension.set(r.dimension, lista);
    }

    return Array.from(porDimension.entries()).map(
      ([dim, fuentes]) =>
        new ResumenDimension(
          dim,
          fuentes,
          fuentes.reduce((s, f) => s + f.cantidadReferencias, 0),
        ),
    );
  }

  async obtenerKpis(filtro: FiltroPoblacional): Promise<KpiPoblacional[]> {
    const { whereClause, params } = this.buildWhere(filtro);
    const sql = `
      SELECT
        dimension,
        referencia,
        AVG(reporte) AS promedio,
        MIN(reporte) AS minimo,
        MAX(reporte) AS maximo,
        COUNT(*)     AS cantidad
      FROM data_encuestas
      WHERE ${whereClause}
        AND dimension IS NOT NULL
      GROUP BY dimension, referencia
      ORDER BY dimension ASC, referencia ASC NULLS LAST
    `;
    const rows = await this.db.query<KpiRow>(sql, params);
    return rows.map(
      (r) =>
        new KpiPoblacional(
          r.dimension,
          r.referencia,
          Number(toNum(r.promedio).toFixed(2)),
          toNum(r.minimo),
          toNum(r.maximo),
          parseInt(r.cantidad ?? '0', 10),
        ),
    );
  }

  async obtenerSerieHistorica(filtro: FiltroPoblacional): Promise<SeriePoblacionalPunto[]> {
    const { whereClause, params } = this.buildWhere(filtro);
    const sql = `
      SELECT anio, mes, dimension, criterio, AVG(reporte) AS valor
      FROM data_encuestas
      WHERE ${whereClause}
        AND anio IS NOT NULL
      GROUP BY anio, mes, dimension, criterio
      ORDER BY anio ASC, mes ASC NULLS LAST, dimension ASC
    `;
    const rows = await this.db.query<SerieRow>(sql, params);
    return rows
      .filter((r) => r.anio != null)
      .map(
        (r) =>
          new SeriePoblacionalPunto(
            r.anio as number,
            r.mes,
            r.dimension,
            r.criterio,
            Number(toNum(r.valor).toFixed(2)),
          ),
      );
  }

  async obtenerRadarUltimoPeriodo(filtro: FiltroPoblacional): Promise<RadarPoblacionalPunto[]> {
    const { whereClause, params } = this.buildWhere(filtro);
    // Estrategia: identificar el último (anio, mes) disponible para la combinación
    // (dimensión/fuente/referencia + filtros de criterio si los hay) y agregar por
    // criterio dentro de ese período. Se usa la misma whereClause de los demás
    // queries para que los filtros por criterio (multi) apliquen también al radar.
    const sql = `
      WITH ultimo AS (
        SELECT anio, mes
        FROM data_encuestas
        WHERE ${whereClause}
          AND anio IS NOT NULL
        ORDER BY anio DESC, mes DESC NULLS LAST
        LIMIT 1
      )
      SELECT criterio,
             AVG(reporte) AS valor,
             MAX(anio)    AS anio,
             MAX(mes)     AS mes
      FROM data_encuestas, ultimo
      WHERE ${whereClause}
        AND anio = ultimo.anio
        AND COALESCE(mes, -1) = COALESCE(ultimo.mes, -1)
        AND criterio IS NOT NULL
      GROUP BY criterio
      ORDER BY criterio ASC
    `;
    const rows = await this.db.query<RadarRow>(sql, params);
    return rows
      .filter((r) => r.criterio != null)
      .map(
        (r) =>
          new RadarPoblacionalPunto(
            r.criterio as string,
            Number(toNum(r.valor).toFixed(2)),
            r.anio,
            r.mes,
          ),
      );
  }

  private buildWhere(filtro: FiltroPoblacional): { whereClause: string; params: unknown[] } {
    const conds: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filtro.fuente) {
      params.push(filtro.fuente);
      conds.push(`fuente = $${idx++}`);
    }
    if (filtro.dimension) {
      params.push(filtro.dimension);
      conds.push(`dimension = $${idx++}`);
    }
    if (filtro.referencia) {
      params.push(filtro.referencia);
      conds.push(`referencia = $${idx++}`);
    }
    if (filtro.criterios && filtro.criterios.length > 0) {
      params.push(filtro.criterios);
      conds.push(`criterio = ANY($${idx++}::text[])`);
    } else if (filtro.criterio) {
      params.push(filtro.criterio);
      conds.push(`criterio = $${idx++}`);
    }
    if (filtro.anio != null) {
      params.push(filtro.anio);
      conds.push(`anio = $${idx++}`);
    }
    if (filtro.mes != null) {
      params.push(filtro.mes);
      conds.push(`mes = $${idx++}`);
    }

    return {
      whereClause: conds.length ? conds.join(' AND ') : '1=1',
      params,
    };
  }
}

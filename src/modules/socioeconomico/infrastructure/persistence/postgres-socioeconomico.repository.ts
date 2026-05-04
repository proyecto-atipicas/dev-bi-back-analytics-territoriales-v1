import { Inject, Injectable } from '@nestjs/common';
import { DatabasePort } from '../../../../shared/database/database.port';
import { DATABASE_PORT } from '../../../../shared/database/database.tokens';
import { IndicadorPorDepartamento } from '../../domain/entities/indicador-departamento.entity';
import { KpiSocioeconomico } from '../../domain/entities/kpi-socioeconomico.entity';
import { SerieHistoricaPunto } from '../../domain/entities/serie-historica-punto.entity';
import {
  FiltroSocioeconomico,
  SocioeconomicoRepositoryPort,
} from '../../domain/ports/socioeconomico.repository.port';
import {
  fuenteATabla,
  FuenteSocioeconomica,
} from '../../domain/value-objects/fuente-socioeconomica.vo';

interface CategoriaRow {
  categoria: string;
}

interface KpiRow {
  categoria: string;
  promedio: string | null;
  minimo: string | null;
  maximo: string | null;
  cantidad: string | null;
  ano_min: string | null;
  ano_max: string | null;
}

interface SerieRow {
  ano: number | null;
  categoria: string | null;
  valor: string | null;
}

interface PorDepartamentoRow {
  codigo_departamento: string;
  departamento: string | null;
  calificacion: string | null;
  valor: string | null;
  ano: number | null;
  categoria: string | null;
}

const toNum = (v: string | null | undefined): number => (v == null ? 0 : Number(v));
const toIntN = (v: string | null | undefined): number | null =>
  v == null ? null : parseInt(v, 10);

@Injectable()
export class PostgresSocioeconomicoRepository implements SocioeconomicoRepositoryPort {
  constructor(@Inject(DATABASE_PORT) private readonly db: DatabasePort) {}

  async listarCategorias(
    fuente: FuenteSocioeconomica,
    fuentePublicacion: string | null = null,
  ): Promise<string[]> {
    const tabla = fuenteATabla(fuente);
    const params: unknown[] = [];
    let where = 'categoria IS NOT NULL';
    if (fuente === FuenteSocioeconomica.PUBLICACIONES && fuentePublicacion) {
      params.push(fuentePublicacion);
      where += ` AND fuente = $${params.length}`;
    }
    const rows = await this.db.query<CategoriaRow>(
      `SELECT DISTINCT categoria
       FROM ${tabla}
       WHERE ${where}
       ORDER BY categoria ASC`,
      params,
    );
    return rows.map((r) => r.categoria);
  }

  async listarFuentesPublicaciones(): Promise<string[]> {
    const rows = await this.db.query<{ fuente: string }>(
      `SELECT DISTINCT fuente
       FROM data_publicaciones
       WHERE fuente IS NOT NULL
       ORDER BY fuente ASC`,
    );
    return rows.map((r) => r.fuente);
  }

  async obtenerKpis(filtro: FiltroSocioeconomico): Promise<KpiSocioeconomico[]> {
    const tabla = fuenteATabla(filtro.fuente);
    const { whereClause, params } = this.buildWhere(filtro);

    const sql = `
      SELECT
        categoria,
        AVG(valor) AS promedio,
        MIN(valor) AS minimo,
        MAX(valor) AS maximo,
        COUNT(*)   AS cantidad,
        MIN(ano)   AS ano_min,
        MAX(ano)   AS ano_max
      FROM ${tabla}
      WHERE ${whereClause}
        AND categoria IS NOT NULL
      GROUP BY categoria
      ORDER BY categoria ASC
    `;
    const rows = await this.db.query<KpiRow>(sql, params);
    return rows.map(
      (r) =>
        new KpiSocioeconomico(
          r.categoria,
          Number(toNum(r.promedio).toFixed(2)),
          toNum(r.minimo),
          toNum(r.maximo),
          parseInt(r.cantidad ?? '0', 10),
          toIntN(r.ano_min),
          toIntN(r.ano_max),
        ),
    );
  }

  async obtenerSerieHistorica(filtro: FiltroSocioeconomico): Promise<SerieHistoricaPunto[]> {
    const tabla = fuenteATabla(filtro.fuente);
    const { whereClause, params } = this.buildWhere(filtro);

    const sql = `
      SELECT ano, categoria, AVG(valor) AS valor
      FROM ${tabla}
      WHERE ${whereClause}
        AND ano IS NOT NULL
      GROUP BY ano, categoria
      ORDER BY ano ASC, categoria ASC
    `;
    const rows = await this.db.query<SerieRow>(sql, params);
    return rows
      .filter((r) => r.ano != null)
      .map(
        (r) =>
          new SerieHistoricaPunto(
            r.ano as number,
            r.categoria,
            Number(toNum(r.valor).toFixed(2)),
          ),
      );
  }

  async obtenerPorDepartamento(
    filtro: FiltroSocioeconomico,
  ): Promise<IndicadorPorDepartamento[]> {
    const tabla = fuenteATabla(filtro.fuente);

    // Construimos el WHERE base SIN el filtro de año, porque el año se aplica
    // dentro del CTE para poder calcular MAX(ano) sobre el resto de filtros.
    const conds: string[] = ['codigo_departamento IS NOT NULL'];
    const params: unknown[] = [];
    let idx = 1;

    if (filtro.codigoDepartamento) {
      // data_moe / data_publicaciones guardan códigos sin padding ('1' en vez de '01').
      params.push(filtro.codigoDepartamento);
      conds.push(`LPAD(codigo_departamento, 2, '0') = LPAD($${idx++}, 2, '0')`);
    }
    if (filtro.categoria) {
      params.push(filtro.categoria);
      conds.push(`categoria = $${idx++}`);
    }
    if (filtro.fuente === FuenteSocioeconomica.PUBLICACIONES && filtro.fuentePublicacion) {
      params.push(filtro.fuentePublicacion);
      conds.push(`fuente = $${idx++}`);
    }

    let anoFilter: string;
    if (filtro.ano != null) {
      params.push(filtro.ano);
      anoFilter = `ano = $${idx++}`;
    } else {
      anoFilter = `ano = (SELECT MAX(ano) FROM filtered)`;
    }

    const sql = `
      WITH filtered AS (
        SELECT
          LPAD(codigo_departamento, 2, '0') AS codigo_departamento,
          departamento, calificacion, valor, ano, categoria
        FROM ${tabla}
        WHERE ${conds.join(' AND ')}
      )
      SELECT codigo_departamento, departamento, calificacion, valor, ano, categoria
      FROM filtered
      WHERE ${anoFilter}
      ORDER BY valor DESC NULLS LAST
    `;

    const rows = await this.db.query<PorDepartamentoRow>(sql, params);
    return rows
      .filter((r) => r.ano != null)
      .map(
        (r) =>
          new IndicadorPorDepartamento(
            r.codigo_departamento,
            r.departamento ?? r.codigo_departamento,
            r.calificacion,
            toNum(r.valor),
            r.ano as number,
            r.categoria,
          ),
      );
  }

  private buildWhere(filtro: FiltroSocioeconomico): { whereClause: string; params: unknown[] } {
    const conds: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filtro.codigoDepartamento) {
      // Compensamos códigos sin padding en data_moe / data_publicaciones ('1' vs '01').
      params.push(filtro.codigoDepartamento);
      conds.push(`LPAD(codigo_departamento, 2, '0') = LPAD($${idx++}, 2, '0')`);
    }
    if (filtro.categoria) {
      params.push(filtro.categoria);
      conds.push(`categoria = $${idx++}`);
    }
    if (filtro.ano != null) {
      params.push(filtro.ano);
      conds.push(`ano = $${idx++}`);
    }
    // El filtro por columna `fuente` solo aplica a data_publicaciones
    if (filtro.fuente === FuenteSocioeconomica.PUBLICACIONES && filtro.fuentePublicacion) {
      params.push(filtro.fuentePublicacion);
      conds.push(`fuente = $${idx++}`);
    }

    return {
      whereClause: conds.length ? conds.join(' AND ') : '1=1',
      params,
    };
  }
}

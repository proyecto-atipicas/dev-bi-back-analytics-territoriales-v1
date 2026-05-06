import { Inject, Injectable } from '@nestjs/common';
import { DatabasePort } from '../../../../shared/database/database.port';
import { DATABASE_PORT } from '../../../../shared/database/database.tokens';
import {
  ComparativoTerritorialResultado,
  GanadorComparativo,
  ItemComparativoTerritorial,
  NivelTerritorial,
  TerritorioComparativo,
} from '../../domain/entities/comparativo-territorial.entity';
import { RankingCandidato } from '../../domain/entities/ranking-candidato.entity';
import { RankingPartido } from '../../domain/entities/ranking-partido.entity';
import { ResumenCorporacion } from '../../domain/entities/resumen-corporacion.entity';
import { ResumenElectoral } from '../../domain/entities/resumen-electoral.entity';
import { VotosPorDepartamento } from '../../domain/entities/votos-departamento.entity';
import { VotosPorMunicipio } from '../../domain/entities/votos-municipio.entity';
import { VotosPorPuesto } from '../../domain/entities/votos-puesto.entity';
import { ElectoralRepositoryPort } from '../../domain/ports/electoral.repository.port';
import { FiltroComparativoTerritorial } from '../../domain/value-objects/filtro-comparativo-territorial.vo';
import { FiltroElectoral } from '../../domain/value-objects/filtro-electoral.vo';
import { buildFiltroElectoralSql } from './filtro-electoral.sql';

interface ResumenRow {
  total_votos: string | null;
  total_candidatos: string | null;
  total_partidos: string | null;
  total_corporaciones: string | null;
  total_departamentos: string | null;
  total_municipios: string | null;
  total_puestos: string | null;
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

interface ItemMetaRow {
  codigo: string;
  nombre: string | null;
  codigo_partido: string | null;
  nombre_partido: string | null;
}

interface TerritorioComparativoRow {
  codigo_departamento: string;
  codigo_municipio: string | null;
  codigo_puesto: string | null;
  nombre: string | null;
  total_a: string | null;
  total_b: string | null;
  total_eleccion: string | null;
}

const toInt = (v: string | null | undefined): number => (v == null ? 0 : parseInt(v, 10));
const toNum = (v: string | null | undefined): number => (v == null ? 0 : Number(v));

@Injectable()
export class PostgresElectoralRepository implements ElectoralRepositoryPort {
  constructor(@Inject(DATABASE_PORT) private readonly db: DatabasePort) {}

  async obtenerResumen(filtro: FiltroElectoral): Promise<ResumenElectoral> {
    const { whereClause, params } = buildFiltroElectoralSql(filtro);
    // Los puestos se identifican por la tripleta (depto, muni, puesto) — un mismo
    // codigo_puesto se repite entre municipios distintos. Los candidatos se
    // identifican por la tupla (codigo_candidato, codigo_partido) — el código
    // se reinicia por partido.
    const sql = `
      SELECT
        COALESCE(SUM(total_votos), 0)            AS total_votos,
        COUNT(DISTINCT (codigo_candidato, codigo_partido))
          FILTER (WHERE codigo_candidato IS NOT NULL) AS total_candidatos,
        COUNT(DISTINCT codigo_partido)           AS total_partidos,
        COUNT(DISTINCT codigo_corporacion)       AS total_corporaciones,
        COUNT(DISTINCT codigo_departamento)      AS total_departamentos,
        COUNT(DISTINCT codigo_municipio)         AS total_municipios,
        COUNT(DISTINCT (codigo_departamento, codigo_municipio, codigo_puesto))
          FILTER (WHERE codigo_puesto IS NOT NULL) AS total_puestos
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
      toInt(row?.total_puestos ?? null),
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
        new VotosPorDepartamento(
          r.codigo_departamento,
          r.nombre_departamento,
          toNum(r.total_votos),
        ),
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

  async obtenerRankingPartidos(filtro: FiltroElectoral, limite: number): Promise<RankingPartido[]> {
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

  async compararTerritorial(
    filtro: FiltroComparativoTerritorial,
  ): Promise<ComparativoTerritorialResultado> {
    const esCandidato = filtro.tipo === 'candidato';
    const codigoCol = esCandidato ? 'codigo_candidato' : 'codigo_partido';
    const nombreCol = esCandidato ? 'nombre_candidato' : 'nombre_partido';

    // Para candidatos la identidad real es la tupla (codigo_candidato,
    // codigo_partido) — el código se reinicia por partido. Construimos
    // condiciones específicas para A y B en lugar de un IN ($1, $2).
    const condA = esCandidato
      ? `(e.codigo_candidato = $1 AND e.codigo_partido = $4)`
      : `e.codigo_partido = $1`;
    const condB = esCandidato
      ? `(e.codigo_candidato = $2 AND e.codigo_partido = $5)`
      : `e.codigo_partido = $2`;
    const condEnAB = `(${condA} OR ${condB})`;

    // Clave de mapa para distinguir A de B cuando ambos comparten codigo
    // pero pertenecen a partidos distintos (caso real para candidatos).
    const claveMeta = (codigo: string, codigoPartido: string | null): string =>
      esCandidato ? `${codigo}|${codigoPartido ?? ''}` : codigo;

    // 1) Metadatos de los ítems (nombre + partido asociado para candidatos).
    const metaParams: unknown[] = [filtro.codigoA, filtro.codigoB, filtro.codigoCorporacion];
    if (esCandidato) {
      metaParams.push(filtro.codigoPartidoA, filtro.codigoPartidoB);
    }
    const metaSql = `
      SELECT
        e.${codigoCol}              AS codigo,
        MAX(e.${nombreCol})         AS nombre,
        MAX(e.codigo_partido)       AS codigo_partido,
        MAX(e.nombre_partido)       AS nombre_partido
      FROM data_election e
      WHERE e.codigo_corporacion = $3
        AND e.${codigoCol} IS NOT NULL
        AND ${condEnAB}
      GROUP BY e.${codigoCol}${esCandidato ? ', e.codigo_partido' : ''}
    `;
    const metaRows = await this.db.query<ItemMetaRow>(metaSql, metaParams);
    const metaMap = new Map<string, ItemMetaRow>();
    for (const r of metaRows) {
      metaMap.set(claveMeta(r.codigo, r.codigo_partido), r);
    }

    // 2) Resultado por territorio + total elección. Granularidad por filtros.
    // Mantenemos los mismos índices $1..$5 para reutilizar los condA/condB.
    const params: unknown[] = [filtro.codigoA, filtro.codigoB, filtro.codigoCorporacion];
    if (esCandidato) {
      params.push(filtro.codigoPartidoA, filtro.codigoPartidoB);
    }
    const conds: string[] = [`e.codigo_corporacion = $3`];
    if (filtro.codigoDepartamento) {
      params.push(filtro.codigoDepartamento);
      conds.push(`e.codigo_departamento = $${params.length}`);
    }
    if (filtro.codigoMunicipio) {
      params.push(filtro.codigoMunicipio);
      conds.push(`e.codigo_municipio = $${params.length}`);
    }

    let nivel: NivelTerritorial;
    let groupCols: string;
    let selectCols: string;
    let nombreExpr: string;
    let joinClause = '';

    if (filtro.codigoMunicipio) {
      // Drill-down a puestos
      nivel = 'puesto';
      groupCols = 'e.codigo_departamento, e.codigo_municipio, e.codigo_puesto';
      selectCols = `
        e.codigo_departamento,
        e.codigo_municipio,
        e.codigo_puesto,
        COALESCE(MAX(p.nombre_puesto), e.codigo_puesto) AS nombre
      `;
      nombreExpr = '';
      joinClause = `
        LEFT JOIN (
          SELECT codigo_departamento, codigo_municipio, codigo_puesto,
                 MAX(nombre_puesto) AS nombre_puesto
          FROM dim_divipole
          WHERE codigo_puesto IS NOT NULL
          GROUP BY codigo_departamento, codigo_municipio, codigo_puesto
        ) p
          ON p.codigo_departamento = e.codigo_departamento
         AND p.codigo_municipio    = e.codigo_municipio
         AND p.codigo_puesto       = e.codigo_puesto
      `;
      conds.push('e.codigo_puesto IS NOT NULL');
    } else if (filtro.codigoDepartamento) {
      // Drill-down a municipios
      nivel = 'municipio';
      groupCols = 'e.codigo_departamento, e.codigo_municipio';
      selectCols = `
        e.codigo_departamento,
        e.codigo_municipio,
        NULL::text AS codigo_puesto,
        COALESCE(MAX(m.nombre_municipio), e.codigo_municipio) AS nombre
      `;
      nombreExpr = '';
      joinClause = `
        LEFT JOIN (
          SELECT codigo_departamento, codigo_municipio,
                 MAX(nombre_municipio) AS nombre_municipio
          FROM dim_divipole
          WHERE codigo_municipio IS NOT NULL
          GROUP BY codigo_departamento, codigo_municipio
        ) m
          ON m.codigo_departamento = e.codigo_departamento
         AND m.codigo_municipio    = e.codigo_municipio
      `;
    } else {
      // Vista nacional → por departamento
      nivel = 'departamento';
      groupCols = 'e.codigo_departamento';
      selectCols = `
        e.codigo_departamento,
        NULL::text AS codigo_municipio,
        NULL::text AS codigo_puesto,
        COALESCE(MAX(d.nombre_departamento), e.codigo_departamento) AS nombre
      `;
      nombreExpr = '';
      joinClause = `
        LEFT JOIN (
          SELECT codigo_departamento, MAX(nombre_departamento) AS nombre_departamento
          FROM dim_divipole
          WHERE codigo_departamento IS NOT NULL
          GROUP BY codigo_departamento
        ) d ON d.codigo_departamento = e.codigo_departamento
      `;
    }
    void nombreExpr;

    const sql = `
      SELECT
        ${selectCols},
        COALESCE(SUM(CASE WHEN ${condA} THEN e.total_votos END), 0) AS total_a,
        COALESCE(SUM(CASE WHEN ${condB} THEN e.total_votos END), 0) AS total_b,
        COALESCE(SUM(e.total_votos), 0) AS total_eleccion
      FROM data_election e
      ${joinClause}
      WHERE ${conds.join(' AND ')}
      GROUP BY ${groupCols}
      HAVING COALESCE(SUM(CASE WHEN ${condEnAB} THEN e.total_votos END), 0) > 0
      ORDER BY total_eleccion DESC
    `;

    const rows = await this.db.query<TerritorioComparativoRow>(sql, params);

    const territorios: TerritorioComparativo[] = rows.map((r) => {
      const totalA = toNum(r.total_a);
      const totalB = toNum(r.total_b);
      const totalEleccion = toNum(r.total_eleccion);
      const diferencia = Math.abs(totalA - totalB);
      let ganador: GanadorComparativo;
      if (totalA > totalB) ganador = 'A';
      else if (totalB > totalA) ganador = 'B';
      else ganador = 'EMPATE';
      const diferenciaPct = totalEleccion > 0 ? (diferencia / totalEleccion) * 100 : 0;
      return new TerritorioComparativo(
        r.codigo_departamento,
        r.codigo_municipio,
        r.codigo_puesto,
        r.nombre ?? '',
        totalA,
        totalB,
        totalEleccion,
        ganador,
        diferencia,
        Number(diferenciaPct.toFixed(2)),
      );
    });

    // Totales agregados a partir de los territorios.
    const totalA = territorios.reduce((s, t) => s + t.totalA, 0);
    const totalB = territorios.reduce((s, t) => s + t.totalB, 0);
    const totalEleccion = territorios.reduce((s, t) => s + t.totalEleccion, 0);
    const totalTerritoriosA = territorios.filter((t) => t.totalA > 0).length;
    const totalTerritoriosB = territorios.filter((t) => t.totalB > 0).length;

    const buildItem = (
      codigo: string,
      codigoPartidoTupla: string | null,
      total: number,
      totalTerritorios: number,
    ): ItemComparativoTerritorial => {
      const meta = metaMap.get(claveMeta(codigo, codigoPartidoTupla));
      const nombre = meta?.nombre ?? codigo;
      const participacionPct = totalEleccion > 0 ? (total / totalEleccion) * 100 : 0;
      // Para tipo=partido, el codigo_partido del ítem es el mismo que el código;
      // para candidato, viene en el filtro (clave compuesta) y se prefiere sobre
      // el agregado del meta-row.
      const codigoPartido = esCandidato
        ? (codigoPartidoTupla ?? meta?.codigo_partido ?? null)
        : codigo;
      const nombrePartido = esCandidato ? (meta?.nombre_partido ?? null) : nombre;
      return new ItemComparativoTerritorial(
        codigo,
        nombre,
        nombrePartido,
        codigoPartido,
        total,
        totalTerritorios,
        Number(participacionPct.toFixed(2)),
      );
    };

    return new ComparativoTerritorialResultado(
      nivel,
      buildItem(filtro.codigoA, filtro.codigoPartidoA, totalA, totalTerritoriosA),
      buildItem(filtro.codigoB, filtro.codigoPartidoB, totalB, totalTerritoriosB),
      totalEleccion,
      territorios,
    );
  }

  async obtenerResumenPorCorporacion(filtro: FiltroElectoral): Promise<ResumenCorporacion[]> {
    const { whereClause, params } = buildFiltroElectoralSql(filtro);
    // Una sola pasada por la tabla: agrupamos y obtenemos el total general con SUM() OVER ().
    const sql = `
      SELECT
        codigo_corporacion,
        MAX(nombre_corporacion) AS nombre_corporacion,
        COALESCE(SUM(total_votos), 0)    AS total_votos,
        COUNT(DISTINCT (codigo_candidato, codigo_partido))
          FILTER (WHERE codigo_candidato IS NOT NULL) AS total_candidatos,
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

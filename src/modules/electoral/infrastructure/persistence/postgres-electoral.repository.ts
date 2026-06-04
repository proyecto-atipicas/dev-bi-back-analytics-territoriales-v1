import { Inject, Injectable } from '@nestjs/common';
import { DatabasePort } from '../../../../shared/database/database.port';
import { DATABASE_PORT } from '../../../../shared/database/database.tokens';
import {
  ComparativoEstadisticoResultado,
  DepartamentoComparativoEstadistico,
  ItemCandidatoEstadistico,
  ValorCandidatoDepartamento,
} from '../../domain/entities/comparativo-estadistico.entity';
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
import {
  TerritorioGanado,
  TerritoriosGanadosResultado,
} from '../../domain/entities/territorios-ganados.entity';
import { VotosPorDepartamento } from '../../domain/entities/votos-departamento.entity';
import { VotosPorMunicipio } from '../../domain/entities/votos-municipio.entity';
import { VotosPorPuesto } from '../../domain/entities/votos-puesto.entity';
import { ElectoralRepositoryPort } from '../../domain/ports/electoral.repository.port';
import { FiltroComparativoEstadistico } from '../../domain/value-objects/filtro-comparativo-estadistico.vo';
import { FiltroComparativoTerritorial } from '../../domain/value-objects/filtro-comparativo-territorial.vo';
import { FiltroElectoral } from '../../domain/value-objects/filtro-electoral.vo';
import { FiltroTerritoriosGanados } from '../../domain/value-objects/filtro-territorios-ganados.vo';
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

interface TerritorioComparativoRow {
  codigo_departamento: string;
  codigo_municipio: string | null;
  codigo_puesto: string | null;
  nombre: string | null;
  total_a: string | null;
  total_b: string | null;
}

interface SeleccionadoMetaRow {
  nombre: string | null;
  codigo_partido: string | null;
  nombre_partido: string | null;
}

interface TerritorioGanadoRow {
  codigo_departamento: string;
  codigo_municipio: string | null;
  nombre: string | null;
  total_votos_territorio: string | null;
  votos_seleccionado: string | null;
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

    // Cada lado del comparativo lleva su propia corporación, de modo que A y B
    // pueden provenir de elecciones distintas (Senado vs Cámara, procesos
    // históricos…). Agregamos cada lado de forma independiente bajo su
    // corporación y los unimos por territorio con un FULL OUTER JOIN, en lugar
    // de un único pase con `codigo_corporacion = $x`. Por eso ya no existe un
    // "total de elección" común: las métricas porcentuales son head-to-head
    // (sobre el par A + B).
    //
    // Para candidatos la identidad real es la tupla (codigo_candidato,
    // codigo_partido) — el código se reinicia por partido.
    // Parámetros base: $1=codigoA, $2=codigoB, $3=corpA, $4=corpB
    // y, para candidato, $5=codigoPartidoA, $6=codigoPartidoB.
    const condA = esCandidato
      ? `e.codigo_candidato = $1 AND e.codigo_partido = $5`
      : `e.codigo_partido = $1`;
    const condB = esCandidato
      ? `e.codigo_candidato = $2 AND e.codigo_partido = $6`
      : `e.codigo_partido = $2`;

    const baseParams: unknown[] = [
      filtro.codigoA,
      filtro.codigoB,
      filtro.codigoCorporacionA,
      filtro.codigoCorporacionB,
    ];
    if (esCandidato) {
      baseParams.push(filtro.codigoPartidoA, filtro.codigoPartidoB);
    }

    // Filtros geográficos comunes a ambos lados (se anexan tras los base y se
    // reutilizan en ambos CTE con los mismos índices $).
    const geoConds: string[] = [];
    const geoParams: unknown[] = [];
    const idxBase = baseParams.length;
    if (filtro.codigoDepartamento) {
      geoParams.push(filtro.codigoDepartamento);
      geoConds.push(`e.codigo_departamento = $${idxBase + geoParams.length}`);
    }
    if (filtro.codigoMunicipio) {
      geoParams.push(filtro.codigoMunicipio);
      geoConds.push(`e.codigo_municipio = $${idxBase + geoParams.length}`);
    }

    // Nivel + claves de agrupación/join según la granularidad geográfica.
    let nivel: NivelTerritorial;
    let keyCols: string[];
    if (filtro.codigoMunicipio) {
      nivel = 'puesto';
      keyCols = ['codigo_departamento', 'codigo_municipio', 'codigo_puesto'];
      geoConds.push('e.codigo_puesto IS NOT NULL');
    } else if (filtro.codigoDepartamento) {
      nivel = 'municipio';
      keyCols = ['codigo_departamento', 'codigo_municipio'];
    } else {
      nivel = 'departamento';
      keyCols = ['codigo_departamento'];
    }

    const selKeys = keyCols.map((c) => `e.${c}`).join(', ');
    const groupBy = selKeys;
    const geoWhere = geoConds.length ? ` AND ${geoConds.join(' AND ')}` : '';

    // CTE de cada lado bajo su propia corporación.
    const cteA = `
      SELECT ${selKeys}, COALESCE(SUM(e.total_votos), 0) AS total
      FROM data_election e
      WHERE e.codigo_corporacion = $3 AND (${condA})${geoWhere}
      GROUP BY ${groupBy}
    `;
    const cteB = `
      SELECT ${selKeys}, COALESCE(SUM(e.total_votos), 0) AS total
      FROM data_election e
      WHERE e.codigo_corporacion = $4 AND (${condB})${geoWhere}
      GROUP BY ${groupBy}
    `;

    // FULL OUTER JOIN: conserva territorios donde sólo uno de los dos obtuvo
    // votos. Las claves se coalescan lado a lado.
    const joinOn = keyCols.map((c) => `a.${c} = b.${c}`).join(' AND ');
    const coalesced = keyCols.map((c) => `COALESCE(a.${c}, b.${c}) AS ${c}`).join(', ');

    // Join de nombres territoriales (independiente de la corporación).
    let nombreSelect: string;
    let nombreJoin: string;
    if (nivel === 'puesto') {
      nombreSelect = `COALESCE(p.nombre_puesto, j.codigo_puesto) AS nombre`;
      nombreJoin = `
        LEFT JOIN (
          SELECT codigo_departamento, codigo_municipio, codigo_puesto,
                 MAX(nombre_puesto) AS nombre_puesto
          FROM dim_divipole
          WHERE codigo_puesto IS NOT NULL
          GROUP BY codigo_departamento, codigo_municipio, codigo_puesto
        ) p
          ON p.codigo_departamento = j.codigo_departamento
         AND p.codigo_municipio    = j.codigo_municipio
         AND p.codigo_puesto       = j.codigo_puesto
      `;
    } else if (nivel === 'municipio') {
      nombreSelect = `COALESCE(m.nombre_municipio, j.codigo_municipio) AS nombre`;
      nombreJoin = `
        LEFT JOIN (
          SELECT codigo_departamento, codigo_municipio,
                 MAX(nombre_municipio) AS nombre_municipio
          FROM dim_divipole
          WHERE codigo_municipio IS NOT NULL
          GROUP BY codigo_departamento, codigo_municipio
        ) m
          ON m.codigo_departamento = j.codigo_departamento
         AND m.codigo_municipio    = j.codigo_municipio
      `;
    } else {
      nombreSelect = `COALESCE(d.nombre_departamento, j.codigo_departamento) AS nombre`;
      nombreJoin = `
        LEFT JOIN (
          SELECT codigo_departamento, MAX(nombre_departamento) AS nombre_departamento
          FROM dim_divipole
          WHERE codigo_departamento IS NOT NULL
          GROUP BY codigo_departamento
        ) d ON d.codigo_departamento = j.codigo_departamento
      `;
    }

    // El SELECT final siempre expone (codigo_departamento, codigo_municipio,
    // codigo_puesto); los niveles superiores rellenan con NULL.
    const extraNullCols =
      nivel === 'puesto'
        ? ''
        : nivel === 'municipio'
          ? 'NULL::text AS codigo_puesto,'
          : 'NULL::text AS codigo_municipio, NULL::text AS codigo_puesto,';

    const sql = `
      WITH a AS (${cteA}),
           b AS (${cteB}),
           j AS (
             SELECT ${coalesced},
                    COALESCE(a.total, 0) AS total_a,
                    COALESCE(b.total, 0) AS total_b
             FROM a FULL OUTER JOIN b ON ${joinOn}
           )
      SELECT
        ${keyCols.map((c) => `j.${c}`).join(', ')},
        ${extraNullCols}
        ${nombreSelect},
        j.total_a,
        j.total_b
      FROM j
      ${nombreJoin}
      WHERE (j.total_a + j.total_b) > 0
      ORDER BY (j.total_a + j.total_b) DESC
    `;
    const params = [...baseParams, ...geoParams];

    // Total de la elección de CADA lado: votos totales de su corporación en el
    // ámbito geográfico filtrado. Es por lado porque las corporaciones pueden
    // diferir; alimenta el "Total elección" y el "% elección" de cada tarjeta.
    const elecGeoConds: string[] = [];
    const elecGeoParams: unknown[] = [];
    if (filtro.codigoDepartamento) {
      elecGeoParams.push(filtro.codigoDepartamento);
      elecGeoConds.push(`e.codigo_departamento = $${1 + elecGeoParams.length}`);
    }
    if (filtro.codigoMunicipio) {
      elecGeoParams.push(filtro.codigoMunicipio);
      elecGeoConds.push(`e.codigo_municipio = $${1 + elecGeoParams.length}`);
    }
    if (nivel === 'puesto') {
      elecGeoConds.push('e.codigo_puesto IS NOT NULL');
    }
    const elecSql = `
      SELECT COALESCE(SUM(e.total_votos), 0) AS total
      FROM data_election e
      WHERE e.codigo_corporacion = $1${elecGeoConds.length ? ` AND ${elecGeoConds.join(' AND ')}` : ''}
    `;
    const elecParamsA = [filtro.codigoCorporacionA, ...elecGeoParams];
    const elecParamsB = [filtro.codigoCorporacionB, ...elecGeoParams];

    // Metadatos de cada ítem (nombre + partido) bajo su propia corporación.
    const metaSqlFor = (corpIdx: number, codigoIdx: number, partidoIdx: number): string => `
      SELECT
        MAX(e.${nombreCol})   AS nombre,
        MAX(e.codigo_partido) AS codigo_partido,
        MAX(e.nombre_partido) AS nombre_partido
      FROM data_election e
      WHERE e.codigo_corporacion = $${corpIdx}
        AND e.${codigoCol} IS NOT NULL
        AND (${esCandidato ? `e.codigo_candidato = $${codigoIdx} AND e.codigo_partido = $${partidoIdx}` : `e.codigo_partido = $${codigoIdx}`})
    `;
    const metaParamsA: unknown[] = esCandidato
      ? [filtro.codigoCorporacionA, filtro.codigoA, filtro.codigoPartidoA]
      : [filtro.codigoCorporacionA, filtro.codigoA];
    const metaParamsB: unknown[] = esCandidato
      ? [filtro.codigoCorporacionB, filtro.codigoB, filtro.codigoPartidoB]
      : [filtro.codigoCorporacionB, filtro.codigoB];

    // Todas las consultas son independientes — corren en paralelo.
    const [metaARows, metaBRows, elecARows, elecBRows, rows] = await Promise.all([
      this.db.query<SeleccionadoMetaRow>(metaSqlFor(1, 2, 3), metaParamsA),
      this.db.query<SeleccionadoMetaRow>(metaSqlFor(1, 2, 3), metaParamsB),
      this.db.query<{ total: string | null }>(elecSql, elecParamsA),
      this.db.query<{ total: string | null }>(elecSql, elecParamsB),
      this.db.query<TerritorioComparativoRow>(sql, params),
    ]);
    const metaA = metaARows[0];
    const metaB = metaBRows[0];
    const totalEleccionA = toNum(elecARows[0]?.total);
    const totalEleccionB = toNum(elecBRows[0]?.total);

    const territorios: TerritorioComparativo[] = rows.map((r) => {
      const totalA = toNum(r.total_a);
      const totalB = toNum(r.total_b);
      const par = totalA + totalB;
      const diferencia = Math.abs(totalA - totalB);
      let ganador: GanadorComparativo;
      if (totalA > totalB) ganador = 'A';
      else if (totalB > totalA) ganador = 'B';
      else ganador = 'EMPATE';
      const diferenciaPct = par > 0 ? (diferencia / par) * 100 : 0;
      const participacionAPct = par > 0 ? (totalA / par) * 100 : 0;
      const participacionBPct = par > 0 ? (totalB / par) * 100 : 0;
      return new TerritorioComparativo(
        r.codigo_departamento,
        r.codigo_municipio,
        r.codigo_puesto,
        r.nombre ?? '',
        totalA,
        totalB,
        ganador,
        diferencia,
        Number(diferenciaPct.toFixed(2)),
        Number(participacionAPct.toFixed(2)),
        Number(participacionBPct.toFixed(2)),
      );
    });

    // Totales agregados a partir de los territorios.
    const totalA = territorios.reduce((s, t) => s + t.totalA, 0);
    const totalB = territorios.reduce((s, t) => s + t.totalB, 0);
    const totalTerritoriosA = territorios.filter((t) => t.totalA > 0).length;
    const totalTerritoriosB = territorios.filter((t) => t.totalB > 0).length;

    const buildItem = (
      codigo: string,
      codigoPartidoTupla: string | null,
      codigoCorporacion: string,
      total: number,
      totalEleccion: number,
      totalTerritorios: number,
      meta: SeleccionadoMetaRow | undefined,
    ): ItemComparativoTerritorial => {
      const nombre = meta?.nombre ?? codigo;
      // % sobre el total de la elección de SU corporación (bien definido por
      // lado aun cuando A y B pertenezcan a corporaciones distintas).
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
        codigoCorporacion,
        total,
        totalEleccion,
        totalTerritorios,
        Number(participacionPct.toFixed(2)),
      );
    };

    return new ComparativoTerritorialResultado(
      nivel,
      buildItem(
        filtro.codigoA,
        filtro.codigoPartidoA,
        filtro.codigoCorporacionA,
        totalA,
        totalEleccionA,
        totalTerritoriosA,
        metaA,
      ),
      buildItem(
        filtro.codigoB,
        filtro.codigoPartidoB,
        filtro.codigoCorporacionB,
        totalB,
        totalEleccionB,
        totalTerritoriosB,
        metaB,
      ),
      territorios,
    );
  }

  async compararEstadistico(
    filtro: FiltroComparativoEstadistico,
  ): Promise<ComparativoEstadisticoResultado> {
    const candidatos = filtro.candidatos;

    // Construye los parámetros y la condición de identidad de cada candidato.
    // La identidad real es la tupla (corporación, candidato, partido) porque
    // codigo_candidato se reinicia por partido. Cada candidato ocupa 3 (ó 2 si
    // no tiene partido) parámetros; guardamos los índices para reutilizarlos en
    // las columnas CASE y en el WHERE.
    const params: unknown[] = [];
    const condByCand: string[] = candidatos.map((c) => {
      params.push(c.codigoCorporacion);
      const corpIdx = params.length;
      params.push(c.codigo);
      const codIdx = params.length;
      let partidoCond: string;
      if (c.codigoPartido) {
        params.push(c.codigoPartido);
        partidoCond = `e.codigo_partido = $${params.length}`;
      } else {
        partidoCond = `e.codigo_partido IS NULL`;
      }
      return `(e.codigo_corporacion = $${corpIdx} AND e.codigo_candidato = $${codIdx} AND ${partidoCond})`;
    });
    const whereCandidatos = condByCand.join(' OR ');

    // Una columna CASE por candidato: suma sus votos en cada departamento.
    const caseCols = condByCand
      .map((cond, i) => `COALESCE(SUM(CASE WHEN ${cond} THEN e.total_votos END), 0) AS c${i}`)
      .join(',\n        ');

    const sqlDeptos = `
      WITH dep AS (
        SELECT codigo_departamento, MAX(nombre_departamento) AS nombre_departamento
        FROM dim_divipole
        WHERE codigo_departamento IS NOT NULL
        GROUP BY codigo_departamento
      )
      SELECT
        e.codigo_departamento,
        COALESCE(dep.nombre_departamento, e.codigo_departamento) AS nombre,
        ${caseCols}
      FROM data_election e
      LEFT JOIN dep ON dep.codigo_departamento = e.codigo_departamento
      WHERE (${whereCandidatos})
        AND e.codigo_departamento IS NOT NULL
      GROUP BY e.codigo_departamento, dep.nombre_departamento
      ORDER BY COALESCE(SUM(e.total_votos), 0) DESC
    `;

    // Metadatos + total por candidato en una sola pasada (mismos params base).
    const sqlMeta = `
      SELECT
        e.codigo_corporacion,
        e.codigo_candidato,
        e.codigo_partido,
        MAX(e.nombre_candidato) AS nombre,
        MAX(e.nombre_partido)   AS nombre_partido,
        COALESCE(SUM(e.total_votos), 0) AS total
      FROM data_election e
      WHERE (${whereCandidatos})
      GROUP BY e.codigo_corporacion, e.codigo_candidato, e.codigo_partido
    `;

    const [deptoRows, metaRows] = await Promise.all([
      this.db.query<Record<string, string | null>>(sqlDeptos, params),
      this.db.query<{
        codigo_corporacion: string;
        codigo_candidato: string;
        codigo_partido: string | null;
        nombre: string | null;
        nombre_partido: string | null;
        total: string | null;
      }>(sqlMeta, params),
    ]);

    // Indexamos los metadatos por la misma clave (corp~codigo~partido).
    const keyDe = (corp: string, codigo: string, partido: string | null): string =>
      `${corp}~${codigo}~${partido ?? ''}`;
    const metaByKey = new Map(
      metaRows.map((r) => [keyDe(r.codigo_corporacion, r.codigo_candidato, r.codigo_partido), r]),
    );

    const totalConjunto = candidatos.reduce(
      (s, c) => s + toNum(metaByKey.get(c.key)?.total ?? null),
      0,
    );

    const items: ItemCandidatoEstadistico[] = candidatos.map((c) => {
      const meta = metaByKey.get(c.key);
      const total = toNum(meta?.total ?? null);
      const participacionPct = totalConjunto > 0 ? (total / totalConjunto) * 100 : 0;
      return new ItemCandidatoEstadistico(
        c.key,
        c.codigo,
        c.codigoPartido,
        c.codigoCorporacion,
        meta?.nombre ?? c.codigo,
        meta?.nombre_partido ?? null,
        total,
        Number(participacionPct.toFixed(2)),
      );
    });

    const departamentos: DepartamentoComparativoEstadistico[] = deptoRows.map((row) => {
      const votosPorCand = candidatos.map((c, i) => ({
        cand: c,
        votos: toNum(row[`c${i}`] ?? null),
      }));
      const totalSeleccionados = votosPorCand.reduce((s, v) => s + v.votos, 0);

      const valores = votosPorCand.map(
        (v) =>
          new ValorCandidatoDepartamento(
            v.cand.key,
            v.votos,
            totalSeleccionados > 0 ? Number(((v.votos / totalSeleccionados) * 100).toFixed(2)) : 0,
          ),
      );

      // Líder y segundo más votado para la diferencia y la ventaja.
      const ordenado = [...votosPorCand].sort((a, b) => b.votos - a.votos);
      const lider = ordenado[0];
      const segundo = ordenado[1];
      const votosLider = lider?.votos ?? 0;
      const votosSegundo = segundo?.votos ?? 0;
      const diferencia = votosLider - votosSegundo;
      const ventajaPct = totalSeleccionados > 0 ? (diferencia / totalSeleccionados) * 100 : 0;

      return new DepartamentoComparativoEstadistico(
        String(row.codigo_departamento),
        row.nombre ?? String(row.codigo_departamento),
        valores,
        totalSeleccionados,
        totalSeleccionados > 0 && lider ? lider.cand.key : null,
        diferencia,
        Number(ventajaPct.toFixed(2)),
      );
    });

    // El orden de columnas sigue el ranking global por total de votos.
    items.sort((a, b) => b.totalVotos - a.totalVotos);

    return new ComparativoEstadisticoResultado(items, departamentos);
  }

  async obtenerTerritoriosGanados(
    filtro: FiltroTerritoriosGanados,
  ): Promise<TerritoriosGanadosResultado> {
    const esCandidato = filtro.tipo === 'candidato';
    const codigoCol = esCandidato ? 'codigo_candidato' : 'codigo_partido';
    const nombreCol = esCandidato ? 'nombre_candidato' : 'nombre_partido';

    // Identidad del seleccionado: para partido basta el código; para candidato
    // es la tupla (codigo_candidato, codigo_partido) porque el código se reinicia
    // por partido.
    const condSeleccionado = esCandidato
      ? `(e.codigo_candidato = $2 AND e.codigo_partido = $3)`
      : `e.codigo_partido = $2`;

    const params: unknown[] = [filtro.codigoCorporacion, filtro.codigo];
    if (esCandidato) {
      params.push(filtro.codigoPartido);
    }

    // 1) Metadata del seleccionado: nombre + partido asociado.
    const metaSql = `
      SELECT
        MAX(e.${nombreCol})    AS nombre,
        MAX(e.codigo_partido)  AS codigo_partido,
        MAX(e.nombre_partido)  AS nombre_partido
      FROM data_election e
      WHERE e.codigo_corporacion = $1
        AND e.${codigoCol} IS NOT NULL
        AND ${condSeleccionado}
    `;

    // 2) Por territorio: total de la elección, votos del seleccionado y
    //    votos del más votado. Se queda con los territorios donde el
    //    seleccionado fue el ganador (es decir, votos_seleccionado >= max_votos).
    //    Empates a favor del seleccionado se cuentan como ganados.
    const nivelDepartamento = filtro.nivel === 'departamento';
    const groupCols = nivelDepartamento
      ? 'e.codigo_departamento'
      : 'e.codigo_departamento, e.codigo_municipio';
    const selectCols = nivelDepartamento
      ? `e.codigo_departamento,
         NULL::text AS codigo_municipio,
         COALESCE(MAX(d.nombre_departamento), e.codigo_departamento) AS nombre`
      : `e.codigo_departamento,
         e.codigo_municipio,
         COALESCE(MAX(m.nombre_municipio), e.codigo_municipio) AS nombre`;
    const joinClause = nivelDepartamento
      ? `LEFT JOIN (
           SELECT codigo_departamento, MAX(nombre_departamento) AS nombre_departamento
           FROM dim_divipole
           WHERE codigo_departamento IS NOT NULL
           GROUP BY codigo_departamento
         ) d ON d.codigo_departamento = e.codigo_departamento`
      : `LEFT JOIN (
           SELECT codigo_departamento, codigo_municipio,
                  MAX(nombre_municipio) AS nombre_municipio
           FROM dim_divipole
           WHERE codigo_municipio IS NOT NULL
           GROUP BY codigo_departamento, codigo_municipio
         ) m
           ON m.codigo_departamento = e.codigo_departamento
          AND m.codigo_municipio    = e.codigo_municipio`;

    // Para identificar al "más votado" por territorio agrupamos primero por
    // (territorio, codigo_partido/codigo_candidato) y luego sacamos el máximo
    // por territorio. El votos_seleccionado se calcula a partir del mismo
    // agregado para garantizar consistencia.
    const ganadorGroup = esCandidato
      ? 'e.codigo_departamento' +
        (nivelDepartamento ? '' : ', e.codigo_municipio') +
        ', e.codigo_candidato, e.codigo_partido'
      : 'e.codigo_departamento' +
        (nivelDepartamento ? '' : ', e.codigo_municipio') +
        ', e.codigo_partido';

    const sql = `
      WITH agreg AS (
        SELECT
          e.codigo_departamento,
          ${nivelDepartamento ? 'NULL::text AS codigo_municipio,' : 'e.codigo_municipio,'}
          ${esCandidato ? 'e.codigo_candidato AS codigo,\n          e.codigo_partido,' : 'e.codigo_partido AS codigo,'}
          COALESCE(SUM(e.total_votos), 0) AS votos
        FROM data_election e
        WHERE e.codigo_corporacion = $1
          AND e.${codigoCol} IS NOT NULL
          AND e.codigo_departamento IS NOT NULL
          ${nivelDepartamento ? '' : 'AND e.codigo_municipio IS NOT NULL'}
        GROUP BY ${ganadorGroup}
      ),
      por_terr AS (
        SELECT
          codigo_departamento,
          codigo_municipio,
          MAX(votos) AS max_votos,
          COALESCE(
            SUM(CASE WHEN ${
              esCandidato ? '(codigo = $2 AND codigo_partido = $3)' : 'codigo = $2'
            } THEN votos END),
            0
          ) AS votos_seleccionado
        FROM agreg
        GROUP BY codigo_departamento, codigo_municipio
      )
      SELECT
        ${selectCols},
        COALESCE(SUM(e.total_votos), 0) AS total_votos_territorio,
        MAX(por_terr.votos_seleccionado) AS votos_seleccionado
      FROM data_election e
      ${joinClause}
      JOIN por_terr
        ON por_terr.codigo_departamento = e.codigo_departamento
       AND ${
         nivelDepartamento
           ? 'por_terr.codigo_municipio IS NULL'
           : 'por_terr.codigo_municipio = e.codigo_municipio'
       }
      WHERE e.codigo_corporacion = $1
        AND e.codigo_departamento IS NOT NULL
        ${nivelDepartamento ? '' : 'AND e.codigo_municipio IS NOT NULL'}
        AND por_terr.votos_seleccionado > 0
        AND por_terr.votos_seleccionado >= por_terr.max_votos
      GROUP BY ${groupCols}
      ORDER BY votos_seleccionado DESC
    `;

    const [metaRow, rows] = await Promise.all([
      this.db.queryOne<SeleccionadoMetaRow>(metaSql, params),
      this.db.query<TerritorioGanadoRow>(sql, params),
    ]);

    const territorios: TerritorioGanado[] = rows.map((r) => {
      const totalTerritorio = toNum(r.total_votos_territorio);
      const votosSel = toNum(r.votos_seleccionado);
      const participacionPct = totalTerritorio > 0 ? (votosSel / totalTerritorio) * 100 : 0;
      const diferencia = totalTerritorio - votosSel;
      return new TerritorioGanado(
        r.codigo_departamento,
        r.codigo_municipio,
        r.nombre ?? '',
        totalTerritorio,
        votosSel,
        Number(participacionPct.toFixed(2)),
        diferencia,
      );
    });

    // Totales del ámbito (corporación). Se calculan en una sola pasada
    // sobre la tabla.
    const totalesSql = `
      SELECT
        COALESCE(SUM(e.total_votos), 0) AS total_eleccion,
        COALESCE(
          SUM(CASE WHEN ${condSeleccionado} THEN e.total_votos END),
          0
        ) AS total_seleccionado
      FROM data_election e
      WHERE e.codigo_corporacion = $1
    `;
    const totales = await this.db.queryOne<{
      total_eleccion: string | null;
      total_seleccionado: string | null;
    }>(totalesSql, params);

    const totalVotosEleccion = toNum(totales?.total_eleccion ?? null);
    const votosSeleccionado = toNum(totales?.total_seleccionado ?? null);
    const participacionPct =
      totalVotosEleccion > 0 ? (votosSeleccionado / totalVotosEleccion) * 100 : 0;

    const nombre = metaRow?.nombre ?? filtro.codigo;
    const codigoPartido = esCandidato
      ? (filtro.codigoPartido ?? metaRow?.codigo_partido ?? null)
      : filtro.codigo;
    const nombrePartido = esCandidato ? (metaRow?.nombre_partido ?? null) : nombre;

    return new TerritoriosGanadosResultado(
      filtro.tipo,
      filtro.nivel,
      filtro.codigo,
      nombre,
      codigoPartido,
      nombrePartido,
      totalVotosEleccion,
      votosSeleccionado,
      Number(participacionPct.toFixed(2)),
      territorios.length,
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

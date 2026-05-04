import { FiltroElectoral } from '../../domain/value-objects/filtro-electoral.vo';

export interface SqlFragment {
  whereClause: string;
  params: unknown[];
}

/**
 * Construye un fragmento WHERE parametrizado a partir de un FiltroElectoral.
 * El alias se usa para tablas joineadas (ej: 'e' para data_election alias).
 * Devuelve la cláusula sin el prefijo `WHERE`; el caller la inserta donde corresponda.
 */
export function buildFiltroElectoralSql(
  filtro: FiltroElectoral,
  alias: string = '',
  startParamIndex: number = 1,
): SqlFragment {
  const prefix = alias ? `${alias}.` : '';
  const conds: string[] = [];
  const params: unknown[] = [];
  let idx = startParamIndex;

  if (filtro.codigoCorporacion) {
    params.push(filtro.codigoCorporacion);
    conds.push(`${prefix}codigo_corporacion = $${idx++}`);
  }
  if (filtro.codigoDepartamento) {
    params.push(filtro.codigoDepartamento);
    conds.push(`${prefix}codigo_departamento = $${idx++}`);
  }
  if (filtro.codigoMunicipio) {
    params.push(filtro.codigoMunicipio);
    conds.push(`${prefix}codigo_municipio = $${idx++}`);
  }
  if (filtro.codigoPartido) {
    params.push(filtro.codigoPartido);
    conds.push(`${prefix}codigo_partido = $${idx++}`);
  }

  return {
    whereClause: conds.length ? conds.join(' AND ') : '1=1',
    params,
  };
}

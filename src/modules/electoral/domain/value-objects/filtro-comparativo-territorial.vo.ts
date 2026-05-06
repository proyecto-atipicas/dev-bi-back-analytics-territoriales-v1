export type TipoComparacionTerritorial = 'partido' | 'candidato';

/**
 * Filtros del comparativo territorial pairwise (item A vs item B) por
 * partido o candidato. La granularidad la decide el filtro geográfico:
 * - sin codigoDepartamento → agregado por departamento
 * - con codigoDepartamento → agregado por municipio
 * - con codigoMunicipio    → agregado por puesto
 *
 * Cuando `tipo='candidato'`, `codigo_candidato` NO es único globalmente — se
 * reinicia por partido — así que se requiere también el `codigoPartido` para
 * desambiguar y evitar mezclar votos de candidatos homónimos en partidos
 * distintos. Para `tipo='partido'`, los partidos A/B son los códigos mismos.
 */
export class FiltroComparativoTerritorial {
  constructor(
    public readonly tipo: TipoComparacionTerritorial,
    public readonly codigoA: string,
    public readonly codigoB: string,
    public readonly codigoCorporacion: string,
    public readonly codigoDepartamento: string | null = null,
    public readonly codigoMunicipio: string | null = null,
    /** Partido del candidato A. Obligatorio cuando tipo='candidato'. */
    public readonly codigoPartidoA: string | null = null,
    /** Partido del candidato B. Obligatorio cuando tipo='candidato'. */
    public readonly codigoPartidoB: string | null = null,
  ) {}
}

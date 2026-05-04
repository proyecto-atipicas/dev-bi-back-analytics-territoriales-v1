export type TipoComparacionTerritorial = 'partido' | 'candidato';

/**
 * Filtros del comparativo territorial pairwise (item A vs item B) por
 * partido o candidato. La granularidad la decide el filtro geográfico:
 * - sin codigoDepartamento → agregado por departamento
 * - con codigoDepartamento → agregado por municipio
 * - con codigoMunicipio    → agregado por puesto
 */
export class FiltroComparativoTerritorial {
  constructor(
    public readonly tipo: TipoComparacionTerritorial,
    public readonly codigoA: string,
    public readonly codigoB: string,
    public readonly codigoCorporacion: string,
    public readonly codigoDepartamento: string | null = null,
    public readonly codigoMunicipio: string | null = null,
  ) {}
}

/**
 * Identidad de un candidato dentro del comparativo estadístico. Como
 * `codigo_candidato` se reinicia por partido, la clave real es la tupla
 * (codigoCorporacion, codigo, codigoPartido). La corporación se incluye porque
 * el comparativo estadístico mezcla candidatos de DOS corporaciones distintas
 * en una misma tabla por departamento.
 */
export class CandidatoComparativoEstadistico {
  constructor(
    public readonly codigoCorporacion: string,
    public readonly codigo: string,
    /** Partido del candidato. Puede ser null si la fila no tiene partido. */
    public readonly codigoPartido: string | null = null,
  ) {}

  /** Clave estable usada para mapear columnas/valores entre back y front. */
  get key(): string {
    return `${this.codigoCorporacion}~${this.codigo}~${this.codigoPartido ?? ''}`;
  }
}

/**
 * Filtros del comparativo estadístico: comparación multi-candidato entre dos
 * corporaciones, agregada por departamento. A diferencia del comparativo
 * pairwise (A vs B), aquí se comparan N candidatos simultáneamente y las
 * métricas por territorio son head-to-head sobre el conjunto seleccionado.
 */
export class FiltroComparativoEstadistico {
  constructor(public readonly candidatos: CandidatoComparativoEstadistico[]) {}
}

export class KpiSocioeconomico {
  constructor(
    /** Antes `categoria`. */
    public readonly dimension: string,
    public readonly promedio: number,
    public readonly minimo: number,
    public readonly maximo: number,
    public readonly cantidadRegistros: number,
    /** Antes `anoMinimo`. */
    public readonly periodoMinimo: number | null,
    /** Antes `anoMaximo`. */
    public readonly periodoMaximo: number | null,
  ) {}
}

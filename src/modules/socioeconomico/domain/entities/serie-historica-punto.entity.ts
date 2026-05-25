export class SerieHistoricaPunto {
  constructor(
    /** Antes `ano`. */
    public readonly periodo: number,
    /** Antes `categoria`. */
    public readonly dimension: string | null,
    public readonly valor: number,
    /** Observación más reciente del período (cuando el filtro acota a un solo registro por período). */
    public readonly observacion: string | null = null,
    /** Unidad de medida del valor para formateo en el frontend. */
    public readonly unidadMedida: string | null = null,
    /**
     * Serie estadística asociada al punto. Permite trazar una línea por
     * serie (criterio) cuando la referencia tiene múltiples mediciones
     * cualitativamente distintas dentro de la misma dimensión.
     */
    public readonly serieEstadistica: string | null = null,
  ) {}
}

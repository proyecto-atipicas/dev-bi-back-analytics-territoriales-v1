export class IndicadorPorDepartamento {
  constructor(
    public readonly codigoDepartamento: string,
    public readonly departamento: string,
    /** Antes `calificacion` — describe el nivel de riesgo (medio/alto/extremo/…). */
    public readonly nivelRiesgo: string | null,
    public readonly valor: number,
    /** Antes `ano`. */
    public readonly periodo: number,
    /** Antes `categoria`. */
    public readonly dimension: string | null,
    /** Nuevo: serie estadística asociada (cuando aplica). */
    public readonly serieEstadistica: string | null = null,
    /** Nuevo: nivel geográfico del registro (Departamental/Nacional/…). */
    public readonly nivelGeografico: string | null = null,
    /** Nuevo: referencia del indicador. */
    public readonly referencia: string | null = null,
    /** Nuevo: observación libre. */
    public readonly observacion: string | null = null,
  ) {}
}

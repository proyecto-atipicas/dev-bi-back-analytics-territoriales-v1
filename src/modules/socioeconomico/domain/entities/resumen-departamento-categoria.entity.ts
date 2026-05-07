/**
 * Snapshot por dimensión para un departamento dado: valor más reciente,
 * nivel de riesgo, posición/ranking nacional y promedio nacional para esa
 * misma (dimensión, período). Sirve para el panel "Detalle por departamento".
 *
 * Nota: el archivo conserva el nombre `resumen-departamento-categoria.entity.ts`
 * por compatibilidad de paths, pero la clase ahora opera por `dimension`.
 */
export class ResumenDepartamentoDimension {
  constructor(
    public readonly codigoDepartamento: string,
    public readonly departamento: string,
    /** Antes `categoria`. */
    public readonly dimension: string,
    public readonly valor: number,
    /** Antes `calificacion`. */
    public readonly nivelRiesgo: string | null,
    /** Antes `ano`. */
    public readonly periodo: number,
    /** Posición del departamento en el ranking de la dimensión (1 = mayor valor). */
    public readonly posicion: number,
    /** Total de departamentos con datos en la dimensión para ese período. */
    public readonly totalDepartamentos: number,
    /** Promedio nacional de la dimensión para ese período. */
    public readonly promedioNacional: number,
    /** Valor del depto en el período inmediatamente anterior, si existe. */
    public readonly valorPeriodoAnterior: number | null,
    public readonly periodoAnterior: number | null,
  ) {}
}

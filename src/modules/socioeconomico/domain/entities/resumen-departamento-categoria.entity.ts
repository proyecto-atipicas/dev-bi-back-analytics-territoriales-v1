/**
 * Snapshot por categoría para un departamento dado: valor más reciente,
 * calificación, posición/ranking nacional y promedio nacional para ese
 * mismo (categoría, año). Sirve para el panel "Detalle por departamento"
 * del módulo socioeconómico.
 */
export class ResumenDepartamentoCategoria {
  constructor(
    public readonly codigoDepartamento: string,
    public readonly departamento: string,
    public readonly categoria: string,
    public readonly valor: number,
    public readonly calificacion: string | null,
    public readonly ano: number,
    /** Posición del departamento en el ranking de la categoría (1 = mayor valor). */
    public readonly posicion: number,
    /** Total de departamentos con datos en la categoría para ese año. */
    public readonly totalDepartamentos: number,
    /** Promedio nacional de la categoría para ese año. */
    public readonly promedioNacional: number,
    /** Valor del depto en el año inmediatamente anterior, si existe. */
    public readonly valorAnoAnterior: number | null,
    public readonly anoAnterior: number | null,
  ) {}
}

export class IndicadorPorDepartamento {
  constructor(
    public readonly codigoDepartamento: string,
    public readonly departamento: string,
    public readonly calificacion: string | null,
    public readonly valor: number,
    public readonly ano: number,
    public readonly categoria: string | null,
  ) {}
}

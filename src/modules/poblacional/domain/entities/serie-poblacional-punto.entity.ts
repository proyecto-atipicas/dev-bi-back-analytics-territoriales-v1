export class SeriePoblacionalPunto {
  constructor(
    public readonly anio: number,
    public readonly mes: number | null,
    public readonly dimension: string | null,
    public readonly criterio: string | null,
    public readonly valor: number,
  ) {}
}

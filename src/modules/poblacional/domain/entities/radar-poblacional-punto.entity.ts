export class RadarPoblacionalPunto {
  constructor(
    public readonly criterio: string,
    public readonly valor: number,
    public readonly anio: number | null,
    public readonly mes: number | null,
  ) {}
}

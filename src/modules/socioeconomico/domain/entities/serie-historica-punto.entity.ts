export class SerieHistoricaPunto {
  constructor(
    public readonly ano: number,
    public readonly categoria: string | null,
    public readonly valor: number,
  ) {}
}

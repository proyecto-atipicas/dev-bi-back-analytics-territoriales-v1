export class SerieHistoricaPunto {
  constructor(
    /** Antes `ano`. */
    public readonly periodo: number,
    /** Antes `categoria`. */
    public readonly dimension: string | null,
    public readonly valor: number,
  ) {}
}

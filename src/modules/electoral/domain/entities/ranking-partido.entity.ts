export class RankingPartido {
  constructor(
    public readonly codigoPartido: string,
    public readonly nombrePartido: string,
    public readonly totalVotos: number,
    public readonly totalCandidatos: number,
  ) {}
}

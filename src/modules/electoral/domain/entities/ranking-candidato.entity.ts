export class RankingCandidato {
  constructor(
    public readonly codigoCandidato: string,
    public readonly nombreCandidato: string,
    public readonly codigoPartido: string | null,
    public readonly nombrePartido: string | null,
    public readonly totalVotos: number,
  ) {}
}

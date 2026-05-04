export class ResumenElectoral {
  constructor(
    public readonly totalVotos: number,
    public readonly totalCandidatos: number,
    public readonly totalPartidos: number,
    public readonly totalCorporaciones: number,
    public readonly totalDepartamentos: number,
    public readonly totalMunicipios: number,
  ) {}
}

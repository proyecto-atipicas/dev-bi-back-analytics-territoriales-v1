export class VotosPorMunicipio {
  constructor(
    public readonly codigoDepartamento: string,
    public readonly codigoMunicipio: string,
    public readonly nombreMunicipio: string,
    public readonly totalVotos: number,
  ) {}
}

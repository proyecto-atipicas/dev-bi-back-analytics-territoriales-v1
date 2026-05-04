export class VotosPorPuesto {
  constructor(
    public readonly codigoDepartamento: string,
    public readonly codigoMunicipio: string,
    public readonly codigoPuesto: string,
    public readonly nombrePuesto: string,
    public readonly totalVotos: number,
  ) {}
}

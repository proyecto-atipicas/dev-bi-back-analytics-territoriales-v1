export class VotosPorDepartamento {
  constructor(
    public readonly codigoDepartamento: string,
    public readonly nombreDepartamento: string,
    public readonly totalVotos: number,
  ) {}
}

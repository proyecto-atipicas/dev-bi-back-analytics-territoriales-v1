export class KpiSocioeconomico {
  constructor(
    public readonly categoria: string,
    public readonly promedio: number,
    public readonly minimo: number,
    public readonly maximo: number,
    public readonly cantidadRegistros: number,
    public readonly anoMinimo: number | null,
    public readonly anoMaximo: number | null,
  ) {}
}

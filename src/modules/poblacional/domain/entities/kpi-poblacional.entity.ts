export class KpiPoblacional {
  constructor(
    public readonly dimension: string,
    public readonly referencia: string | null,
    public readonly promedio: number,
    public readonly minimo: number,
    public readonly maximo: number,
    public readonly cantidadRegistros: number,
  ) {}
}

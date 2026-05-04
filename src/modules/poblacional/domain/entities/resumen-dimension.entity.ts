export class FuenteConReferencias {
  constructor(
    public readonly fuente: string,
    public readonly cantidadReferencias: number,
  ) {}
}

export class ResumenDimension {
  constructor(
    public readonly dimension: string,
    public readonly fuentes: FuenteConReferencias[],
    public readonly totalReferencias: number,
  ) {}
}

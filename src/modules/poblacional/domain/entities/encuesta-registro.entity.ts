export class EncuestaRegistro {
  constructor(
    public readonly fuente: string | null,
    public readonly dimension: string | null,
    public readonly referencia: string | null,
    public readonly criterio: string | null,
    public readonly mes: number | null,
    public readonly anio: number | null,
    public readonly reporte: number,
  ) {}
}

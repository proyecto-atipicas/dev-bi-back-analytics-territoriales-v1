export class ComparativoCorporacion {
  constructor(
    public readonly codigoCorporacion: string,
    public readonly nombreCorporacion: string,
    public readonly totalVotos: number,
    public readonly totalCandidatos: number,
    public readonly totalPartidos: number,
    /** Participación porcentual del total seleccionado en el comparativo (0–100). */
    public readonly participacionPct: number,
  ) {}
}

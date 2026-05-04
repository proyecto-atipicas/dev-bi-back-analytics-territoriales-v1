export class ResumenCorporacion {
  constructor(
    public readonly codigoCorporacion: string,
    public readonly nombreCorporacion: string,
    public readonly totalVotos: number,
    public readonly totalCandidatos: number,
    public readonly totalPartidos: number,
    /** Participación porcentual sobre el total de votos del universo filtrado (0–100) */
    public readonly participacionPct: number,
  ) {}
}

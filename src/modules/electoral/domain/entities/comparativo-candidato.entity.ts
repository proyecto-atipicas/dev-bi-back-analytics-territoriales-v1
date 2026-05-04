export class ComparativoCandidato {
  constructor(
    public readonly codigoCandidato: string,
    public readonly nombreCandidato: string,
    public readonly codigoPartido: string | null,
    public readonly nombrePartido: string | null,
    public readonly codigoCorporacion: string | null,
    public readonly nombreCorporacion: string | null,
    public readonly totalVotos: number,
    /** Participación porcentual del total seleccionado en el comparativo (0–100). */
    public readonly participacionPct: number,
  ) {}
}

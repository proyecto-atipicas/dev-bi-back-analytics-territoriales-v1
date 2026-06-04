/**
 * Un candidato dentro del comparativo estadístico, con su total agregado sobre
 * el ámbito analizado (todos los departamentos). `participacionPct` es el % de
 * sus votos sobre el total del conjunto de candidatos seleccionados.
 */
export class ItemCandidatoEstadistico {
  constructor(
    /** Clave estable (codigoCorporacion~codigo~codigoPartido). */
    public readonly key: string,
    public readonly codigo: string,
    public readonly codigoPartido: string | null,
    public readonly codigoCorporacion: string,
    public readonly nombre: string,
    public readonly nombrePartido: string | null,
    public readonly totalVotos: number,
    /** % de los votos del candidato sobre el total del conjunto seleccionado. */
    public readonly participacionPct: number,
  ) {}
}

/** Votos de un candidato concreto dentro de un departamento. */
export class ValorCandidatoDepartamento {
  constructor(
    public readonly key: string,
    public readonly votos: number,
    /** % de los votos del candidato sobre el total del par/conjunto en el depto. */
    public readonly participacionPct: number,
  ) {}
}

/**
 * Fila de la tabla comparativa: un departamento con los votos de cada candidato
 * seleccionado y las métricas head-to-head del conjunto (líder, diferencia y
 * ventaja del líder sobre el segundo).
 */
export class DepartamentoComparativoEstadistico {
  constructor(
    public readonly codigoDepartamento: string,
    public readonly nombre: string,
    /** Votos por candidato en este departamento, en el mismo orden que `candidatos`. */
    public readonly valores: ValorCandidatoDepartamento[],
    /** Suma de votos de todos los candidatos seleccionados en el departamento. */
    public readonly totalSeleccionados: number,
    /** Clave del candidato más votado en el departamento (null si no hay votos). */
    public readonly liderKey: string | null,
    /** Diferencia en votos entre el líder y el segundo más votado. */
    public readonly diferencia: number,
    /** Ventaja del líder sobre el segundo, en puntos porcentuales del conjunto (0-100). */
    public readonly ventajaPct: number,
  ) {}
}

export class ComparativoEstadisticoResultado {
  constructor(
    /** Candidatos seleccionados, ordenados por total de votos descendente. */
    public readonly candidatos: ItemCandidatoEstadistico[],
    /** Departamentos con datos, ordenados por total del conjunto descendente. */
    public readonly departamentos: DepartamentoComparativoEstadistico[],
  ) {}
}

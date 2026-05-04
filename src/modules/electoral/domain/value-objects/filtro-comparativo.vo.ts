/**
 * Filtros del comparativo a nivel corporación.
 * Requiere al menos 2 códigos para que la comparación tenga sentido.
 */
export class FiltroComparativoCorporacion {
  constructor(
    public readonly codigosCorporacion: string[],
    public readonly codigoDepartamento: string | null = null,
    public readonly codigoMunicipio: string | null = null,
  ) {}
}

/**
 * Filtros del comparativo a nivel candidato.
 * Permite mezclar candidatos de distintas corporaciones (definición acordada con negocio).
 */
export class FiltroComparativoCandidato {
  constructor(
    public readonly codigosCandidato: string[],
    public readonly codigoDepartamento: string | null = null,
    public readonly codigoMunicipio: string | null = null,
  ) {}
}

/**
 * Filtros transversales que aplican a casi todas las consultas del contexto electoral.
 * Todos los campos son opcionales; cuando están vacíos, no se filtra por ese atributo.
 */
export class FiltroElectoral {
  constructor(
    public readonly codigoCorporacion: string | null = null,
    public readonly codigoDepartamento: string | null = null,
    public readonly codigoMunicipio: string | null = null,
    public readonly codigoPartido: string | null = null,
  ) {}

  static empty(): FiltroElectoral {
    return new FiltroElectoral();
  }

  isEmpty(): boolean {
    return (
      !this.codigoCorporacion &&
      !this.codigoDepartamento &&
      !this.codigoMunicipio &&
      !this.codigoPartido
    );
  }
}

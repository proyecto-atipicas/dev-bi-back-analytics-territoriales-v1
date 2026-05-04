export class Puesto {
  constructor(
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly codigoMunicipio: string,
    public readonly codigoZona: string | null,
  ) {
    if (!codigo || codigo.trim() === '') {
      throw new Error('Puesto: codigo no puede estar vacío');
    }
    if (!nombre || nombre.trim() === '') {
      throw new Error('Puesto: nombre no puede estar vacío');
    }
    if (!codigoMunicipio || codigoMunicipio.trim() === '') {
      throw new Error('Puesto: codigoMunicipio no puede estar vacío');
    }
  }
}

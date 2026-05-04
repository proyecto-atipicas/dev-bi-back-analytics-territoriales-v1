export class Municipio {
  constructor(
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly codigoDepartamento: string,
  ) {
    if (!codigo || codigo.trim() === '') {
      throw new Error('Municipio: codigo no puede estar vacío');
    }
    if (!nombre || nombre.trim() === '') {
      throw new Error('Municipio: nombre no puede estar vacío');
    }
    if (!codigoDepartamento || codigoDepartamento.trim() === '') {
      throw new Error('Municipio: codigoDepartamento no puede estar vacío');
    }
  }
}

export class Corporacion {
  constructor(
    public readonly codigo: string,
    public readonly nombre: string,
  ) {
    if (!codigo || codigo.trim() === '') {
      throw new Error('Corporacion: codigo no puede estar vacío');
    }
    if (!nombre || nombre.trim() === '') {
      throw new Error('Corporacion: nombre no puede estar vacío');
    }
  }
}

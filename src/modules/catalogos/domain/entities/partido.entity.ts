export class Partido {
  constructor(
    public readonly codigo: string,
    public readonly nombre: string,
  ) {
    if (!codigo || codigo.trim() === '') {
      throw new Error('Partido: codigo no puede estar vacío');
    }
    if (!nombre || nombre.trim() === '') {
      throw new Error('Partido: nombre no puede estar vacío');
    }
  }
}

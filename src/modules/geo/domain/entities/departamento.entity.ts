export class Departamento {
  constructor(
    public readonly codigo: string,
    public readonly nombre: string,
  ) {
    if (!codigo || codigo.trim() === '') {
      throw new Error('Departamento: codigo no puede estar vacío');
    }
    if (!nombre || nombre.trim() === '') {
      throw new Error('Departamento: nombre no puede estar vacío');
    }
  }
}

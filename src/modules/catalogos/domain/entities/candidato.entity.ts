export class Candidato {
  constructor(
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly codigoPartido: string | null,
    public readonly codigoCorporacion: string | null,
    public readonly nombrePartido: string | null = null,
  ) {
    if (!codigo || codigo.trim() === '') {
      throw new Error('Candidato: codigo no puede estar vacío');
    }
    if (!nombre || nombre.trim() === '') {
      throw new Error('Candidato: nombre no puede estar vacío');
    }
  }
}

export class Fuente {
  constructor(
    public readonly id: string,
    public readonly fuente: string,
    public readonly tipificacion: string,
    public readonly fechaPublicacion: string | null,
    public readonly link: string | null,
  ) {
    if (!fuente || fuente.trim() === '') {
      throw new Error('Fuente: nombre no puede estar vacío');
    }
    if (!tipificacion || tipificacion.trim() === '') {
      throw new Error('Fuente: tipificacion no puede estar vacía');
    }
  }
}

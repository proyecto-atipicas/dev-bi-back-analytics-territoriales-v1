import { FuenteSocioeconomica } from '../value-objects/fuente-socioeconomica.vo';

export class IndicadorSocioeconomico {
  constructor(
    public readonly fuente: FuenteSocioeconomica,
    public readonly categoria: string | null,
    public readonly ano: number | null,
    public readonly departamento: string | null,
    public readonly codigoDepartamento: string | null,
    public readonly calificacion: string | null,
    public readonly valor: number,
  ) {}
}

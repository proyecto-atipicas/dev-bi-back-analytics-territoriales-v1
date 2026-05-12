import { Fuente } from '../entities/fuente.entity';

export const FUENTES_REPOSITORY = Symbol('FUENTES_REPOSITORY');

export interface FiltroFuentes {
  tipificacion: string | null;
  fuente: string | null;
}

export interface FuentesRepositoryPort {
  listar(filtro: FiltroFuentes): Promise<Fuente[]>;
  listarTipificaciones(): Promise<string[]>;
  listarNombresFuente(): Promise<string[]>;
}

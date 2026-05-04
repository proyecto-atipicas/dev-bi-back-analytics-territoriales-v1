import { Candidato } from '../entities/candidato.entity';
import { Corporacion } from '../entities/corporacion.entity';
import { Partido } from '../entities/partido.entity';

export const CATALOGOS_REPOSITORY = Symbol('CATALOGOS_REPOSITORY');

export interface ListarPartidosFiltros {
  codigoCorporacion?: string | null;
}

export interface ListarCandidatosFiltros {
  codigoCorporacion?: string | null;
  codigoPartido?: string | null;
  /**
   * Limite máximo de candidatos. Necesario porque la fuente puede tener miles
   * y el endpoint normalmente se usa para autocompletes/filtros.
   */
  limite?: number;
}

export interface CatalogosRepositoryPort {
  listarCorporaciones(): Promise<Corporacion[]>;
  listarPartidos(filtros: ListarPartidosFiltros): Promise<Partido[]>;
  listarCandidatos(filtros: ListarCandidatosFiltros): Promise<Candidato[]>;
}

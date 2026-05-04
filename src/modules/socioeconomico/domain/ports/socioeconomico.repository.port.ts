import { IndicadorPorDepartamento } from '../entities/indicador-departamento.entity';
import { KpiSocioeconomico } from '../entities/kpi-socioeconomico.entity';
import { SerieHistoricaPunto } from '../entities/serie-historica-punto.entity';
import { FuenteSocioeconomica } from '../value-objects/fuente-socioeconomica.vo';

export const SOCIOECONOMICO_REPOSITORY = Symbol('SOCIOECONOMICO_REPOSITORY');

export interface FiltroSocioeconomico {
  fuente: FuenteSocioeconomica;
  /**
   * Filtro adicional por la columna `fuente` de `data_publicaciones`
   * (ej: "DNP TerriData", "Externado e Indepaz", "Mapa de Riesgos").
   * Solo aplica cuando fuente === PUBLICACIONES.
   */
  fuentePublicacion?: string | null;
  codigoDepartamento?: string | null;
  categoria?: string | null;
  ano?: number | null;
}

export interface SocioeconomicoRepositoryPort {
  listarCategorias(
    fuente: FuenteSocioeconomica,
    fuentePublicacion?: string | null,
  ): Promise<string[]>;

  /** Lista los valores distintos de la columna `fuente` en `data_publicaciones`. */
  listarFuentesPublicaciones(): Promise<string[]>;

  obtenerKpis(filtro: FiltroSocioeconomico): Promise<KpiSocioeconomico[]>;
  obtenerSerieHistorica(filtro: FiltroSocioeconomico): Promise<SerieHistoricaPunto[]>;

  /**
   * Devuelve los indicadores discriminados por departamento. Si no se
   * especifica `ano` en el filtro, usa el último año disponible respetando
   * los demás filtros (categoría, fuente, etc.). Sirve para el mapa de
   * calor por calificación y la tabla lateral.
   */
  obtenerPorDepartamento(filtro: FiltroSocioeconomico): Promise<IndicadorPorDepartamento[]>;
}

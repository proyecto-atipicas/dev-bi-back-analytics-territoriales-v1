import { IndicadorPorDepartamento } from '../entities/indicador-departamento.entity';
import { KpiSocioeconomico } from '../entities/kpi-socioeconomico.entity';
import { ResumenDepartamentoDimension } from '../entities/resumen-departamento-categoria.entity';
import { SerieHistoricaPunto } from '../entities/serie-historica-punto.entity';

export const SOCIOECONOMICO_REPOSITORY = Symbol('SOCIOECONOMICO_REPOSITORY');

export interface FiltroSocioeconomico {
  /**
   * Filtro por la columna `fuente` de `data_socioeconómica`
   * (ej: "DNP TerriData", "Externado e Indepaz", "Mapa de Riesgos").
   */
  fuentePublicacion?: string | null;
  codigoDepartamento?: string | null;
  /** Antes `categoria`. */
  dimension?: string | null;
  /** Antes `ano`. */
  periodo?: number | null;
  /** Filtra por `referencia`. */
  referencia?: string | null;
  /** Filtra por `nivel_geografico` (Departamental/Nacional/…). */
  nivelGeografico?: string | null;
}

export interface SocioeconomicoRepositoryPort {
  listarDimensiones(fuentePublicacion?: string | null): Promise<string[]>;

  /** Lista los valores distintos de la columna `fuente` en `data_socioeconómica`. */
  listarFuentesPublicaciones(): Promise<string[]>;

  /** Distinct de `referencia`. Acepta filtro por fuentePublicacion y dimensión. */
  listarReferencias(filtro: FiltroSocioeconomico): Promise<string[]>;

  /** Distinct de `nivel_geografico`. Acepta filtro por fuentePublicacion, dimensión y referencia. */
  listarNivelesGeograficos(filtro: FiltroSocioeconomico): Promise<string[]>;

  obtenerKpis(filtro: FiltroSocioeconomico): Promise<KpiSocioeconomico[]>;
  obtenerSerieHistorica(filtro: FiltroSocioeconomico): Promise<SerieHistoricaPunto[]>;

  /**
   * Devuelve los indicadores discriminados por departamento. Si no se
   * especifica `periodo` en el filtro, usa el último período disponible
   * respetando los demás filtros (dimensión, fuentePublicacion, etc.). Sirve para el
   * mapa de calor por nivel de riesgo y la tabla lateral.
   */
  obtenerPorDepartamento(filtro: FiltroSocioeconomico): Promise<IndicadorPorDepartamento[]>;

  /**
   * Snapshot por dimensión para un departamento puntual: último valor,
   * nivel de riesgo, posición y promedio nacional. El filtro requiere
   * `codigoDepartamento`; `dimension` se ignora (devuelve TODAS las
   * dimensiones disponibles). Sirve para el panel "Detalle por departamento".
   */
  obtenerResumenDepartamento(filtro: FiltroSocioeconomico): Promise<ResumenDepartamentoDimension[]>;
}

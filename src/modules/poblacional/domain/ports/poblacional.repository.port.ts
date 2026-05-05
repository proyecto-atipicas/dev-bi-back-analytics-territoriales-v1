import { KpiPoblacional } from '../entities/kpi-poblacional.entity';
import { RadarPoblacionalPunto } from '../entities/radar-poblacional-punto.entity';
import { ResumenDimension } from '../entities/resumen-dimension.entity';
import { SeriePoblacionalPunto } from '../entities/serie-poblacional-punto.entity';

export const POBLACIONAL_REPOSITORY = Symbol('POBLACIONAL_REPOSITORY');

export interface FiltroPoblacional {
  fuente?: string | null;
  dimension?: string | null;
  referencia?: string | null;
  criterio?: string | null;
  criterios?: string[] | null;
  anio?: number | null;
  mes?: number | null;
}

export interface PoblacionalRepositoryPort {
  listarDimensiones(): Promise<string[]>;
  /**
   * Resumen de cada dimensión con la cantidad de referencias por fuente.
   * Sirve como vista inicial del módulo.
   */
  listarResumenDimensiones(): Promise<ResumenDimension[]>;
  listarReferencias(dimension?: string | null, fuente?: string | null): Promise<string[]>;
  /**
   * Lista los criterios propios de una referencia, filtrables además por dimensión y fuente.
   */
  listarCriterios(filtro: FiltroPoblacional): Promise<string[]>;
  obtenerKpis(filtro: FiltroPoblacional): Promise<KpiPoblacional[]>;
  obtenerSerieHistorica(filtro: FiltroPoblacional): Promise<SeriePoblacionalPunto[]>;
  /**
   * Para la gráfica de radar: un valor por criterio en el último período disponible
   * de la combinación dimensión/fuente/referencia.
   */
  obtenerRadarUltimoPeriodo(filtro: FiltroPoblacional): Promise<RadarPoblacionalPunto[]>;
}

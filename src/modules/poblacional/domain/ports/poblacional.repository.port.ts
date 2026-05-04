import { KpiPoblacional } from '../entities/kpi-poblacional.entity';
import { ResumenDimension } from '../entities/resumen-dimension.entity';
import { SeriePoblacionalPunto } from '../entities/serie-poblacional-punto.entity';

export const POBLACIONAL_REPOSITORY = Symbol('POBLACIONAL_REPOSITORY');

export interface FiltroPoblacional {
  fuente?: string | null;
  dimension?: string | null;
  referencia?: string | null;
  criterio?: string | null;
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
  obtenerKpis(filtro: FiltroPoblacional): Promise<KpiPoblacional[]>;
  obtenerSerieHistorica(filtro: FiltroPoblacional): Promise<SeriePoblacionalPunto[]>;
}

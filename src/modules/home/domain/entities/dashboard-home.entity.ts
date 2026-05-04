import { KpiPoblacional } from '../../../poblacional/domain/entities/kpi-poblacional.entity';
import { KpiSocioeconomico } from '../../../socioeconomico/domain/entities/kpi-socioeconomico.entity';
import { ResumenCorporacion } from '../../../electoral/domain/entities/resumen-corporacion.entity';
import { ResumenElectoral } from '../../../electoral/domain/entities/resumen-electoral.entity';
import { VotosPorDepartamento } from '../../../electoral/domain/entities/votos-departamento.entity';

/**
 * Aggregate del dashboard principal. Compone datos de múltiples bounded contexts
 * (electoral, socioeconómico, poblacional) en una respuesta única para reducir
 * idas y vueltas desde el frontend.
 */
export class DashboardHome {
  constructor(
    public readonly resumen: ResumenElectoral,
    public readonly tarjetasCorporaciones: ResumenCorporacion[],
    public readonly mapaDepartamentos: VotosPorDepartamento[],
    public readonly kpisSocioeconomicos: KpiSocioeconomico[],
    public readonly kpisPoblacionales: KpiPoblacional[],
  ) {}
}

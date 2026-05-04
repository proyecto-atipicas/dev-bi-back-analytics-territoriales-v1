import { Injectable } from '@nestjs/common';
import { ObtenerResumenPorCorporacionUseCase } from '../../../electoral/application/use-cases/obtener-resumen-por-corporacion.use-case';
import { ObtenerResumenUseCase } from '../../../electoral/application/use-cases/obtener-resumen.use-case';
import { ObtenerVotosPorDepartamentoUseCase } from '../../../electoral/application/use-cases/obtener-votos-por-departamento.use-case';
import { FiltroElectoral } from '../../../electoral/domain/value-objects/filtro-electoral.vo';
import { ObtenerKpisPoblacionalUseCase } from '../../../poblacional/application/use-cases/obtener-kpis-poblacional.use-case';
import { ObtenerKpisSocioeconomicosUseCase } from '../../../socioeconomico/application/use-cases/obtener-kpis.use-case';
import { FuenteSocioeconomica } from '../../../socioeconomico/domain/value-objects/fuente-socioeconomica.vo';
import { DashboardHome } from '../../domain/entities/dashboard-home.entity';

@Injectable()
export class ObtenerDashboardHomeUseCase {
  constructor(
    private readonly obtenerResumen: ObtenerResumenUseCase,
    private readonly obtenerResumenCorp: ObtenerResumenPorCorporacionUseCase,
    private readonly obtenerVotosDep: ObtenerVotosPorDepartamentoUseCase,
    private readonly obtenerKpisSocio: ObtenerKpisSocioeconomicosUseCase,
    private readonly obtenerKpisPoblacional: ObtenerKpisPoblacionalUseCase,
  ) {}

  async execute(filtro: FiltroElectoral): Promise<DashboardHome> {
    const filtroSocio = {
      fuente: FuenteSocioeconomica.MOE,
      codigoDepartamento: filtro.codigoDepartamento ?? null,
      categoria: null,
      ano: null,
    };
    const filtroPoblacional = {
      fuente: null,
      dimension: null,
      referencia: null,
      criterio: null,
      anio: null,
      mes: null,
    };

    const [resumen, tarjetas, mapa, kpisSocio, kpisPoblacional] = await Promise.all([
      this.obtenerResumen.execute(filtro),
      this.obtenerResumenCorp.execute(filtro),
      this.obtenerVotosDep.execute(filtro),
      this.obtenerKpisSocio.execute(filtroSocio),
      this.obtenerKpisPoblacional.execute(filtroPoblacional),
    ]);

    return new DashboardHome(resumen, tarjetas, mapa, kpisSocio, kpisPoblacional);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { KpiPoblacionalResponseDto } from '../../../../poblacional/infrastructure/http/dtos/kpi-poblacional.response.dto';
import { KpiSocioeconomicoResponseDto } from '../../../../socioeconomico/infrastructure/http/dtos/kpi-socioeconomico.response.dto';
import { ResumenCorporacionResponseDto } from '../../../../electoral/infrastructure/http/dtos/resumen-corporacion.response.dto';
import { ResumenElectoralResponseDto } from '../../../../electoral/infrastructure/http/dtos/resumen-electoral.response.dto';
import { VotosDepartamentoResponseDto } from '../../../../electoral/infrastructure/http/dtos/votos-departamento.response.dto';
import { DashboardHome } from '../../../domain/entities/dashboard-home.entity';

export class DashboardHomeResponseDto {
  @ApiProperty({ type: ResumenElectoralResponseDto })
  resumen!: ResumenElectoralResponseDto;

  @ApiProperty({ type: ResumenCorporacionResponseDto, isArray: true })
  tarjetasCorporaciones!: ResumenCorporacionResponseDto[];

  @ApiProperty({ type: VotosDepartamentoResponseDto, isArray: true })
  mapaDepartamentos!: VotosDepartamentoResponseDto[];

  @ApiProperty({ type: KpiSocioeconomicoResponseDto, isArray: true })
  kpisSocioeconomicos!: KpiSocioeconomicoResponseDto[];

  @ApiProperty({ type: KpiPoblacionalResponseDto, isArray: true })
  kpisPoblacionales!: KpiPoblacionalResponseDto[];

  static fromDomain(d: DashboardHome): DashboardHomeResponseDto {
    return {
      resumen: ResumenElectoralResponseDto.fromDomain(d.resumen),
      tarjetasCorporaciones: d.tarjetasCorporaciones.map(ResumenCorporacionResponseDto.fromDomain),
      mapaDepartamentos: d.mapaDepartamentos.map(VotosDepartamentoResponseDto.fromDomain),
      kpisSocioeconomicos: d.kpisSocioeconomicos.map(KpiSocioeconomicoResponseDto.fromDomain),
      kpisPoblacionales: d.kpisPoblacionales.map(KpiPoblacionalResponseDto.fromDomain),
    };
  }
}

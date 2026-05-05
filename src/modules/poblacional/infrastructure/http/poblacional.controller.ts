import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListarCriteriosUseCase } from '../../application/use-cases/listar-criterios.use-case';
import { ListarDimensionesUseCase } from '../../application/use-cases/listar-dimensiones.use-case';
import { ListarReferenciasUseCase } from '../../application/use-cases/listar-referencias.use-case';
import { ListarResumenDimensionesUseCase } from '../../application/use-cases/listar-resumen-dimensiones.use-case';
import { ObtenerKpisPoblacionalUseCase } from '../../application/use-cases/obtener-kpis-poblacional.use-case';
import { ObtenerRadarPoblacionalUseCase } from '../../application/use-cases/obtener-radar-poblacional.use-case';
import { ObtenerSeriePoblacionalUseCase } from '../../application/use-cases/obtener-serie-poblacional.use-case';
import {
  FiltroPoblacionalQueryDto,
  ListarCriteriosQueryDto,
  ListarReferenciasQueryDto,
} from './dtos/filtro-poblacional.query.dto';
import { KpiPoblacionalResponseDto } from './dtos/kpi-poblacional.response.dto';
import { RadarPoblacionalResponseDto } from './dtos/radar-poblacional.response.dto';
import { ResumenDimensionResponseDto } from './dtos/resumen-dimension.response.dto';
import { SeriePoblacionalPuntoResponseDto } from './dtos/serie-poblacional-punto.response.dto';

@ApiTags('Poblacional')
@Controller('poblacional')
export class PoblacionalController {
  constructor(
    private readonly listarDimensiones: ListarDimensionesUseCase,
    private readonly listarResumenDimensiones: ListarResumenDimensionesUseCase,
    private readonly listarReferencias: ListarReferenciasUseCase,
    private readonly listarCriterios: ListarCriteriosUseCase,
    private readonly obtenerKpis: ObtenerKpisPoblacionalUseCase,
    private readonly obtenerSerie: ObtenerSeriePoblacionalUseCase,
    private readonly obtenerRadar: ObtenerRadarPoblacionalUseCase,
  ) {}

  @Get('dimensiones')
  @ApiOperation({ summary: 'Lista las dimensiones disponibles' })
  @ApiOkResponse({ type: String, isArray: true })
  async getDimensiones(): Promise<string[]> {
    return this.listarDimensiones.execute();
  }

  @Get('resumen-dimensiones')
  @ApiOperation({
    summary:
      'Resumen inicial: cada dimensión con la cantidad de referencias por fuente',
  })
  @ApiOkResponse({ type: ResumenDimensionResponseDto, isArray: true })
  async getResumenDimensiones(): Promise<ResumenDimensionResponseDto[]> {
    const result = await this.listarResumenDimensiones.execute();
    return result.map(ResumenDimensionResponseDto.fromDomain);
  }

  @Get('referencias')
  @ApiOperation({
    summary: 'Lista las referencias (opcionalmente filtradas por dimensión y/o fuente)',
  })
  @ApiOkResponse({ type: String, isArray: true })
  async getReferencias(@Query() q: ListarReferenciasQueryDto): Promise<string[]> {
    return this.listarReferencias.execute(q.dimension, q.fuente);
  }

  @Get('criterios')
  @ApiOperation({
    summary:
      'Lista los criterios de una referencia (filtrable por dimensión / fuente / referencia)',
  })
  @ApiOkResponse({ type: String, isArray: true })
  async getCriterios(@Query() q: ListarCriteriosQueryDto): Promise<string[]> {
    return this.listarCriterios.execute({
      dimension: q.dimension ?? null,
      fuente: q.fuente ?? null,
      referencia: q.referencia ?? null,
    });
  }

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs (promedio, mín, máx) por dimensión/referencia' })
  @ApiOkResponse({ type: KpiPoblacionalResponseDto, isArray: true })
  async getKpis(
    @Query() q: FiltroPoblacionalQueryDto,
  ): Promise<KpiPoblacionalResponseDto[]> {
    const result = await this.obtenerKpis.execute(q.toDomain());
    return result.map(KpiPoblacionalResponseDto.fromDomain);
  }

  @Get('serie-historica')
  @ApiOperation({ summary: 'Serie histórica por año/mes y dimensión' })
  @ApiOkResponse({ type: SeriePoblacionalPuntoResponseDto, isArray: true })
  async getSerie(
    @Query() q: FiltroPoblacionalQueryDto,
  ): Promise<SeriePoblacionalPuntoResponseDto[]> {
    const result = await this.obtenerSerie.execute(q.toDomain());
    return result.map(SeriePoblacionalPuntoResponseDto.fromDomain);
  }

  @Get('radar')
  @ApiOperation({
    summary:
      'Radar: valor por criterio en el último período disponible para la referencia',
  })
  @ApiOkResponse({ type: RadarPoblacionalResponseDto, isArray: true })
  async getRadar(
    @Query() q: FiltroPoblacionalQueryDto,
  ): Promise<RadarPoblacionalResponseDto[]> {
    const result = await this.obtenerRadar.execute(q.toDomain());
    return result.map(RadarPoblacionalResponseDto.fromDomain);
  }
}

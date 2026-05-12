import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListarDimensionesUseCase } from '../../application/use-cases/listar-categorias.use-case';
import { ListarFuentesPublicacionesUseCase } from '../../application/use-cases/listar-fuentes-publicaciones.use-case';
import { ListarNivelesGeograficosUseCase } from '../../application/use-cases/listar-niveles-geograficos.use-case';
import { ListarReferenciasUseCase } from '../../application/use-cases/listar-referencias.use-case';
import { ObtenerKpisSocioeconomicosUseCase } from '../../application/use-cases/obtener-kpis.use-case';
import { ObtenerPorDepartamentoSocioeconomicoUseCase } from '../../application/use-cases/obtener-por-departamento.use-case';
import { ObtenerResumenDepartamentoUseCase } from '../../application/use-cases/obtener-resumen-departamento.use-case';
import { ObtenerSerieHistoricaUseCase } from '../../application/use-cases/obtener-serie-historica.use-case';
import {
  FiltroSocioeconomicoQueryDto,
  FuentePublicacionQueryDto,
} from './dtos/filtro-socioeconomico.query.dto';
import { IndicadorDepartamentoResponseDto } from './dtos/indicador-departamento.response.dto';
import { KpiSocioeconomicoResponseDto } from './dtos/kpi-socioeconomico.response.dto';
import { ResumenDepartamentoDimensionResponseDto } from './dtos/resumen-departamento-categoria.response.dto';
import { SerieHistoricaPuntoResponseDto } from './dtos/serie-historica-punto.response.dto';

@ApiTags('Socioeconomico')
@Controller('socioeconomico')
export class SocioeconomicoController {
  constructor(
    private readonly listarDimensiones: ListarDimensionesUseCase,
    private readonly listarFuentesPublicaciones: ListarFuentesPublicacionesUseCase,
    private readonly listarReferencias: ListarReferenciasUseCase,
    private readonly listarNivelesGeo: ListarNivelesGeograficosUseCase,
    private readonly obtenerKpis: ObtenerKpisSocioeconomicosUseCase,
    private readonly obtenerSerie: ObtenerSerieHistoricaUseCase,
    private readonly obtenerPorDepartamento: ObtenerPorDepartamentoSocioeconomicoUseCase,
    private readonly obtenerResumenDep: ObtenerResumenDepartamentoUseCase,
  ) {}

  @Get('fuentes-publicaciones')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
  @ApiOperation({
    summary: 'Lista las fuentes (DNP TerriData, Externado e Indepaz, etc.) en data_publicaciones',
  })
  @ApiOkResponse({ type: String, isArray: true })
  async getFuentesPublicaciones(): Promise<string[]> {
    return this.listarFuentesPublicaciones.execute();
  }

  @Get('dimensiones')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
  @ApiOperation({
    summary:
      'Lista las dimensiones disponibles en data_publicaciones (opcionalmente filtrado por fuentePublicacion). Antes `/categorias`.',
  })
  @ApiOkResponse({ type: String, isArray: true })
  async getDimensiones(@Query() q: FuentePublicacionQueryDto): Promise<string[]> {
    return this.listarDimensiones.execute(q.fuentePublicacion);
  }

  @Get('referencias')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
  @ApiOperation({
    summary: 'Distinct de referencias para los filtros aplicados',
  })
  @ApiOkResponse({ type: String, isArray: true })
  async getReferencias(@Query() q: FiltroSocioeconomicoQueryDto): Promise<string[]> {
    return this.listarReferencias.execute(q.toDomain());
  }

  @Get('niveles-geograficos')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
  @ApiOperation({
    summary:
      'Distinct de niveles geográficos (Departamental, Nacional, …) para los filtros aplicados',
  })
  @ApiOkResponse({ type: String, isArray: true })
  async getNivelesGeograficos(@Query() q: FiltroSocioeconomicoQueryDto): Promise<string[]> {
    return this.listarNivelesGeo.execute(q.toDomain());
  }

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs (promedio, mín, máx) por dimensión según filtros' })
  @ApiOkResponse({ type: KpiSocioeconomicoResponseDto, isArray: true })
  async getKpis(@Query() q: FiltroSocioeconomicoQueryDto): Promise<KpiSocioeconomicoResponseDto[]> {
    const result = await this.obtenerKpis.execute(q.toDomain());
    return result.map(KpiSocioeconomicoResponseDto.fromDomain);
  }

  @Get('serie-historica')
  @ApiOperation({ summary: 'Serie histórica por período y dimensión' })
  @ApiOkResponse({ type: SerieHistoricaPuntoResponseDto, isArray: true })
  async getSerieHistorica(
    @Query() q: FiltroSocioeconomicoQueryDto,
  ): Promise<SerieHistoricaPuntoResponseDto[]> {
    const result = await this.obtenerSerie.execute(q.toDomain());
    return result.map(SerieHistoricaPuntoResponseDto.fromDomain);
  }

  @Get('por-departamento')
  @ApiOperation({
    summary:
      'Indicadores por departamento (último período disponible si no se especifica). Alimenta el mapa de calor y la tabla lateral.',
  })
  @ApiOkResponse({ type: IndicadorDepartamentoResponseDto, isArray: true })
  async getPorDepartamento(
    @Query() q: FiltroSocioeconomicoQueryDto,
  ): Promise<IndicadorDepartamentoResponseDto[]> {
    const result = await this.obtenerPorDepartamento.execute(q.toDomain());
    return result.map(IndicadorDepartamentoResponseDto.fromDomain);
  }

  @Get('resumen-departamento')
  @ApiOperation({
    summary:
      'Snapshot por dimensión para un departamento dado: último valor, nivel de riesgo, ranking nacional, promedio nacional y valor del período anterior. Requiere codigoDepartamento.',
  })
  @ApiOkResponse({ type: ResumenDepartamentoDimensionResponseDto, isArray: true })
  async getResumenDepartamento(
    @Query() q: FiltroSocioeconomicoQueryDto,
  ): Promise<ResumenDepartamentoDimensionResponseDto[]> {
    const result = await this.obtenerResumenDep.execute(q.toDomain());
    return result.map(ResumenDepartamentoDimensionResponseDto.fromDomain);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListarCategoriasUseCase } from '../../application/use-cases/listar-categorias.use-case';
import { ListarFuentesPublicacionesUseCase } from '../../application/use-cases/listar-fuentes-publicaciones.use-case';
import { ObtenerKpisSocioeconomicosUseCase } from '../../application/use-cases/obtener-kpis.use-case';
import { ObtenerPorDepartamentoSocioeconomicoUseCase } from '../../application/use-cases/obtener-por-departamento.use-case';
import { ObtenerResumenDepartamentoUseCase } from '../../application/use-cases/obtener-resumen-departamento.use-case';
import { ObtenerSerieHistoricaUseCase } from '../../application/use-cases/obtener-serie-historica.use-case';
import {
  FiltroSocioeconomicoQueryDto,
  FuenteQueryDto,
} from './dtos/filtro-socioeconomico.query.dto';
import { IndicadorDepartamentoResponseDto } from './dtos/indicador-departamento.response.dto';
import { KpiSocioeconomicoResponseDto } from './dtos/kpi-socioeconomico.response.dto';
import { ResumenDepartamentoCategoriaResponseDto } from './dtos/resumen-departamento-categoria.response.dto';
import { SerieHistoricaPuntoResponseDto } from './dtos/serie-historica-punto.response.dto';

@ApiTags('Socioeconomico')
@Controller('socioeconomico')
export class SocioeconomicoController {
  constructor(
    private readonly listarCategorias: ListarCategoriasUseCase,
    private readonly listarFuentesPublicaciones: ListarFuentesPublicacionesUseCase,
    private readonly obtenerKpis: ObtenerKpisSocioeconomicosUseCase,
    private readonly obtenerSerie: ObtenerSerieHistoricaUseCase,
    private readonly obtenerPorDepartamento: ObtenerPorDepartamentoSocioeconomicoUseCase,
    private readonly obtenerResumenDep: ObtenerResumenDepartamentoUseCase,
  ) {}

  @Get('fuentes-publicaciones')
  @ApiOperation({
    summary: 'Lista las fuentes (DNP TerriData, Externado e Indepaz, etc.) en data_publicaciones',
  })
  @ApiOkResponse({ type: String, isArray: true })
  async getFuentesPublicaciones(): Promise<string[]> {
    return this.listarFuentesPublicaciones.execute();
  }

  @Get('categorias')
  @ApiOperation({
    summary:
      'Lista las categorías disponibles para una fuente (opcionalmente filtrado por fuentePublicacion)',
  })
  @ApiOkResponse({ type: String, isArray: true })
  async getCategorias(@Query() q: FuenteQueryDto): Promise<string[]> {
    return this.listarCategorias.execute(q.fuente, q.fuentePublicacion);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs (promedio, mín, máx) por categoría según filtros' })
  @ApiOkResponse({ type: KpiSocioeconomicoResponseDto, isArray: true })
  async getKpis(@Query() q: FiltroSocioeconomicoQueryDto): Promise<KpiSocioeconomicoResponseDto[]> {
    const result = await this.obtenerKpis.execute(q.toDomain());
    return result.map(KpiSocioeconomicoResponseDto.fromDomain);
  }

  @Get('serie-historica')
  @ApiOperation({ summary: 'Serie histórica por año y categoría' })
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
      'Indicadores por departamento (último año disponible si no se especifica). Alimenta el mapa de calor y la tabla lateral.',
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
      'Snapshot por categoría para un departamento dado: último valor, calificación, ranking nacional, promedio nacional y valor del año anterior. Requiere codigoDepartamento.',
  })
  @ApiOkResponse({ type: ResumenDepartamentoCategoriaResponseDto, isArray: true })
  async getResumenDepartamento(
    @Query() q: FiltroSocioeconomicoQueryDto,
  ): Promise<ResumenDepartamentoCategoriaResponseDto[]> {
    const result = await this.obtenerResumenDep.execute(q.toDomain());
    return result.map(ResumenDepartamentoCategoriaResponseDto.fromDomain);
  }
}

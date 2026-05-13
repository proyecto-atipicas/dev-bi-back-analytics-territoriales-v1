import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompararTerritorialUseCase } from '../../application/use-cases/comparar-territorial.use-case';
import { ObtenerRankingCandidatosUseCase } from '../../application/use-cases/obtener-ranking-candidatos.use-case';
import { ObtenerRankingPartidosUseCase } from '../../application/use-cases/obtener-ranking-partidos.use-case';
import { ObtenerResumenPorCorporacionUseCase } from '../../application/use-cases/obtener-resumen-por-corporacion.use-case';
import { ObtenerResumenUseCase } from '../../application/use-cases/obtener-resumen.use-case';
import { ObtenerTerritoriosGanadosUseCase } from '../../application/use-cases/obtener-territorios-ganados.use-case';
import { ObtenerVotosPorDepartamentoUseCase } from '../../application/use-cases/obtener-votos-por-departamento.use-case';
import { ObtenerVotosPorMunicipioUseCase } from '../../application/use-cases/obtener-votos-por-municipio.use-case';
import { ObtenerVotosPorPuestoUseCase } from '../../application/use-cases/obtener-votos-por-puesto.use-case';
import { ComparativoTerritorialResponseDto } from './dtos/comparativo-territorial.response.dto';
import { FiltroComparativoTerritorialQueryDto } from './dtos/filtro-comparativo-territorial.query.dto';
import {
  FiltroElectoralConLimiteQueryDto,
  FiltroElectoralQueryDto,
} from './dtos/filtro-electoral.query.dto';
import { FiltroTerritoriosGanadosQueryDto } from './dtos/filtro-territorios-ganados.query.dto';
import { RankingCandidatoResponseDto } from './dtos/ranking-candidato.response.dto';
import { RankingPartidoResponseDto } from './dtos/ranking-partido.response.dto';
import { ResumenCorporacionResponseDto } from './dtos/resumen-corporacion.response.dto';
import { ResumenElectoralResponseDto } from './dtos/resumen-electoral.response.dto';
import { TerritoriosGanadosResponseDto } from './dtos/territorios-ganados.response.dto';
import { VotosDepartamentoResponseDto } from './dtos/votos-departamento.response.dto';
import { VotosMunicipioResponseDto } from './dtos/votos-municipio.response.dto';
import { VotosPuestoResponseDto } from './dtos/votos-puesto.response.dto';

@ApiTags('Electoral')
@Controller('electoral')
export class ElectoralController {
  constructor(
    private readonly obtenerResumen: ObtenerResumenUseCase,
    private readonly obtenerVotosDep: ObtenerVotosPorDepartamentoUseCase,
    private readonly obtenerVotosMun: ObtenerVotosPorMunicipioUseCase,
    private readonly obtenerVotosPuesto: ObtenerVotosPorPuestoUseCase,
    private readonly obtenerRankingPartidos: ObtenerRankingPartidosUseCase,
    private readonly obtenerRankingCandidatos: ObtenerRankingCandidatosUseCase,
    private readonly obtenerResumenCorp: ObtenerResumenPorCorporacionUseCase,
    private readonly compararTerritorial: CompararTerritorialUseCase,
    private readonly obtenerTerritoriosGanados: ObtenerTerritoriosGanadosUseCase,
  ) {}

  @Get('resumen')
  @ApiOperation({ summary: 'Totales agregados según filtros (votos, candidatos, partidos…)' })
  @ApiOkResponse({ type: ResumenElectoralResponseDto })
  async getResumen(@Query() q: FiltroElectoralQueryDto): Promise<ResumenElectoralResponseDto> {
    const result = await this.obtenerResumen.execute(q.toDomain());
    return ResumenElectoralResponseDto.fromDomain(result);
  }

  @Get('por-departamento')
  @ApiOperation({ summary: 'Total de votos por departamento (alimenta el mapa de Colombia)' })
  @ApiOkResponse({ type: VotosDepartamentoResponseDto, isArray: true })
  async getPorDepartamento(
    @Query() q: FiltroElectoralQueryDto,
  ): Promise<VotosDepartamentoResponseDto[]> {
    const result = await this.obtenerVotosDep.execute(q.toDomain());
    return result.map(VotosDepartamentoResponseDto.fromDomain);
  }

  @Get('por-municipio')
  @ApiOperation({ summary: 'Total de votos por municipio (requiere codigoDepartamento)' })
  @ApiOkResponse({ type: VotosMunicipioResponseDto, isArray: true })
  async getPorMunicipio(@Query() q: FiltroElectoralQueryDto): Promise<VotosMunicipioResponseDto[]> {
    const result = await this.obtenerVotosMun.execute(q.toDomain());
    return result.map(VotosMunicipioResponseDto.fromDomain);
  }

  @Get('por-puesto')
  @ApiOperation({
    summary:
      'Total de votos por puesto de votación (requiere codigoDepartamento y codigoMunicipio)',
  })
  @ApiOkResponse({ type: VotosPuestoResponseDto, isArray: true })
  async getPorPuesto(@Query() q: FiltroElectoralQueryDto): Promise<VotosPuestoResponseDto[]> {
    const result = await this.obtenerVotosPuesto.execute(q.toDomain());
    return result.map(VotosPuestoResponseDto.fromDomain);
  }

  @Get('ranking-partidos')
  @ApiOperation({ summary: 'Top de partidos por votos' })
  @ApiOkResponse({ type: RankingPartidoResponseDto, isArray: true })
  async getRankingPartidos(
    @Query() q: FiltroElectoralConLimiteQueryDto,
  ): Promise<RankingPartidoResponseDto[]> {
    const result = await this.obtenerRankingPartidos.execute(q.toDomain(), q.limite ?? 20);
    return result.map(RankingPartidoResponseDto.fromDomain);
  }

  @Get('ranking-candidatos')
  @ApiOperation({ summary: 'Top de candidatos por votos' })
  @ApiOkResponse({ type: RankingCandidatoResponseDto, isArray: true })
  async getRankingCandidatos(
    @Query() q: FiltroElectoralConLimiteQueryDto,
  ): Promise<RankingCandidatoResponseDto[]> {
    const result = await this.obtenerRankingCandidatos.execute(q.toDomain(), q.limite ?? 50);
    return result.map(RankingCandidatoResponseDto.fromDomain);
  }

  @Get('resumen-corporaciones')
  @ApiOperation({ summary: 'Tarjetas resumen por corporación (votos, candidatos, participación)' })
  @ApiOkResponse({ type: ResumenCorporacionResponseDto, isArray: true })
  async getResumenCorp(
    @Query() q: FiltroElectoralQueryDto,
  ): Promise<ResumenCorporacionResponseDto[]> {
    const result = await this.obtenerResumenCorp.execute(q.toDomain());
    return result.map(ResumenCorporacionResponseDto.fromDomain);
  }

  @Get('territorios-ganados')
  @ApiOperation({
    summary:
      'Lista los territorios (departamentos o municipios) donde un partido o candidato fue el más votado, dentro de una corporación.',
  })
  @ApiOkResponse({ type: TerritoriosGanadosResponseDto })
  async getTerritoriosGanados(
    @Query() q: FiltroTerritoriosGanadosQueryDto,
  ): Promise<TerritoriosGanadosResponseDto> {
    const result = await this.obtenerTerritoriosGanados.execute(q.toDomain());
    return TerritoriosGanadosResponseDto.fromDomain(result);
  }

  @Get('comparativo/territorial')
  @ApiOperation({
    summary:
      'Compara pairwise dos partidos o candidatos con desglose territorial. Granularidad: depto sin filtro, muni con depto, puesto con muni.',
  })
  @ApiOkResponse({ type: ComparativoTerritorialResponseDto })
  async getComparativoTerritorial(
    @Query() q: FiltroComparativoTerritorialQueryDto,
  ): Promise<ComparativoTerritorialResponseDto> {
    const result = await this.compararTerritorial.execute(q.toDomain());
    return ComparativoTerritorialResponseDto.fromDomain(result);
  }
}

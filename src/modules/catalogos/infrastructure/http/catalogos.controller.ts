import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListarCandidatosUseCase } from '../../application/use-cases/listar-candidatos.use-case';
import { ListarCorporacionesUseCase } from '../../application/use-cases/listar-corporaciones.use-case';
import { ListarPartidosUseCase } from '../../application/use-cases/listar-partidos.use-case';
import { CandidatoResponseDto } from './dtos/candidato.response.dto';
import { CorporacionResponseDto } from './dtos/corporacion.response.dto';
import { ListarCandidatosQueryDto } from './dtos/listar-candidatos.query.dto';
import { ListarPartidosQueryDto } from './dtos/listar-partidos.query.dto';
import { PartidoResponseDto } from './dtos/partido.response.dto';

@ApiTags('Catalogos')
@Controller('catalogos')
export class CatalogosController {
  constructor(
    private readonly listarCorporaciones: ListarCorporacionesUseCase,
    private readonly listarPartidos: ListarPartidosUseCase,
    private readonly listarCandidatos: ListarCandidatosUseCase,
  ) {}

  @Get('corporaciones')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
  @ApiOperation({ summary: 'Lista las corporaciones disponibles' })
  @ApiOkResponse({ type: CorporacionResponseDto, isArray: true })
  async getCorporaciones(): Promise<CorporacionResponseDto[]> {
    const result = await this.listarCorporaciones.execute();
    return result.map(CorporacionResponseDto.fromDomain);
  }

  @Get('partidos')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
  @ApiOperation({ summary: 'Lista los partidos políticos (opcionalmente por corporación)' })
  @ApiOkResponse({ type: PartidoResponseDto, isArray: true })
  async getPartidos(@Query() query: ListarPartidosQueryDto): Promise<PartidoResponseDto[]> {
    const result = await this.listarPartidos.execute({
      codigoCorporacion: query.codigoCorporacion ?? null,
    });
    return result.map(PartidoResponseDto.fromDomain);
  }

  @Get('candidatos')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
  @ApiOperation({ summary: 'Lista candidatos filtrando por corporación y/o partido' })
  @ApiOkResponse({ type: CandidatoResponseDto, isArray: true })
  async getCandidatos(@Query() query: ListarCandidatosQueryDto): Promise<CandidatoResponseDto[]> {
    const result = await this.listarCandidatos.execute({
      codigoCorporacion: query.codigoCorporacion ?? null,
      codigoPartido: query.codigoPartido ?? null,
      limite: query.limite,
    });
    return result.map(CandidatoResponseDto.fromDomain);
  }
}

import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListarFuentesUseCase } from '../../application/use-cases/listar-fuentes.use-case';
import { ListarNombresFuenteUseCase } from '../../application/use-cases/listar-nombres-fuente.use-case';
import { ListarTipificacionesUseCase } from '../../application/use-cases/listar-tipificaciones.use-case';
import { FuenteResponseDto } from './dtos/fuente.response.dto';
import { ListarFuentesQueryDto } from './dtos/listar-fuentes.query.dto';

@ApiTags('Fuentes')
@Controller('fuentes')
export class FuentesController {
  constructor(
    private readonly listarFuentes: ListarFuentesUseCase,
    private readonly listarTipificaciones: ListarTipificacionesUseCase,
    private readonly listarNombresFuente: ListarNombresFuenteUseCase,
  ) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
  @ApiOperation({
    summary:
      'Lista las fuentes documentales con filtros opcionales por tipificación y nombre de fuente',
  })
  @ApiOkResponse({ type: FuenteResponseDto, isArray: true })
  async getFuentes(@Query() query: ListarFuentesQueryDto): Promise<FuenteResponseDto[]> {
    const result = await this.listarFuentes.execute(query.toDomain());
    return result.map(FuenteResponseDto.fromDomain);
  }

  @Get('tipificaciones')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
  @ApiOperation({ summary: 'Lista las tipificaciones disponibles (DISTINCT)' })
  @ApiOkResponse({ type: String, isArray: true })
  async getTipificaciones(): Promise<string[]> {
    return this.listarTipificaciones.execute();
  }

  @Get('nombres')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
  @ApiOperation({ summary: 'Lista los nombres de fuente disponibles (DISTINCT)' })
  @ApiOkResponse({ type: String, isArray: true })
  async getNombres(): Promise<string[]> {
    return this.listarNombresFuente.execute();
  }
}

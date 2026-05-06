import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FiltroElectoralQueryDto } from '../../../electoral/infrastructure/http/dtos/filtro-electoral.query.dto';
import { ObtenerDashboardHomeUseCase } from '../../application/use-cases/obtener-dashboard-home.use-case';
import { DashboardHomeResponseDto } from './dtos/dashboard-home.response.dto';

@ApiTags('Home')
@Controller('home')
export class HomeController {
  constructor(private readonly obtenerDashboard: ObtenerDashboardHomeUseCase) {}

  @Get('resumen-global')
  @ApiOperation({
    summary: 'Payload consolidado del Home: resumen, tarjetas, mapa y KPIs en una sola consulta',
  })
  @ApiOkResponse({ type: DashboardHomeResponseDto })
  async getDashboard(@Query() q: FiltroElectoralQueryDto): Promise<DashboardHomeResponseDto> {
    const result = await this.obtenerDashboard.execute(q.toDomain());
    return DashboardHomeResponseDto.fromDomain(result);
  }
}

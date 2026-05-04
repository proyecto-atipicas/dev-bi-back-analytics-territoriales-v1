import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListarDepartamentosUseCase } from '../../application/use-cases/listar-departamentos.use-case';
import { ListarMunicipiosUseCase } from '../../application/use-cases/listar-municipios.use-case';
import { ListarPuestosUseCase } from '../../application/use-cases/listar-puestos.use-case';
import { DepartamentoResponseDto } from './dtos/departamento.response.dto';
import { MunicipioResponseDto } from './dtos/municipio.response.dto';
import { PuestoResponseDto } from './dtos/puesto.response.dto';

@ApiTags('Geo')
@Controller('geo')
export class GeoController {
  constructor(
    private readonly listarDepartamentos: ListarDepartamentosUseCase,
    private readonly listarMunicipios: ListarMunicipiosUseCase,
    private readonly listarPuestos: ListarPuestosUseCase,
  ) {}

  @Get('departamentos')
  @ApiOperation({ summary: 'Lista todos los departamentos disponibles' })
  @ApiOkResponse({ type: DepartamentoResponseDto, isArray: true })
  async getDepartamentos(): Promise<DepartamentoResponseDto[]> {
    const result = await this.listarDepartamentos.execute();
    return result.map(DepartamentoResponseDto.fromDomain);
  }

  @Get('departamentos/:codigo/municipios')
  @ApiOperation({ summary: 'Lista los municipios de un departamento' })
  @ApiOkResponse({ type: MunicipioResponseDto, isArray: true })
  async getMunicipios(@Param('codigo') codigo: string): Promise<MunicipioResponseDto[]> {
    const result = await this.listarMunicipios.execute(codigo);
    return result.map(MunicipioResponseDto.fromDomain);
  }

  @Get('puestos')
  @ApiOperation({ summary: 'Lista los puestos de votación de un municipio' })
  @ApiOkResponse({ type: PuestoResponseDto, isArray: true })
  async getPuestos(
    @Query('codigoDepartamento') codigoDepartamento: string,
    @Query('codigoMunicipio') codigoMunicipio: string,
  ): Promise<PuestoResponseDto[]> {
    const result = await this.listarPuestos.execute(codigoDepartamento, codigoMunicipio);
    return result.map(PuestoResponseDto.fromDomain);
  }
}

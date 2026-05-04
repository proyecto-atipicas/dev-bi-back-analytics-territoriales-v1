import { ApiProperty } from '@nestjs/swagger';
import { Municipio } from '../../../domain/entities/municipio.entity';

export class MunicipioResponseDto {
  @ApiProperty({ example: '11001' })
  codigo!: string;

  @ApiProperty({ example: 'BOGOTÁ D.C.' })
  nombre!: string;

  @ApiProperty({ example: '11' })
  codigoDepartamento!: string;

  static fromDomain(m: Municipio): MunicipioResponseDto {
    return {
      codigo: m.codigo,
      nombre: m.nombre,
      codigoDepartamento: m.codigoDepartamento,
    };
  }
}

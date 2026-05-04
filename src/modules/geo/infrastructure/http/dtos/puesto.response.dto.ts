import { ApiProperty } from '@nestjs/swagger';
import { Puesto } from '../../../domain/entities/puesto.entity';

export class PuestoResponseDto {
  @ApiProperty({ example: '01' })
  codigo!: string;

  @ApiProperty({ example: 'COLEGIO X' })
  nombre!: string;

  @ApiProperty({ example: '11001' })
  codigoMunicipio!: string;

  @ApiProperty({ example: '01', nullable: true })
  codigoZona!: string | null;

  static fromDomain(p: Puesto): PuestoResponseDto {
    return {
      codigo: p.codigo,
      nombre: p.nombre,
      codigoMunicipio: p.codigoMunicipio,
      codigoZona: p.codigoZona,
    };
  }
}

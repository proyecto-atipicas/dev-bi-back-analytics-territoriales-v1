import { ApiProperty } from '@nestjs/swagger';
import { Corporacion } from '../../../domain/entities/corporacion.entity';

export class CorporacionResponseDto {
  @ApiProperty({ example: '1' })
  codigo!: string;

  @ApiProperty({ example: 'SENADO' })
  nombre!: string;

  static fromDomain(c: Corporacion): CorporacionResponseDto {
    return { codigo: c.codigo, nombre: c.nombre };
  }
}

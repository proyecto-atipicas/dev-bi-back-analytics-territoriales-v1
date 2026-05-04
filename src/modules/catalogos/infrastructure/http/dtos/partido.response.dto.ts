import { ApiProperty } from '@nestjs/swagger';
import { Partido } from '../../../domain/entities/partido.entity';

export class PartidoResponseDto {
  @ApiProperty({ example: '00001' })
  codigo!: string;

  @ApiProperty({ example: 'PARTIDO LIBERAL' })
  nombre!: string;

  static fromDomain(p: Partido): PartidoResponseDto {
    return { codigo: p.codigo, nombre: p.nombre };
  }
}

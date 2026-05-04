import { ApiProperty } from '@nestjs/swagger';
import { Departamento } from '../../../domain/entities/departamento.entity';

export class DepartamentoResponseDto {
  @ApiProperty({ example: '11', description: 'Código DIVIPOLA del departamento' })
  codigo!: string;

  @ApiProperty({ example: 'BOGOTÁ D.C.', description: 'Nombre del departamento' })
  nombre!: string;

  static fromDomain(d: Departamento): DepartamentoResponseDto {
    return { codigo: d.codigo, nombre: d.nombre };
  }
}

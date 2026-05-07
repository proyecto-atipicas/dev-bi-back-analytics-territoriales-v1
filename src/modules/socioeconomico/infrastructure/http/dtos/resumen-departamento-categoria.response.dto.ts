import { ApiProperty } from '@nestjs/swagger';
import { ResumenDepartamentoDimension } from '../../../domain/entities/resumen-departamento-categoria.entity';

export class ResumenDepartamentoDimensionResponseDto {
  @ApiProperty({ example: '05' })
  codigoDepartamento!: string;

  @ApiProperty({ example: 'ANTIOQUIA' })
  departamento!: string;

  @ApiProperty({ example: 'Pobreza monetaria' })
  dimension!: string;

  @ApiProperty({ example: 23.45 })
  valor!: number;

  @ApiProperty({ example: 'medio', nullable: true })
  nivelRiesgo!: string | null;

  @ApiProperty({ example: 2023 })
  periodo!: number;

  @ApiProperty({ example: 7, description: 'Posición del depto (1 = mayor valor)' })
  posicion!: number;

  @ApiProperty({ example: 33 })
  totalDepartamentos!: number;

  @ApiProperty({ example: 28.7 })
  promedioNacional!: number;

  @ApiProperty({ example: 24.1, nullable: true })
  valorPeriodoAnterior!: number | null;

  @ApiProperty({ example: 2022, nullable: true })
  periodoAnterior!: number | null;

  static fromDomain(r: ResumenDepartamentoDimension): ResumenDepartamentoDimensionResponseDto {
    return {
      codigoDepartamento: r.codigoDepartamento,
      departamento: r.departamento,
      dimension: r.dimension,
      valor: r.valor,
      nivelRiesgo: r.nivelRiesgo,
      periodo: r.periodo,
      posicion: r.posicion,
      totalDepartamentos: r.totalDepartamentos,
      promedioNacional: r.promedioNacional,
      valorPeriodoAnterior: r.valorPeriodoAnterior,
      periodoAnterior: r.periodoAnterior,
    };
  }
}

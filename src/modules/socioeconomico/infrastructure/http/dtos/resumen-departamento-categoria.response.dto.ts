import { ApiProperty } from '@nestjs/swagger';
import { ResumenDepartamentoCategoria } from '../../../domain/entities/resumen-departamento-categoria.entity';

export class ResumenDepartamentoCategoriaResponseDto {
  @ApiProperty({ example: '05' })
  codigoDepartamento!: string;

  @ApiProperty({ example: 'ANTIOQUIA' })
  departamento!: string;

  @ApiProperty({ example: 'Pobreza monetaria' })
  categoria!: string;

  @ApiProperty({ example: 23.45 })
  valor!: number;

  @ApiProperty({ example: 'medio', nullable: true })
  calificacion!: string | null;

  @ApiProperty({ example: 2023 })
  ano!: number;

  @ApiProperty({ example: 7, description: 'Posición del depto (1 = mayor valor)' })
  posicion!: number;

  @ApiProperty({ example: 33 })
  totalDepartamentos!: number;

  @ApiProperty({ example: 28.7 })
  promedioNacional!: number;

  @ApiProperty({ example: 24.1, nullable: true })
  valorAnoAnterior!: number | null;

  @ApiProperty({ example: 2022, nullable: true })
  anoAnterior!: number | null;

  static fromDomain(r: ResumenDepartamentoCategoria): ResumenDepartamentoCategoriaResponseDto {
    return {
      codigoDepartamento: r.codigoDepartamento,
      departamento: r.departamento,
      categoria: r.categoria,
      valor: r.valor,
      calificacion: r.calificacion,
      ano: r.ano,
      posicion: r.posicion,
      totalDepartamentos: r.totalDepartamentos,
      promedioNacional: r.promedioNacional,
      valorAnoAnterior: r.valorAnoAnterior,
      anoAnterior: r.anoAnterior,
    };
  }
}

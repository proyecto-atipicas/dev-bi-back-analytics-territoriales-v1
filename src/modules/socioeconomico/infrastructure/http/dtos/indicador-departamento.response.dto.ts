import { ApiProperty } from '@nestjs/swagger';
import { IndicadorPorDepartamento } from '../../../domain/entities/indicador-departamento.entity';

export class IndicadorDepartamentoResponseDto {
  @ApiProperty() codigoDepartamento!: string;
  @ApiProperty() departamento!: string;
  @ApiProperty({ nullable: true, description: 'medio | alto | extremo | otro' })
  calificacion!: string | null;
  @ApiProperty() valor!: number;
  @ApiProperty() ano!: number;
  @ApiProperty({ nullable: true }) categoria!: string | null;

  static fromDomain(i: IndicadorPorDepartamento): IndicadorDepartamentoResponseDto {
    return {
      codigoDepartamento: i.codigoDepartamento,
      departamento: i.departamento,
      calificacion: i.calificacion,
      valor: i.valor,
      ano: i.ano,
      categoria: i.categoria,
    };
  }
}

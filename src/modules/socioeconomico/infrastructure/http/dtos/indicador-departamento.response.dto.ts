import { ApiProperty } from '@nestjs/swagger';
import { IndicadorPorDepartamento } from '../../../domain/entities/indicador-departamento.entity';

export class IndicadorDepartamentoResponseDto {
  @ApiProperty() codigoDepartamento!: string;
  @ApiProperty() departamento!: string;
  @ApiProperty({ nullable: true, description: 'medio | alto | extremo | otro' })
  nivelRiesgo!: string | null;
  @ApiProperty() valor!: number;
  @ApiProperty() periodo!: number;
  @ApiProperty({ nullable: true }) dimension!: string | null;
  @ApiProperty({ nullable: true }) serieEstadistica!: string | null;
  @ApiProperty({ nullable: true, description: 'Departamental | Nacional | …' })
  nivelGeografico!: string | null;
  @ApiProperty({ nullable: true }) referencia!: string | null;
  @ApiProperty({ nullable: true }) observacion!: string | null;

  static fromDomain(i: IndicadorPorDepartamento): IndicadorDepartamentoResponseDto {
    return {
      codigoDepartamento: i.codigoDepartamento,
      departamento: i.departamento,
      nivelRiesgo: i.nivelRiesgo,
      valor: i.valor,
      periodo: i.periodo,
      dimension: i.dimension,
      serieEstadistica: i.serieEstadistica,
      nivelGeografico: i.nivelGeografico,
      referencia: i.referencia,
      observacion: i.observacion,
    };
  }
}

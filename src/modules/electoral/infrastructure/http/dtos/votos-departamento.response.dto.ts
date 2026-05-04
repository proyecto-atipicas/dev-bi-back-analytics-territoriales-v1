import { ApiProperty } from '@nestjs/swagger';
import { VotosPorDepartamento } from '../../../domain/entities/votos-departamento.entity';

export class VotosDepartamentoResponseDto {
  @ApiProperty() codigoDepartamento!: string;
  @ApiProperty() nombreDepartamento!: string;
  @ApiProperty() totalVotos!: number;

  static fromDomain(v: VotosPorDepartamento): VotosDepartamentoResponseDto {
    return {
      codigoDepartamento: v.codigoDepartamento,
      nombreDepartamento: v.nombreDepartamento,
      totalVotos: v.totalVotos,
    };
  }
}

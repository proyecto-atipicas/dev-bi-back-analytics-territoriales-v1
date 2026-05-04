import { ApiProperty } from '@nestjs/swagger';
import { VotosPorPuesto } from '../../../domain/entities/votos-puesto.entity';

export class VotosPuestoResponseDto {
  @ApiProperty() codigoDepartamento!: string;
  @ApiProperty() codigoMunicipio!: string;
  @ApiProperty() codigoPuesto!: string;
  @ApiProperty() nombrePuesto!: string;
  @ApiProperty() totalVotos!: number;

  static fromDomain(v: VotosPorPuesto): VotosPuestoResponseDto {
    return {
      codigoDepartamento: v.codigoDepartamento,
      codigoMunicipio: v.codigoMunicipio,
      codigoPuesto: v.codigoPuesto,
      nombrePuesto: v.nombrePuesto,
      totalVotos: v.totalVotos,
    };
  }
}

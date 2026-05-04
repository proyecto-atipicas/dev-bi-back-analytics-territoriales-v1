import { ApiProperty } from '@nestjs/swagger';
import { VotosPorMunicipio } from '../../../domain/entities/votos-municipio.entity';

export class VotosMunicipioResponseDto {
  @ApiProperty() codigoDepartamento!: string;
  @ApiProperty() codigoMunicipio!: string;
  @ApiProperty() nombreMunicipio!: string;
  @ApiProperty() totalVotos!: number;

  static fromDomain(v: VotosPorMunicipio): VotosMunicipioResponseDto {
    return {
      codigoDepartamento: v.codigoDepartamento,
      codigoMunicipio: v.codigoMunicipio,
      nombreMunicipio: v.nombreMunicipio,
      totalVotos: v.totalVotos,
    };
  }
}

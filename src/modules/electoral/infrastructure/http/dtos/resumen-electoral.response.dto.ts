import { ApiProperty } from '@nestjs/swagger';
import { ResumenElectoral } from '../../../domain/entities/resumen-electoral.entity';

export class ResumenElectoralResponseDto {
  @ApiProperty() totalVotos!: number;
  @ApiProperty() totalCandidatos!: number;
  @ApiProperty() totalPartidos!: number;
  @ApiProperty() totalCorporaciones!: number;
  @ApiProperty() totalDepartamentos!: number;
  @ApiProperty() totalMunicipios!: number;

  static fromDomain(r: ResumenElectoral): ResumenElectoralResponseDto {
    return {
      totalVotos: r.totalVotos,
      totalCandidatos: r.totalCandidatos,
      totalPartidos: r.totalPartidos,
      totalCorporaciones: r.totalCorporaciones,
      totalDepartamentos: r.totalDepartamentos,
      totalMunicipios: r.totalMunicipios,
    };
  }
}

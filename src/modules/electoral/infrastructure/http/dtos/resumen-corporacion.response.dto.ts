import { ApiProperty } from '@nestjs/swagger';
import { ResumenCorporacion } from '../../../domain/entities/resumen-corporacion.entity';

export class ResumenCorporacionResponseDto {
  @ApiProperty() codigoCorporacion!: string;
  @ApiProperty() nombreCorporacion!: string;
  @ApiProperty() totalVotos!: number;
  @ApiProperty() totalCandidatos!: number;
  @ApiProperty() totalPartidos!: number;
  @ApiProperty({ description: 'Porcentaje de participación 0-100' })
  participacionPct!: number;

  static fromDomain(r: ResumenCorporacion): ResumenCorporacionResponseDto {
    return {
      codigoCorporacion: r.codigoCorporacion,
      nombreCorporacion: r.nombreCorporacion,
      totalVotos: r.totalVotos,
      totalCandidatos: r.totalCandidatos,
      totalPartidos: r.totalPartidos,
      participacionPct: r.participacionPct,
    };
  }
}

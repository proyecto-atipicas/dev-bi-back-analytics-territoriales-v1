import { ApiProperty } from '@nestjs/swagger';
import { ComparativoCorporacion } from '../../../domain/entities/comparativo-corporacion.entity';

export class ComparativoCorporacionResponseDto {
  @ApiProperty() codigoCorporacion!: string;
  @ApiProperty() nombreCorporacion!: string;
  @ApiProperty() totalVotos!: number;
  @ApiProperty() totalCandidatos!: number;
  @ApiProperty() totalPartidos!: number;
  @ApiProperty({ description: 'Porcentaje 0-100 sobre el total del comparativo' })
  participacionPct!: number;

  static fromDomain(c: ComparativoCorporacion): ComparativoCorporacionResponseDto {
    return {
      codigoCorporacion: c.codigoCorporacion,
      nombreCorporacion: c.nombreCorporacion,
      totalVotos: c.totalVotos,
      totalCandidatos: c.totalCandidatos,
      totalPartidos: c.totalPartidos,
      participacionPct: c.participacionPct,
    };
  }
}

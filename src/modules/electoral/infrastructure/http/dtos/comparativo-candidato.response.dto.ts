import { ApiProperty } from '@nestjs/swagger';
import { ComparativoCandidato } from '../../../domain/entities/comparativo-candidato.entity';

export class ComparativoCandidatoResponseDto {
  @ApiProperty() codigoCandidato!: string;
  @ApiProperty() nombreCandidato!: string;
  @ApiProperty({ nullable: true }) codigoPartido!: string | null;
  @ApiProperty({ nullable: true }) nombrePartido!: string | null;
  @ApiProperty({ nullable: true }) codigoCorporacion!: string | null;
  @ApiProperty({ nullable: true }) nombreCorporacion!: string | null;
  @ApiProperty() totalVotos!: number;
  @ApiProperty({ description: 'Porcentaje 0-100 sobre el total del comparativo' })
  participacionPct!: number;

  static fromDomain(c: ComparativoCandidato): ComparativoCandidatoResponseDto {
    return {
      codigoCandidato: c.codigoCandidato,
      nombreCandidato: c.nombreCandidato,
      codigoPartido: c.codigoPartido,
      nombrePartido: c.nombrePartido,
      codigoCorporacion: c.codigoCorporacion,
      nombreCorporacion: c.nombreCorporacion,
      totalVotos: c.totalVotos,
      participacionPct: c.participacionPct,
    };
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { RankingCandidato } from '../../../domain/entities/ranking-candidato.entity';

export class RankingCandidatoResponseDto {
  @ApiProperty() codigoCandidato!: string;
  @ApiProperty() nombreCandidato!: string;
  @ApiProperty({ nullable: true }) codigoPartido!: string | null;
  @ApiProperty({ nullable: true }) nombrePartido!: string | null;
  @ApiProperty() totalVotos!: number;

  static fromDomain(r: RankingCandidato): RankingCandidatoResponseDto {
    return {
      codigoCandidato: r.codigoCandidato,
      nombreCandidato: r.nombreCandidato,
      codigoPartido: r.codigoPartido,
      nombrePartido: r.nombrePartido,
      totalVotos: r.totalVotos,
    };
  }
}

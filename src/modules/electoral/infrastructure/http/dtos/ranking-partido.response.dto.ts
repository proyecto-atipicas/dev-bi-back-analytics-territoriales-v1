import { ApiProperty } from '@nestjs/swagger';
import { RankingPartido } from '../../../domain/entities/ranking-partido.entity';

export class RankingPartidoResponseDto {
  @ApiProperty() codigoPartido!: string;
  @ApiProperty() nombrePartido!: string;
  @ApiProperty() totalVotos!: number;
  @ApiProperty() totalCandidatos!: number;

  static fromDomain(r: RankingPartido): RankingPartidoResponseDto {
    return {
      codigoPartido: r.codigoPartido,
      nombrePartido: r.nombrePartido,
      totalVotos: r.totalVotos,
      totalCandidatos: r.totalCandidatos,
    };
  }
}

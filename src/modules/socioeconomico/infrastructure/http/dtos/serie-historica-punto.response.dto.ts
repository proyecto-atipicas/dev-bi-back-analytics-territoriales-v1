import { ApiProperty } from '@nestjs/swagger';
import { SerieHistoricaPunto } from '../../../domain/entities/serie-historica-punto.entity';

export class SerieHistoricaPuntoResponseDto {
  @ApiProperty() ano!: number;
  @ApiProperty({ nullable: true }) categoria!: string | null;
  @ApiProperty() valor!: number;

  static fromDomain(s: SerieHistoricaPunto): SerieHistoricaPuntoResponseDto {
    return { ano: s.ano, categoria: s.categoria, valor: s.valor };
  }
}

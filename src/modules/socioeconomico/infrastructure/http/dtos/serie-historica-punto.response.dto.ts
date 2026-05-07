import { ApiProperty } from '@nestjs/swagger';
import { SerieHistoricaPunto } from '../../../domain/entities/serie-historica-punto.entity';

export class SerieHistoricaPuntoResponseDto {
  @ApiProperty() periodo!: number;
  @ApiProperty({ nullable: true }) dimension!: string | null;
  @ApiProperty() valor!: number;

  static fromDomain(s: SerieHistoricaPunto): SerieHistoricaPuntoResponseDto {
    return { periodo: s.periodo, dimension: s.dimension, valor: s.valor };
  }
}

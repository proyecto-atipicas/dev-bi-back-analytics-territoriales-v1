import { ApiProperty } from '@nestjs/swagger';
import { SeriePoblacionalPunto } from '../../../domain/entities/serie-poblacional-punto.entity';

export class SeriePoblacionalPuntoResponseDto {
  @ApiProperty() anio!: number;
  @ApiProperty({ nullable: true }) mes!: number | null;
  @ApiProperty({ nullable: true }) dimension!: string | null;
  @ApiProperty({ nullable: true }) criterio!: string | null;
  @ApiProperty() valor!: number;

  static fromDomain(s: SeriePoblacionalPunto): SeriePoblacionalPuntoResponseDto {
    return {
      anio: s.anio,
      mes: s.mes,
      dimension: s.dimension,
      criterio: s.criterio,
      valor: s.valor,
    };
  }
}

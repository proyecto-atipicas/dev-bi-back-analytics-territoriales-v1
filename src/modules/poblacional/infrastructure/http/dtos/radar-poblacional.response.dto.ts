import { ApiProperty } from '@nestjs/swagger';
import { RadarPoblacionalPunto } from '../../../domain/entities/radar-poblacional-punto.entity';

export class RadarPoblacionalResponseDto {
  @ApiProperty() criterio!: string;
  @ApiProperty() valor!: number;
  @ApiProperty({ nullable: true }) anio!: number | null;
  @ApiProperty({ nullable: true }) mes!: number | null;

  static fromDomain(p: RadarPoblacionalPunto): RadarPoblacionalResponseDto {
    return {
      criterio: p.criterio,
      valor: p.valor,
      anio: p.anio,
      mes: p.mes,
    };
  }
}

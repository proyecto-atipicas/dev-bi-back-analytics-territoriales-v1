import { ApiProperty } from '@nestjs/swagger';
import { KpiSocioeconomico } from '../../../domain/entities/kpi-socioeconomico.entity';

export class KpiSocioeconomicoResponseDto {
  @ApiProperty() dimension!: string;
  @ApiProperty() promedio!: number;
  @ApiProperty() minimo!: number;
  @ApiProperty() maximo!: number;
  @ApiProperty() cantidadRegistros!: number;
  @ApiProperty({ nullable: true }) periodoMinimo!: number | null;
  @ApiProperty({ nullable: true }) periodoMaximo!: number | null;

  static fromDomain(k: KpiSocioeconomico): KpiSocioeconomicoResponseDto {
    return {
      dimension: k.dimension,
      promedio: k.promedio,
      minimo: k.minimo,
      maximo: k.maximo,
      cantidadRegistros: k.cantidadRegistros,
      periodoMinimo: k.periodoMinimo,
      periodoMaximo: k.periodoMaximo,
    };
  }
}

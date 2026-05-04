import { ApiProperty } from '@nestjs/swagger';
import { KpiSocioeconomico } from '../../../domain/entities/kpi-socioeconomico.entity';

export class KpiSocioeconomicoResponseDto {
  @ApiProperty() categoria!: string;
  @ApiProperty() promedio!: number;
  @ApiProperty() minimo!: number;
  @ApiProperty() maximo!: number;
  @ApiProperty() cantidadRegistros!: number;
  @ApiProperty({ nullable: true }) anoMinimo!: number | null;
  @ApiProperty({ nullable: true }) anoMaximo!: number | null;

  static fromDomain(k: KpiSocioeconomico): KpiSocioeconomicoResponseDto {
    return {
      categoria: k.categoria,
      promedio: k.promedio,
      minimo: k.minimo,
      maximo: k.maximo,
      cantidadRegistros: k.cantidadRegistros,
      anoMinimo: k.anoMinimo,
      anoMaximo: k.anoMaximo,
    };
  }
}

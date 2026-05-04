import { ApiProperty } from '@nestjs/swagger';
import { KpiPoblacional } from '../../../domain/entities/kpi-poblacional.entity';

export class KpiPoblacionalResponseDto {
  @ApiProperty() dimension!: string;
  @ApiProperty({ nullable: true }) referencia!: string | null;
  @ApiProperty() promedio!: number;
  @ApiProperty() minimo!: number;
  @ApiProperty() maximo!: number;
  @ApiProperty() cantidadRegistros!: number;

  static fromDomain(k: KpiPoblacional): KpiPoblacionalResponseDto {
    return {
      dimension: k.dimension,
      referencia: k.referencia,
      promedio: k.promedio,
      minimo: k.minimo,
      maximo: k.maximo,
      cantidadRegistros: k.cantidadRegistros,
    };
  }
}

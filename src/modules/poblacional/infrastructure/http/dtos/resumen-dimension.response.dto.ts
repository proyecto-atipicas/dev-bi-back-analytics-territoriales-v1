import { ApiProperty } from '@nestjs/swagger';
import {
  FuenteConReferencias,
  ResumenDimension,
} from '../../../domain/entities/resumen-dimension.entity';

export class FuenteConReferenciasResponseDto {
  @ApiProperty() fuente!: string;
  @ApiProperty() cantidadReferencias!: number;

  static fromDomain(f: FuenteConReferencias): FuenteConReferenciasResponseDto {
    return { fuente: f.fuente, cantidadReferencias: f.cantidadReferencias };
  }
}

export class ResumenDimensionResponseDto {
  @ApiProperty() dimension!: string;
  @ApiProperty({ type: FuenteConReferenciasResponseDto, isArray: true })
  fuentes!: FuenteConReferenciasResponseDto[];
  @ApiProperty() totalReferencias!: number;

  static fromDomain(r: ResumenDimension): ResumenDimensionResponseDto {
    return {
      dimension: r.dimension,
      fuentes: r.fuentes.map(FuenteConReferenciasResponseDto.fromDomain),
      totalReferencias: r.totalReferencias,
    };
  }
}

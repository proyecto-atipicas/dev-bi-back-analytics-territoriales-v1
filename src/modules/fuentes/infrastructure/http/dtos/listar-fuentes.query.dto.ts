import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { FiltroFuentes } from '../../../domain/ports/fuentes.repository.port';

export class ListarFuentesQueryDto {
  @ApiPropertyOptional({
    description:
      'Filtrar por tipificación (categoría de la fuente: Socioeconómico, Impacto poblacional, …)',
  })
  @IsOptional()
  @IsString()
  tipificacion?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre de la fuente (DNP TerriData, Externado e Indepaz, Mapa de Riesgos, …)',
  })
  @IsOptional()
  @IsString()
  fuente?: string;

  toDomain(): FiltroFuentes {
    return {
      tipificacion: this.tipificacion ?? null,
      fuente: this.fuente ?? null,
    };
  }
}

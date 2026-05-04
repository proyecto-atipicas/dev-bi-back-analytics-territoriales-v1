import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FiltroPoblacional } from '../../../domain/ports/poblacional.repository.port';

export class FiltroPoblacionalQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() fuente?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dimension?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referencia?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() criterio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  anio?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;

  toDomain(): FiltroPoblacional {
    return {
      fuente: this.fuente ?? null,
      dimension: this.dimension ?? null,
      referencia: this.referencia ?? null,
      criterio: this.criterio ?? null,
      anio: this.anio ?? null,
      mes: this.mes ?? null,
    };
  }
}

export class ListarReferenciasQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dimension?: string;

  @ApiPropertyOptional({ description: 'Filtrar referencias por fuente' })
  @IsOptional()
  @IsString()
  fuente?: string;
}

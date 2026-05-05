import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { FiltroPoblacional } from '../../../domain/ports/poblacional.repository.port';

function toStringArray(value: unknown): string[] | undefined {
  if (value == null || value === '') return undefined;
  const arr = Array.isArray(value) ? value : String(value).split(',');
  const limpio = arr
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);
  return limpio.length > 0 ? limpio : undefined;
}

export class FiltroPoblacionalQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() fuente?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dimension?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referencia?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() criterio?: string;

  @ApiPropertyOptional({
    description:
      'Lista de criterios. Acepta CSV o repetido (criterios=A,B o criterios=A&criterios=B).',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  criterios?: string[];

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
      criterios: this.criterios && this.criterios.length > 0 ? this.criterios : null,
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

export class ListarCriteriosQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() dimension?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fuente?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referencia?: string;
}

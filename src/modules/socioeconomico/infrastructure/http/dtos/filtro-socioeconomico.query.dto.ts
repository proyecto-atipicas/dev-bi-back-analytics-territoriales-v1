import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { FiltroSocioeconomico } from '../../../domain/ports/socioeconomico.repository.port';

/** Acepta CSV (`a,b,c`) o repetido (`?x=a&x=b`) y lo normaliza a string[]. */
function toStringArray(v: unknown): string[] | undefined {
  if (v == null) return undefined;
  if (Array.isArray(v)) {
    const limpio = v.map((x) => String(x).trim()).filter(Boolean);
    return limpio.length ? limpio : undefined;
  }
  const limpio = String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return limpio.length ? limpio : undefined;
}

export class FiltroSocioeconomicoQueryDto {
  @ApiPropertyOptional({
    description:
      'Filtra por la columna `fuente` de data_socioeconómica (DNP TerriData, Externado e Indepaz, Mapa de Riesgos, …).',
  })
  @IsOptional()
  @IsString()
  fuentePublicacion?: string;

  @ApiPropertyOptional({ description: 'Filtrar por código de departamento' })
  @IsOptional()
  @IsString()
  codigoDepartamento?: string;

  @ApiPropertyOptional({ description: 'Filtrar por dimensión (antes `categoria`)' })
  @IsOptional()
  @IsString()
  dimension?: string;

  @ApiPropertyOptional({ description: 'Filtrar por período (antes `ano`)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  periodo?: number;

  @ApiPropertyOptional({ description: 'Filtrar por referencia' })
  @IsOptional()
  @IsString()
  referencia?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nivel geográfico (Departamental | Nacional | …)',
  })
  @IsOptional()
  @IsString()
  nivelGeografico?: string;

  @ApiPropertyOptional({
    description:
      'Subconjunto de series estadísticas a incluir. Acepta CSV (`a,b,c`) o el parámetro repetido (`?seriesEstadisticas=a&seriesEstadisticas=b`).',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  seriesEstadisticas?: string[];

  toDomain(): FiltroSocioeconomico {
    return {
      fuentePublicacion: this.fuentePublicacion ?? null,
      codigoDepartamento: this.codigoDepartamento ?? null,
      dimension: this.dimension ?? null,
      periodo: this.periodo ?? null,
      referencia: this.referencia ?? null,
      nivelGeografico: this.nivelGeografico ?? null,
      seriesEstadisticas: this.seriesEstadisticas ?? null,
    };
  }
}

/** DTO acotado para `/dimensiones`, donde sólo aplica el filtro de fuente publicación. */
export class FuentePublicacionQueryDto {
  @ApiPropertyOptional({
    description: 'Filtro por la columna `fuente` de data_socioeconómica',
  })
  @IsOptional()
  @IsString()
  fuentePublicacion?: string;
}

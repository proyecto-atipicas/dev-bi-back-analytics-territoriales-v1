import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { FiltroSocioeconomico } from '../../../domain/ports/socioeconomico.repository.port';

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

  toDomain(): FiltroSocioeconomico {
    return {
      fuentePublicacion: this.fuentePublicacion ?? null,
      codigoDepartamento: this.codigoDepartamento ?? null,
      dimension: this.dimension ?? null,
      periodo: this.periodo ?? null,
      referencia: this.referencia ?? null,
      nivelGeografico: this.nivelGeografico ?? null,
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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { FiltroSocioeconomico } from '../../../domain/ports/socioeconomico.repository.port';
import { FuenteSocioeconomica } from '../../../domain/value-objects/fuente-socioeconomica.vo';

export class FiltroSocioeconomicoQueryDto {
  @ApiProperty({ enum: FuenteSocioeconomica, description: 'Tabla a consultar' })
  @IsEnum(FuenteSocioeconomica)
  fuente!: FuenteSocioeconomica;

  @ApiPropertyOptional({
    description:
      'Filtro por la columna `fuente` de data_publicaciones (DNP TerriData, Externado e Indepaz, etc.). Solo aplica cuando fuente=PUBLICACIONES.',
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
      fuente: this.fuente,
      fuentePublicacion: this.fuentePublicacion ?? null,
      codigoDepartamento: this.codigoDepartamento ?? null,
      dimension: this.dimension ?? null,
      periodo: this.periodo ?? null,
      referencia: this.referencia ?? null,
      nivelGeografico: this.nivelGeografico ?? null,
    };
  }
}

export class FuenteQueryDto {
  @ApiProperty({ enum: FuenteSocioeconomica })
  @IsEnum(FuenteSocioeconomica)
  fuente!: FuenteSocioeconomica;

  @ApiPropertyOptional({
    description: 'Filtro adicional por columna `fuente` de data_publicaciones',
  })
  @IsOptional()
  @IsString()
  fuentePublicacion?: string;
}

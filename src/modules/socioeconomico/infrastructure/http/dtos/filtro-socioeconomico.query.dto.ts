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

  @ApiPropertyOptional({ description: 'Filtrar por categoría' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Filtrar por año' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  ano?: number;

  toDomain(): FiltroSocioeconomico {
    return {
      fuente: this.fuente,
      fuentePublicacion: this.fuentePublicacion ?? null,
      codigoDepartamento: this.codigoDepartamento ?? null,
      categoria: this.categoria ?? null,
      ano: this.ano ?? null,
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

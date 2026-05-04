import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListarCandidatosQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por código de corporación' })
  @IsOptional()
  @IsString()
  codigoCorporacion?: string;

  @ApiPropertyOptional({ description: 'Filtrar por código de partido' })
  @IsOptional()
  @IsString()
  codigoPartido?: string;

  @ApiPropertyOptional({ description: 'Límite de resultados (default 200, máx 1000)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limite?: number;
}

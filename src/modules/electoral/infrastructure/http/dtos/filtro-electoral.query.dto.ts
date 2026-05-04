import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FiltroElectoral } from '../../../domain/value-objects/filtro-electoral.vo';

export class FiltroElectoralQueryDto {
  @ApiPropertyOptional({ description: 'Código de la corporación' })
  @IsOptional()
  @IsString()
  codigoCorporacion?: string;

  @ApiPropertyOptional({ description: 'Código DIVIPOLA del departamento' })
  @IsOptional()
  @IsString()
  codigoDepartamento?: string;

  @ApiPropertyOptional({ description: 'Código DIVIPOLA del municipio' })
  @IsOptional()
  @IsString()
  codigoMunicipio?: string;

  @ApiPropertyOptional({ description: 'Código del partido político' })
  @IsOptional()
  @IsString()
  codigoPartido?: string;

  toDomain(): FiltroElectoral {
    return new FiltroElectoral(
      this.codigoCorporacion ?? null,
      this.codigoDepartamento ?? null,
      this.codigoMunicipio ?? null,
      this.codigoPartido ?? null,
    );
  }
}

export class FiltroElectoralConLimiteQueryDto extends FiltroElectoralQueryDto {
  @ApiPropertyOptional({ description: 'Límite de resultados' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limite?: number;
}

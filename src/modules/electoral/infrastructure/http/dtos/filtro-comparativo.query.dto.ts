import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';
import {
  FiltroComparativoCandidato,
  FiltroComparativoCorporacion,
} from '../../../domain/value-objects/filtro-comparativo.vo';

/** Convierte "A,B,C" o ["A","B"] en ["A","B","C"] */
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter((v) => v.length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }
  return [];
}

export class FiltroComparativoCorporacionQueryDto {
  @ApiPropertyOptional({
    description:
      'Códigos de corporación a comparar. Acepta CSV (`codigosCorporacion=1,2,3`) o repetido.',
    type: [String],
  })
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  codigosCorporacion!: string[];

  @ApiPropertyOptional({ description: 'Código DIVIPOLA del departamento' })
  @IsOptional()
  @IsString()
  codigoDepartamento?: string;

  @ApiPropertyOptional({ description: 'Código DIVIPOLA del municipio' })
  @IsOptional()
  @IsString()
  codigoMunicipio?: string;

  toDomain(): FiltroComparativoCorporacion {
    return new FiltroComparativoCorporacion(
      this.codigosCorporacion,
      this.codigoDepartamento ?? null,
      this.codigoMunicipio ?? null,
    );
  }
}

export class FiltroComparativoCandidatoQueryDto {
  @ApiPropertyOptional({
    description: 'Códigos de candidato a comparar. CSV o repetido.',
    type: [String],
  })
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  codigosCandidato!: string[];

  @ApiPropertyOptional({ description: 'Código DIVIPOLA del departamento' })
  @IsOptional()
  @IsString()
  codigoDepartamento?: string;

  @ApiPropertyOptional({ description: 'Código DIVIPOLA del municipio' })
  @IsOptional()
  @IsString()
  codigoMunicipio?: string;

  toDomain(): FiltroComparativoCandidato {
    return new FiltroComparativoCandidato(
      this.codigosCandidato,
      this.codigoDepartamento ?? null,
      this.codigoMunicipio ?? null,
    );
  }
}

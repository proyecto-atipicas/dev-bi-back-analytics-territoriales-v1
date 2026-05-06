import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import {
  FiltroComparativoTerritorial,
  TipoComparacionTerritorial,
} from '../../../domain/value-objects/filtro-comparativo-territorial.vo';

export class FiltroComparativoTerritorialQueryDto {
  @ApiProperty({
    enum: ['partido', 'candidato'],
    description: 'Dimensión a comparar: por partido o por candidato',
  })
  @IsIn(['partido', 'candidato'])
  tipo!: TipoComparacionTerritorial;

  @ApiProperty({ description: 'Código del ítem A (partido o candidato)' })
  @IsString()
  codigoA!: string;

  @ApiProperty({ description: 'Código del ítem B (partido o candidato)' })
  @IsString()
  codigoB!: string;

  @ApiProperty({ description: 'Código de corporación (contexto obligatorio)' })
  @IsString()
  codigoCorporacion!: string;

  @ApiPropertyOptional({ description: 'Código de departamento — drill-down a municipios' })
  @IsOptional()
  @IsString()
  codigoDepartamento?: string;

  @ApiPropertyOptional({ description: 'Código de municipio — drill-down a puestos' })
  @IsOptional()
  @IsString()
  codigoMunicipio?: string;

  @ApiPropertyOptional({
    description:
      'Código del partido del ítem A. OBLIGATORIO cuando tipo=candidato (codigo_candidato no es único globalmente, se reinicia por partido).',
  })
  @IsOptional()
  @IsString()
  codigoPartidoA?: string;

  @ApiPropertyOptional({
    description:
      'Código del partido del ítem B. OBLIGATORIO cuando tipo=candidato (codigo_candidato no es único globalmente, se reinicia por partido).',
  })
  @IsOptional()
  @IsString()
  codigoPartidoB?: string;

  toDomain(): FiltroComparativoTerritorial {
    return new FiltroComparativoTerritorial(
      this.tipo,
      this.codigoA,
      this.codigoB,
      this.codigoCorporacion,
      this.codigoDepartamento ?? null,
      this.codigoMunicipio ?? null,
      this.codigoPartidoA ?? null,
      this.codigoPartidoB ?? null,
    );
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import {
  FiltroTerritoriosGanados,
  NivelAnalisisTerritoriosGanados,
  TipoSeleccionTerritoriosGanados,
} from '../../../domain/value-objects/filtro-territorios-ganados.vo';

export class FiltroTerritoriosGanadosQueryDto {
  @ApiProperty({
    enum: ['partido', 'candidato'],
    description: 'Dimensión a analizar: partido u organización política o candidato',
  })
  @IsIn(['partido', 'candidato'])
  tipo!: TipoSeleccionTerritoriosGanados;

  @ApiProperty({
    enum: ['departamento', 'municipio'],
    description: 'Nivel territorial de análisis',
  })
  @IsIn(['departamento', 'municipio'])
  nivel!: NivelAnalisisTerritoriosGanados;

  @ApiProperty({ description: 'Código de corporación (contexto obligatorio)' })
  @IsString()
  codigoCorporacion!: string;

  @ApiProperty({ description: 'Código del partido o candidato seleccionado' })
  @IsString()
  codigo!: string;

  @ApiPropertyOptional({
    description:
      'Código de partido del candidato. OBLIGATORIO cuando tipo=candidato (codigo_candidato no es único globalmente, se reinicia por partido).',
  })
  @IsOptional()
  @IsString()
  codigoPartido?: string;

  toDomain(): FiltroTerritoriosGanados {
    return new FiltroTerritoriosGanados(
      this.tipo,
      this.nivel,
      this.codigoCorporacion,
      this.codigo,
      this.codigoPartido ?? null,
    );
  }
}

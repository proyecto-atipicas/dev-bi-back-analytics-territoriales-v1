import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Fuente } from '../../../domain/entities/fuente.entity';

export class FuenteResponseDto {
  @ApiProperty({ example: 'f-001', description: 'Identificador interno de la fuente' })
  id!: string;

  @ApiProperty({
    example: 'Externado e Indepaz',
    description: 'Nombre canónico de la fuente / institución publicadora',
  })
  fuente!: string;

  @ApiProperty({
    example: 'Socioeconómico',
    description: 'Categoría a la que pertenece la fuente (Socioeconómico, Impacto poblacional)',
  })
  tipificacion!: string;

  @ApiPropertyOptional({
    example: '2024-08-15',
    description: 'Fecha de publicación en formato ISO (yyyy-mm-dd)',
    nullable: true,
  })
  fechaPublicacion!: string | null;

  @ApiPropertyOptional({
    example: 'Fuente-Externado.pdf',
    description:
      'Nombre de archivo del PDF asociado. El frontend lo concatena con `/fuentes/` para servirlo desde public/',
    nullable: true,
  })
  link!: string | null;

  static fromDomain(f: Fuente): FuenteResponseDto {
    return {
      id: f.id,
      fuente: f.fuente,
      tipificacion: f.tipificacion,
      fechaPublicacion: f.fechaPublicacion,
      link: f.link,
    };
  }
}

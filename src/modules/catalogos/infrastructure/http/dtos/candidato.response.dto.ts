import { ApiProperty } from '@nestjs/swagger';
import { Candidato } from '../../../domain/entities/candidato.entity';

export class CandidatoResponseDto {
  @ApiProperty({ example: '0001' })
  codigo!: string;

  @ApiProperty({ example: 'JUAN PÉREZ' })
  nombre!: string;

  @ApiProperty({ example: '00001', nullable: true })
  codigoPartido!: string | null;

  @ApiProperty({ example: '1', nullable: true })
  codigoCorporacion!: string | null;

  @ApiProperty({ example: 'PARTIDO LIBERAL', nullable: true })
  nombrePartido!: string | null;

  static fromDomain(c: Candidato): CandidatoResponseDto {
    return {
      codigo: c.codigo,
      nombre: c.nombre,
      codigoPartido: c.codigoPartido,
      codigoCorporacion: c.codigoCorporacion,
      nombrePartido: c.nombrePartido,
    };
  }
}

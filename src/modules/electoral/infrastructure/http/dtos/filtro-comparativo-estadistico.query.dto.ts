import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import {
  CandidatoComparativoEstadistico,
  FiltroComparativoEstadistico,
} from '../../../domain/value-objects/filtro-comparativo-estadistico.vo';

const SEP_CANDIDATO = ';';
const SEP_CAMPO = '~';

/**
 * Filtros del comparativo estadístico. Los candidatos viajan en un único
 * parámetro `candidatos` para no multiplicar query params: una lista separada
 * por `;`, cada candidato codificado como `codigoCorporacion~codigo~codigoPartido`.
 * El `codigoPartido` puede ir vacío si la fila no tiene partido.
 *
 * Ejemplo: `candidatos=1~0001~00010;2~0042~00007`
 */
export class FiltroComparativoEstadisticoQueryDto {
  @ApiProperty({
    description:
      'Lista de candidatos separados por ";". Cada candidato: codigoCorporacion~codigo~codigoPartido. Ej: 1~0001~00010;2~0042~00007',
    example: '1~0001~00010;2~0042~00007',
  })
  @IsString()
  candidatos!: string;

  toDomain(): FiltroComparativoEstadistico {
    const tokens = (this.candidatos ?? '')
      .split(SEP_CANDIDATO)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const candidatos = tokens.map((token) => {
      const [corp, codigo, partido] = token.split(SEP_CAMPO);
      return new CandidatoComparativoEstadistico(
        (corp ?? '').trim(),
        (codigo ?? '').trim(),
        partido && partido.trim() !== '' ? partido.trim() : null,
      );
    });

    return new FiltroComparativoEstadistico(candidatos);
  }
}

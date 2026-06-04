import { ApiProperty } from '@nestjs/swagger';
import {
  ComparativoEstadisticoResultado,
  DepartamentoComparativoEstadistico,
  ItemCandidatoEstadistico,
  ValorCandidatoDepartamento,
} from '../../../domain/entities/comparativo-estadistico.entity';

export class ItemCandidatoEstadisticoDto {
  @ApiProperty({ description: 'Clave estable codigoCorporacion~codigo~codigoPartido' })
  key!: string;
  @ApiProperty() codigo!: string;
  @ApiProperty({ nullable: true }) codigoPartido!: string | null;
  @ApiProperty() codigoCorporacion!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ nullable: true }) nombrePartido!: string | null;
  @ApiProperty() totalVotos!: number;
  @ApiProperty({ description: '% sobre el total del conjunto seleccionado (0-100)' })
  participacionPct!: number;

  static fromDomain(i: ItemCandidatoEstadistico): ItemCandidatoEstadisticoDto {
    return {
      key: i.key,
      codigo: i.codigo,
      codigoPartido: i.codigoPartido,
      codigoCorporacion: i.codigoCorporacion,
      nombre: i.nombre,
      nombrePartido: i.nombrePartido,
      totalVotos: i.totalVotos,
      participacionPct: i.participacionPct,
    };
  }
}

export class ValorCandidatoDepartamentoDto {
  @ApiProperty() key!: string;
  @ApiProperty() votos!: number;
  @ApiProperty({ description: '% sobre el total del conjunto en el departamento (0-100)' })
  participacionPct!: number;

  static fromDomain(v: ValorCandidatoDepartamento): ValorCandidatoDepartamentoDto {
    return { key: v.key, votos: v.votos, participacionPct: v.participacionPct };
  }
}

export class DepartamentoComparativoEstadisticoDto {
  @ApiProperty() codigoDepartamento!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ type: ValorCandidatoDepartamentoDto, isArray: true })
  valores!: ValorCandidatoDepartamentoDto[];
  @ApiProperty() totalSeleccionados!: number;
  @ApiProperty({ nullable: true, description: 'Clave del candidato más votado' })
  liderKey!: string | null;
  @ApiProperty({ description: 'Diferencia en votos entre líder y segundo' })
  diferencia!: number;
  @ApiProperty({
    description: 'Ventaja del líder sobre el segundo en puntos % del conjunto (0-100)',
  })
  ventajaPct!: number;

  static fromDomain(d: DepartamentoComparativoEstadistico): DepartamentoComparativoEstadisticoDto {
    return {
      codigoDepartamento: d.codigoDepartamento,
      nombre: d.nombre,
      valores: d.valores.map(ValorCandidatoDepartamentoDto.fromDomain),
      totalSeleccionados: d.totalSeleccionados,
      liderKey: d.liderKey,
      diferencia: d.diferencia,
      ventajaPct: d.ventajaPct,
    };
  }
}

export class ComparativoEstadisticoResponseDto {
  @ApiProperty({ type: ItemCandidatoEstadisticoDto, isArray: true })
  candidatos!: ItemCandidatoEstadisticoDto[];

  @ApiProperty({ type: DepartamentoComparativoEstadisticoDto, isArray: true })
  departamentos!: DepartamentoComparativoEstadisticoDto[];

  static fromDomain(r: ComparativoEstadisticoResultado): ComparativoEstadisticoResponseDto {
    return {
      candidatos: r.candidatos.map(ItemCandidatoEstadisticoDto.fromDomain),
      departamentos: r.departamentos.map(DepartamentoComparativoEstadisticoDto.fromDomain),
    };
  }
}

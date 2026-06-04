import { ApiProperty } from '@nestjs/swagger';
import {
  ComparativoTerritorialResultado,
  GanadorComparativo,
  ItemComparativoTerritorial,
  NivelTerritorial,
  TerritorioComparativo,
} from '../../../domain/entities/comparativo-territorial.entity';

export class ItemComparativoTerritorialDto {
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ nullable: true }) nombrePartido!: string | null;
  @ApiProperty({ nullable: true }) codigoPartido!: string | null;
  @ApiProperty({ description: 'Corporación del lado del comparativo' })
  codigoCorporacion!: string;
  @ApiProperty() totalVotos!: number;
  @ApiProperty({ description: 'Total de votos de la elección de su corporación en el ámbito' })
  totalEleccion!: number;
  @ApiProperty() totalTerritorios!: number;
  @ApiProperty({ description: 'Porcentaje 0-100 sobre el total de la elección de su corporación' })
  participacionPct!: number;

  static fromDomain(i: ItemComparativoTerritorial): ItemComparativoTerritorialDto {
    return {
      codigo: i.codigo,
      nombre: i.nombre,
      nombrePartido: i.nombrePartido,
      codigoPartido: i.codigoPartido,
      codigoCorporacion: i.codigoCorporacion,
      totalVotos: i.totalVotos,
      totalEleccion: i.totalEleccion,
      totalTerritorios: i.totalTerritorios,
      participacionPct: i.participacionPct,
    };
  }
}

export class TerritorioComparativoDto {
  @ApiProperty() codigoDepartamento!: string;
  @ApiProperty({ nullable: true }) codigoMunicipio!: string | null;
  @ApiProperty({ nullable: true }) codigoPuesto!: string | null;
  @ApiProperty() nombre!: string;
  @ApiProperty() totalA!: number;
  @ApiProperty() totalB!: number;
  @ApiProperty({ enum: ['A', 'B', 'EMPATE'] }) ganador!: GanadorComparativo;
  @ApiProperty() diferencia!: number;
  @ApiProperty({ description: 'Ventaja porcentual del ganador sobre el par (0-100)' })
  diferenciaPct!: number;
  @ApiProperty({ description: '% de los votos del par que corresponden a A (0-100)' })
  participacionAPct!: number;
  @ApiProperty({ description: '% de los votos del par que corresponden a B (0-100)' })
  participacionBPct!: number;

  static fromDomain(t: TerritorioComparativo): TerritorioComparativoDto {
    return {
      codigoDepartamento: t.codigoDepartamento,
      codigoMunicipio: t.codigoMunicipio,
      codigoPuesto: t.codigoPuesto,
      nombre: t.nombre,
      totalA: t.totalA,
      totalB: t.totalB,
      ganador: t.ganador,
      diferencia: t.diferencia,
      diferenciaPct: t.diferenciaPct,
      participacionAPct: t.participacionAPct,
      participacionBPct: t.participacionBPct,
    };
  }
}

export class ComparativoTerritorialResponseDto {
  @ApiProperty({ enum: ['departamento', 'municipio', 'puesto'] })
  nivel!: NivelTerritorial;

  @ApiProperty({ type: ItemComparativoTerritorialDto })
  itemA!: ItemComparativoTerritorialDto;

  @ApiProperty({ type: ItemComparativoTerritorialDto })
  itemB!: ItemComparativoTerritorialDto;

  @ApiProperty({ type: TerritorioComparativoDto, isArray: true })
  territorios!: TerritorioComparativoDto[];

  static fromDomain(r: ComparativoTerritorialResultado): ComparativoTerritorialResponseDto {
    return {
      nivel: r.nivel,
      itemA: ItemComparativoTerritorialDto.fromDomain(r.itemA),
      itemB: ItemComparativoTerritorialDto.fromDomain(r.itemB),
      territorios: r.territorios.map(TerritorioComparativoDto.fromDomain),
    };
  }
}

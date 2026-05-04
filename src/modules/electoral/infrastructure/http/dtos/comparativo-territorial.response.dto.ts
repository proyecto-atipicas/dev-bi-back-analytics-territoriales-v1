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
  @ApiProperty() totalVotos!: number;
  @ApiProperty() totalTerritorios!: number;
  @ApiProperty({ description: 'Porcentaje 0-100 sobre el total de la elección' })
  participacionPct!: number;

  static fromDomain(i: ItemComparativoTerritorial): ItemComparativoTerritorialDto {
    return {
      codigo: i.codigo,
      nombre: i.nombre,
      nombrePartido: i.nombrePartido,
      codigoPartido: i.codigoPartido,
      totalVotos: i.totalVotos,
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
  @ApiProperty() totalEleccion!: number;
  @ApiProperty({ enum: ['A', 'B', 'EMPATE'] }) ganador!: GanadorComparativo;
  @ApiProperty() diferencia!: number;
  @ApiProperty() diferenciaPct!: number;

  static fromDomain(t: TerritorioComparativo): TerritorioComparativoDto {
    return {
      codigoDepartamento: t.codigoDepartamento,
      codigoMunicipio: t.codigoMunicipio,
      codigoPuesto: t.codigoPuesto,
      nombre: t.nombre,
      totalA: t.totalA,
      totalB: t.totalB,
      totalEleccion: t.totalEleccion,
      ganador: t.ganador,
      diferencia: t.diferencia,
      diferenciaPct: t.diferenciaPct,
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

  @ApiProperty() totalEleccion!: number;

  @ApiProperty({ type: TerritorioComparativoDto, isArray: true })
  territorios!: TerritorioComparativoDto[];

  static fromDomain(r: ComparativoTerritorialResultado): ComparativoTerritorialResponseDto {
    return {
      nivel: r.nivel,
      itemA: ItemComparativoTerritorialDto.fromDomain(r.itemA),
      itemB: ItemComparativoTerritorialDto.fromDomain(r.itemB),
      totalEleccion: r.totalEleccion,
      territorios: r.territorios.map(TerritorioComparativoDto.fromDomain),
    };
  }
}

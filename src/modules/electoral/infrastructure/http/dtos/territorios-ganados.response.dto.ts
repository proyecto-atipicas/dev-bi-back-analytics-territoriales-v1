import { ApiProperty } from '@nestjs/swagger';
import {
  TerritorioGanado,
  TerritoriosGanadosResultado,
} from '../../../domain/entities/territorios-ganados.entity';
import type {
  NivelAnalisisTerritoriosGanados,
  TipoSeleccionTerritoriosGanados,
} from '../../../domain/value-objects/filtro-territorios-ganados.vo';

export class TerritorioGanadoDto {
  @ApiProperty() codigoDepartamento!: string;
  @ApiProperty({ nullable: true }) codigoMunicipio!: string | null;
  @ApiProperty() nombre!: string;
  @ApiProperty() totalVotosTerritorio!: number;
  @ApiProperty() votosSeleccionado!: number;
  @ApiProperty({ description: 'Porcentaje 0-100 del seleccionado sobre el total del territorio' })
  participacionPct!: number;
  @ApiProperty() diferencia!: number;

  static fromDomain(t: TerritorioGanado): TerritorioGanadoDto {
    return {
      codigoDepartamento: t.codigoDepartamento,
      codigoMunicipio: t.codigoMunicipio,
      nombre: t.nombre,
      totalVotosTerritorio: t.totalVotosTerritorio,
      votosSeleccionado: t.votosSeleccionado,
      participacionPct: t.participacionPct,
      diferencia: t.diferencia,
    };
  }
}

export class TerritoriosGanadosResponseDto {
  @ApiProperty({ enum: ['partido', 'candidato'] })
  tipo!: TipoSeleccionTerritoriosGanados;

  @ApiProperty({ enum: ['departamento', 'municipio'] })
  nivel!: NivelAnalisisTerritoriosGanados;

  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ nullable: true }) codigoPartido!: string | null;
  @ApiProperty({ nullable: true }) nombrePartido!: string | null;
  @ApiProperty() totalVotosEleccion!: number;
  @ApiProperty() votosSeleccionado!: number;
  @ApiProperty() participacionPct!: number;
  @ApiProperty() totalTerritoriosGanados!: number;

  @ApiProperty({ type: TerritorioGanadoDto, isArray: true })
  territorios!: TerritorioGanadoDto[];

  static fromDomain(r: TerritoriosGanadosResultado): TerritoriosGanadosResponseDto {
    return {
      tipo: r.tipo,
      nivel: r.nivel,
      codigo: r.codigo,
      nombre: r.nombre,
      codigoPartido: r.codigoPartido,
      nombrePartido: r.nombrePartido,
      totalVotosEleccion: r.totalVotosEleccion,
      votosSeleccionado: r.votosSeleccionado,
      participacionPct: r.participacionPct,
      totalTerritoriosGanados: r.totalTerritoriosGanados,
      territorios: r.territorios.map(TerritorioGanadoDto.fromDomain),
    };
  }
}

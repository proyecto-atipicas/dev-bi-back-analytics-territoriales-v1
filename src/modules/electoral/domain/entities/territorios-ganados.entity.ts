import type {
  NivelAnalisisTerritoriosGanados,
  TipoSeleccionTerritoriosGanados,
} from '../value-objects/filtro-territorios-ganados.vo';

export class TerritorioGanado {
  constructor(
    public readonly codigoDepartamento: string,
    public readonly codigoMunicipio: string | null,
    public readonly nombre: string,
    /** Votos totales de la elección en el territorio (corporación filtrada). */
    public readonly totalVotosTerritorio: number,
    /** Votos obtenidos por el partido o candidato seleccionado. */
    public readonly votosSeleccionado: number,
    /** % del seleccionado sobre el total del territorio (0-100). */
    public readonly participacionPct: number,
    /** total_territorio - votos_seleccionado. */
    public readonly diferencia: number,
  ) {}
}

export class TerritoriosGanadosResultado {
  constructor(
    public readonly tipo: TipoSeleccionTerritoriosGanados,
    public readonly nivel: NivelAnalisisTerritoriosGanados,
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly codigoPartido: string | null,
    public readonly nombrePartido: string | null,
    /** Total de votos de la elección en el ámbito (corporación filtrada). */
    public readonly totalVotosEleccion: number,
    /** Votos totales del seleccionado en el ámbito. */
    public readonly votosSeleccionado: number,
    /** % seleccionado sobre el total de la elección (0-100). */
    public readonly participacionPct: number,
    /** Cantidad de territorios donde el seleccionado fue el más votado. */
    public readonly totalTerritoriosGanados: number,
    public readonly territorios: TerritorioGanado[],
  ) {}
}

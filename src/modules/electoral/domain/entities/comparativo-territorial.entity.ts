export type NivelTerritorial = 'departamento' | 'municipio' | 'puesto';

export type GanadorComparativo = 'A' | 'B' | 'EMPATE';

export class ItemComparativoTerritorial {
  constructor(
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly nombrePartido: string | null,
    public readonly codigoPartido: string | null,
    public readonly totalVotos: number,
    /** Número de territorios (al nivel actual) donde el ítem obtuvo votos. */
    public readonly totalTerritorios: number,
    /** % sobre el total de la elección (corporación). */
    public readonly participacionPct: number,
  ) {}
}

export class TerritorioComparativo {
  constructor(
    public readonly codigoDepartamento: string,
    public readonly codigoMunicipio: string | null,
    public readonly codigoPuesto: string | null,
    public readonly nombre: string,
    public readonly totalA: number,
    public readonly totalB: number,
    /** Suma total de votos en el territorio para la corporación filtrada. */
    public readonly totalEleccion: number,
    public readonly ganador: GanadorComparativo,
    /** |totalA - totalB| en votos absolutos. */
    public readonly diferencia: number,
    /** Diferencia porcentual respecto al total del territorio (0–100). */
    public readonly diferenciaPct: number,
  ) {}
}

export class ComparativoTerritorialResultado {
  constructor(
    public readonly nivel: NivelTerritorial,
    public readonly itemA: ItemComparativoTerritorial,
    public readonly itemB: ItemComparativoTerritorial,
    /** Total de la elección (corporación) en el ámbito filtrado. */
    public readonly totalEleccion: number,
    public readonly territorios: TerritorioComparativo[],
  ) {}
}

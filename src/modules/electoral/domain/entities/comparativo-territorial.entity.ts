export type NivelTerritorial = 'departamento' | 'municipio' | 'puesto';

export type GanadorComparativo = 'A' | 'B' | 'EMPATE';

export class ItemComparativoTerritorial {
  constructor(
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly nombrePartido: string | null,
    public readonly codigoPartido: string | null,
    /** Corporación a la que pertenece este lado del comparativo. */
    public readonly codigoCorporacion: string,
    public readonly totalVotos: number,
    /**
     * Total de votos de la elección de SU corporación en el ámbito filtrado.
     * Es por lado: cuando A y B pertenecen a corporaciones distintas cada uno
     * tiene su propio total de elección.
     */
    public readonly totalEleccion: number,
    /** Número de territorios (al nivel actual) donde el ítem obtuvo votos. */
    public readonly totalTerritorios: number,
    /** % de los votos del ítem sobre el total de la elección de su corporación. */
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
    public readonly ganador: GanadorComparativo,
    /** |totalA - totalB| en votos absolutos. */
    public readonly diferencia: number,
    /**
     * Ventaja porcentual del ganador en el territorio: |totalA - totalB| sobre
     * el total del par (totalA + totalB), en el rango 0–100. Cuando ambos lados
     * comparten corporación equivale a la brecha relativa entre los dos ítems.
     */
    public readonly diferenciaPct: number,
    /** % de los votos del par que corresponden a A en este territorio (0–100). */
    public readonly participacionAPct: number,
    /** % de los votos del par que corresponden a B en este territorio (0–100). */
    public readonly participacionBPct: number,
  ) {}
}

export class ComparativoTerritorialResultado {
  constructor(
    public readonly nivel: NivelTerritorial,
    public readonly itemA: ItemComparativoTerritorial,
    public readonly itemB: ItemComparativoTerritorial,
    public readonly territorios: TerritorioComparativo[],
  ) {}
}

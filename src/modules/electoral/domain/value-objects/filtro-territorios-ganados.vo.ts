export type TipoSeleccionTerritoriosGanados = 'partido' | 'candidato';
export type NivelAnalisisTerritoriosGanados = 'departamento' | 'municipio';

/**
 * Filtro para identificar territorios donde un partido o candidato obtuvo la
 * mayor votación. Para `tipo='candidato'`, `codigo_candidato` no es único
 * globalmente — se reinicia por partido — así que también se requiere
 * `codigoPartido` para desambiguar la identidad.
 */
export class FiltroTerritoriosGanados {
  constructor(
    public readonly tipo: TipoSeleccionTerritoriosGanados,
    public readonly nivel: NivelAnalisisTerritoriosGanados,
    public readonly codigoCorporacion: string,
    public readonly codigo: string,
    /** Obligatorio cuando tipo='candidato'. Ignorado cuando tipo='partido'. */
    public readonly codigoPartido: string | null = null,
  ) {}
}

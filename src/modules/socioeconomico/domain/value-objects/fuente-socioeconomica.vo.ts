export enum FuenteSocioeconomica {
  MOE = 'MOE',
  PUBLICACIONES = 'PUBLICACIONES',
}

export const FUENTES_VALIDAS = Object.values(FuenteSocioeconomica);

export function fuenteATabla(fuente: FuenteSocioeconomica): 'data_moe' | 'data_publicaciones' {
  switch (fuente) {
    case FuenteSocioeconomica.MOE:
      return 'data_moe';
    case FuenteSocioeconomica.PUBLICACIONES:
      return 'data_publicaciones';
    default: {
      const exhaustive: never = fuente;
      throw new Error(`Fuente socioeconómica no soportada: ${String(exhaustive)}`);
    }
  }
}

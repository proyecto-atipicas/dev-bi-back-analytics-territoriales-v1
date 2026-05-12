import { Inject, Injectable } from '@nestjs/common';
import { DatabasePort } from '../../../../shared/database/database.port';
import { DATABASE_PORT } from '../../../../shared/database/database.tokens';
import { Fuente } from '../../domain/entities/fuente.entity';
import { FiltroFuentes, FuentesRepositoryPort } from '../../domain/ports/fuentes.repository.port';

interface FuenteRow {
  id: string | null;
  fuente: string;
  tipificacion: string;
  fecha_publicacion: Date | string | null;
  link: string | null;
}

// `fecha_publicacion` viene como `Date` desde `pg`. Lo serializamos a ISO
// (yyyy-mm-dd) para no acoplar el contrato a la zona horaria del backend.
function toIsoDate(value: Date | string | null): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(value);
}

@Injectable()
export class PostgresFuentesRepository implements FuentesRepositoryPort {
  constructor(@Inject(DATABASE_PORT) private readonly db: DatabasePort) {}

  async listar(filtro: FiltroFuentes): Promise<Fuente[]> {
    const rows = await this.db.query<FuenteRow>(
      `SELECT id, fuente, tipificacion, fecha_publicacion, link
       FROM data_fuentes
       WHERE fuente IS NOT NULL
         AND tipificacion IS NOT NULL
         AND ($1::text IS NULL OR tipificacion = $1)
         AND ($2::text IS NULL OR fuente = $2)
       ORDER BY tipificacion ASC, fecha_publicacion DESC NULLS LAST, fuente ASC`,
      [filtro.tipificacion, filtro.fuente],
    );
    return rows.map(
      (r, idx) =>
        new Fuente(
          r.id ?? `row-${idx}`,
          r.fuente,
          r.tipificacion,
          toIsoDate(r.fecha_publicacion),
          r.link,
        ),
    );
  }

  async listarTipificaciones(): Promise<string[]> {
    const rows = await this.db.query<{ tipificacion: string }>(
      `SELECT DISTINCT tipificacion
       FROM data_fuentes
       WHERE tipificacion IS NOT NULL
       ORDER BY tipificacion ASC`,
    );
    return rows.map((r) => r.tipificacion);
  }

  async listarNombresFuente(): Promise<string[]> {
    const rows = await this.db.query<{ fuente: string }>(
      `SELECT DISTINCT fuente
       FROM data_fuentes
       WHERE fuente IS NOT NULL
       ORDER BY fuente ASC`,
    );
    return rows.map((r) => r.fuente);
  }
}

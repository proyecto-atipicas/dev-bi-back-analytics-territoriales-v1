# Backend Consultas Analíticas — CNE

API NestJS con **arquitectura hexagonal** (Ports & Adapters) para los tableros electorales, socioeconómicos y poblacionales.

## Stack

- **NestJS 10** + TypeScript
- **PostgreSQL** (driver `pg` directo, sin ORM)
- **Swagger** para documentación
- Validación con `class-validator`
- Sin Docker, sin Prisma (por requerimiento)

## Arquitectura hexagonal

Cada bounded context bajo `src/modules/<contexto>/` se organiza en tres capas:

```
src/modules/<contexto>/
├── domain/                  # Núcleo: cero dependencias de framework/infra
│   ├── entities/            # Entidades inmutables con invariantes
│   └── ports/               # Interfaces (puertos) que el dominio expone
├── application/             # Casos de uso. Depende solo del dominio.
│   └── use-cases/
└── infrastructure/          # Adaptadores. Depende del dominio.
    ├── persistence/         # Adapter Postgres del puerto
    └── http/                # Adapter HTTP (controladores + DTOs)
```

**Regla fundamental:** las dependencias siempre apuntan hacia adentro.
`infrastructure → application → domain`. El dominio nunca importa de application ni infrastructure.

### Inyección de puertos

Los puertos se registran con `Symbol` tokens:

```ts
// domain/ports/geo.repository.port.ts
export const GEO_REPOSITORY = Symbol('GEO_REPOSITORY');
export interface GeoRepositoryPort { ... }

// geo.module.ts
providers: [
  { provide: GEO_REPOSITORY, useClass: PostgresGeoRepository },
]

// caso de uso
constructor(@Inject(GEO_REPOSITORY) private readonly repo: GeoRepositoryPort) {}
```

Cambiar de Postgres a otro adapter (mock, Mongo, REST) es solo cambiar el `useClass`.

## Estructura del proyecto

```
src/
├── main.ts
├── app.module.ts
├── shared/                  # Componentes transversales
│   ├── config/              # AppConfig, DatabaseConfig, validación de env
│   ├── database/            # DatabasePort + PostgresAdapter (pool pg)
│   └── http/                # Filtro global de excepciones
└── modules/
    ├── health/              # /health, /health/readiness
    └── geo/                 # Bounded context de referencia (hexagonal completo)
```

## Configuración

1. Copiar `.env.example` a `.env` y ajustar credenciales:

```bash
cp .env.example .env
```

> **Importante:** la IP `44.203.257.178` del contexto es inválida (octeto > 255).
> Confirmar IP real con el cliente. Confirmar también `DB_PASSWORD`.

2. Variables clave:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `DB_SCHEMA` — el `search_path` se aplica automáticamente a cada conexión del pool
   - `CORS_ORIGIN` — origen del frontend Next.js

## Instalación y ejecución

```bash
npm install
npm run start:dev
```

- API: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api/v1/docs`
- Health: `http://localhost:3001/api/v1/health/readiness`

## Endpoints disponibles

Todos los endpoints están bajo `/api/v1`.

### Health
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Liveness |
| GET | `/health/readiness` | Verifica conexión a Postgres |

### Geo (`dim_divipole`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/geo/departamentos` | Lista todos los departamentos |
| GET | `/geo/departamentos/:codigo/municipios` | Municipios de un departamento |
| GET | `/geo/puestos?codigoMunicipio=...` | Puestos de un municipio |

### Catalogos (`data_election` DISTINCT)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/catalogos/corporaciones` | Corporaciones disponibles |
| GET | `/catalogos/partidos?codigoCorporacion=...` | Partidos (filtrable por corporación) |
| GET | `/catalogos/candidatos?codigoCorporacion=...&codigoPartido=...&limite=...` | Candidatos |

### Electoral (`data_election` agregaciones)
Filtros aceptados en query string: `codigoCorporacion`, `codigoDepartamento`, `codigoMunicipio`, `codigoPartido`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/electoral/resumen` | Totales agregados |
| GET | `/electoral/por-departamento` | Votos por departamento (mapa) |
| GET | `/electoral/por-municipio` | Votos por municipio (requiere `codigoDepartamento`) |
| GET | `/electoral/ranking-partidos?limite=20` | Top partidos |
| GET | `/electoral/ranking-candidatos?limite=50` | Top candidatos |
| GET | `/electoral/resumen-corporaciones` | Tarjetas resumen por corporación |
| GET | `/electoral/comparativo/corporaciones?codigosCorporacion=A,B,C&codigoDepartamento=...&codigoMunicipio=...` | Comparativo entre 2–8 corporaciones (con `participacionPct` sobre el total seleccionado) |
| GET | `/electoral/comparativo/candidatos?codigosCandidato=X,Y,Z&codigoDepartamento=...&codigoMunicipio=...` | Comparativo entre 2–12 candidatos (admite mezcla de corporaciones) |

### Socioeconómico (`data_moe`, `data_publicaciones`)
Parámetro obligatorio: `fuente=MOE|PUBLICACIONES`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/socioeconomico/categorias?fuente=...` | Categorías disponibles |
| GET | `/socioeconomico/kpis?fuente=...&codigoDepartamento=...&categoria=...&ano=...` | KPIs |
| GET | `/socioeconomico/serie-historica?fuente=...&...` | Serie histórica |

### Poblacional (`data_encuestas`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/poblacional/dimensiones` | Dimensiones disponibles |
| GET | `/poblacional/referencias?dimension=...` | Referencias |
| GET | `/poblacional/kpis?fuente=...&dimension=...&...` | KPIs por dimensión |
| GET | `/poblacional/serie-historica?...` | Serie histórica anio/mes |

### Home (agregador)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/home/resumen-global?codigoCorporacion=...&...` | Payload consolidado del dashboard |

## Bounded contexts implementados

```
src/modules/
├── geo/             # Departamentos, municipios, puestos
├── catalogos/       # Corporaciones, partidos, candidatos
├── electoral/       # Resúmenes, rankings, mapas (3.2M filas)
├── socioeconomico/  # KPIs MOE / Publicaciones
├── poblacional/     # KPIs Encuestas
├── home/            # Agregador (orquesta los anteriores)
└── health/
```

Cada contexto sigue exactamente el mismo patrón hexagonal documentado al inicio.

## Notas de implementación

- **Schema mismatch pendiente:** el contexto indica `Schema: data_apff` pero los `CREATE TABLE`
  ejemplo usan `report.*`. Las queries actuales son **sin esquema calificado** y dependen del
  `search_path` (configurable vía `DB_SCHEMA`). Si el schema real es `report`, basta cambiar
  el `.env`.
- **Tablas pesadas:** `data_election` tiene ~3.2M filas. Toda agregación se hace en SQL.
  Antes de exponer en producción, crear índices en `data_election`:
  ```sql
  CREATE INDEX idx_data_election_corp_dep ON data_election (codigo_corporacion, codigo_departamento);
  CREATE INDEX idx_data_election_partido  ON data_election (codigo_partido);
  CREATE INDEX idx_data_election_mun      ON data_election (codigo_municipio);
  CREATE INDEX idx_data_election_cand     ON data_election (codigo_candidato);
  ```
- **Catálogos sin caché aún:** los DISTINCT sobre `data_election` son costosos. Próximo paso:
  envolver `ListarCorporacionesUseCase`, `ListarPartidosUseCase` y `ListarDepartamentosUseCase`
  con `cache-manager` (TTL 10 min). El paquete ya está en `dependencies`.
- **No mutaciones:** este servicio es read-only sobre la DB.
- **Home agregador:** `/home/resumen-global` ejecuta 5 queries en paralelo (`Promise.all`).
  Si en producción se vuelve lento, vale la pena agregar caché por hash de filtros.

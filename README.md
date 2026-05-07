# Backend Analítica Territorial


API NestJS con **arquitectura hexagonal** (Ports & Adapters) para los tableros electorales, socioeconómicos y poblacionales.

## Stack

- **NestJS 10** + TypeScript
- **PostgreSQL** (driver `pg` directo, sin ORM)
- **Swagger** para documentación
- Validación con `class-validator`
- Caché TTL en memoria (`TtlCacheService`) para catálogos estables
- Sin Docker, sin Prisma (por requerimiento)

## Arquitectura hexagonal

Cada bounded context bajo `src/modules/<contexto>/` se organiza en tres capas:

```
src/modules/<contexto>/
├── domain/                  # Núcleo: cero dependencias de framework/infra
│   ├── entities/            # Entidades inmutables con invariantes
│   ├── value-objects/       # Filtros y tipos compuestos
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
├── shared/
│   ├── config/              # AppConfig, DatabaseConfig, validación de env
│   ├── database/            # DatabasePort + PostgresAdapter (pool pg)
│   ├── cache/               # TtlCacheService (TTL en memoria + dedup)
│   └── http/                # Filtro global de excepciones
└── modules/
    ├── health/              # /health, /health/readiness
    ├── geo/                 # Departamentos, municipios, puestos
    ├── catalogos/           # Corporaciones, partidos, candidatos
    ├── electoral/           # Resúmenes, rankings, mapas, comparativo territorial
    ├── socioeconomico/      # KPIs MOE / Publicaciones, mapa de calor, serie
    ├── poblacional/         # Encuestas
    └── home/                # Agregador del dashboard
```

## Configuración

1. Copiar `.env.example` a `.env` y ajustar credenciales.

2. Variables clave:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `DB_SCHEMA` — el `search_path` se aplica automáticamente a cada conexión del pool (valor verificado: `report`)
   - `CACHE_TTL_SECONDS` — TTL del caché de catálogos (default 600s)
   - `CORS_ORIGIN` — origen del frontend Next.js (CSV admitido)

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
| GET | `/geo/puestos?codigoDepartamento=...&codigoMunicipio=...` | Puestos de un municipio (ambos parámetros obligatorios) |

### Catalogos (`data_election` DISTINCT)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/catalogos/corporaciones` | Corporaciones disponibles |
| GET | `/catalogos/partidos?codigoCorporacion=...` | Partidos (filtrable por corporación) |
| GET | `/catalogos/candidatos?codigoCorporacion=...&codigoPartido=...&limite=...` | Candidatos |

### Electoral (`data_election` agregaciones)
Filtros transversales: `codigoCorporacion`, `codigoDepartamento`, `codigoMunicipio`, `codigoPartido`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/electoral/resumen` | Totales agregados (votos, candidatos, partidos, departamentos, municipios, puestos) |
| GET | `/electoral/por-departamento` | Votos por departamento (mapa nacional) |
| GET | `/electoral/por-municipio` | Votos por municipio (requiere `codigoDepartamento`) |
| GET | `/electoral/por-puesto` | Votos por puesto (requiere `codigoDepartamento` + `codigoMunicipio`) |
| GET | `/electoral/ranking-partidos?limite=20` | Top partidos |
| GET | `/electoral/ranking-candidatos?limite=50` | Top candidatos |
| GET | `/electoral/resumen-corporaciones` | Tarjetas resumen por corporación |
| GET | `/electoral/comparativo/territorial?tipo=partido\|candidato&codigoA=...&codigoB=...&codigoCorporacion=...` | Comparativo pairwise — totales por A y B, ítems con metadatos y desglose por territorio. Granularidad adaptativa: depto sin filtro → muni con depto → puesto con muni. |

### Socioeconómico (`data_moe`, `data_publicaciones`)
Parámetro obligatorio: `fuente=MOE|PUBLICACIONES`. Si `PUBLICACIONES`, opcional `fuentePublicacion=<DNP TerriData|Externado e Indepaz|...>`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/socioeconomico/fuentes-publicaciones` | Lista DISTINCT de la columna `fuente` en `data_publicaciones` |
| GET | `/socioeconomico/categorias?fuente=...&fuentePublicacion=...` | Categorías disponibles |
| GET | `/socioeconomico/kpis?fuente=...&codigoDepartamento=...&categoria=...&ano=...` | KPIs (promedio, mín, máx) |
| GET | `/socioeconomico/serie-historica?fuente=...&categoria=...` | Serie histórica anual |
| GET | `/socioeconomico/por-departamento?fuente=...&categoria=...&ano=...` | Indicadores por departamento (mapa de calor + tabla) — último año si no se especifica `ano` |

### Poblacional (`data_encuestas`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/poblacional/dimensiones` | Dimensiones disponibles |
| GET | `/poblacional/resumen-dimensiones` | Cada dimensión con su cuenta de referencias por fuente |
| GET | `/poblacional/referencias?dimension=...&fuente=...` | Referencias |
| GET | `/poblacional/criterios?dimension=...&fuente=...&referencia=...` | Criterios |
| GET | `/poblacional/kpis?fuente=...&dimension=...&...` | KPIs por dimensión/referencia |
| GET | `/poblacional/serie-historica?dimension=...&fuente=...&referencia=...&criterios=A,B` | Serie histórica anio/mes |
| GET | `/poblacional/radar?dimension=...&fuente=...&referencia=...&criterios=A,B` | Valor por criterio en el último período disponible |

### Home (agregador)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/home/resumen-global?codigoCorporacion=...&...` | Payload consolidado del dashboard (orquesta varias queries en paralelo) |

## Notas de implementación

- **Schema verificado:** `report` (configurado en `.env` vía `DB_SCHEMA`). Las queries no califican schema; dependen del `search_path` que setea `PostgresAdapter` al conectar.
- **Tablas pesadas:** `data_election` tiene ~3.2M filas. Toda agregación se hace en SQL. Los índices del script [`sql/indexes.sql`](sql/indexes.sql) ya están aplicados en producción y son idempotentes.
- **Caché de catálogos:** los DISTINCT sobre `data_election` son costosos. `ListarCorporacionesUseCase`, `ListarPartidosUseCase` y `ListarDepartamentosUseCase` están envueltos con `TtlCacheService` (TTL 10 min, dedup de promesas en vuelo).
- **Read-only:** este servicio no muta la BD.
- **`participacionPct`:** se calcula en una sola pasada con `SUM() OVER ()` para evitar consultas dobles.
- **Normalización de códigos:** `data_moe` / `data_publicaciones` usan códigos sin padding; el SQL aplica `LPAD(codigo_departamento, 2, '0')` para emparejarlos con los códigos del frontend.
- **Identidad del puesto:** la tripleta `(codigo_departamento, codigo_municipio, codigo_puesto)`. Un mismo `codigo_puesto` se repite entre municipios — todas las queries de detalle y los conteos `DISTINCT` lo respetan.

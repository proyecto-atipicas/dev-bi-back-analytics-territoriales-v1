-- ============================================================================
-- Índices recomendados para `report.data_election` (~3.2M filas)
-- Ejecutar con `CREATE INDEX CONCURRENTLY` en producción para evitar bloqueos.
-- Cada bloque puede ejecutarse de forma independiente y es idempotente.
-- ============================================================================

SET search_path TO report, public;

-- Filtros transversales que combinan corporación + departamento (mapas y resúmenes).
CREATE INDEX IF NOT EXISTS idx_data_election_corp_dep
  ON data_election (codigo_corporacion, codigo_departamento);

-- Rankings y filtros por partido.
CREATE INDEX IF NOT EXISTS idx_data_election_partido
  ON data_election (codigo_partido);

-- Drill-down a municipio (usado por `por-municipio`).
CREATE INDEX IF NOT EXISTS idx_data_election_mun
  ON data_election (codigo_departamento, codigo_municipio);

-- Búsquedas y comparativos por candidato.
CREATE INDEX IF NOT EXISTS idx_data_election_cand
  ON data_election (codigo_candidato);

-- ----------------------------------------------------------------------------
-- Índices auxiliares para catálogos / geo
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_dim_divipole_dep
  ON dim_divipole (codigo_departamento);

CREATE INDEX IF NOT EXISTS idx_dim_divipole_dep_mun
  ON dim_divipole (codigo_departamento, codigo_municipio);

-- Socioeconómico
-- `data_publicaciones` aplicó la migración 2026-05 (dimension/periodo/nivel_riesgo + nuevos campos).
-- `data_moe` quedó en esquema legacy (categoria/ano/calificacion) y NO tiene
-- las columnas nuevas — los índices se mantienen sobre los nombres reales.
CREATE INDEX IF NOT EXISTS idx_data_moe_dep_categoria
  ON data_moe (codigo_departamento, categoria, ano);

CREATE INDEX IF NOT EXISTS idx_data_publicaciones_dep_dimension
  ON data_publicaciones (codigo_departamento, dimension, periodo, fuente);

-- Filtros nuevos: referencia y nivel_geografico (sólo data_publicaciones)
CREATE INDEX IF NOT EXISTS idx_data_publicaciones_referencia
  ON data_publicaciones (referencia);

CREATE INDEX IF NOT EXISTS idx_data_publicaciones_nivel_geo
  ON data_publicaciones (nivel_geografico);

-- Poblacional
CREATE INDEX IF NOT EXISTS idx_data_encuestas_dim_ref
  ON data_encuestas (dimension, referencia, anio);

-- Verificar uso real con: EXPLAIN (ANALYZE, BUFFERS) <query>;

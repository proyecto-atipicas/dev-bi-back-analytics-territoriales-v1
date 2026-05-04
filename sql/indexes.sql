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
CREATE INDEX IF NOT EXISTS idx_data_moe_dep_categoria
  ON data_moe (codigo_departamento, categoria, ano);

CREATE INDEX IF NOT EXISTS idx_data_publicaciones_dep_categoria
  ON data_publicaciones (codigo_departamento, categoria, ano, fuente);

-- Poblacional
CREATE INDEX IF NOT EXISTS idx_data_encuestas_dim_ref
  ON data_encuestas (dimension, referencia, anio);

-- Verificar uso real con: EXPLAIN (ANALYZE, BUFFERS) <query>;

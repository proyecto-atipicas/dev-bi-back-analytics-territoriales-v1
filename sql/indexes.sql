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

-- Corporación sola: cubre /electoral/resumen, /resumen-corporaciones y
-- /ranking-partidos cuando el único filtro activo es la corporación
-- (caso por defecto del Home y de Comportamiento al cargar).
CREATE INDEX IF NOT EXISTS idx_data_election_corp
  ON data_election (codigo_corporacion);

-- Comparativo pairwise por partido y rankings filtrados por partido dentro
-- de la corporación. Acelera /electoral/comparativo/territorial cuando
-- tipo=partido y los códigos A/B se filtran sobre data_election (3.2M filas).
CREATE INDEX IF NOT EXISTS idx_data_election_corp_partido
  ON data_election (codigo_corporacion, codigo_partido);

-- Comparativo pairwise por candidato — identidad compuesta
-- (codigo_candidato, codigo_partido) acotada por corporación. Es el patrón
-- más caro porque escanea por tupla; este índice lo cubre exactamente.
CREATE INDEX IF NOT EXISTS idx_data_election_corp_cand_partido
  ON data_election (codigo_corporacion, codigo_candidato, codigo_partido);

-- Drill-down territorial completo dentro de una corporación (puestos).
-- Acelera /por-puesto y la rama "puesto" de /comparativo/territorial.
CREATE INDEX IF NOT EXISTS idx_data_election_corp_dep_mun_puesto
  ON data_election (codigo_corporacion, codigo_departamento, codigo_municipio, codigo_puesto);

-- ----------------------------------------------------------------------------
-- Índices auxiliares para catálogos / geo
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_dim_divipole_dep
  ON dim_divipole (codigo_departamento);

CREATE INDEX IF NOT EXISTS idx_dim_divipole_dep_mun
  ON dim_divipole (codigo_departamento, codigo_municipio);

-- Drill-down a puestos cuando se construye el sub-CTE de nombres en
-- `comparar-territorial` y `por-puesto`.
CREATE INDEX IF NOT EXISTS idx_dim_divipole_dep_mun_puesto
  ON dim_divipole (codigo_departamento, codigo_municipio, codigo_puesto);

-- Socioeconómico
-- `data_socioeconómica` aplicó la migración 2026-05 (dimension/periodo/nivel_riesgo + nuevos campos)
-- y es la única tabla consultada por el módulo socioeconómico.
CREATE INDEX IF NOT EXISTS idx_data_socioeconómica_dep_dimension
  ON data_socioeconómica (codigo_departamento, dimension, periodo, fuente);

-- ----------------------------------------------------------------------------
-- Índice FUNCIONAL para `LPAD(codigo_departamento, 2, '0')`
-- ----------------------------------------------------------------------------
-- El repositorio socioeconómico normaliza códigos sin padding ('1' → '01')
-- al filtrar:   WHERE LPAD(codigo_departamento, 2, '0') = LPAD($1, 2, '0')
-- Sin este índice funcional el planner NO puede usar
-- `idx_data_socioeconómica_dep_dimension` y termina haciendo seq scan completo
-- en cada filtro de depto (~835 filas hoy — pequeñas, pero crecerán; además
-- el seq scan invalida el orden del índice compuesto).
CREATE INDEX IF NOT EXISTS idx_data_socioeconómica_dep_padded
  ON data_socioeconómica ((LPAD(codigo_departamento, 2, '0')));

-- Filtros nuevos: referencia y nivel_geografico (sólo data_socioeconómica)
CREATE INDEX IF NOT EXISTS idx_data_socioeconómica_referencia
  ON data_socioeconómica (referencia);

CREATE INDEX IF NOT EXISTS idx_data_socioeconómica_nivel_geo
  ON data_socioeconómica (nivel_geografico);

-- `fuente` se usa para acotar publicaciones (DNP TerriData, Externado e Indepaz…).
-- También alimenta `/socioeconomico/fuentes-publicaciones`.
CREATE INDEX IF NOT EXISTS idx_data_socioeconómica_fuente
  ON data_socioeconómica (fuente);

-- Poblacional
CREATE INDEX IF NOT EXISTS idx_data_impacto_poblacional_dim_ref
  ON data_impacto_poblacional (dimension, referencia, anio);

-- Filtros adicionales del módulo poblacional: fuente y criterio se usan en
-- KPIs, serie histórica y radar. Sin índices, cada cambio de filtro
-- redespacha el seq scan sobre la tabla.
CREATE INDEX IF NOT EXISTS idx_data_impacto_poblacional_fuente_dim_ref
  ON data_impacto_poblacional (fuente, dimension, referencia);

CREATE INDEX IF NOT EXISTS idx_data_impacto_poblacional_criterio
  ON data_impacto_poblacional (criterio);

-- Fuentes (catálogo documental): filtros frecuentes en /fuentes y
-- /fuentes/tipificaciones, /fuentes/nombres.
CREATE INDEX IF NOT EXISTS idx_data_fuentes_tipificacion
  ON data_fuentes (tipificacion);

CREATE INDEX IF NOT EXISTS idx_data_fuentes_fuente
  ON data_fuentes (fuente);

-- ----------------------------------------------------------------------------
-- ANALYZE explícito para que el planner use los índices nuevos sin esperar
-- al próximo autovacuum. En producción ejecutar una sola vez tras crear los
-- índices (no requiere lock exclusivo).
-- ----------------------------------------------------------------------------
ANALYZE data_election;
ANALYZE dim_divipole;
ANALYZE data_socioeconómica;
ANALYZE data_impacto_poblacional;
ANALYZE data_fuentes;

-- Verificar uso real con: EXPLAIN (ANALYZE, BUFFERS) <query>;

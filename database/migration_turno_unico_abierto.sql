-- ============================================================
-- Migración: evita que un cajero quede con más de un turno
-- "abierto" a la vez (causa del bug donde la pantalla de
-- "Abrir Caja" se queda atascada sin avanzar al POS).
-- Ejecuta esto en el SQL Editor de Supabase.
-- ============================================================

-- 1. Limpieza de turnos duplicados ya existentes:
--    si un cajero tiene varios turnos "abierto", nos quedamos
--    con el más reciente y cerramos los demás (sin tocar sus
--    ventas, solo se marcan como cerrados para destrabar al cajero).
WITH duplicados AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY cajero_id
           ORDER BY fecha_apertura DESC
         ) AS rn
  FROM turnos
  WHERE estado = 'abierto'
)
UPDATE turnos
SET estado = 'cerrado',
    fecha_cierre = NOW(),
    observaciones = COALESCE(observaciones || ' | ', '') || 'Cerrado automáticamente: turno duplicado detectado por bug de apertura'
WHERE id IN (SELECT id FROM duplicados WHERE rn > 1);

-- 2. Índice único: a partir de ahora, la base de datos rechaza
--    cualquier intento de abrir un segundo turno mientras el cajero
--    ya tenga uno abierto.
CREATE UNIQUE INDEX IF NOT EXISTS turnos_un_abierto_por_cajero
ON turnos (cajero_id)
WHERE estado = 'abierto';

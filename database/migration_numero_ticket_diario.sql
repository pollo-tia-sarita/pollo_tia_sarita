-- ============================================================
-- Migración: Numeración de tickets secuencial por sucursal,
-- reinicia cada día.
-- Ejecuta esto en el SQL Editor de Supabase.
-- ============================================================

-- 1. Tabla de contadores: un contador por (sucursal, día)
CREATE TABLE IF NOT EXISTS contador_tickets (
  sucursal_id   uuid NOT NULL REFERENCES sucursales(id),
  fecha         date NOT NULL DEFAULT CURRENT_DATE,
  ultimo_numero integer NOT NULL DEFAULT 0,
  PRIMARY KEY (sucursal_id, fecha)
);

-- 2. Función que asigna el siguiente número del día para la sucursal
--    de la venta que se está insertando (UPSERT atómico, seguro con
--    varios cajeros vendiendo a la vez).
CREATE OR REPLACE FUNCTION asignar_numero_ticket_diario()
RETURNS TRIGGER AS $$
DECLARE
  v_numero integer;
BEGIN
  INSERT INTO contador_tickets (sucursal_id, fecha, ultimo_numero)
  VALUES (NEW.sucursal_id, CURRENT_DATE, 1)
  ON CONFLICT (sucursal_id, fecha)
  DO UPDATE SET ultimo_numero = contador_tickets.ultimo_numero + 1
  RETURNING ultimo_numero INTO v_numero;

  NEW.numero_ticket := v_numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger: corre antes de insertar cada venta
DROP TRIGGER IF EXISTS trg_numero_ticket_diario ON ventas;
CREATE TRIGGER trg_numero_ticket_diario
BEFORE INSERT ON ventas
FOR EACH ROW
EXECUTE FUNCTION asignar_numero_ticket_diario();

-- 4. La columna ya no necesita el default de la secuencia global
--    (SERIAL), ahora el trigger la controla.
ALTER TABLE ventas ALTER COLUMN numero_ticket DROP DEFAULT;

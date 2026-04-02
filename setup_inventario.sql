-- ============================================================
-- SQL: Descuento Automático de Inventario (Recetas)
-- Ejecutar entero en Supabase SQL Editor
-- ============================================================

-- 1. Crear tabla que define la 'Receta' (ingredientes para un producto)
CREATE TABLE IF NOT EXISTS public.producto_insumos (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id   UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    insumo_id     UUID NOT NULL REFERENCES public.insumos(id) ON DELETE CASCADE,
    cantidad      NUMERIC(12, 3) NOT NULL CHECK (cantidad > 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activar RLS en la nueva tabla
ALTER TABLE public.producto_insumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "producto_insumos_todos_leen" ON public.producto_insumos 
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "producto_insumos_admin_escribe" ON public.producto_insumos 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('admin', 'supervisor'))
    );


-- 2. Función: Bajar el stock cuando se inserta un detalle de venta completado
CREATE OR REPLACE FUNCTION descontar_stock_por_venta()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Comprueba que la venta actual sea 'completada'
    IF EXISTS (SELECT 1 FROM ventas WHERE id = NEW.venta_id AND estado = 'completada') THEN
        -- Por la cantidad que el cliente compró (NEW.cantidad), la multiplicamos 
        -- por la cantidad de insumo en su receta (pi.cantidad)
        UPDATE insumos i
        SET stock_actual = i.stock_actual - (pi.cantidad * NEW.cantidad),
            updated_at = NOW()
        FROM producto_insumos pi
        WHERE pi.producto_id = NEW.producto_id
          AND i.id = pi.insumo_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_descontar_stock ON detalle_ventas;
CREATE TRIGGER trg_descontar_stock
AFTER INSERT ON detalle_ventas
FOR EACH ROW EXECUTE FUNCTION descontar_stock_por_venta();


-- 3. Función: Devolver el stock a cocina si un administrador ANULA la venta
CREATE OR REPLACE FUNCTION retornar_stock_por_anulacion()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Solo si pasa de "completada" a "anulada"
    IF OLD.estado = 'completada' AND NEW.estado = 'anulada' THEN
        -- Actualizamos todos los insumos de los productos de esta venta
        UPDATE insumos i
        SET stock_actual = i.stock_actual + (pi.cantidad * dv.cantidad),
            updated_at = NOW()
        FROM detalle_ventas dv
        JOIN producto_insumos pi ON pi.producto_id = dv.producto_id
        WHERE dv.venta_id = NEW.id
          AND i.id = pi.insumo_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_retornar_stock ON ventas;
CREATE TRIGGER trg_retornar_stock
AFTER UPDATE OF estado ON ventas
FOR EACH ROW
WHEN (OLD.estado = 'completada' AND NEW.estado = 'anulada')
EXECUTE FUNCTION retornar_stock_por_anulacion();

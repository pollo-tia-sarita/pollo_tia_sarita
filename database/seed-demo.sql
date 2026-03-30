-- ============================================================
-- 🍗 TÍA SARITA — Datos de Prueba (Demo Seed)
-- Ejecuta este script SOLAMENTE si quieres llenar el sistema 
-- con datos falsos (Pollos, combos, etc) para ver cómo funciona.
-- ============================================================

-- IMPORTANTE: Asegúrate de haber ejecutado schema.sql y creado 
-- el primer usuario admin antes de correr esto.

DO $$ 
DECLARE
    cat_pollos UUID;
    cat_combos UUID;
    cat_bebidas UUID;
    cat_extras  UUID;
    v_sucursal_id UUID;
BEGIN
    -- 1. Obtener la sucursal por defecto
    SELECT id INTO v_sucursal_id FROM sucursales LIMIT 1;
    
    IF v_sucursal_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró ninguna sucursal. Ejecuta schema.sql primero.';
    END IF;

    -- 2. Crear Categorías Demo
    INSERT INTO categorias (nombre, icono, orden, activa) VALUES
    ('Pollos a la Broaster', '🍗', 1, true) RETURNING id INTO cat_pollos;
    
    INSERT INTO categorias (nombre, icono, orden, activa) VALUES
    ('Combos Familiares', '👨‍👩‍👧‍👦', 2, true) RETURNING id INTO cat_combos;

    INSERT INTO categorias (nombre, icono, orden, activa) VALUES
    ('Bebidas', '🥤', 3, true) RETURNING id INTO cat_bebidas;

    INSERT INTO categorias (nombre, icono, orden, activa) VALUES
    ('Complementos', '🍟', 4, true) RETURNING id INTO cat_extras;

    -- 3. Crear Productos Demo
    
    -- POLLOS
    INSERT INTO productos (categoria_id, nombre, descripcion, precio, disponible, orden, imagen_url) VALUES
    (cat_pollos, '1/4 de Pollo Broaster', 'Pierna o pecho, acompañado de papas fritas, arroz chaufa y cremas.', 25.00, true, 1, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=400&h=400&fit=crop'),
    (cat_pollos, 'Medio Pollo Broaster', 'Dos presas grandes con doble porción de papas y arroz.', 45.00, true, 2, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=400&h=400&fit=crop'),
    (cat_pollos, 'Pollo Entero a la Broaster', '4 presas grandes, mega porción de papas fritas y arroz para 4 personas.', 85.00, true, 3, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=400&h=400&fit=crop');

    -- COMBOS (Con oferta)
    INSERT INTO productos (categoria_id, nombre, descripcion, precio, precio_oferta, en_oferta, disponible, orden) VALUES
    (cat_combos, 'Combo Tia Sarita', 'Pollo entero + Gaseosa 2L + Salchipapa familiar', 120.00, 105.00, true, true, 1),
    (cat_combos, 'Combo Duo', 'Medio Pollo + 2 Gaseosas Personales', 55.00, 50.00, true, true, 2);

    -- BEBIDAS
    INSERT INTO productos (categoria_id, nombre, precio, disponible, orden) VALUES
    (cat_bebidas, 'Coca Cola 2 Litros', 15.00, true, 1),
    (cat_bebidas, 'Coca Cola Personal', 6.00, true, 2),
    (cat_bebidas, 'Jarra de Chicha Morada', 20.00, true, 3),
    (cat_bebidas, 'Agua Mineral', 5.00, true, 4);

    -- EXTRAS
    INSERT INTO productos (categoria_id, nombre, precio, disponible, orden) VALUES
    (cat_extras, 'Porción de Papas Fritas', 12.00, true, 1),
    (cat_extras, 'Arroz Chaufa Extra', 10.00, true, 2),
    (cat_extras, 'Ensalada Mixta', 8.00, true, 3);
    
    RAISE NOTICE '¡Datos demo insertados correctamente!';
END $$;

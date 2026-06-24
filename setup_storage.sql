-- ============================================================
-- SQL: Configuración de Almacenamiento (Storage) de Supabase
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================================

-- 1. Crear el Bucket "productos" de manera pública
INSERT INTO storage.buckets (id, name, public) 
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir que CUALQUIERA (incluyendo clientes y el POS) pueda VER las imágenes
CREATE POLICY "Permitir lectura pública de imágenes" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'productos' );

-- 3. Permitir que SOLO administradores/empleados logueados puedan SUBIR imágenes
CREATE POLICY "Permitir subida a usuarios autenticados" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'productos' AND auth.role() = 'authenticated' );

-- 4. Permitir que SOLO administradores/empleados logueados puedan BORRAR/ACTUALIZAR imágenes
CREATE POLICY "Permitir borrado a usuarios autenticados" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'productos' AND auth.role() = 'authenticated' );

CREATE POLICY "Permitir actualizacion a usuarios autenticados" 
ON storage.objects FOR UPDATE
USING ( bucket_id = 'productos' AND auth.role() = 'authenticated' );

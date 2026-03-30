-- 1. Actualizar el tipo de dato ENUM (rol_usuario) para aceptar los nuevos roles
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'mesero';
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'cocinero';
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'repartidor';
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'limpieza';

-- 2. Creamos la tabla de comunicados (avisos)
CREATE TABLE IF NOT EXISTS public.comunicados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    roles_destino TEXT[] DEFAULT '{}', -- Ej: ['mesero', 'cocinero'] o vacío para todos
    creador_id UUID REFERENCES public.perfiles(id),
    sucursal_id UUID REFERENCES public.sucursales(id), -- Opcional, si el aviso es por sucursal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Creamos la tabla de bitácora (Asistencia)
CREATE TABLE IF NOT EXISTS public.bitacora_asistencia (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empleado_id UUID REFERENCES public.perfiles(id) NOT NULL,
    sucursal_id UUID REFERENCES public.sucursales(id), -- Opcional
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_entrada TIMESTAMP WITH TIME ZONE,
    hora_salida TIMESTAMP WITH TIME ZONE,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitamos RLS (Row Level Security)
ALTER TABLE public.bitacora_asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;

-- 5. Políticas para Comunicados (Corregido el error de tipos de Postgres)
CREATE POLICY "Empleados pueden ver comunicados genéricos o a su rol" 
ON public.comunicados 
FOR SELECT 
USING (
  roles_destino = '{}' OR 
  (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND perfiles.rol::TEXT = ANY(comunicados.roles_destino)))
);

CREATE POLICY "Administradores pueden crear comunicados"
ON public.comunicados
FOR ALL
USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND perfiles.rol::TEXT IN ('admin', 'supervisor')));

-- 6. Políticas para Bitácora
CREATE POLICY "Empleados pueden insertar y ver su propia bitacora"
ON public.bitacora_asistencia
FOR ALL
USING (empleado_id = auth.uid())
WITH CHECK (empleado_id = auth.uid());

CREATE POLICY "Admins pueden ver todas las bitacoras"
ON public.bitacora_asistencia
FOR SELECT
USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND perfiles.rol::TEXT IN ('admin', 'supervisor')));

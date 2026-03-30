CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_origen_id uuid NOT NULL,
  rol_origen character varying NOT NULL,
  mensaje text NOT NULL,
  tipo character varying NOT NULL DEFAULT 'sistema',
  leido boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT notificaciones_usuario_origen_id_fkey FOREIGN KEY (usuario_origen_id) REFERENCES perfiles (id) ON DELETE CASCADE
);

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins pueden ver todas las notificaciones" ON public.notificaciones;
CREATE POLICY "Admins pueden ver todas las notificaciones" ON public.notificaciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND (rol = 'admin' OR rol = 'supervisor')
    )
  );

DROP POLICY IF EXISTS "Usuarios pueden insertar notificaciones" ON public.notificaciones;
CREATE POLICY "Usuarios pueden insertar notificaciones" ON public.notificaciones
  FOR INSERT WITH CHECK (auth.uid() = usuario_origen_id);

DROP POLICY IF EXISTS "Admins pueden actualizar notificaciones" ON public.notificaciones;
CREATE POLICY "Admins pueden actualizar notificaciones" ON public.notificaciones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM perfiles WHERE id = auth.uid() AND (rol = 'admin' OR rol = 'supervisor')
    )
  );

-- Habilitar Realtime para notificaciones de forma segura
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'notificaciones'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notificaciones;
  END IF;
END $$;

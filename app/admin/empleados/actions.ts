'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Server Action: Crea un nuevo usuario en Supabase Auth usando la SERVICE_ROLE KEY.
 * Esto se ejecuta SOLO en el servidor — la clave nunca llega al navegador.
 *
 * Devuelve { userId } si tuvo éxito, o { error } si falló.
 */
export async function crearUsuarioAuth(email: string, password: string): Promise<
  { userId: string; error?: never } |
  { userId?: never; error: string }
> {
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return { error: 'Faltan variables de entorno del servidor (SUPABASE_SERVICE_ROLE_KEY).' }
  }

  // Cliente admin con service_role — solo existe en el servidor
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,  // Confirmar email automáticamente (no requiere que el empleado confirme)
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'No se pudo crear el usuario.' }
  }

  return { userId: data.user.id }
}

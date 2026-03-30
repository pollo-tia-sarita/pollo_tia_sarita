import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PortalClient from './PortalClient'

export const dynamic = 'force-dynamic'

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener perfil completo
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('id, nombre, apellido, rol, sucursal_id, sucursales(nombre)')
    .eq('id', user.id)
    .single()

  if (!perfil) redirect('/login')

  // Obtener comunicados para este rol, limitados a los ultimos 10
  // Para evitar errores si la tabla aún no se creó, usamos bloque try/catch (o en este caso supabase maneja error silent devuelto)
  const { data: comunicados, error: comError } = await supabase
    .from('comunicados')
    .select('id, titulo, mensaje, fecha, creador_id(nombre, apellido), roles_destino')
    .order('fecha', { ascending: false })
    .limit(10)

  // Obtener la bitácora de HOY para este empleado
  const today = new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
  const { data: bitacoraHoy } = await supabase
    .from('bitacora_asistencia')
    .select('*')
    .eq('empleado_id', perfil.id)
    .eq('fecha', today)
    .maybeSingle()

  return (
    <PortalClient 
      perfil={perfil} 
      comunicados={comError ? [] : (comunicados || [])} 
      bitacora={bitacoraHoy}
    />
  )
}

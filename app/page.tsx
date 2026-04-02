import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener rol del usuario
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  const rolesOperativos = ['mesero', 'cocinero', 'repartidor', 'limpieza']

  if (perfil?.rol === 'cajero') {
    redirect('/pos')
  }

  if (rolesOperativos.includes(perfil?.rol || '')) {
    redirect('/portal')
  }

  redirect('/admin/dashboard')
}

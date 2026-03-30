import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Utensils } from 'lucide-react'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, apellido, rol, sucursal_id, sucursales(nombre)')
    .eq('id', user.id)
    .single()

  if (!perfil) redirect('/login')

  // Redirigir si no es un rango valido para este portal (ej. si entra el Admin por error, lo mandamos a su lugar)
  const rolesOperativos = ['mesero', 'cocinero', 'repartidor', 'limpieza']
  if (!rolesOperativos.includes(perfil.rol)) {
    if (perfil.rol === 'admin' || perfil.rol === 'supervisor') redirect('/admin')
    if (perfil.rol === 'cajero') redirect('/pos')
  }

  const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`

  return (
    <div className="portal-layout" style={{ minHeight: '100dvh', background: 'var(--bg-900)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Simplificado Móvil */}
      <header style={{ 
        background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)',
        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ background: 'var(--yellow)', width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Utensils size={18} color="#000" />
        </div>
        <h1 style={{ color: 'var(--text-100)', fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
          StaffTíaSarita
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="portal-content" style={{ flex: 1, padding: '24px 16px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: var(--bg-900); color: var(--text-100); font-family: system-ui, -apple-system, sans-serif; }
      `}</style>
    </div>
  )
}

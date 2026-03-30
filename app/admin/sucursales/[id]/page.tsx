import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Store, Users, DollarSign, TrendingUp, TrendingDown, BadgeCheck, Phone, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function SucursalDashboardPage({ params }: PageProps) {
  const sucursalId = params.id
  const supabase = await createClient()

  // 1. Obtener la información de la Sucursal
  const { data: sucursal, error: sucError } = await supabase
    .from('sucursales')
    .select('*')
    .eq('id', sucursalId)
    .single()

  if (!sucursal || sucError) {
    return notFound()
  }

  // 2. Obtener Perfiles (Empleados) de esta sucursal
  const { data: empleados } = await supabase
    .from('perfiles')
    .select('id, nombre, apellido, rol, activo')
    .eq('sucursal_id', sucursalId)
    .order('rol', { ascending: true }) // Admin -> Cajero -> Supervisor... el enum dicta el orden

  const empleadosAsignados = empleados || []
  
  // Buscar Encargado (Cualquiera con rol 'supervisor', o 'admin' de resguardo)
  const encargado = empleadosAsignados.find(e => e.rol === 'supervisor') || 
                    empleadosAsignados.find(e => e.rol === 'admin')

  // 3. Obtener Total de Ventas Completadas
  const { data: ventas } = await supabase
    .from('ventas')
    .select('total')
    .eq('sucursal_id', sucursalId)
    .eq('estado', 'completada')

  const totalVentas = (ventas || []).reduce((acc, v) => acc + (v.total || 0), 0)

  // 4. Obtener Total de Compras (Egresos de Insumos)
  const { data: compras } = await supabase
    .from('compras')
    .select('total')
    .eq('sucursal_id', sucursalId)

  const totalCompras = (compras || []).reduce((acc, c) => acc + (c.total || 0), 0)

  // 5. Cálculos 
  const gananciaNeta = totalVentas - totalCompras
  const esGanancia = gananciaNeta >= 0

  const fmt = (n: number) => new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2 }).format(n)

  return (
    <div className="admin-page animate-fade-in text-white">
      
      {/* Navegación y Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/sucursales" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-400)', textDecoration: 'none', marginBottom: '20px', fontWeight: 600, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Volver a Sucursales
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-100)', display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.03em' }}>
              <div style={{ padding: '12px', background: 'rgba(253, 216, 53, 0.1)', borderRadius: '16px', color: 'var(--yellow)' }}>
                <Store size={36} />
              </div>
              {sucursal.nombre}
            </h1>
            <div style={{ display: 'flex', gap: '20px', marginTop: '16px', color: 'var(--text-500)', fontSize: '0.95rem' }}>
              <span className="flex items-center gap-2"><MapPin size={16}/> {sucursal.direccion || 'Sin dirección'} {sucursal.ciudad ? `(${sucursal.ciudad})` : ''}</span>
              <span className="flex items-center gap-2"><Phone size={16}/> {sucursal.telefono || 'Sin teléfono'}</span>
              <span className="flex items-center gap-2" style={{ color: sucursal.activa ? '#4CAF50' : 'var(--text-500)' }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sucursal.activa ? '#4CAF50' : 'var(--text-600)' }}></div>
                 {sucursal.activa ? 'Operativa' : 'Inactiva'}
              </span>
            </div>
          </div>

          {/* Tarjeta del Encargado */}
          {encargado && (
            <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '250px' }}>
               <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                 {encargado.nombre.charAt(0)}
               </div>
               <div>
                 <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--yellow)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   <BadgeCheck size={14} /> Encargado
                 </p>
                 <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{encargado.nombre} {encargado.apellido}</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Métricas Financieras */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        
        {/* Ingresos */}
        <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Total Ingresos (Ventas)</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <TrendingUp size={24} />
             </div>
             <p style={{ fontSize: '2rem', fontWeight: 900, color: '#4CAF50', fontFamily: 'monospace' }}>Bs. {fmt(totalVentas)}</p>
          </div>
        </div>

        {/* Egresos */}
        <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Total Egresos (Compras)</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(211, 47, 47, 0.1)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <TrendingDown size={24} />
             </div>
             <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--red)', fontFamily: 'monospace' }}>Bs. {fmt(totalCompras)}</p>
          </div>
        </div>

        {/* Ganancia Neta */}
        <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, transform: 'scale(1.5)', color: esGanancia ? '#4CAF50' : 'var(--red)' }}>
            <DollarSign size={120} />
          </div>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', position: 'relative' }}>Ganancia Neta Límpidez</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
             <p style={{ fontSize: '2.5rem', fontWeight: 900, color: esGanancia ? '#fff' : 'var(--red)', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
               {esGanancia ? '' : '-' }Bs. {fmt(Math.abs(gananciaNeta))}
             </p>
          </div>
        </div>

      </div>

      {/* Tabla de Empleados */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Users className="text-yellow" /> Empleados Asignados
      </h2>

      <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Nombre</th>
              <th style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Rol</th>
              <th style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Estado Sistema</th>
            </tr>
          </thead>
          <tbody>
            {empleadosAsignados.map(emp => (
              <tr key={emp.id} style={{ transition: 'var(--transition)' }}>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: '#fff' }}>
                  {emp.nombre} {emp.apellido}
                  {emp.id === encargado?.id && <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: 'rgba(253, 216, 53, 0.1)', color: 'var(--yellow)', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>ENCARGADO</span>}
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: emp.rol === 'admin' ? 'var(--red)' : emp.rol === 'supervisor' ? 'var(--yellow)' : '#2196F3' }}>
                    {emp.rol}
                  </span>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                  {emp.activo 
                    ? <span style={{ fontSize: '0.8rem', color: '#4CAF50', fontWeight: 600 }}>● Acceso Permitido</span>
                    : <span style={{ fontSize: '0.8rem', color: 'var(--red)', fontWeight: 600 }}>● Cuenta Bloqueada</span>
                  }
                </td>
              </tr>
            ))}

            {empleadosAsignados.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-500)' }}>
                  No hay empleados registrados en esta sucursal aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-2 { gap: 8px; }
      `}</style>
    </div>
  )
}

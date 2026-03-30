'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { MapPin, Watch, ShieldAlert, CheckCircle, Bell, Clock, LogOut } from 'lucide-react'
import { useComunicados } from '@/lib/hooks/useComunicados'

export default function PortalClient({ perfil, comunicados: initialComunicados, bitacora: initialBitacora }: { perfil: any, comunicados: any[], bitacora: any }) {
  const supabase = createClient()
  const [loading, setLoading]   = useState(false)
  const [bitacora, setBitacora] = useState(initialBitacora)

  // Hook centralizado: Realtime + filtrado por rol + conteo no-leídos
  const { comunicados } = useComunicados(perfil.rol, initialComunicados)

  const handleMarcarAsistencia = async () => {
    setLoading(true)
    const nowLocal = new Date() // El dispositivo del usuario
    const isClockIn = !bitacora
    const isClockOut = bitacora && !bitacora.hora_salida

    if (!isClockIn && !isClockOut) {
      toast.error('Ya registraste tu entrada y salida hoy. ¡Buen trabajo!')
      setLoading(false)
      return
    }

    try {
      if (isClockIn) {
        // Marcar Entrada (INSERT)
        const todayStr = new Date().toISOString().split('T')[0]
        const { data, error } = await supabase
          .from('bitacora_asistencia')
          .insert({
            empleado_id: perfil.id,
            sucursal_id: perfil.sucursal_id || null, // Algunos pueden no tener
            fecha: todayStr,
            hora_entrada: nowLocal.toISOString()
          })
          .select('*')
          .single()
        
        if (error) throw error;

        // Enviar Notificación al Admin
        await supabase.from('notificaciones').insert({
          usuario_origen_id: perfil.id,
          rol_origen: perfil.rol,
          tipo: 'bitacora',
          mensaje: `El/La ${perfil.rol.toUpperCase()} ${perfil.nombre} acaba de MARCAR ENTRADA e iniciar turno.`
        })

        toast.success('¡Entrada registrada correctamente!')
        setBitacora(data)
      } else if (isClockOut) {
        // Marcar Salida (UPDATE)
        const { data, error } = await supabase
          .from('bitacora_asistencia')
          .update({
            hora_salida: nowLocal.toISOString()
          })
          .eq('id', bitacora.id)
          .select('*')
          .single()
          
        if (error) throw error;
        
        // Enviar Notificación al Admin
        await supabase.from('notificaciones').insert({
          usuario_origen_id: perfil.id,
          rol_origen: perfil.rol,
          tipo: 'bitacora',
          mensaje: `El/La ${perfil.rol.toUpperCase()} ${perfil.nombre} ha MARCADO SALIDA y finalizado turno.`
        })

        toast.success('¡Salida registrada! Hasta mañana.')
        setBitacora(data)
      }
    } catch(err: any) {
      toast.error('Error al registrar asistencia: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const estadoLaboral = 
    !bitacora ? 'Pendiente' : 
    !bitacora.hora_salida ? 'En Turno' : 'Turno Finalizado';

  const formatHora = (iso: string) => {
    if (!iso) return '--:--'
    const date = new Date(iso)
    let h = date.getHours().toString().padStart(2, '0')
    let m = date.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }

  // Filtrar comunicados pertinentes para el usuario
  const misComunicados = comunicados.filter(c => {
    if (!c.roles_destino) return true
    if (Array.isArray(c.roles_destino)) {
      return c.roles_destino.length === 0 || c.roles_destino.includes(perfil.rol)
    }
    return false
  })

  const rolColors: any = {
    mesero: '#4CAF50',
    cocinero: '#FF9800',
    repartidor: '#ba68c8',
    limpieza: '#4dd0e1',
    def: '#64b5f6'
  }
  const color = rolColors[perfil.rol] || rolColors.def;

  return (
    <div className="portal-client animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Toaster position="top-center" toastOptions={{ style: { background: '#222', color: '#fff', borderRadius: '12px' } }} />

      {/* HEADER DE BIENVENIDA & PERFIL */}
      <div style={{ background: 'var(--bg-800)', borderRadius: 'var(--radius-xl)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${color}20`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
              {perfil.nombre.charAt(0)}{perfil.apellido.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-100)' }}>{perfil.nombre} {perfil.apellido}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: color, fontWeight: 700, textTransform: 'uppercase' }}>
                <ShieldAlert size={14} /> {perfil.rol}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-400)', padding: '8px', borderRadius: '50%', cursor: 'pointer' }} title="Cerrar Sesión">
            <LogOut size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '140px', background: 'var(--bg-900)', padding: '12px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)' }}>
             <MapPin size={18} color="var(--text-400)" />
             <div style={{ color: 'var(--text-300)', fontSize: '0.85rem' }}>{perfil.sucursales?.nombre || 'General'}</div>
          </div>
          <div style={{ flex: 1, minWidth: '140px', background: 'var(--bg-900)', padding: '12px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)' }}>
             <Watch size={18} color="var(--text-400)" />
             <div style={{ color: 'var(--text-300)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column' }}>
               <span>Turno Diario</span>
               <span style={{ fontWeight: 800, color: 'var(--text-100)' }}>{estadoLaboral}</span>
             </div>
          </div>
        </div>

      </div>

      {/* BITÁCORA GIGANTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-100)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Clock size={20} color="var(--yellow)" /> Control de Asistencia Personal
        </h3>
        
        <div style={{ background: 'var(--bg-800)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
           
           <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', width: '100%', marginBottom: '10px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-400)', fontWeight: 600, textTransform: 'uppercase' }}>Entrada</div>
               <div style={{ fontSize: '1.8rem', fontWeight: 800, color: bitacora?.hora_entrada ? '#4CAF50' : 'var(--text-500)' }}>
                 {bitacora?.hora_entrada ? formatHora(bitacora.hora_entrada) : '--:--'}
               </div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-400)', fontWeight: 600, textTransform: 'uppercase' }}>Salida</div>
               <div style={{ fontSize: '1.8rem', fontWeight: 800, color: bitacora?.hora_salida ? 'var(--yellow)' : 'var(--text-500)' }}>
                 {bitacora?.hora_salida ? formatHora(bitacora.hora_salida) : '--:--'}
               </div>
             </div>
           </div>

           <button 
             onClick={handleMarcarAsistencia}
             disabled={loading || (bitacora && bitacora.hora_salida)}
             style={{ 
               width: '100%', maxWidth: '300px', height: '60px', borderRadius: '30px', border: 'none', 
               background: (bitacora && bitacora.hora_salida) ? 'var(--bg-900)' : (!bitacora ? '#4CAF50' : 'var(--yellow)'), 
               color: (bitacora && bitacora.hora_salida) ? 'var(--text-500)' : '#000', 
               fontSize: '1.1rem', fontWeight: 800, cursor: (bitacora && bitacora.hora_salida) ? 'not-allowed' : 'pointer', 
               boxShadow: (bitacora && bitacora.hora_salida) ? 'none' : '0 10px 20px rgba(0,0,0,0.3)', 
               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', opacity: loading ? 0.7 : 1
             }}
             onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
             onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
             onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
           >
             {loading ? 'Procesando...' : (
               !bitacora ? <><CheckCircle size={22}/> ¡Marcar Entrada Ahora!</> :
               !bitacora.hora_salida ? <><LogOut size={22}/> ¡Marcar Salida de Turno!</> :
               <><CheckCircle size={22}/> Turno Completado</>
             )}
           </button>
           {!bitacora && <div style={{ fontSize: '0.8rem', color: 'var(--text-400)' }}>Toca para iniciar a contar tus horas.</div>}
        </div>
      </div>

      {/* FEED DE COMUNICADOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-100)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Bell size={20} color="var(--yellow)" /> Avisos y Tablón
        </h3>
        
        {misComunicados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-800)', borderRadius: 'var(--radius-lg)', color: 'var(--text-500)', fontSize: '0.9rem' }}>
            No tienes avisos pendientes por el momento.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {misComunicados.map((com: any) => (
              <div key={com.id} style={{ background: 'var(--bg-800)', borderRadius: 'var(--radius-lg)', padding: '16px', borderLeft: '4px solid var(--yellow)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 700 }}>{com.titulo}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-500)' }}>{new Date(com.fecha || com.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-300)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {com.mensaje}
                </p>
                {com.creador_id && (
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-500)', fontWeight: 600 }}>
                    Enviado por Administración
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

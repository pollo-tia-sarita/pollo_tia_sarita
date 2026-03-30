'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

interface Notificacion {
  id: string
  mensaje: string
  tipo: string
  leido: boolean
  created_at: string
}

export default function NotificacionesBell() {
  const [notis, setNotis] = useState<Notificacion[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // 1. Fetch inicial de no leídas
    const fetchInicial = async () => {
      const { data } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('leido', false)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setNotis(data)
    }
    fetchInicial()

    // 2. Suscribirse a INSERTS via Realtime
    const channel = supabase.channel('notificaciones-db')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones' }, payload => {
        const nueva = payload.new as Notificacion
        // Mostrar popup real-time
        toast((t) => (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>{nueva.tipo === 'caja' ? '💰' : '🕒'}</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>Nueva Actividad</div>
              <div style={{ fontSize: '13px', color: '#ccc' }}>{nueva.mensaje}</div>
            </div>
          </div>
        ), { duration: 8000 })

        setNotis(prev => [nueva, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const unseenCount = notis.filter(n => !n.leido).length

  const marcarComoLeidas = async () => {
    if (unseenCount === 0) return
    const ids = notis.filter(n => !n.leido).map(n => n.id)
    await supabase.from('notificaciones').update({ leido: true }).in('id', ids)
    setNotis(prev => prev.map(n => ({ ...n, leido: true })))
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="btn btn-ghost btn-icon" 
        onClick={() => setOpen(!open)}
        style={{ position: 'relative' }}
        title="Notificaciones en vivo"
      >
        <Bell size={18} />
        {unseenCount > 0 && (
          <span className="animate-pulse" style={{
            position: 'absolute', top: '2px', right: '2px', 
            background: 'var(--red)', color: 'white', 
            borderRadius: '50%', width: '18px', height: '18px',
            fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', border: '2px solid var(--bg-800)'
          }}>
            {unseenCount > 9 ? '+9' : unseenCount}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-fade-in" style={{
          position: 'absolute', top: '50px', right: '0', width: '350px',
          background: 'var(--bg-800)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
          zIndex: 100, overflow: 'hidden'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-900)' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-100)', fontWeight: 800, textTransform: 'uppercase' }}>Notificaciones</h3>
            {unseenCount > 0 && (
              <button 
                onClick={marcarComoLeidas} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-400)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckSquare size={14} /> Marcar leídas
              </button>
            )}
          </div>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {notis.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-500)', fontSize: '0.9rem' }}>
                <Bell size={32} style={{ margin: '0 auto 10px', opacity: 0.2 }} />
                No hay notificaciones nuevas
              </div>
            ) : (
              notis.map(n => (
                <div key={n.id} style={{ 
                  padding: '16px', 
                  borderBottom: '1px solid var(--border)', 
                  background: n.leido ? 'transparent' : 'rgba(253, 216, 53, 0.05)', 
                  opacity: n.leido ? 0.6 : 1,
                  borderLeft: n.leido ? '4px solid transparent' : '4px solid var(--yellow)'
                }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-100)', lineHeight: '1.4', fontWeight: n.leido ? 500 : 700 }}>{n.mensaje}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-500)', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{new Date(n.created_at).toLocaleString('es-BO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span style={{ textTransform: 'uppercase', color: n.tipo === 'caja' ? '#4CAF50' : 'var(--blue)' }}>{n.tipo}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

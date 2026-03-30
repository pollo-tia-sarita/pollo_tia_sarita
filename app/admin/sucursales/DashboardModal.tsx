'use client'

import { useState, useEffect } from 'react'
import { X, Store, Users, TrendingUp, TrendingDown, DollarSign, BadgeCheck } from 'lucide-react'
import { getSucursalDashboard } from './actions'

interface Sucursal {
  id: string
  nombre: string
  direccion: string | null
  telefono: string | null
  ciudad: string | null
  activa: boolean
}

interface Props {
  isOpen: boolean
  onClose: () => void
  sucursal: Sucursal | null
}

export default function DashboardModal({ isOpen, onClose, sucursal }: Props) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (isOpen && sucursal) {
      setLoading(true)
      setData(null)
      getSucursalDashboard(sucursal.id).then((res) => {
        setData(res)
        setLoading(false)
      }).catch(err => {
        console.error(err)
        setLoading(false)
      })
    }
  }, [isOpen, sucursal])

  if (!isOpen || !sucursal) return null

  const fmt = (n: number) => new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2 }).format(n)

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in-scale" style={{ maxWidth: '800px', width: '100%' }}>
        
        {/* Header Modal */}
        <div className="modal-header" style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-800)' }}>
          <div>
            <h2 className="modal-title flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
              <div style={{ padding: '8px', background: 'rgba(253, 216, 53, 0.1)', borderRadius: '12px', color: 'var(--yellow)' }}>
                <Store size={24} />
              </div>
              {sucursal.nombre}
            </h2>
            <p style={{ color: 'var(--text-400)', fontSize: '0.85rem', marginTop: '6px', marginLeft: '48px' }}>
              {sucursal.direccion || 'Sin dirección'} {sucursal.ciudad ? `(${sucursal.ciudad})` : ''} - {sucursal.telefono}
            </p>
          </div>
          <button onClick={onClose} className="btn-close"><X size={24} /></button>
        </div>

        {/* Body Modal */}
        <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-400)' }}>
              Cargando panel de control...
            </div>
          ) : data ? (
            <>
              {/* Encargado */}
              {data.encargado && (
                <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                     {data.encargado.nombre.charAt(0)}
                   </div>
                   <div>
                     <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--yellow)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <BadgeCheck size={14} /> Encargado / Supervisor Actual
                     </p>
                     <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{data.encargado.nombre} {data.encargado.apellido}</p>
                   </div>
                </div>
              )}

              {/* Finanzas Rápidas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', marginBottom: '12px' }}>Ingresos (Ventas)</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#4CAF50', fontFamily: 'monospace' }}>Bs. {fmt(data.totalVentas)}</p>
                </div>

                <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', marginBottom: '12px' }}>Egresos (Compras)</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--red)', fontFamily: 'monospace' }}>Bs. {fmt(data.totalCompras)}</p>
                </div>

                <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.05, transform: 'scale(1.2)', color: data.esGanancia ? '#4CAF50' : 'var(--red)' }}>
                    <DollarSign size={80} />
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', marginBottom: '12px', position: 'relative' }}>Ganancia Neta Límpidez</p>
                  <p style={{ fontSize: '1.8rem', fontWeight: 900, color: data.esGanancia ? '#fff' : 'var(--red)', fontFamily: 'monospace', position: 'relative' }}>
                    {data.esGanancia ? '' : '-' }Bs. {fmt(Math.abs(data.gananciaNeta))}
                  </p>
                </div>
              </div>

              {/* Personal */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} className="text-yellow" /> Personal Asignado
              </h3>

              <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-400)', borderBottom: '1px solid var(--border)' }}>Nombre</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-400)', borderBottom: '1px solid var(--border)' }}>Rol</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-400)', borderBottom: '1px solid var(--border)' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.empleados.map((emp: any) => (
                      <tr key={emp.id}>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                          {emp.nombre} {emp.apellido}
                          {emp.id === data.encargado?.id && <span style={{ marginLeft: '8px', fontSize: '0.65rem', background: 'rgba(253, 216, 53, 0.1)', color: 'var(--yellow)', padding: '2px 6px', borderRadius: '12px', fontWeight: 800 }}>ENCARGADO</span>}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: emp.rol === 'admin' ? 'var(--red)' : emp.rol === 'supervisor' ? 'var(--yellow)' : '#2196F3' }}>
                            {emp.rol}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                          {emp.activo 
                            ? <span style={{ fontSize: '0.8rem', color: '#4CAF50', fontWeight: 600 }}>● Activo</span>
                            : <span style={{ fontSize: '0.8rem', color: 'var(--red)', fontWeight: 600 }}>● Bloqueado</span>
                          }
                        </td>
                      </tr>
                    ))}
                    {data.empleados.length === 0 && (
                      <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-500)', fontSize: '0.9rem' }}>Sin empleados asignados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--red)' }}>
              Error al cargar los datos.
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

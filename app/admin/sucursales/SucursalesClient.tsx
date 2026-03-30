'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, MapPin, Phone, Users, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SucursalModal from './SucursalModal'
import DashboardModal from './DashboardModal'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface Sucursal {
  id: string
  nombre: string
  direccion: string | null
  telefono: string | null
  ciudad: string | null
  activa: boolean
  perfiles: [{ count: number }] | { count: number }[]
}

interface Props {
  initialData: any[] // Mapeado internamente
}

export default function SucursalesClient({ initialData }: Props) {
  const router = useRouter()
  const sucursales: Sucursal[] = initialData || []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null)
  
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const [dashboardSucursal, setDashboardSucursal] = useState<Sucursal | null>(null)

  const handleSuccess = () => {
    router.refresh()
  }

  const handleDelete = async (s: Sucursal) => {
    if (!confirm(`¿Estás seguro de eliminar la sucursal ${s.nombre}?\nNOTA: Solo se desactivará por seguridad para no perder histórico de ventas.`)) {
      return
    }
    
    const supabase = createClient()
    try {
      // Mejor es desactivarla "Soft delete" en vez de romper las relationales constraints con Ventas
      const { error } = await supabase.from('sucursales').update({ activa: false }).eq('id', s.id)
      if (error) throw error
      toast.success('Sucursal inhabilitada correctamente')
      router.refresh()
    } catch(err: any){
      toast.error('Error: ' + err.message)
    }
  }

  return (
    <div className="sucursales-client animate-fade-in">
      
      <div className="toolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', fontSize: '0.95rem' }}
          onClick={() => {
            setEditingSucursal(null)
            setIsModalOpen(true)
          }}
        >
          <Plus size={18} /> Nueva Sucursal
        </button>
      </div>

      <div className="sucursales-grid">
        {sucursales.map(sucursal => {
          const empCount = Array.isArray(sucursal.perfiles) && sucursal.perfiles.length > 0
            ? sucursal.perfiles[0].count 
            : 0

          return (
            <div key={sucursal.id} className="sucursal-card">
              
              {/* Header Card */}
              <div className="card-header">
                 <div className="header-titles">
                   <h3 className="s-name">{sucursal.nombre}</h3>
                   <div className="s-status">
                     {sucursal.activa 
                       ? <span className="badge-status online"><CheckCircle2 size={12}/> Activa</span>
                       : <span className="badge-status offline"><AlertCircle size={12}/> Inactiva</span>
                     }
                   </div>
                 </div>
                 
                 <div className="card-actions">
                   <button 
                     className="btn-icon-soft"
                     onClick={() => {
                       setEditingSucursal(sucursal)
                       setIsModalOpen(true)
                     }}
                     title="Editar datos"
                   >
                     <Edit2 size={16} />
                   </button>
                 </div>
              </div>

              {/* Body Card */}
              <div className="card-body">
                <div className="info-row">
                  <MapPin size={16} className="info-icon" />
                  <div className="info-text">
                    <p className="info-title">Ubicación</p>
                    <p className="info-val">{sucursal.direccion || 'Sin dirección registrada'}</p>
                    {sucursal.ciudad && <span className="info-sub">{sucursal.ciudad}</span>}
                  </div>
                </div>

                <div className="info-row">
                  <Phone size={16} className="info-icon" />
                  <div className="info-text">
                    <p className="info-title">Teléfono</p>
                    <p className="info-val">{sucursal.telefono || 'No registrado'}</p>
                  </div>
                </div>

                <div className="info-row">
                  <Users size={16} className="info-icon text-yellow" style={{ color: 'var(--yellow)' }} />
                  <div className="info-text">
                    <p className="info-title">Personal / Empleados</p>
                    <p className="info-val" style={{ color: 'var(--yellow)', fontWeight: 800 }}>{empCount} empleados asignados</p>
                  </div>
                </div>
              </div>

              {/* Footer Card */}
              <div className="card-footer">
                <button 
                  onClick={() => {
                    setDashboardSucursal(sucursal)
                    setIsDashboardOpen(true)
                  }}
                  className="btn-dashboard"
                >
                  Ver Dashboard del Local
                  <ArrowRight size={18} />
                </button>
              </div>

            </div>
          )
        })}

        {sucursales.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'var(--bg-800)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-xl)' }}>
            <p style={{ color: 'var(--text-400)', fontSize: '1.1rem' }}>Aún no tienes sucursales registradas.</p>
          </div>
        )}
      </div>

      <SucursalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        sucursalToEdit={editingSucursal} 
        onSuccess={handleSuccess} 
      />

      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        sucursal={dashboardSucursal}
      />

      <style>{`
        .sucursales-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        .sucursal-card {
          background: var(--bg-800);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: var(--transition);
        }
        .sucursal-card:hover {
          border-color: rgba(253, 216, 53, 0.4);
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .card-header {
          padding: 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: rgba(255,255,255,0.02);
        }

        .s-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-100);
          margin-bottom: 6px;
        }

        .badge-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge-status.online { background: rgba(76, 175, 80, 0.1); color: #4CAF50; border: 1px solid rgba(76,175,80,0.2); }
        .badge-status.offline { background: rgba(158, 158, 158, 0.1); color: #9E9E9E; border: 1px solid rgba(158,158,158,0.2); }

        .btn-icon-soft {
          background: transparent;
          border: none;
          color: var(--text-500);
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
        }
        .btn-icon-soft:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-200);
        }

        .card-body {
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .info-icon {
          color: var(--text-500);
          margin-top: 2px;
          flex-shrink: 0;
        }

        .info-text {
          display: flex;
          flex-direction: column;
          line-height: 1.4;
        }

        .info-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-500);
          margin-bottom: 4px;
          letter-spacing: 0.05em;
        }

        .info-val {
          font-size: 0.95rem;
          color: var(--text-200);
          font-weight: 500;
        }

        .info-sub {
          font-size: 0.8rem;
          color: var(--text-400);
          margin-top: 2px;
        }

        .card-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--border);
          background: var(--bg-900);
        }

        .btn-dashboard {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: transparent;
          color: var(--yellow);
          font-weight: 700;
          font-size: 0.95rem;
          padding: 8px 0;
          transition: var(--transition);
          text-decoration: none;
        }
        .btn-dashboard:hover {
          color: #fff;
        }
        .btn-dashboard:hover svg {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  )
}

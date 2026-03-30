'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, ArrowLeft, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import CerrarTurnoModal from './CerrarTurnoModal'
import ComunicadosBell from './ComunicadosBell'

interface Props {
  children: React.ReactNode
  nombreUsuario: string
  esAdmin: boolean
  rol: string
  sucursal: string
  turnoId?: string
}

export default function PosSidebarHeader({ children, nombreUsuario, esAdmin, rol, sucursal, turnoId }: Props) {
  const router = useRouter()
  const [isCerrarModalOpen, setIsCerrarModalOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="pos-layout">
      {/* Top Header */}
      <header className="pos-header">
        <div className="pos-header-left">
          <div className="pos-logo-wrap">
            <Image src="/log.png" alt="Tía Sarita" width={40} height={40} className="pos-logo" />
          </div>
          <div className="pos-brand">
            <h1 className="pos-title">Tía Sarita</h1>
            <span className="pos-subtitle">Punto de Venta</span>
          </div>
        </div>

        <div className="pos-header-right">
          <div className="pos-store-info">
            <span className="pos-store-name">{sucursal}</span>
          </div>

          {turnoId ? (
            <button 
              className="pos-shift-status badge-green badge animate-fade-in" 
              style={{ cursor: 'pointer', border: '1px solid #4CAF50', background: 'rgba(76, 175, 80, 0.1)' }}
              onClick={() => setIsCerrarModalOpen(true)}
              title="Cerrar Turno"
            >
              <Clock size={14} />
              <span>Turno Abierto</span>
            </button>
          ) : (
            <div className="pos-shift-status badge-red badge">
              <Clock size={14} />
              <span>Caja Cerrada</span>
            </div>
          )}

          <div className="pos-user">
            <div className="pos-avatar">{nombreUsuario.charAt(0).toUpperCase()}</div>
            <div className="pos-user-details">
              <span className="pos-user-name">{nombreUsuario}</span>
              <span className="pos-user-role">{rol === 'admin' ? 'Administrador' : rol === 'supervisor' ? 'Supervisor' : 'Cajero'}</span>
            </div>
          </div>

          <div className="pos-actions">
            <ComunicadosBell rol={rol} />
            {esAdmin && (
              <button onClick={() => router.push('/admin/dashboard')} className="btn btn-ghost btn-sm" title="Volver al Admin">
                <ArrowLeft size={16} /> Admin
              </button>
            )}
            <button onClick={handleLogout} className="btn-pos-logout" title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content (The POS interface) */}
      <main className="pos-main">
        {children}
      </main>

      {turnoId && (
        <CerrarTurnoModal 
          isOpen={isCerrarModalOpen} 
          onClose={() => setIsCerrarModalOpen(false)} 
          turnoId={turnoId} 
          cajeroNombre={nombreUsuario}
          cajeroRol={rol}
        />
      )}

      <style>{`
        .pos-layout {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          background: #0f0f0f; /* very dark background for contrast */
          overflow: hidden;
        }

        .pos-header {
          height: 64px;
          background: var(--bg-800);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          flex-shrink: 0;
          z-index: 50;
        }

        .pos-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pos-logo-wrap {
          width: 40px; height: 40px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--bg-900);
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--red);
        }

        .pos-logo {
          object-fit: cover;
        }

        .pos-brand {
          display: flex;
          flex-direction: column;
        }

        .pos-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-100);
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .pos-subtitle {
          font-size: 0.75rem;
          color: var(--text-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .pos-header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .pos-store-info {
          display: flex;
          align-items: center;
          padding-right: 15px;
          border-right: 1px solid var(--border);
        }

        .pos-store-name {
          font-size: 0.8rem;
          color: var(--text-400);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .pos-shift-status {
          margin-left: 5px;
        }

        .pos-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-left: 15px;
          border-left: 1px solid var(--border);
        }

        .pos-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--red-dark), var(--red));
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: var(--shadow-sm);
        }

        .pos-user-details {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .pos-user-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-100);
        }
        
        .pos-user-role {
          font-size: 0.7rem;
          color: var(--yellow);
          font-weight: 600;
          text-transform: uppercase;
        }

        .pos-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-pos-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px; height: 36px;
          border-radius: var(--radius-md);
          background: rgba(211,47,47,0.1);
          color: var(--red-light);
          border: 1px solid rgba(211,47,47,0.2);
          transition: var(--transition);
        }
        .btn-pos-logout:hover {
          background: var(--red);
          color: #fff;
          border-color: var(--red);
        }

        .pos-main {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .pos-header {
            padding: 0 10px;
          }
          .pos-store-info {
            display: none;
          }
          .pos-shift-status span {
            display: none;
          }
          .pos-shift-status {
            padding: 6px;
          }
          .pos-user-name {
            display: none;
          }
          .pos-user-role {
            font-size: 0.8rem;
          }
          .pos-brand .pos-subtitle {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

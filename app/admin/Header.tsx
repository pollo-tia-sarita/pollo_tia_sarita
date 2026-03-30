'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import NotificacionesBell from './NotificacionesBell'

const pageNames: Record<string, string> = {
  '/admin/dashboard':    'Dashboard',
  '/admin/ventas':       'Ventas',
  '/admin/caja':         'Caja',
  '/admin/empleados':    'Empleados',
  '/admin/menu':         'Menú',
  '/admin/inventario':   'Inventario',
  '/admin/inventario/proveedores': 'Proveedores',
  '/admin/inventario/insumos':     'Insumos',
  '/admin/inventario/compras':     'Registro de Compras',
  '/admin/reportes':     'Reportes',
  '/admin/sucursales':   'Sucursales',
  '/admin/configuracion':'Configuración',
}

interface Props { nombreUsuario: string }

export default function AdminHeader({ nombreUsuario }: Props) {
  const pathname = usePathname()
  const title = pageNames[pathname] ?? 'Panel Admin'

  const now = new Date()
  const hora = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
  const fecha = now.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })

  function handleOpenSidebar() {
    window.dispatchEvent(new Event('toggle-sidebar'))
  }

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button 
          className="mobile-menu-btn" 
          onClick={handleOpenSidebar}
          title="Abrir Menú"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="admin-header-title">{title}</h1>
          <span className="admin-header-date">{fecha} · {hora}</span>
        </div>
      </div>

      <div className="admin-header-right">
        <NotificacionesBell />
        <div className="admin-header-user">
          <span className="admin-header-greeting">Hola, <strong>{nombreUsuario}</strong></span>
          <div className="admin-header-avatar">
            {nombreUsuario.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <style>{`
        .admin-header {
          height: var(--header-h);
          background: var(--bg-800);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 50;
          gap: 16px;
        }
        .admin-header-left { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
        }
        .mobile-menu-btn {
          display: none;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-200);
          padding: 8px;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .admin-header { padding: 0 16px; }
          .mobile-menu-btn { display: flex; }
          .admin-header-date { display: none; }
          .admin-header-greeting { display: none; }
        }
        .admin-header-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-100);
          line-height: 1;
        }
        .admin-header-title {
          margin-bottom: 2px;
        }
        .admin-header-date {
          font-size: 0.75rem;
          color: var(--text-600);
          text-transform: capitalize;
        }
        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-header-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .admin-header-greeting {
          font-size: 0.875rem;
          color: var(--text-400);
        }
        .admin-header-greeting strong {
          color: var(--text-100);
          font-weight: 600;
        }
        .admin-header-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--red-dark), var(--red));
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          border: 2px solid var(--border);
        }
      `}</style>
    </header>
  )
}

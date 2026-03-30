'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Users, Package,
  BarChart3, Wallet, ShoppingBag, Settings,
  ChevronRight, ChevronDown, LogOut, Store, X,
  Clock, Bell, User
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href?: string
  icon:  React.ReactNode
  badge?: number
  subItems?: { label: string, href: string }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard',   href: '/admin/dashboard',   icon: <LayoutDashboard size={18} /> },
  { label: 'Ventas',      href: '/admin/ventas',       icon: <ShoppingCart size={18} /> },
  { label: 'Caja',        href: '/admin/caja',         icon: <Wallet size={18} /> },
  { label: 'Empleados',   href: '/admin/empleados',    icon: <Users size={18} /> },
  { label: 'Asistencia',  href: '/admin/asistencia',   icon: <Clock size={18} /> },
  { label: 'Avisos',      href: '/admin/comunicados',  icon: <Bell size={18} /> },
  { label: 'Menú',        href: '/admin/menu',         icon: <Package size={18} /> },
  { 
    label: 'Inventario',  
    icon: <ShoppingBag size={18} />,
    subItems: [
      { label: 'Proveedores', href: '/admin/inventario/proveedores' },
      { label: 'Insumos',     href: '/admin/inventario/insumos' },
      { label: 'Compras',     href: '/admin/inventario/compras' },
    ]
  },
  { label: 'Reportes',    href: '/admin/reportes',     icon: <BarChart3 size={18} /> },
  { label: 'Sucursales',  href: '/admin/sucursales',   icon: <Store size={18} /> },
  { label: 'Mi Perfil',   href: '/admin/perfil',       icon: <User size={18} /> },
  { label: 'Configuración', href: '/admin/configuracion', icon: <Settings size={18} /> },
]

interface Props {
  nombreUsuario: string
  rolUsuario:    string
  sucursal?:     string
}

export default function AdminSidebar({ nombreUsuario, rolUsuario, sucursal }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  
  const [isOpen, setIsOpen] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    'Inventario': pathname.startsWith('/admin/inventario')
  })

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev)
    window.addEventListener('toggle-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-sidebar', handleToggle)
  }, [])

  function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
      setIsOpen(false)
    }
  }

  function toggleSubmenu(label: string) {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }))
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const rolBadge = rolUsuario === 'admin'
    ? { label: 'Admin',      cls: 'badge-red' }
    : rolUsuario === 'supervisor'
    ? { label: 'Supervisor', cls: 'badge-yellow' }
    : { label: 'Cajero',     cls: 'badge-blue' }

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`} 
        onClick={() => setIsOpen(false)}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-wrap">
            <div className="sidebar-logo-ring" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/log.png" alt="Tía Sarita" className="sidebar-logo" />
          </div>
          <div className="flex-1">
            <span className="sidebar-brand-name">Tía Sarita</span>
            <span className="sidebar-brand-sub">Gestión</span>
          </div>
          <button 
            className="mobile-close-btn" 
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-divider" />

        {/* Nav principal */}
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const hasSubmenu = !!item.subItems
            const isActiveWrapper = item.href 
              ? pathname === item.href || pathname.startsWith(item.href + '/')
              : item.subItems?.some(s => pathname === s.href || pathname.startsWith(s.href + '/'))

            if (hasSubmenu) {
              const isSubmenuOpen = openSubmenus[item.label]
              return (
                <div key={item.label} className="submenu-container">
                  <button
                    className={`sidebar-nav-item submenu-toggle ${isActiveWrapper ? 'active' : ''}`}
                    onClick={() => toggleSubmenu(item.label)}
                  >
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    <span className="sidebar-nav-label">{item.label}</span>
                    {isSubmenuOpen ? <ChevronDown size={14} className="sidebar-nav-arrow" /> : <ChevronRight size={14} className="sidebar-nav-arrow" />}
                  </button>
                  {isSubmenuOpen && (
                    <div className="submenu-list">
                      {item.subItems!.map(sub => {
                        const isSubActive = pathname === sub.href
                        return (
                          <Link 
                            key={sub.href} 
                            href={sub.href}
                            className={`submenu-item ${isSubActive ? 'active' : ''}`}
                            onClick={closeSidebarOnMobile}
                          >
                            <span className="submenu-dot" />
                            {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.href!}
                href={item.href!}
                onClick={closeSidebarOnMobile}
                className={`sidebar-nav-item ${isActiveWrapper ? 'active' : ''}`}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
                {item.badge != null && (
                  <span className="sidebar-nav-badge">{item.badge}</span>
                )}
                {isActiveWrapper && <ChevronRight size={14} className="sidebar-nav-arrow" />}
              </Link>
            )
          })}
        </nav>

        {/* Perfil usuario + logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {nombreUsuario.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{nombreUsuario}</span>
              <div className="flex gap-2 items-center" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span className={`badge ${rolBadge.cls}`}>{rolBadge.label}</span>
                {sucursal && <span className="sidebar-user-branch" style={{ fontSize: '0.65rem', color: 'var(--text-500)', textTransform: 'uppercase' }}>{sucursal}</span>}
              </div>
            </div>
          </div>
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="sidebar-logout"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>

        <style>{`
          .sidebar {
            width: var(--sidebar-w);
            height: 100dvh;
            background: var(--bg-800);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0; left: 0;
            z-index: 1000;
            overflow: hidden;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }

          @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); }
            .sidebar-overlay.show {
              opacity: 1;
              pointer-events: auto;
            }
          }

          .mobile-close-btn {
            display: none;
            background: transparent;
            border: none;
            color: var(--text-400);
            padding: 8px;
          }

          @media (max-width: 768px) {
            .mobile-close-btn { display: block; }
          }

          /* Brand */
          .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 20px 16px;
            flex-shrink: 0;
          }
          .sidebar-logo-wrap {
            position: relative;
            width: 44px; height: 44px;
            flex-shrink: 0;
          }
          .sidebar-logo-ring {
            position: absolute;
            inset: -3px;
            border-radius: 50%;
            background: conic-gradient(var(--red), var(--yellow), var(--red));
            animation: spin 6s linear infinite;
            opacity: 0.7;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .sidebar-logo {
            width: 44px; height: 44px;
            border-radius: 50%;
            position: relative;
            z-index: 1;
            object-fit: cover;
            border: 2px solid var(--bg-800);
          }
          .sidebar-brand-name {
            display: block;
            font-size: 1rem;
            font-weight: 800;
            color: var(--text-100);
            line-height: 1.2;
          }
          .sidebar-brand-sub {
            display: block;
            font-size: 0.7rem;
            color: var(--text-600);
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .sidebar-divider {
            height: 1px;
            background: var(--border);
            margin: 0 12px 8px;
          }

          /* Nav */
          .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 0 8px;
            flex: 1;
            overflow-y: auto;
          }
          /* Custom scrollbar for sidebar nav */
          .sidebar-nav::-webkit-scrollbar {
            width: 4px;
          }
          .sidebar-nav::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 4px;
          }
          .sidebar-nav-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: var(--radius-md);
            color: var(--text-500);
            font-size: 0.875rem;
            font-weight: 500;
            transition: var(--transition);
            position: relative;
            text-decoration: none;
            width: 100%;
            border: none;
            background: transparent;
            cursor: pointer;
            text-align: left;
          }
          .sidebar-nav-item:hover {
            background: var(--bg-600);
            color: var(--text-200);
          }
          .sidebar-nav-item.active {
            background: rgba(211, 47, 47, 0.12);
            color: var(--text-100);
            font-weight: 600;
          }
          .sidebar-nav-item.active .sidebar-nav-icon {
            color: var(--red);
          }
          .sidebar-nav-icon {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            transition: var(--transition);
          }
          .sidebar-nav-label { flex: 1; }
          .sidebar-nav-badge {
            background: var(--red);
            color: #fff;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: var(--radius-full);
            min-width: 20px;
            text-align: center;
          }
          .sidebar-nav-arrow {
            color: var(--text-400);
            transition: transform 0.2s;
          }
          .sidebar-nav-item.active .sidebar-nav-arrow {
            color: var(--red);
          }

          /* Submenu */
          .submenu-container {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .submenu-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding-left: 36px;
            margin-top: 2px;
            margin-bottom: 4px;
          }
          .submenu-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: var(--radius-md);
            color: var(--text-500);
            font-size: 0.85rem;
            text-decoration: none;
            transition: var(--transition);
          }
          .submenu-dot {
            width: 5px; height: 5px;
            border-radius: 50%;
            background: var(--border);
            transition: var(--transition);
          }
          .submenu-item:hover {
            color: var(--text-200);
            background: var(--bg-600);
          }
          .submenu-item:hover .submenu-dot { background: var(--text-400); }
          .submenu-item.active {
            color: var(--red-light);
            font-weight: 600;
          }
          .submenu-item.active .submenu-dot {
            background: var(--red);
            box-shadow: 0 0 8px var(--red);
          }

          /* Footer */
          .sidebar-footer {
            padding: 12px 12px 16px;
            border-top: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }
          .sidebar-user {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            min-width: 0;
          }
          .sidebar-avatar {
            width: 36px; height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--red-dark), var(--red));
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.95rem;
            flex-shrink: 0;
          }
          .sidebar-user-info {
            display: flex;
            flex-direction: column;
            gap: 3px;
            min-width: 0;
          }
          .sidebar-user-name {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-200);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .sidebar-logout {
            background: transparent;
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            color: var(--text-500);
            padding: 7px;
            display: flex;
            align-items: center;
            transition: var(--transition);
            flex-shrink: 0;
            cursor: pointer;
          }
          .sidebar-logout:hover {
            background: rgba(211,47,47,0.12);
            border-color: rgba(211,47,47,0.3);
            color: var(--red-light);
          }
        `}</style>
      </aside>
    </>
  )
}
